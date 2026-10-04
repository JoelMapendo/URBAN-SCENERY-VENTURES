
from settings import Model 
from datetime import datetime 
import uuid

from sqlalchemy.orm import Mapped , mapped_column , relationship 
from sqlalchemy import String , Integer , DECIMAL  , DateTime , ForeignKey , Uuid , func 
from typing import TYPE_CHECKING 

if TYPE_CHECKING :
    from .utils import OrderStatus , PaymentMethod , PaymentStatus
    from .users_model import User 
    from .products_model import Product 
    from .payment_model import Payment
    

class Order(Model):
    
    __tablename__ = "orders"
    
    id : Mapped[uuid.UUID] = mapped_column(Uuid ,primary_key=True , nullable=False , index=True , default=uuid.uuid4)
    address : Mapped[str] = mapped_column(String(128) , nullable=False)
    contacs : Mapped[str] = mapped_column(String(16), nullable=False) # phone number 
    
    initial_price : Mapped[float] = mapped_column(DECIMAL)
    total_price : Mapped[float] = mapped_column(DECIMAL)
    quantity : Mapped[int] = mapped_column(Integer)
    
    order_status_id : Mapped[int] = mapped_column(ForeignKey("order_statuses.id"))
    payment_method_id: Mapped[int] = mapped_column(ForeignKey("payment_methods.id"))
    payment_status_id : Mapped[int] = mapped_column(ForeignKey("payment_statuses.id"))
    user_id : Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.private_id"), nullable=True)
    product_id : Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    
    ordered_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default= func.now())
    
    user : Mapped["User"] = relationship(
        "User",
        back_populates="orders"
        )
    
    product : Mapped["Product"] = relationship(
        "Product",back_populates="orders"
        )

    payment : Mapped["Payment | None"] = relationship(
        "Payment",
        back_populates="order", cascade="all, delete-orphan"
        )
    
    order_status : Mapped["OrderStatus"] = relationship(
        "OrderStatus",
        back_populates="order"
    )
    
    payment_status : Mapped["PaymentStatus"] = relationship(
            "PaymentStatus",
            back_populates="order"
    )
     
    payment_method : Mapped["PaymentMethod"] = relationship(
            "PaymentMethod",
            back_populates="order"
    )