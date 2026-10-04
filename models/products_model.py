
from sqlalchemy.orm import Mapped , mapped_column , relationship
from sqlalchemy import String , TEXT , DECIMAL , Integer , ForeignKey
from settings import Model 
from models.shared import  Timestamp
from typing import TYPE_CHECKING 

if TYPE_CHECKING :
    
    from .utils import ProductStatus 
    from .order_model import Order
   
    
from sqlalchemy import String , TEXT , DECIMAL , Integer
from settings import Model 
from .utils import ProductStatus , Timestamp

class Product(Model, Timestamp):
    __tablename__= "products"
    
    id : Mapped[int] = mapped_column(primary_key=True , nullable=False , index=True , unique=True)
    name : Mapped[str] = mapped_column(String(128), nullable=False , index=True)
    price : Mapped[float] = mapped_column(DECIMAL)
    description : Mapped[str] = mapped_column(TEXT)
    banner_image : Mapped[str]= mapped_column(TEXT)
    quantity : Mapped[int] = mapped_column(Integer)
    product_status_id : Mapped[int] = mapped_column(ForeignKey("product_statuses.id"))
    
    orders : Mapped[list["Order"]] = relationship(
        back_populates="product")
    
    payment_status : Mapped["ProductStatus"] = relationship(
        "ProductStatus",
        back_populates="product"
    )
    status : Mapped[str] = mapped_column(default=ProductStatus.Available.value)
    orders : Mapped[list["Order"]] = relationship(back_populates="product")
