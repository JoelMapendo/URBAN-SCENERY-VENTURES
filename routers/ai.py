from __future__ import annotations
from typing import Any, Dict
from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.orm import Session
from settings import get_db
from schemas.ai_schema import (
    AIRecommendationQuery,
    AIRecommendationResponse,
    AISmartSearchResponse,
    AgentRequest,
    AgentResponse,
)
from services import ai_service

router = APIRouter(prefix="/ai", tags=["AI Electronics Assistant"])
platforms_router = APIRouter(prefix="/platforms", tags=["Multichannel Platforms"])


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


@router.post("/agents/image-studio/render")
def render_image_studio(
    payload: AgentRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    brief = ai_service.run_grounded_agent(session=db, agent_name="image-studio", question=payload.question)
    return {
        "agent": "image-studio-renderer",
        "prompt": payload.question,
        "status": "rendered",
        "brief": brief["answer"],
    }


@router.post("/agents/{agent_name}", response_model=AgentResponse)
def run_ai_agent(
    agent_name: str,
    payload: AgentRequest,
    db: Session = Depends(get_db),
):
    return ai_service.run_grounded_agent(
        session=db,
        agent_name=agent_name,
        question=payload.question,
    )


@platforms_router.get("/status")
def get_platforms_status() -> Dict[str, Any]:
    return {
        "facebook": True,
        "instagram": True,
        "tiktok": True,
        "whatsapp": True,
    }


@platforms_router.post("/campaign/publish")
def publish_campaign(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {
        "status": "published",
        "platforms": payload.get("platforms", []),
        "caption": payload.get("caption", ""),
    }


@platforms_router.post("/facebook/publish")
def publish_facebook(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {"status": "published", "platform": "facebook", "payload": payload}


@platforms_router.post("/instagram/publish-image")
def publish_instagram(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {"status": "published", "platform": "instagram", "payload": payload}


@platforms_router.post("/tiktok/publish-video")
def publish_tiktok(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {"status": "published", "platform": "tiktok", "payload": payload}


@platforms_router.post("/whatsapp/messages")
def send_whatsapp_message(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {
        "status": "sent",
        "platform": "whatsapp",
        "to": payload.get("to"),
        "message": payload.get("message"),
    }


@platforms_router.get("/whatsapp/conversations/summary")
def get_whatsapp_summary() -> Dict[str, Any]:
    return {"status": "online", "active_conversations": 12}
