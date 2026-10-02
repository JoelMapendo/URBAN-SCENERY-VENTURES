from models.order_model import Order
from sqlalchemy import select
from sqlalchemy.orm import Session
from uuid import UUID


_UPDATABLE_FIELDS = {
    "address",
    "contacs",
    "order_status",
    "payment_method",
    "payment_status",
    "initial_price",
    "total_price",
    "quantity",
    "user_id",
    "product_id",
}


def create_order(order: Order, session: Session) -> Order:
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def get_order(order_id: int, session: Session) -> Order | None:
    return session.get(Order, order_id)


def get_all_orders(session: Session, offset: int = 0, limit: int = 100) -> list[Order]:
    statement = select(Order).offset(offset).limit(limit)
    return list(session.scalars(statement).all())


def get_user_orders(user_id: UUID, session: Session) -> list[Order]:
    statement = select(Order).where(Order.user_id == user_id)
    return list(session.scalars(statement).all())


def update_order(order_id: int, updates: dict[str, object], session: Session) -> Order | None:
    order = session.get(Order, order_id)
    if order is None:
        return None

    invalid_fields = updates.keys() - _UPDATABLE_FIELDS
    if invalid_fields:
        raise ValueError(f"Unsupported order fields: {', '.join(sorted(invalid_fields))}")

    for field, value in updates.items():
        setattr(order, field, value)

    session.commit()
    session.refresh(order)
    return order


def delete_order(order_id: int, session: Session) -> bool:
    order = session.get(Order, order_id)
    if order is None:
        return False

    session.delete(order)
    session.commit()
    return True
