from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DECIMAL, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from settings import Model
from .utils import PaymentMethod

if TYPE_CHECKING:
    from .order_model import Order


class Payment(Model):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True, nullable=False, autoincrement=True)
    payment_method: Mapped[str] = mapped_column(String(32), default=PaymentMethod.Bank.value)
    amount: Mapped[float] = mapped_column(DECIMAL(12, 2))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    order: Mapped["Order"] = relationship(back_populates="payment")