-include .env

run :; @uvicorn main:app --reload --port 5000
pw:; $(USER_PW)