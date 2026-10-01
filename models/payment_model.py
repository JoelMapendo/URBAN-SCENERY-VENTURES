
from settings import Model 
from sqlalchemy.orm import Mapped , mapped_column , relationship 
from sqlalchemy import  DECIMAL, DATETIME , ForeignKey , Integer , func
from .utils import PaymentMethod
from datetime import datetime



class Payment(Model):
    
    __tablename__="payments"
    
    id: Mapped[int] = mapped_column(primary_key=True , unique=True ,nullable=False)
    payment_method : Mapped[str] = mapped_column(default=PaymentMethod.Bank)
    amount : Mapped[float] = mapped_column(DECIMAL)
    paid_at : Mapped[datetime] = mapped_column(DATETIME(timezone=True), server_default=func.now())
    order_id : Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    order : Mapped["Order"] = relationship(back_populates="payment")