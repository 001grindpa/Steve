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

# slice filtered history dictionary
def slice_history(history: dict, lim: int):
    new_history = {}
    keys = list(history.keys())[0: lim]
    values = list(history.values())[0: lim]

    for k, v in zip(keys, values):
        new_history[k] = v
    return new_history