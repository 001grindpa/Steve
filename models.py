from sqlalchemy import Column, String, Integer, create_engine, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
import os
load_dotenv()

# access env
user_pw = os.getenv("USER_PW")

# query Steve
class QueryData(BaseModel):
    query: str

# dishes model
class DishData(BaseModel):
    name: str
    origin: str
    ingredients: str

# user models
class CreateUser(BaseModel):
    password: str
    confirm_pw: str
    email: str

class LoginUser(BaseModel):
    email: str
    password: str

class UserData(LoginUser):
    username: str
    dishes: List[DishData]
    class Config():
        orm_mode = True
        
# jwt decoded token class
class TokenData(BaseModel):
    email: str

# database config
db_url = f"mysql+mysqlconnector://root:{user_pw}@localhost/steve"
engine = create_engine(db_url)
Base = declarative_base()
LocalSession = sessionmaker(bind=engine, autoflush=False)

# declare db session
def get_db():
    try:
        db = LocalSession()
        yield db
    finally:
        db.close

class BaseClass(Base):
    __allow_unmapped__ = True
    __abstract__ = True

    id = Column(Integer, primary_key=True)

class User(BaseClass):
    __tablename__ = "users"

    username = Column(String(255))
    password = Column(String(255))
    email = Column(String(255))

    dishes = relationship("Dish", back_populates="users")

    def __repr__(self):
        return f"<username='{self.username}', email='{self.email}'>"
    
class Dish(BaseClass):
    __tablename__ = "dishes"

    name = Column(String(255))
    origin = Column(String(255))
    time = Column(String(255))
    mode = Column(String(255))
    description = Column(String(1000))
    ingredients = Column(String(1000))
    user_id = Column(ForeignKey("users.id"))

    users = relationship(User, back_populates="dishes")

    def __repr__(self):
        f"<name='{self.name}', origin='{self.origin}', ingredients='{self.ingredients}'>"

class Chat(BaseClass):
    __tablename__ = "chats"
    email = Column(String(255))
    user_txt = Column(String(255))
    user_time = Column(String(255))
    steve_txt = Column(String(1000))
    steve_time = Column(String(255))

    def __repr__(self):
        return f"id='{self.id}', user_txt='{self.user_txt}', steve_txt='{self.steve_txt}', steve_time='{self.steve_time}'"

Base.metadata.create_all(engine)