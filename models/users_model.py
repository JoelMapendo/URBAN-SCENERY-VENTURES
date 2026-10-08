import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from settings import Model
from .utils import Timestamp, UserRole

if TYPE_CHECKING:
    from .order_model import Order


class User(Model, Timestamp):
    __tablename__ = "users"

    private_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, unique=True, default=uuid.uuid4
    )
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, unique=True, index=True, default=uuid.uuid4, nullable=False
    )
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    email: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(default=UserRole.Customer)
    contact: Mapped[str | None] = mapped_column(String(128), nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")