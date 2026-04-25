from fastapi import FastAPI, Depends, status, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from models import CreateUser, LoginUser, UserData, get_db, User, Dish, DishData
from sqlalchemy.orm import Session
from hash import Hash
from routers import user, dish
from jwt_config import create_jwt_token

app = FastAPI()
app.include_router(user.router)
app.include_router(dish.router)

@app.post("/create_token", status_code=status.HTTP_201_CREATED, tags=["Create JWT"])
def create_token(data: OAuth2PasswordRequestForm=Depends(), db: Session=Depends(get_db)):
    email = db.query(User).where(User.email == data.username).first()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="use a registered email"   
        )
    access_token = create_jwt_token(data={"sub": data.username}, exp_min=5)
    return {"access_token": access_token, "token_type": "bearer"}
