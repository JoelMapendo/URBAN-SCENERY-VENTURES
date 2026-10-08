from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from settings import get_db
from schemas.payment_schema import PaymentCreate, PaymentOut
from services import payment_service, order_service
from core.security import get_current_admin

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/pay", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def process_order_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
):
    order = order_service.get_order(payload.order_id, db)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{payload.order_id} not found",
        )

    if order.payment_status == "PAID":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order #{payload.order_id} has already been paid for",
        )

    try:
        payment = payment_service.create_payment(
            order_id=payload.order_id,
            payment_method=payload.payment_method,
            amount=payload.amount,
            session=db,
        )
        return payment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment_details(payment_id: int, db: Session = Depends(get_db)):
    payment = payment_service.get_payment(payment_id, db)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment #{payment_id} not found",
        )
    return payment


@router.get("/order/{order_id}", response_model=PaymentOut)
def get_payment_by_order(order_id: int, db: Session = Depends(get_db)):
    payment = payment_service.get_payment_by_order_id(order_id, db)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No payment recorded yet for Order #{order_id}",
        )
    return payment


@router.get("", response_model=List[PaymentOut], dependencies=[Depends(get_current_admin)])
def list_payments(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return payment_service.get_all_payments(session=db, offset=offset, limit=limit)
