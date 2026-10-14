from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.order_model import Order
from models.products_model import Product
from models.utils import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ProductStatus,
)
from services.lookup_service import get_lookup

_UPDATABLE_FIELDS = {
    "address",
    "contacs",
    "order_status",
    "payment_method",
    "payment_status",
    "quantity",
}


def create_order(
    product_id: int,
    quantity: int,
    address: str,
    contact: str,
    payment_method: str,
    session: Session,
    user_id: Optional[UUID] = None,
) -> Order:
    product = session.get(Product, product_id)
    if product is None:
        raise ValueError(f"Product with id {product_id} not found")

    if quantity < 1:
        raise ValueError("Order quantity must be at least 1")
    if product.quantity < quantity:
        raise ValueError(
            f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, Requested: {quantity}"
        )

    product.quantity -= quantity
    if product.quantity == 0:
        product.product_status = get_lookup(session, ProductStatus, "EMPTY")

    unit_price = Decimal(str(product.price))
    total_price = unit_price * quantity

    order = Order(
        address=address.strip(),
        contacs=contact.strip(),
        order_status=get_lookup(session, OrderStatus, "PENDING"),
        payment_method=get_lookup(session, PaymentMethod, payment_method),
        payment_status=get_lookup(session, PaymentStatus, "NOT YET PAID"),
        initial_price=unit_price,
        total_price=total_price,
        quantity=quantity,
        product_id=product_id,
        user_id=user_id,
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def get_order(order_id: int, session: Session) -> Optional[Order]:
    return session.get(Order, order_id)


def get_all_orders(session: Session, offset: int = 0, limit: int = 100) -> List[Order]:
    statement = select(Order).offset(offset).limit(limit)
    return list(session.scalars(statement).all())


def get_user_orders(user_id: UUID, session: Session) -> List[Order]:
    statement = select(Order).where(Order.user_id == user_id)
    return list(session.scalars(statement).all())


def update_order(order_id: int, updates: dict[str, object], session: Session) -> Optional[Order]:
    order = session.get(Order, order_id)
    if order is None:
        return None

    for field, value in updates.items():
        lookup_models = {
            "order_status": OrderStatus,
            "payment_method": PaymentMethod,
            "payment_status": PaymentStatus,
        }
        if field in lookup_models and value is not None:
            setattr(order, field, get_lookup(session, lookup_models[field], str(value)))
        elif field in _UPDATABLE_FIELDS and value is not None:
            setattr(order, field, value)

    session.commit()
    session.refresh(order)
    return order


def delete_order(order_id: int, session: Session) -> bool:
    order = session.get(Order, order_id)
    if order is None:
        return False

    if order.product and order.order_status.name in {"PENDING", "CANCELLED"}:
        order.product.quantity += order.quantity
        if order.product.product_status.name == "EMPTY":
            order.product.product_status = get_lookup(
                session, ProductStatus, "AVAILABLE"
            )

    session.delete(order)
    session.commit()
    return True
