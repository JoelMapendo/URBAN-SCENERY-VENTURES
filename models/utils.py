from datetime import datetime
from enum import Enum
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class Timestamp:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class UserRole(str, Enum):
    Admin = "ADMIN"
    Customer = "CUSTOMER"
    Guest = "GUEST"


class OrderStatus(str, Enum):
    Pending = "PENDING"
    Approved = "APPROVED"
    Processing = "PROCESSING"
    Shipped = "SHIPPED"
    Delivered = "DELIVERED"
    Delivared = "DELIVARED"  # Alias for backward compatibility
    Cancelled = "CANCELLED"
    Failed = "FAILED"
    Refunded = "REFUNDED"
    Refounded = "REFOUNDED"  # Alias for backward compatibility


class PaymentStatus(str, Enum):
    Paid = "PAID"
    Pending = "PENDING"
    pending = "PENDING"
    Not_yet_paid = "NOT YET PAID"
    Failed = "FAILED"


class PaymentMethod(str, Enum):
    Mobile_money = "MOBILE MONEY"
    Bank = "BANK"
    Crypto = "CRYPTO"
    Cripto = " CRIPTO"  # Alias for backward compatibility


class ProductStatus(str, Enum):
    Available = "AVAILABLE"
    Shipping = "SHIPPING"
    SHIPPING = "SHIPPING"
    Empty = "EMPTY"
    EMPY = "EMPTY"  # Alias for backward compatibility
    OutOfStock = "OUT_OF_STOCK"