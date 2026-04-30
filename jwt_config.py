from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
import datetime
from models import TokenData
from dotenv import load_dotenv
import os
load_dotenv()

secret_key=os.getenv("SECRET_KEY")
algo=os.getenv("ALGORITHM")

SECRET_KEY=secret_key
ALGORITHM=algo

def create_jwt_token(data: dict, exp_min: int):
    to_encode = data.copy()

    # setup expiration logic
    exp = datetime.datetime.now() + datetime.timedelta(minutes=exp_min)
    to_encode.update({"exp": exp})

    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded

def verify_jwt_token(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        email = decoded.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized token"
            )
        email_data = TokenData(email=email)
        return email_data
    except JWTError:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized token"
            )