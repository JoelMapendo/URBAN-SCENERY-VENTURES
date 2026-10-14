from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LookupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)
    description: str = Field(default="", max_length=2000)


class LookupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=32)
    description: Optional[str] = Field(None, max_length=2000)


class LookupOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
