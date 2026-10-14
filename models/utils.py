from models.shared import Timestamp
from settings import Model
from sqlalchemy import  Text , String
from sqlalchemy.orm import Mapped , mapped_column , relationship

from typing import TYPE_CHECKING 

if TYPE_CHECKING :
    from users_model import User 
    from products_model import Product 
    from payment_model import Payment 
    from order_model import Order 
    

class UserRole(Model , Timestamp):
    
    __tablename__="user_roles"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False)
    name : Mapped[str] = mapped_column(String(32) , unique=True , nullable=False)
    description : Mapped[str] = mapped_column(Text)
    
    user : Mapped["User"] = relationship(
        "User",
        back_populates="user_role"
    )
    

class OrderStatus(Model,Timestamp):
    
    __tablename__="order_statuses"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False)
    name : Mapped[str] = mapped_column(String(32) , unique=True , nullable=False)
    description : Mapped[str] = mapped_column(Text)
    
    order : Mapped["Order"] = relationship(
        "Order",
        back_populates="order_status"
    )

class PaymentStatus(Model,Timestamp):
    
    __tablename__="payment_statuses"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False)
    name : Mapped[str] = mapped_column(String(32) , unique=True , nullable=False)
    description : Mapped[str] = mapped_column(Text)  
    
    order : Mapped["Order"] = relationship(
            "Order",
            back_populates="payment_status"
        )
    
    
class PaymentMethod(Model, Timestamp):
    
    __tablename__="payment_methods"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False)
    name : Mapped[str] = mapped_column(String(32) , unique=True , nullable=False)
    description : Mapped[str] = mapped_column(Text)  
    
    
    order : Mapped["Payment"] = relationship(
        "Payment",
        back_populates="payment_method"
    )
    
    payment : Mapped["Payment"] = relationship(
            "Payment",
            back_populates="payment_method"
        )
    
class ProductStatus(Model , Timestamp):
    
    __tablename__="product_statuses"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False)
    name : Mapped[str] = mapped_column(String(32) , unique=True , nullable=False)
    description : Mapped[str] = mapped_column(Text)  
    
    product : Mapped["Product"] = relationship(
        "Product",
        back_populates="product_status"
    )
