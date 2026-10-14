from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import AliasPath, BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=32, description="User full name")
    email: EmailStr = Field(..., description="User email address")
    contact: Optional[str] = Field(None, max_length=64, description="User phone number or contact info")


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128, description="User password")
    role: Literal["CUSTOMER", "GUEST"] = Field(
        default="CUSTOMER", description="Public registration roles"
    )


class AdminUserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    role: Literal["CUSTOMER", "GUEST", "ADMIN"] = "CUSTOMER"


class UserRoleUpdate(BaseModel):
    role: Literal["CUSTOMER", "GUEST", "ADMIN"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=64)
    contact: Optional[str] = Field(None, max_length=64)


class UserOut(BaseModel):
    public_id: UUID
    name: str
    email: str
    role: str = Field(validation_alias=AliasPath("user_role", "name"))
    contact: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
