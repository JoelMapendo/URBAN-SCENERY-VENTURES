import uuid 
from settings import Model 
from .utils import Timestamp , UserRole
from sqlalchemy.orm import Mapped , mapped_column , relationship
from sqlalchemy import String , Uuid

class User(Model,Timestamp):
    
    __tablename__="users"
    
    private_id : Mapped[uuid.UUID] = mapped_column(Uuid,primary_key=True,unique=True,default=uuid.uuid4)
    public_id : Mapped[uuid.UUID] = mapped_column(Uuid,unique=True,index=True,default=uuid.uuid4,nullable=False)
    name : Mapped[str] = mapped_column(String(32),nullable=False)
    email : Mapped[str] = mapped_column(String(128),nullable=False,unique=True)
    orders : Mapped[list["Order"]] = relationship(back_populates="user")
    role : Mapped[UserRole] = mapped_column(default=UserRole.Guest)
    contact : Mapped[str] = mapped_column(String(128))