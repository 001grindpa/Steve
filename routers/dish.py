from fastapi import APIRouter, Depends, status, Request, HTTPException
from models import get_db, Dish, DishData, User, Recipe
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from sqlalchemy import and_
from hash import Hash
from routers import user
from oauth2 import get_current_user
from kit import DishDetail
from agents.recipe_agent import query_graph

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

    return {"detail": "Added to planner"}

# this api seraches the recipe db to get dish recipe or calls agent to get a new recipe
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
        new_recipe_data = await query_graph(f"name={dish_obj.name}, ingredients={dish_obj.ingredients}, time_to_prepare={dish_obj.time}, origin={dish_obj.origin}")
        print(new_recipe_data)
        return {"detail": "recipe retrieved"}
    
    return {"detail": recipe_data}
# [{"dish_name":"Homemade Fresh Spaghetti with Tomato Sauce","ingredients":"flour, eggs, tomatoes, onions, olive oil, salt, pepper","quantities":"flour 2 cups, eggs 3, tomatoes 4 cups diced, onions 1 medium diced, olive oil 2 tbsp, salt 1 tsp, pepper 1/2 tsp","steps":"Combine flour and eggs to form dough, knead until smooth, let rest 30 minutes; roll dough thin, cut into spaghetti strands; bring a large pot of salted water to boil, cook pasta 2-3 minutes until al dente, drain; in a skillet heat olive oil, sauté onions until translucent, add tomatoes, cook 5 minutes until softened, season with salt and pepper; toss cooked pasta with sauce, serve hot"}]

# this api clears steve's ideas from ui
@router.delete("/cancel-options", status_code=status.HTTP_200_OK)
def cancel_options(request: Request):
    request.session["dishes"] = None
    return {"detail": "options cleared"}