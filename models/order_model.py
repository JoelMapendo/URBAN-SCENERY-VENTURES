
from settings import Model 
from datetime import datetime 
import uuid
from .utils import OrderStatus , PaymentMethod , PaymentStatus
from sqlalchemy.orm import Mapped , mapped_column , relationship
from sqlalchemy import String , Integer , DECIMAL  , DateTime , ForeignKey , Uuid , func


class Order(Model):
    
    __tablename__ = "orders"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False , index=True)
    address : Mapped[str] = mapped_column(String(128) , nullable=False)
    contacs : Mapped[str] = mapped_column(String(16), nullable=False) # phone number 
    
    order_status : Mapped[str] = mapped_column(default=OrderStatus.Pending.value)
    payment_method : Mapped[str] = mapped_column(default=PaymentMethod.Bank.value)
    payment_status : Mapped[str] = mapped_column(default=PaymentStatus.Not_yet_paid.value)
    
    initial_price : Mapped[float] = mapped_column(DECIMAL)
    total_price : Mapped[float] = mapped_column(DECIMAL)
    quantity : Mapped[int] = mapped_column(Integer)
    
    ordered_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default= func.now())
    
    
    user_id : Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.private_id"), nullable=True)
    user : Mapped["User"] = relationship(back_populates="orders")

    product_id : Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    product : Mapped["Product"] = relationship(back_populates="orders")

    payment : Mapped["Payment | None"] = relationship(back_populates="order", cascade="all, delete-orphan")
    