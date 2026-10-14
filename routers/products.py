from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from settings import get_db
from models.products_model import Product
from schemas.product_schema import ProductCreate, ProductUpdate, ProductOut
from services import product_service
from core.security import get_current_admin

router = APIRouter(prefix="/products", tags=["Products (Electronics)"])


@router.get("", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = Query(None, description="Search products by title or description"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (AVAILABLE, EMPTY)"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return product_service.get_all_products(
        session=db,
        offset=offset,
        limit=limit,
        search=search,
        min_price=min_price,
        max_price=max_price,
        status=status_filter,
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(product_id, db)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Electronics product #{product_id} not found",
        )
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_new_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
):
    product = Product(
        name=payload.name,
        price=payload.price,
        description=payload.description,
        banner_image=payload.banner_image,
        quantity=payload.quantity,
        status=payload.status or "AVAILABLE",
    )
    return product_service.create_product(product, db)


@router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(get_current_admin)])
def update_product_details(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)
    updated = product_service.update_product(product_id, updates, db)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product #{product_id} not found",
        )
    return updated


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_product_item(product_id: int, db: Session = Depends(get_db)):
    success = product_service.delete_product(product_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product #{product_id} not found",
        )
