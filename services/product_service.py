from __future__ import annotations
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from models.products_model import Product
from models.utils import ProductStatus
from services.lookup_service import get_lookup

_UPDATABLE_FIELDS = {"name", "price", "description", "banner_image", "quantity", "status"}

_SEARCH_SYNONYMS: dict[str, tuple[str, ...]] = {
    "laptop": ("laptop", "macbook", "notebook", "display", "m3", "ssd"),
    "phone": ("phone", "smartphone", "galaxy", "mobile", "5g", "camera"),
    "smart": ("smart", "galaxy", "watch", "quest", "vr", "drone", "ecoflow"),
    "audio": ("audio", "headphone", "earphone", "earbud", "speaker", "bluetooth", "noise", "wh-1000xm5"),
    "watch": ("watch", "wearable", "gps", "ultra", "quest", "vr"),
    "monitor": ("monitor", "display", "ultrasharp", "4k", "retina"),
    "accessories": ("anker", "power", "charger", "keyboard", "keychron", "usb-c", "hub", "station"),
    "accessory": ("anker", "power", "charger", "keyboard", "keychron", "usb-c", "hub", "station"),
    "usb": ("usb", "anker", "power", "charger", "keyboard", "keychron", "ecoflow"),
    "gaming": ("playstation", "gaming", "console", "quest", "vr", "4k", "keyboard"),
    "setup": ("macbook", "monitor", "ultrasharp", "keyboard", "keychron", "anker"),
}


def create_product(
    product: Product,
    session: Session,
) -> Product:
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def get_product(product_id: int, session: Session) -> Optional[Product]:
    return session.get(Product, product_id)


def get_all_products(
    session: Session,
    offset: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    status: Optional[str] = None,
) -> List[Product]:
    statement = select(Product)

    if search:
        cleaned = search.strip().lower()
        if cleaned not in {"sale", "deal", "deals", "all"}:
            terms: set[str] = {cleaned}
            for token in cleaned.split():
                if len(token) >= 2:
                    terms.add(token)
                    if token in _SEARCH_SYNONYMS:
                        terms.update(_SEARCH_SYNONYMS[token])
            if cleaned in _SEARCH_SYNONYMS:
                terms.update(_SEARCH_SYNONYMS[cleaned])

            clauses = []
            for term in terms:
                pattern = f"%{term}%"
                clauses.append(Product.name.ilike(pattern))
                clauses.append(Product.description.ilike(pattern))

            if clauses:
                statement = statement.where(or_(*clauses))

    if min_price is not None:
        statement = statement.where(Product.price >= min_price)

    if max_price is not None:
        statement = statement.where(Product.price <= max_price)

    if status:
        statement = statement.where(
            Product.product_status.has(ProductStatus.name == status.strip().upper())
        )

    statement = statement.offset(offset).limit(limit)
    return list(session.scalars(statement).all())


def update_product(
    product_id: int,
    updates: dict[str, object],
    session: Session,
) -> Optional[Product]:
    product = session.get(Product, product_id)
    if product is None:
        return None

    for field, value in updates.items():
        if field == "status" and value is not None:
            product.product_status = get_lookup(session, ProductStatus, str(value))
        elif field in _UPDATABLE_FIELDS and value is not None:
            setattr(product, field, value)

    if product.quantity == 0 and product.product_status.name != "EMPTY":
        product.product_status = get_lookup(session, ProductStatus, "EMPTY")
    elif product.quantity > 0 and product.product_status.name == "EMPTY":
        product.product_status = get_lookup(session, ProductStatus, "AVAILABLE")

    session.commit()
    session.refresh(product)
    return product


def reduce_product_stock(
    product_id: int,
    quantity_to_reduce: int,
    session: Session,
) -> Optional[Product]:
    product = session.get(Product, product_id)
    if product is None or product.quantity < quantity_to_reduce:
        return None

    product.quantity -= quantity_to_reduce
    if product.quantity == 0:
        product.product_status = get_lookup(session, ProductStatus, "EMPTY")

    session.commit()
    session.refresh(product)
    return product


def delete_product(product_id: int, session: Session) -> bool:
    product = session.get(Product, product_id)
    if product is None:
        return False

    session.delete(product)
    session.commit()
    return True
