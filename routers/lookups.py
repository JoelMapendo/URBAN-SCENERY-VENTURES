from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.security import get_current_admin
from schemas.lookup_schema import LookupCreate, LookupOut, LookupUpdate
from settings import get_db
from models.utils import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ProductStatus,
    UserRole,
)

router = APIRouter(
    prefix="/lookups",
    tags=["Lookup Data"],
    dependencies=[Depends(get_current_admin)],
)

_LOOKUP_MODELS: dict[str, type[Any]] = {
    "user-roles": UserRole,
    "order-statuses": OrderStatus,
    "payment-statuses": PaymentStatus,
    "payment-methods": PaymentMethod,
    "product-statuses": ProductStatus,
}


def _get_model(resource: str) -> type[Any]:
    model = _LOOKUP_MODELS.get(resource)
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lookup resource '{resource}' not found",
        )
    return model


@router.get("/{resource}", response_model=list[LookupOut])
def list_lookups(
    resource: str,
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    model = _get_model(resource)
    return list(db.scalars(select(model).offset(offset).limit(limit)).all())


@router.post(
    "/{resource}",
    response_model=LookupOut,
    status_code=status.HTTP_201_CREATED,
)
def create_lookup(
    resource: str,
    payload: LookupCreate,
    db: Session = Depends(get_db),
):
    model = _get_model(resource)
    lookup = model(name=payload.name.strip(), description=payload.description.strip())
    db.add(lookup)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lookup with this name already exists",
        ) from error
    db.refresh(lookup)
    return lookup


@router.get("/{resource}/{lookup_id}", response_model=LookupOut)
def get_lookup_by_id(resource: str, lookup_id: int, db: Session = Depends(get_db)):
    model = _get_model(resource)
    lookup = db.get(model, lookup_id)
    if lookup is None:
        raise HTTPException(status_code=404, detail="Lookup not found")
    return lookup


@router.put("/{resource}/{lookup_id}", response_model=LookupOut)
def update_lookup(
    resource: str,
    lookup_id: int,
    payload: LookupUpdate,
    db: Session = Depends(get_db),
):
    model = _get_model(resource)
    lookup = db.get(model, lookup_id)
    if lookup is None:
        raise HTTPException(status_code=404, detail="Lookup not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(lookup, field, value.strip())
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The lookup name is already in use or this lookup is referenced",
        ) from error
    db.refresh(lookup)
    return lookup


@router.delete("/{resource}/{lookup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lookup(
    resource: str,
    lookup_id: int,
    db: Session = Depends(get_db),
):
    model = _get_model(resource)
    lookup = db.get(model, lookup_id)
    if lookup is None:
        raise HTTPException(status_code=404, detail="Lookup not found")

    db.delete(lookup)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a lookup that is referenced by existing records",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
