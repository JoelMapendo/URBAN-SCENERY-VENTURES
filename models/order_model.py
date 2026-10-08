from datetime import datetime
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String, Uuid, func, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from settings import Model
from .utils import OrderStatus, PaymentMethod, PaymentStatus

if TYPE_CHECKING:
    from .users_model import User
    from .products_model import Product
    from .payment_model import Payment


class Order(Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    contacs: Mapped[str] = mapped_column(String(64), nullable=False)  # Phone / contact info

    order_status: Mapped[str] = mapped_column(String(32), default=OrderStatus.Pending.value)
    payment_method: Mapped[str] = mapped_column(String(32), default=PaymentMethod.Bank.value)
    payment_status: Mapped[str] = mapped_column(String(32), default=PaymentStatus.Not_yet_paid.value)

    initial_price: Mapped[float] = mapped_column(DECIMAL(12, 2))
    total_price: Mapped[float] = mapped_column(DECIMAL(12, 2))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    ordered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.private_id"), nullable=True)
    user: Mapped["User | None"] = relationship(back_populates="orders")

    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    product: Mapped["Product"] = relationship(back_populates="orders")

    payment: Mapped["Payment | None"] = relationship(
        back_populates="order", cascade="all, delete-orphan", uselist=False
    )