from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional
from pydantic import AliasPath, BaseModel, Field


class PaymentCreate(BaseModel):
    order_id: int = Field(..., description="ID of the order to pay for")
    payment_method: Literal["MOBILE MONEY", "BANK", "CRYPTO"] = Field(
        ..., description="Payment method: MOBILE MONEY, BANK, CRYPTO"
    )
    amount: Decimal = Field(..., gt=0, description="Amount paid")


class PaymentUpdate(BaseModel):
    payment_method: Optional[Literal["MOBILE MONEY", "BANK", "CRYPTO"]] = None
    amount: Optional[Decimal] = Field(None, gt=0)


class PaymentProcessRequest(BaseModel):
    order_id: int = Field(..., description="Order ID to settle")
    payment_method: Literal["MOBILE MONEY", "BANK", "CRYPTO"] = Field(
        ..., description="Payment method: MOBILE MONEY, BANK, CRYPTO"
    )
    account_reference: Optional[str] = Field(None, description="Phone number (Mobile Money), Wallet Address (Crypto), or Account Ref")


class PaymentOut(BaseModel):
    id: int
    payment_method: str = Field(validation_alias=AliasPath("payment_method", "name"))
    amount: Decimal
    paid_at: datetime
    order_id: int

    class Config:
        from_attributes = True
