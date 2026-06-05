import asyncio
from datetime import datetime, timedelta
from typing import List
from random import choice

# get the current chat time
def get_time():
    now = datetime.now()
    hour = now.hour
    minute = now.minute
    period = "AM"
    if (hour >= 12):
        # hour = 24-hour
        period = "PM"
    return "{}:{} {}".format(f"0{hour}" if hour < 9 else hour, 
                             f"0{minute}" if minute < 9 else minute, 
                             period)

# check if password is strong
def check_password(pw: str):
    is_digit = is_lower = is_upper = False
    for i in pw:
        if i.isdigit():
            is_digit = True
        elif i.isupper():
            is_upper = True
        elif i.islower():
            is_lower = True
    if len(pw) <= 5:
        return "short"
    elif is_digit == False:
        return "no digit"
    elif is_lower == False:
        return "no lowercase"
    elif is_upper == False:
        return "no uppercase"
    return "valid"

def email_check(mail: str):
    for c in mail:
        if c == "@" and len(mail) >= 5 and "." in mail:
            return "valid"
    return "invalid"

async def stream_response(q: str):
    for char in q:
        await asyncio.sleep(0.03)
        yield char

async def getting_dish_replies():
    replies = ["Ok.", "On it.", "Searching the web right now.", "You got it."]
    return choice(replies)

# classes
class DishDetail:
    def __init__(self, name: str, origin: str, time: str, mode: str, description: str, ingredients: List[str]) -> None:
        self.name =  name
        self.origin = origin
        self.time = time
        self.mode = mode
        self.desc = description
        self.ingre = ingredients

    def __str__(self):
        return f"{self.name} is an {self.origin} dish, {self.desc}. It's a {self.mode} meal that takes about {self.time} to make."
    def __repr__(self):
        return f"<name='{self.name}', origin='{self.origin}', description='{self.desc}', ingredients='{self.ingre}', mode='{self.mode}', time/duration='{self.time}'>"

# print(getting_dish_replies())