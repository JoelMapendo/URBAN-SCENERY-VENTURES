from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from models.products_model import Product
from models.utils import ProductStatus

_UPDATABLE_FIELDS = {"name", "price", "description", "banner_image", "quantity", "status"}


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
        search_filter = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Product.name.ilike(search_filter),
                Product.description.ilike(search_filter),
            )
        )

    if min_price is not None:
        statement = statement.where(Product.price >= min_price)

    if max_price is not None:
        statement = statement.where(Product.price <= max_price)

    if status:
        statement = statement.where(Product.status == status)

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
        if field in _UPDATABLE_FIELDS and value is not None:
            setattr(product, field, value)

    # Automatically set status to EMPTY if quantity reaches 0
    if product.quantity == 0 and product.status == ProductStatus.Available.value:
        product.status = ProductStatus.Empty.value
    elif product.quantity > 0 and product.status == ProductStatus.Empty.value:
        product.status = ProductStatus.Available.value

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
        product.status = ProductStatus.Empty.value

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
