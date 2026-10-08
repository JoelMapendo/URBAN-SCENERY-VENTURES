from datetime import datetime
import uuid
from sqlalchemy import DateTime, Integer, TEXT, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from settings import Model


class AIInteraction(Model):
    """Stores AI recommendation queries and search interactions."""
    __tablename__ = "ai_interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    prompt: Mapped[str] = mapped_column(TEXT, nullable=False)
    response: Mapped[str] = mapped_column(TEXT, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
