from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, StreamingResponse
from models import CreateUser, LoginUser, UserData, get_db, User, Chat, History
from sqlalchemy.orm import Session
from sqlalchemy import and_
from hash import Hash
import json
from kit import (
    check_password, email_check, stream_response, get_time, 
    getting_dish_replies, DishDetail
)
from agents.agent import graph
import ast

router = APIRouter(tags=["User Routes"])
templates = Jinja2Templates(directory="templates")

# landing page endpoint
@router.get("/landing", status_code=status.HTTP_200_OK)
def landing(request: Request):
    return templates.TemplateResponse(request, "landing.html", {"page_id": "landing"})

# index page endpoint
@router.get("/", status_code=status.HTTP_200_OK)
def index(request: Request):
    if not request.session.get("email"):
        return RedirectResponse("/landing", status_code=303)
    return templates.TemplateResponse(request, "index.html", {"page_id": "index", "user": request.session["username"]})

# sign up endpoints
@router.get("/signup", status_code=status.HTTP_200_OK)
def signup(request: Request):
    return templates.TemplateResponse(request, "signup.html", {"page_id": "signup"})

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(request: Request ,user_data: CreateUser, db: Session=Depends(get_db)):
    # remove live sessions after login
    if request.session.get("dishes"):
        request.session["dishes"] = None
    # check if fields are empty and if passwords are matching
    if (user_data.password != user_data.confirm_pw):
        raise HTTPException(status_code=status.HTTP_412_PRECONDITION_FAILED, detail="mismatched")
    elif (len(user_data.password.strip()) == 0 or 
          len(user_data.confirm_pw.strip()) == 0 or len(user_data.email.strip()) == 0):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, 
                            detail="Empty field detected")
    # check if password is strong
    password_result = check_password(user_data.password)
    if password_result != "valid":
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=password_result)
    # check if email is valid
    email_result = email_check(user_data.email.strip())
    if email_result != "valid":
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=email_result)
    # check if email already exists
    pending_user = db.query(User).where(User.email == user_data.email.strip()).first()
    if pending_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="exists")
    # create user if all conditions are valid
    user = User(password=Hash.hash_func(user_data.password.strip()),
                email=user_data.email.lower().strip())
    db.add(user)
    db.commit()
    request.session["email"] = user_data.email
    request.session["username"] = "user"
    db.refresh(user)
    return {"detail": "success"}

# login endpoints
@router.get("/login", status_code=status.HTTP_200_OK)
def login(request: Request):
    return templates.TemplateResponse(request, "login.html", {"page_id": "login"})

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(request: Request,user_data: LoginUser, db: Session=Depends(get_db)):
    # remove live sessions after login
    if request.session.get("dishes"):
        request.session["dishes"] = None
    # check if fields are empty
    if user_data.email.strip() == "" or user_data.password.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="empty"
        )
    user = db.query(User).where(User.email == user_data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="not exist")
    if Hash.verify_hash(user_data.password, user.password):
        request.session["email"] = user.email
        request.session["username"] = "user"
        return {"detail": "success"}
    return {"detail": "Check password again"}

@router.get("/get_user/{user}", status_code=status.HTTP_200_OK, response_model=UserData)
def get_user(username: str, db: Session=Depends(get_db)):
    user = db.query(User).where(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="User does not exist")
    return user

# logout endpoint
@router.post("/logout", status_code=status.HTTP_308_PERMANENT_REDIRECT)
def logout(request: Request):
    request.session["username"] = None
    request.session["email"] = None
    return RedirectResponse("/login", status_code=status.HTTP_308_PERMANENT_REDIRECT)

# agent query endpoint
@router.get("/steve", status_code=status.HTTP_200_OK)
async def steve(request: Request, query: str=None, db: Session=Depends(get_db)):
    user = db.query(User).where(User.email == request.session.get("email")).first()
    config = {"configurable": {"thread_id": user.id}}
    raw_r = await graph.ainvoke({"messages": [query]}, config=config)
    r = raw_r["messages"][-1].content
    print(r)
    try:
        if (isinstance(ast.literal_eval(r), list)):
            dish_data = []
            for obj in ast.literal_eval(r):
                dish_data.append(json.loads(obj))
            request.session["dishes"] = dish_data
            r = await getting_dish_replies()
    except (ValueError, SyntaxError):
        pass
    time = get_time()
    # add chat to database first
    chat = Chat(
        email=request.session.get("email"), user_txt=query,
        user_time=time, steve_txt=r, steve_time=time
        )
    db.add(chat)
    db.commit()

    # query db to get llm response
    last_chat = db.query(Chat).where(
        Chat.email == request.session.get("email")        
        ).order_by(Chat.id.desc()).first()
    llm_response = last_chat.steve_txt
    
    # print(last_chat)
    # SSE - Server Sent Event
    return StreamingResponse(stream_response(llm_response), media_type="text/event-stream")

@router.get("/chat", status_code=status.HTTP_200_OK)
def chat(request: Request, db: Session=Depends(get_db)):
    chats = db.query(Chat).where(Chat.email == request.session.get("email")).all()
    if chats is None:
        return {"detail": "not_found"}
    return {"detail": chats}

# This endpoint deletes chats
@router.delete("/clear_chat", status_code=status.HTTP_200_OK)
def clear_chat(request: Request, db:Session=Depends(get_db)):
    chats = db.query(Chat).where(Chat.email == request.session.get("email")).all()
    for chat in chats:
        db.delete(chat)
        db.commit()
    return {"detail": "chats cleared"}

# this api returns history template on page request
@router.get("/history", status_code=status.HTTP_200_OK)
def history(request: Request):
    return templates.TemplateResponse(request, "history.html", {"page_id": "history"})

# this api gets stored history data
@router.post("/get-history", status_code=status.HTTP_200_OK)
async def get_history(request: Request, db: Session=Depends(get_db)):
    q = await request.json()
    # get user
    user = db.query(User).where(User.email == request.session.get("email")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    history: str
    # query fav history table
    if q.get("q") == "fav":
        history = db.query(History).where(
            and_(History.favorites != "", History.user_id == user.id)
        ).limit(q.get("lim")).all()
    # query planner history table
    elif q.get("q") == "plan":
        history = db.query(History).where(
            and_(History.planner != "", History.user_id == user.id)
        ).limit(q.get("lim")).all()

    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empty history"
        )
    return {"detail": history}
