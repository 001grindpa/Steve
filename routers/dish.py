from fastapi import APIRouter, Depends, status, Request, HTTPException
from models import CreateUser, LoginUser, UserData, get_db, User, Dish, DishData
from sqlalchemy.orm import Session
from hash import Hash
from routers import user
from oauth2 import get_current_user

router = APIRouter(tags=["Dish Routes"])

@router.post("/make_dish", status_code=status.HTTP_201_CREATED)
def make_dish(dish_data: DishData, username: str, current_user: User=Depends(get_current_user), db: Session=Depends(get_db)):
    dish = Dish(name=dish_data.name, origin=dish_data.origin, 
                ingredients=dish_data.ingredients)
    user = db.query(User).where(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="User does not exist")
    
    user.dishes.append(dish)
    db.commit()
    db.refresh(dish)
    return dish
