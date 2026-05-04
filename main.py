from fastapi import FastAPI, Depends, status, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from models import get_db, User
from sqlalchemy.orm import Session
from routers import user, dish
from jwt_config import create_jwt_token
import os
from dotenv import load_dotenv

load_dotenv()

session_secret_key = os.getenv("SESSION_SECRET_KEY")

app = FastAPI()
app.include_router(user.router)
app.include_router(dish.router)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(SessionMiddleware, secret_key=session_secret_key, max_age=30*24*60*60) # max_age (30 days in this case) is session lifetime in seconds

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
