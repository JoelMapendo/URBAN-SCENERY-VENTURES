
from sqlalchemy.orm import Mapped , mapped_column , relationship
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
    status : Mapped[str] = mapped_column(default=ProductStatus.Available)
    orders : Mapped[list["Order"]] = relationship(back_populates="product")