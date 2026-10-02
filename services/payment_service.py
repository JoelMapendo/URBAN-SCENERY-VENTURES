from models.payment_model import Payment
from sqlalchemy import select
from sqlalchemy.orm import Session


_UPDATABLE_FIELDS = {"payment_method", "amount", "order_id"}


def create_payment(payment: Payment, session: Session) -> Payment:
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment


def get_payment(payment_id: int, session: Session) -> Payment | None:
    return session.get(Payment, payment_id)


def get_all_payments(session: Session, offset: int = 0, limit: int = 100) -> list[Payment]:
    statement = select(Payment).offset(offset).limit(limit)
    return list(session.scalars(statement).all())


def update_payment(payment_id: int, updates: dict[str, object], session: Session) -> Payment | None:
    payment = session.get(Payment, payment_id)
    if payment is None:
        return None

    invalid_fields = updates.keys() - _UPDATABLE_FIELDS
    if invalid_fields:
        raise ValueError(f"Unsupported payment fields: {', '.join(sorted(invalid_fields))}")

    for field, value in updates.items():
        setattr(payment, field, value)

    session.commit()
    session.refresh(payment)
    return payment


def delete_payment(payment_id: int, session: Session) -> bool:
    payment = session.get(Payment, payment_id)
    if payment is None:
        return False

    session.delete(payment)
    session.commit()
    return True


