from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.shared import Timestamp
from settings import Model

if TYPE_CHECKING:
    from .order_model import Order
    from .payment_model import Payment
    from .products_model import Product
    from .users_model import User


class UserRole(Model, Timestamp):
    __tablename__ = "user_roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    users: Mapped[list["User"]] = relationship(back_populates="user_role")


class OrderStatus(Model, Timestamp):
    __tablename__ = "order_statuses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    orders: Mapped[list["Order"]] = relationship(back_populates="order_status")


class PaymentStatus(Model, Timestamp):
    __tablename__ = "payment_statuses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    orders: Mapped[list["Order"]] = relationship(back_populates="payment_status")


class PaymentMethod(Model, Timestamp):
    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    orders: Mapped[list["Order"]] = relationship(back_populates="payment_method")
    payments: Mapped[list["Payment"]] = relationship(back_populates="payment_method")


class ProductStatus(Model, Timestamp):
    __tablename__ = "product_statuses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    products: Mapped[list["Product"]] = relationship(back_populates="product_status")
