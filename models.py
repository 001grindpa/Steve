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

# this table stores user data
class User(BaseClass):
    __tablename__ = "users"

    username = Column(String(255))
    password = Column(String(255))
    email = Column(String(255))

    dishes = relationship("Dish", back_populates="users")
    planner = relationship("Planner", back_populates="users")

    def __repr__(self):
        return f"<username='{self.username}', email='{self.email}'>"
    
# this table stores fav dishes
class Dish(BaseClass):
    __tablename__ = "dishes"

    name = Column(String(255))
    origin = Column(String(255))
    time = Column(String(255))
    mode = Column(String(255))
    description = Column(String(1000))
    ingredients = Column(String(1000))
    user_id = Column(ForeignKey("users.id"))

    users = relationship(User, back_populates="dishes") # relate to user where user is forign key
    recipes = relationship("Recipe", back_populates="dishes") # relate to recipe as forign key

    def __repr__(self):
        f"<name='{self.name}', origin='{self.origin}', ingredients='{self.ingredients}'>"

# table that stores conversations
class Chat(BaseClass):
    __tablename__ = "chats"
    email = Column(String(255))
    user_txt = Column(String(255))
    user_time = Column(String(255))
    steve_txt = Column(String(1000))
    steve_time = Column(String(255))

    def __repr__(self):
        return f"id='{self.id}', user_txt='{self.user_txt}', steve_txt='{self.steve_txt}', steve_time='{self.steve_time}'"

# this table stores meal planner
class Planner(BaseClass):
    __tablename__ = "planner"

    breakfast = Column(String(1000))
    lunch = Column(String(1000))
    dinner = Column(String(1000))
    snacks = Column(String(1000))
    user_id = Column(ForeignKey("users.id"))

    # establish relationship with user table
    users = relationship(User, back_populates="planner")

    def __repr__(self):
        return f"""<id='{self.id}', breakfast='{self.breakfast}', 
        lunch='{self.lunch}', dinner='{self.dinner}', snack'{self.snacks}'>""".strip()

# this db stores dish recipes
class Recipe(BaseClass):
    __tablename__ = "recipes"

    dish_name = Column(String(1000))
    ingredients = Column(String(1000)) # add ingredients seperated by comma
    quantities = Column(String(255)) # ingre qunatities seperated by a comma
    steps = Column(String(1000)) # add steps seperated by comma
    dish_id = Column(ForeignKey("dishes.id"))

    dishes = relationship(Dish, back_populates="recipes") # relate to dishes where dishes is foreign key

    def __repr__(self):
        return f"<id='{self.id}', dish_name='{self.dish_name}', ingredients='{self.ingredients}', quantity='{self.quantities}', steps='{self.steps}', dish_id='{self.dish_id}'>"

Base.metadata.create_all(engine)