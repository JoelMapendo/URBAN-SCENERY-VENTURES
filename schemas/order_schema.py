from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional
from uuid import UUID
from pydantic import AliasPath, BaseModel, Field
from schemas.product_schema import ProductOut


class OrderCreate(BaseModel):
    product_id: int = Field(..., description="ID of the electronics product to buy")
    quantity: int = Field(default=1, ge=1, description="Number of items to purchase")
    address: str = Field(..., min_length=5, max_length=128, description="Delivery / Shipping address")
    contact: str = Field(..., min_length=5, max_length=16, description="Contact phone number")
    payment_method: Optional[Literal["MOBILE MONEY", "BANK", "CRYPTO"]] = Field(
        default="BANK",
        description="Preferred payment method (MOBILE MONEY, BANK, CRYPTO)",
    )


class OrderStatusUpdate(BaseModel):
    order_status: Optional[
        Literal["PENDING", "APPROVED", "SHIPPED", "DELIVERED", "CANCELLED"]
    ] = None
    payment_status: Optional[Literal["PAID", "NOT YET PAID", "FAILED"]] = None


class OrderOut(BaseModel):
    id: int
    address: str
    contacs: str
    order_status: str = Field(validation_alias=AliasPath("order_status", "name"))
    payment_method: str = Field(validation_alias=AliasPath("payment_method", "name"))
    payment_status: str = Field(validation_alias=AliasPath("payment_status", "name"))
    initial_price: Decimal
    total_price: Decimal
    quantity: int
    ordered_at: datetime
    user_id: Optional[UUID] = None
    product_id: int
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True
