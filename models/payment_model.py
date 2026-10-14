
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DECIMAL, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from settings import Model

if TYPE_CHECKING:
    from .order_model import Order
    from .utils import PaymentMethod


class Payment(Model):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[float] = mapped_column(DECIMAL, nullable=False)
    order_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("orders.id"), unique=True, nullable=False
    )
    payment_method_id: Mapped[int] = mapped_column(
        ForeignKey("payment_methods.id"), nullable=False
    )
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    order: Mapped["Order"] = relationship(back_populates="payment")
    payment_method: Mapped["PaymentMethod"] = relationship(
        back_populates="payments"
    )
