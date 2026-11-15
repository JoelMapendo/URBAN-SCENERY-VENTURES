from __future__ import annotations
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from schemas.product_schema import ProductOut


class AIRecommendationQuery(BaseModel):
    query: str = Field(..., min_length=2, description="What kind of electronics are you looking for?")
    max_budget: Optional[Decimal] = Field(None, gt=0, description="Maximum budget")
    preferred_category: Optional[str] = Field(None, description="Electronics category (e.g., Laptops, Phones, Audio, Accessories)")


class AIRecommendationResponse(BaseModel):
    query: str
    ai_advice: str
    recommendations: List[ProductOut]


class AISmartSearchResponse(BaseModel):
    query: str
    total_matches: int
    matches: List[ProductOut]


class AgentRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Prompt or question for the AI agent")


class AgentResponse(BaseModel):
    agent: str
    answer: str
    model: str = "urban-scenery-grounded-v1"
    warning: Optional[str] = None
    data_summary: Dict[str, Any] = Field(default_factory=dict)

