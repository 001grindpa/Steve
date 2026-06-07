-include .env

run :; @uvicorn main:app --reload --port 8000
pw:; $(USER_PW)

run_all:; @uvicorn main:app --host 0.0.0.0 --port 8000 --reload