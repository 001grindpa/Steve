from fastapi import APIRouter, Depends, status, Request, HTTPException
from models import get_db, Dish, DishData, User, Recipe, Planner, PlannerDishDetail
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from sqlalchemy import and_
from hash import Hash
from routers import user
from oauth2 import get_current_user
from kit import DishDetail
from agents.recipe_agent import query_graph
import ast
import json

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
    return {"detail": "Meal added to favorites"}

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

# this api returns the planner page template for rendering
@router.get("/planner", status_code=status.HTTP_200_OK)
def planner(request: Request):
    return templates.TemplateResponse(request, "planner.html", {"page_id": "planner"})

# this api removes fav dishes from db
@router.delete("/remove-dish", status_code=status.HTTP_200_OK)
def remove_dish(request: Request, name: str, db: Session=Depends(get_db)):
    # get user
    current_user = db.query(User).where(User.email == request.session.get("email")).first()

    # check if dish in db
    dish = db.query(Dish).where(and_(Dish.name == name,
                                     Dish.user_id == current_user.id)).first()
    # remove the associated recipe
    recipe = db.query(Recipe).where(Recipe.dish_id == dish.id).first()
    if recipe:
        db.delete(recipe)
        db.commit()

    if dish:
        db.delete(dish)
        db.commit()
        if dish.id in request.session.get("planner_dishes"):
            request.session.get("planner_dishes").remove(dish.id)
            print("removed from planner")
        return {"detail": "Meal removed from list"}
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This dish is not in list")

# this api adds meal to planner session
@router.put("/add-to-planner", status_code=status.HTTP_201_CREATED)
async def add_planner(request: Request, meal: str, db: Session=Depends(get_db)):
    # declare planner dish list session
    if not request.session.get("planner_dishes"):
        request.session["planner_dishes"] = []
    # get current user
    user = db.query(User).where(User.email == request.session.get("email")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    # get dish object
    dish_obj = db.query(Dish).where(and_(Dish.user_id == user.id, Dish.name == meal)).first()
    if not dish_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dish does not exist"
        )
    # check if meal is already in session
    if dish_obj.id in request.session.get("planner_dishes"):
        raise HTTPException(
            status.HTTP_302_FOUND, detail=f"{meal} is already in planner"
        )
    print(request.session.get("planner_dishes"))
    # add meal to planner session
    request.session.get("planner_dishes").append(dish_obj.id) # store dish id, and get dish by id

    return {"detail": "Added to planner section"}

# this api returns dishes added to planner session from db
@router.get("/planner-dishes", status_code=status.HTTP_200_OK)
def planner_dishes(request: Request, db: Session=Depends(get_db)):
    print(request.session.get("planner_dishes"))

    dishes = []
    for dish in request.session.get("planner_dishes"):
        dish_data = db.query(Dish).where(Dish.id == dish).first()
        dishes.append(dish_data)

    return {"detail": dishes}

# this api removes addable planner dish from session
@router.delete("/remove-addable", status_code=status.HTTP_200_OK)
async def remove_addable(request: Request, id: int, db: Session=Depends(get_db)):
    # remove from session
    if id in request.session.get("planner_dishes"):
        request.session.get("planner_dishes").remove(id)
        return {"detail": "Removed addable from list"}
    HTTPException(detail="Invalid dish id", status_code=status.HTTP_406_NOT_ACCEPTABLE)

# this api stores planned meal for each day
@router.post("/store-planned-meal", status_code=status.HTTP_201_CREATED)
async def store_planner_dish(request: Request, db: Session=Depends(get_db)):
    # check if dish in dishes db
    dish_data = await request.json()
    # date-format: month-day-year
    # get current user
    user = db.query(User).where(User.email == request.session.get("email")).first()

    dish_id = db.query(Dish).where(
        and_(Dish.name == dish_data.get("name"), Dish.user_id == user.id)
    ).first()
    if not dish_id:
        raise HTTPException(detail="Dish not found", status_code=status.HTTP_404_NOT_FOUND)
    current_user = db.query(User).where(User.email == request.session.get("email")).first()

    # check if date exists in db, update planner dish if true
    planner_meal = db.query(Planner).where(
        and_(Planner.date == dish_data.get("date"), Planner.user_id == user.id)
    ).first()
    if planner_meal and dish_data.get("dayTime") == "Morning":
        planner_meal.breakfast = dish_data.get("name")
        db.commit()
        return {"detail": f"Morning meal for {dish_data.get("date")} updated"}
    elif planner_meal and dish_data.get("dayTime") == "Afternoon":
        planner_meal.lunch = dish_data.get("name")
        db.commit()
        return {"detail": f"Afternoon meal for {dish_data.get("date")} updated"}
    elif planner_meal and dish_data.get("dayTime") == "Evening":
        planner_meal.dinner = dish_data.get("name")
        db.commit()
        return {"detail": f"Evening meal for {dish_data.get("date")} updated"}
    # create new planner meal if not exist
    if not planner_meal:
        if dish_data.get("dayTime") == "Morning":
            new_planner_meal = Planner(
                breakfast=dish_data.get("name"), lunch="", dinner="", date=dish_data.get("date"),
                snacks=""
                )
            current_user.planner.append(new_planner_meal)
            db.commit()
            return {"detail": f"Morning meal for {dish_data.get("date")} created"}
        elif dish_data.get("dayTime") == "Afternoon":
            new_planner_meal = Planner(
                breakfast="", lunch=dish_data.get("name"), dinner="", date=dish_data.get("date"),
                snacks=""
                )
            current_user.planner.append(new_planner_meal)
            db.commit()
            return {"detail": f"Afternoon meal for {dish_data.get("date")} created"}
        elif dish_data.get("dayTime") == "Evening":
            new_planner_meal = Planner(
                breakfast="", lunch="", dinner=dish_data.get("name"), date=dish_data.get("date"),
                snacks=""
                )
            current_user.planner.append(new_planner_meal)
            db.commit()
            return {"detail": f"Evening meal for {dish_data.get("date")} created"}

# this api returns existing planner meals for requested date
@router.get("/planner-added-meals", status_code=status.HTTP_200_OK)
async def planner_added_meals(request: Request, q: str, db: Session=Depends(get_db)):
    # check if date exists already
    planner_meals = db.query(Planner).where(Planner.date == q).first()
    if planner_meals:
        return {"detail": planner_meals}
    
    raise HTTPException(
        detail="Not found", status_code=status.HTTP_404_NOT_FOUND
    )

# this api is used for deleting meals in planner
@router.delete("/drop-planner-meal", status_code=status.HTTP_200_OK)
async def remove_planner_meal(request: Request, db: Session=Depends(get_db)):
    # dish details is dictionary containing properties for date, dish_name and dayTime
    dish_details = await request.json()

    # get current user
    user = db.query(User).where(User.email == request.session.get("email")).first()

    # check if meal in planner db
    planner_meal = db.query(Planner).where(
        and_(Planner.date == dish_details.get("date"), Planner.user_id == user.id)
    ).first()
    if planner_meal:
        if dish_details.get("type") == "breakfast":
            planner_meal.breakfast = ""
            db.commit()
        elif dish_details.get("type") == "lunch":
            planner_meal.lunch = ""
            db.commit()
        elif dish_details.get("type") == "dinner":
            planner_meal.dinner = ""
            db.commit()
    else:
        raise HTTPException(
            detail="Meal not found in Planner", status_code=status.HTTP_404_NOT_FOUND
        )
    return {"detail": f"{dish_details.get("name")} removed from Planner for {dish_details.get("date")}"}

# this api searches the recipe db to get dish recipe or calls agent to get a new recipe
@router.get("/get-recipe", status_code=status.HTTP_200_OK)
async def get_recipe(request: Request, name: str, db: Session=Depends(get_db)):
    # get dish obj
    dish_obj = db.query(Dish).where(Dish.name == name).first()
    if not dish_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="This dish does not exist"
        )
    # check if recipe in db, retrieve it
    recipe_data = db.query(Recipe).where(Recipe.dish_id == dish_obj.id).first()
    if not recipe_data:
        new_recipe_data_raw = await query_graph(f"name={dish_obj.name}, ingredients={dish_obj.ingredients}, time_to_prepare={dish_obj.time}, origin={dish_obj.origin}")
        new_recipe_data = ast.literal_eval(new_recipe_data_raw)
        # create the recipe obj
        new_recipe_obj = Recipe(
            dish_name=new_recipe_data[0].get("dish_name"),
            ingredients=new_recipe_data[1].get("ingredients"),
            quantities=new_recipe_data[2].get("quantities"),
            steps=new_recipe_data[3].get("steps")
            )
        dish_obj.recipes.append(new_recipe_obj)
        db.commit();
        recipe_data = db.query(Recipe).where(Recipe.dish_id == dish_obj.id).first()
        print("data sent")
        return {"detail": recipe_data}
    print("data sent")
    return {"detail": recipe_data}

# this api clears steve's ideas from ui
@router.delete("/cancel-options", status_code=status.HTTP_200_OK)
def cancel_options(request: Request):
    request.session["dishes"] = None
    return {"detail": "options cleared"}