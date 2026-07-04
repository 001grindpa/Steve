from fastapi import APIRouter, Depends, status, Request, HTTPException
from models import get_db, Dish, DishData, User
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from sqlalchemy import and_
from hash import Hash
from routers import user
from oauth2 import get_current_user
from kit import DishDetail

router = APIRouter(tags=["Dish Routes"])
templates = Jinja2Templates(directory="templates")

@router.get("/to-make", status_code=status.HTTP_200_OK)
async def to_make(request: Request):
    dishes = ""
    if request.session.get("dishes"):
        dishes = request.session.get("dishes")
    return {"detail": dishes}

# this API endpoint recieves the array index of the dish object you intend to save
# then it saves it from the active dishes session data to the db
@router.post("/add-dish", status_code=status.HTTP_201_CREATED)
async def add_dish(request: Request, index: int, db:Session = Depends(get_db)):
    selected_dish = request.session.get("dishes")[index]
    current_user = db.query(User).where(User.email == request.session.get("email")).first()

    # check if dish is already in db
    dish = db.query(Dish).where(Dish.name == selected_dish.get("name")).first()
    if dish:
        raise HTTPException(status_code=status.HTTP_302_FOUND, detail="This dish is already added to list")
    # create dish db object
    new_dish = Dish(name=selected_dish.get("name"), origin=selected_dish.get("origin"), 
                time=selected_dish.get("time_it_takes"), mode=selected_dish.get("difficulty"), 
                description=selected_dish.get("description"), ingredients=selected_dish.get("ingredients"))
    # add dish object to db
    current_user.dishes.append(new_dish)
    db.commit()
    return {"detail": "Meal added to list successfully"}

# this endpoint returns the page template
@router.get("/dishes", status_code=status.HTTP_200_OK)
def dishes(request: Request):
    return templates.TemplateResponse(request, "favorites.html", {"page_id": "fav"})

# this api retrieves dishes from db
@router.post("/dishes", status_code=status.HTTP_200_OK)
async def dishes(request: Request, db: Session=Depends(get_db)):
    form_data = await request.json()
    print(form_data)
    
    current_user = db.query(User).where(User.email == request.session.get("email")).first()

    if form_data.get("fav").strip() != "":
        queried_dishes = db.query(Dish).where(Dish.user_id == current_user.id).filter(Dish.name.like(f"%{form_data.get("fav").strip()}%")).all()
        if queried_dishes is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This dish is not found")
        else:
            return {"detail": queried_dishes}

    if current_user is None:
        raise HTTPException(detail="User not found", status_code=status.HTTP_404_NOT_FOUND)
    if form_data.get("fav").strip() == "":
        user_dishes = db.query(Dish).where(Dish.user_id == current_user.id).all()
        return {"detail": user_dishes}

# this api removes fav dishes from db
@router.delete("/remove-dish", status_code=status.HTTP_200_OK)
def remove_dish(request: Request, name: str, db: Session=Depends(get_db)):
    # get user
    current_user = db.query(User).where(User.email == request.session.get("email")).first()

    # check if dish in db
    dish = db.query(Dish).where(and_(Dish.name == name,
                                     Dish.user_id == current_user.id)).first()
    if dish:
        db.delete(dish)
        db.commit()
        return {"detail": "Meal removed from list"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This dish is not in list")

# this api clears steve's ideas from ui
@router.delete("/cancel-options", status_code=status.HTTP_200_OK)
def cancel_options(request: Request):
    request.session["dishes"] = None
    return {"detail": "options cleared"}