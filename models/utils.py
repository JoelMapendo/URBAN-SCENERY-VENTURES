from datetime import datetime 
from sqlalchemy import DateTime , func
from sqlalchemy.orm import Mapped , mapped_column
from enum import Enum 

class Timestamp :
    
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default= func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default= func.now())
    
    
class UserRole(Enum):
    
    Admin ="ADMIN"
    Customer = "CUSTOMER"
    Guest = "GUEST"
    
class OrderStatus(Enum):
    
    Pending ="PENDING"
    Failed = "FAILED"
    Cancelled = "CANCELLED"
    Shipped  = "SHIPPED"
    Refounded = "REFOUNDED"
    Delivared = "DELIVARED"
    

class PaymentStatus(Enum):
    
    Paid = "PAID"
    pending = "PENDING"
    Not_yet_paid = "NOT YET PAID"    
    
class PaymentMethod(Enum):
    
    Mobile_money = "MOBILE MONEY"
    Bank = "BANK"
    Cripto = " CRIPTO"
    
class ProductStatus(Enum):
    
    Available = "AVAILABLE"
    SHIPPING = "SHIPPING"
    EMPY = "EMPTY"