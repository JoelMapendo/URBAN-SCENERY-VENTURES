from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.order_model import Order
from models.products_model import Product
from models.utils import OrderStatus, PaymentStatus, ProductStatus

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

    if product.quantity < quantity:
        raise ValueError(
            f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, Requested: {quantity}"
        )

    # Deduct stock
    product.quantity -= quantity
    if product.quantity == 0:
        product.status = ProductStatus.Empty.value

    unit_price = Decimal(str(product.price))
    total_price = unit_price * quantity

    order = Order(
        address=address.strip(),
        contacs=contact.strip(),
        order_status=OrderStatus.Pending.value,
        payment_method=payment_method,
        payment_status=PaymentStatus.Not_yet_paid.value,
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
        if field in _UPDATABLE_FIELDS and value is not None:
            setattr(order, field, value)

    session.commit()
    session.refresh(order)
    return order


def delete_order(order_id: int, session: Session) -> bool:
    order = session.get(Order, order_id)
    if order is None:
        return False

    # Restore stock if order was pending or cancelled
    if order.product and order.order_status in [OrderStatus.Pending.value, OrderStatus.Cancelled.value]:
        order.product.quantity += order.quantity
        if order.product.status == ProductStatus.Empty.value:
            order.product.status = ProductStatus.Available.value

    session.delete(order)
    session.commit()
    return True
