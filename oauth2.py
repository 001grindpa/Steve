from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt_config import verify_jwt_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/create_token")

def get_current_user(token: str=Depends(oauth2_scheme)):
    return verify_jwt_token(token) # this function returns user's email/username from token (current user)