from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import DECIMAL, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.shared import Timestamp
from settings import Model

if TYPE_CHECKING:
    from .order_model import Order
    from .utils import ProductStatus


class Product(Model, Timestamp):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    price: Mapped[float] = mapped_column(DECIMAL, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    banner_image: Mapped[Optional[str]] = mapped_column(Text)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    product_status_id: Mapped[int] = mapped_column(
        ForeignKey("product_statuses.id"), nullable=False
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="product")
    product_status: Mapped["ProductStatus"] = relationship(
        back_populates="products"
    )
