-include .env

run :; @uvicorn main:app --reload --port 8000
pw:; $(USER_PW)