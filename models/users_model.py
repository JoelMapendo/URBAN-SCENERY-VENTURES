import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.shared import Timestamp
from settings import Model

if TYPE_CHECKING:
    from .order_model import Order
    from .utils import UserRole


class User(Model, Timestamp):
    __tablename__ = "users"

    private_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, unique=True, index=True, default=uuid.uuid4, nullable=False
    )
    name: Mapped[str] = mapped_column(String(32), nullable=False)
    email: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    contact: Mapped[str | None] = mapped_column(String(128))
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    role_id: Mapped[int] = mapped_column(ForeignKey("user_roles.id"), nullable=False)

    user_role: Mapped["UserRole"] = relationship(back_populates="users")
    orders: Mapped[list["Order"]] = relationship(back_populates="user")
