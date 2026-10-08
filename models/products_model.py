from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TEXT, DECIMAL, Integer
from settings import Model
from .utils import ProductStatus, Timestamp

if TYPE_CHECKING:
    from .order_model import Order


class Product(Model, Timestamp):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    price: Mapped[float] = mapped_column(DECIMAL(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    banner_image: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(default=ProductStatus.Available.value)

    orders: Mapped[list["Order"]] = relationship(back_populates="product")