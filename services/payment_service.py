from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.payment_model import Payment
from models.order_model import Order
from models.utils import PaymentStatus, OrderStatus

_UPDATABLE_FIELDS = {"payment_method", "amount"}


def create_payment(
    order_id: int,
    payment_method: str,
    amount: Decimal,
    session: Session,
) -> Payment:
    order = session.get(Order, order_id)
    if order is None:
        raise ValueError(f"Order with ID {order_id} not found")

    existing_payment = session.scalars(
        select(Payment).where(Payment.order_id == order_id)
    ).first()
    if existing_payment:
        raise ValueError(f"Payment already recorded for Order #{order_id}")

    payment = Payment(
        order_id=order_id,
        payment_method=payment_method,
        amount=amount,
    )
    session.add(payment)

    # Automatically mark order as PAID and APPROVED
    order.payment_status = PaymentStatus.Paid.value
    order.order_status = OrderStatus.Approved.value

    session.commit()
    session.refresh(payment)
    return payment


def get_payment(payment_id: int, session: Session) -> Optional[Payment]:
    return session.get(Payment, payment_id)


def get_payment_by_order_id(order_id: int, session: Session) -> Optional[Payment]:
    statement = select(Payment).where(Payment.order_id == order_id)
    return session.scalars(statement).first()


def get_all_payments(session: Session, offset: int = 0, limit: int = 100) -> List[Payment]:
    statement = select(Payment).offset(offset).limit(limit)
    return list(session.scalars(statement).all())


def delete_payment(payment_id: int, session: Session) -> bool:
    payment = session.get(Payment, payment_id)
    if payment is None:
        return False

    session.delete(payment)
    session.commit()
    return True
