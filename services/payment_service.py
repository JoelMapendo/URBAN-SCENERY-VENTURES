from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from models.payment_model import Payment
from models.order_model import Order
from models.utils import PaymentMethod, PaymentStatus, OrderStatus
from services.lookup_service import get_lookup

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

    if amount != Decimal(str(order.total_price)):
        raise ValueError("Payment amount must match the order total")

    payment = Payment(
        order_id=order_id,
        payment_method=get_lookup(session, PaymentMethod, payment_method),
        amount=amount,
    )
    session.add(payment)

    order.payment_method = get_lookup(session, PaymentMethod, payment_method)
    order.payment_status = get_lookup(session, PaymentStatus, "PAID")
    order.order_status = get_lookup(session, OrderStatus, "APPROVED")

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


def update_payment(
    payment_id: int,
    updates: dict[str, object],
    session: Session,
) -> Optional[Payment]:
    payment = session.get(Payment, payment_id)
    if payment is None:
        return None

    amount = updates.get("amount")
    if amount is not None and Decimal(str(amount)) != Decimal(str(payment.order.total_price)):
        raise ValueError("Payment amount must match the order total")

    payment_method = updates.get("payment_method")
    if payment_method is not None:
        method = get_lookup(session, PaymentMethod, str(payment_method))
        payment.payment_method = method
        payment.order.payment_method = method
    if amount is not None:
        payment.amount = float(Decimal(str(amount)))

    session.commit()
    session.refresh(payment)
    return payment


def delete_payment(payment_id: int, session: Session) -> bool:
    payment = session.get(Payment, payment_id)
    if payment is None:
        return False

    payment.order.payment_status = get_lookup(
        session, PaymentStatus, "NOT YET PAID"
    )
    if payment.order.order_status.name == "APPROVED":
        payment.order.order_status = get_lookup(session, OrderStatus, "PENDING")
    session.delete(payment)
    session.commit()
    return True
