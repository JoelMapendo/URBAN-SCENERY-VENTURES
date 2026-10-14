from typing import Any, overload

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.utils import OrderStatus, PaymentMethod, PaymentStatus, ProductStatus, UserRole


@overload
def get_lookup(session: Session, lookup_model: type[UserRole], name: str) -> UserRole: ...


@overload
def get_lookup(
    session: Session, lookup_model: type[OrderStatus], name: str
) -> OrderStatus: ...


@overload
def get_lookup(
    session: Session, lookup_model: type[PaymentStatus], name: str
) -> PaymentStatus: ...


@overload
def get_lookup(
    session: Session, lookup_model: type[PaymentMethod], name: str
) -> PaymentMethod: ...


@overload
def get_lookup(
    session: Session, lookup_model: type[ProductStatus], name: str
) -> ProductStatus: ...


def get_lookup(
    session: Session,
    lookup_model: type[Any],
    name: str,
) -> Any:
    normalized_name = name.strip().upper()
    name_column = getattr(lookup_model, "name")
    lookup = session.scalars(
        select(lookup_model).where(name_column == normalized_name)
    ).first()
    if lookup is None:
        raise ValueError(
            f"Unknown {getattr(lookup_model, '__tablename__', 'lookup')} value: {name}"
        )
    return lookup
