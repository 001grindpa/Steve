from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from models import CreateUser, LoginUser, UserData, get_db, User
from sqlalchemy.orm import Session
from hash import Hash

router = APIRouter(tags=["User Routes"])
templates = Jinja2Templates(directory="templates")

# landing page endpoint
@router.get("/landing", status_code=status.HTTP_200_OK)
def landing(request: Request):
    return templates.TemplateResponse(request, "landing.html", {"page_id": "landing"})

# index page endpoint
@router.get("/", status_code=status.HTTP_200_OK)
def index(request: Request):
    if not request.session.get("username"):
        return RedirectResponse("/landing", status_code=303)
    return templates.TemplateResponse(request, "index.html")

# sign up endpoints
@router.get("/signup", status_code=status.HTTP_200_OK)
def signup(request: Request):
    return templates.TemplateResponse(request, "index.html")

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: CreateUser, db: Session=Depends(get_db)):
    user = User(username=user_data.username.lower(),
                password=Hash.hash_func(user_data.password),
                email=user_data.email.lower())
    db.add(user)
    db.commit()
    # db.refresh(user)
    return {"msg": "signup successfull"}

# login endpoints
@router.post("/login", status_code=status.HTTP_200_OK)
def login(user_data: LoginUser, db: Session=Depends(get_db)):
    user = db.query(User).where(User.email == user_data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="User does not exist")
    if Hash.verify_hash(user_data.password, user.password):
        return {"msg": "login succesfull"}
    return {"msg": "check password again"}

@router.get("/get_user/{user}", status_code=status.HTTP_200_OK, response_model=UserData)
def get_user(username: str, db: Session=Depends(get_db)):
    user = db.query(User).where(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="User does not exist")
    return user
