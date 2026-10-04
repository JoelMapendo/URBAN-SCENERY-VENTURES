from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker , DeclarativeBase 
from dotenv import load_dotenv 

load_dotenv()
import os 

DATABASE_URL = str(os.getenv("DATABASE_URL"))

class Model(DeclarativeBase):
    pass

engine = create_engine(
    DATABASE_URL ,
    echo = True
)

sessionlocal = sessionmaker(
    autoflush=False ,
    autocommit = False,
    expire_on_commit=False,
    bind= engine 
)