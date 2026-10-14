from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AIInteractionCreate(BaseModel):
    prompt: str = Field(..., min_length=1)
    response: str = Field(..., min_length=1)
    user_id: Optional[UUID] = None


class AIInteractionUpdate(BaseModel):
    prompt: Optional[str] = Field(None, min_length=1)
    response: Optional[str] = Field(None, min_length=1)
    user_id: Optional[UUID] = None


class AIInteractionOut(BaseModel):
    id: int
    prompt: str
    response: str
    created_at: datetime
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True
