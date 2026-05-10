from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi.responses import RedirectResponse
from models import get_db, User
from sqlalchemy.orm import Session
from hash import Hash
import urllib.parse
import httpx
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

router = APIRouter(tags=["Google OAuth"])

@router.get("/auth/google")
async def login_google():
    # construct the query params for Google's OAuth
    params = {
        "client_id": google_client_id,
        "response_type": "code",
        "scope": "openid profile email",
        "redirect_uri": google_redirect_uri,
        "access_type": "offline"
    }
    query_string = urllib.parse.urlencode(params)
    google_url = f"{GOOGLE_AUTH_ENDPOINT}?{query_string}"

    # Redirect the user's browser straight to google
    return RedirectResponse(url=google_url)

@router.get("/auth/callback", status_code=status.HTTP_200_OK)
async def google_callback(request: Request, code: str, db: Session=Depends(get_db)):
    # exchange the temporary code for an access token
    async with httpx.AsyncClient(timeout=60) as client:
        token_response = await client.post(
            url=GOOGLE_TOKEN_ENDPOINT,
            data={
                "code": code,
                "client_id": google_client_id,
                "client_secret": google_client_secret,
                "redirect_uri": google_redirect_uri,
                "grant_type": "authorization_code"
            }
        )
        if token_response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Failed to fetch user info from Google")
        tokens = token_response.json()
        access_token = tokens.get("access_token")

        # use the access token to pull user's profile data
        async with httpx.AsyncClient(timeout=60) as client:
            userinfo_response = await client.get(
                url=GOOGLE_USERINFO_ENDPOINT,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if userinfo_response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Failed to fetch user info from google"
                )
            user_data = userinfo_response.json()
            email = user_data.get("email")
            name = user_data.get("name")
            picture = user_data.get("picture")

            # check if user already exists in db, else create new user with null pw
            user = db.query(User).where(User.email == email).first()
            if not user:
                new_user = User(username=name, email=email, password="")
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
    # assign session
    request.session["username"] = name
    return RedirectResponse("/", status_code=status.HTTP_303_SEE_OTHER)
