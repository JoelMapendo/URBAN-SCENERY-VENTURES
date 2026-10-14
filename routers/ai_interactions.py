from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from core.security import get_current_admin
from models.ai_model import AIInteraction
from schemas.ai_interaction_schema import (
    AIInteractionCreate,
    AIInteractionOut,
    AIInteractionUpdate,
)
from settings import get_db

router = APIRouter(
    prefix="/ai/interactions",
    tags=["AI Interaction Records"],
    dependencies=[Depends(get_current_admin)],
)


@router.post("", response_model=AIInteractionOut, status_code=status.HTTP_201_CREATED)
def create_interaction(
    payload: AIInteractionCreate,
    db: Session = Depends(get_db),
):
    interaction = AIInteraction(**payload.model_dump())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.get("", response_model=list[AIInteractionOut])
def list_interactions(
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    statement = select(AIInteraction).order_by(AIInteraction.id).offset(offset).limit(limit)
    return list(db.scalars(statement).all())


@router.get("/{interaction_id}", response_model=AIInteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.get(AIInteraction, interaction_id)
    if interaction is None:
        raise HTTPException(status_code=404, detail="AI interaction not found")
    return interaction


@router.put("/{interaction_id}", response_model=AIInteractionOut)
def update_interaction(
    interaction_id: int,
    payload: AIInteractionUpdate,
    db: Session = Depends(get_db),
):
    interaction = db.get(AIInteraction, interaction_id)
    if interaction is None:
        raise HTTPException(status_code=404, detail="AI interaction not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(interaction, field, value)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.get(AIInteraction, interaction_id)
    if interaction is None:
        raise HTTPException(status_code=404, detail="AI interaction not found")
    db.delete(interaction)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
