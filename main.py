from fastapi import FastAPI, Depends, status, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import httpx
from models import get_db, User
import urllib.parse
from sqlalchemy.orm import Session
from routers import user, dish, google_OAuth
from jwt_config import create_jwt_token
import os
from dotenv import load_dotenv

load_dotenv()
# environment variables
session_secret_key = os.getenv("SESSION_SECRET_KEY")
google_client_id = os.getenv("GOOGLE_AUTH_CLIENT_ID")
google_client_secret = os.getenv("GOOGLE_AUTH_CLIENT_SECRET_KEY")
google_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

# check if all env variables are true
if not all([google_client_id, google_client_secret, google_redirect_uri, session_secret_key]):
    raise RuntimeError("Missing required Google OAuth environment variables")

# declare google endpoints
GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"

app = FastAPI()
app.include_router(user.router)
app.include_router(dish.router)
app.include_router(google_OAuth.router)
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
