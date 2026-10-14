from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from settings import get_db
from schemas.ai_schema import AIRecommendationQuery, AIRecommendationResponse, AISmartSearchResponse
from services import ai_service

router = APIRouter(prefix="/ai", tags=["AI Electronics Assistant"])


@router.post("/recommend", response_model=AIRecommendationResponse)
def get_ai_product_recommendations(
    payload: AIRecommendationQuery,
    db: Session = Depends(get_db),
):
    """
    Intelligent electronics recommendation assistant.
    Analyzes user preference, desired features, and budget to find the best matched products.
    """
    result = ai_service.get_electronics_recommendations(
        session=db,
        query=payload.query,
        max_budget=payload.max_budget,
        preferred_category=payload.preferred_category,
    )
    return result


@router.get("/smart-search", response_model=AISmartSearchResponse)
def ai_smart_search(
    q: str = Query(..., min_length=2, description="Electronics search prompt"),
    db: Session = Depends(get_db),
):
    """
    Smart electronics search with semantic synonyms (e.g., 'earbuds' -> headphones, audio, wireless).
    """
    return ai_service.smart_search_electronics(session=db, query=q)
