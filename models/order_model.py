from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DECIMAL, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from settings import Model

if TYPE_CHECKING:
    from .payment_model import Payment
    from .products_model import Product
    from .users_model import User
    from .utils import OrderStatus, PaymentMethod, PaymentStatus


class Order(Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    address: Mapped[str] = mapped_column(String(128), nullable=False)
    contacs: Mapped[str] = mapped_column(String(16), nullable=False)
    initial_price: Mapped[float] = mapped_column(DECIMAL, nullable=False)
    total_price: Mapped[float] = mapped_column(DECIMAL, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    order_status_id: Mapped[int] = mapped_column(
        ForeignKey("order_statuses.id"), nullable=False
    )
    payment_method_id: Mapped[int] = mapped_column(
        ForeignKey("payment_methods.id"), nullable=False
    )
    payment_status_id: Mapped[int] = mapped_column(
        ForeignKey("payment_statuses.id"), nullable=False
    )
    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.private_id"), nullable=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False
    )
    ordered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User | None"] = relationship(back_populates="orders")
    product: Mapped["Product"] = relationship(back_populates="orders")
    payment: Mapped["Payment | None"] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    order_status: Mapped["OrderStatus"] = relationship(back_populates="orders")
    payment_status: Mapped["PaymentStatus"] = relationship(back_populates="orders")
    payment_method: Mapped["PaymentMethod"] = relationship(back_populates="orders")
    
