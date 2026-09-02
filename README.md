# Steve

Steve is a FastAPI-based cooking assistant that helps users discover meals they can make from ingredients they already have, save favorite dishes, plan meals by day, and review their cooking history.

## What the app does

- AI-powered meal suggestions using Groq and Tavily search
- Ingredient-based dish recommendations from a conversational agent
- User authentication with email/password and Google OAuth
- Saved favorites and personal meal history
- Meal planner for breakfast, lunch, and dinner by date
- Streaming chat-style responses for interactive cooking guidance

## Tech stack

- Python 3.13+
- FastAPI
- SQLAlchemy + MySQL
- JWT authentication
- Google OAuth login
- LangChain / LangGraph with Groq and Tavily
- Jinja2 templates and static frontend assets

## Local prerequisites

Before running the app locally, make sure you have:

- Python 3.13 or newer
- A local MySQL server running on localhost
- A MySQL database named `steve`
- API keys for Groq and Tavily
- A Google Cloud OAuth client configured for localhost redirects

## 1) Clone and set up the project

```bash
git clone <your-repository-url>
cd Steve
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If you prefer the project metadata workflow:

```bash
pip install "fastapi[all]" langchain langchain-groq langchain-tavily langgraph python-dotenv python-jose mysql-connector-python sqlalchemy passlib bcrypt uvicorn mcp aiosqlite
```

## 2) Create the local database

Create a MySQL database called `steve` before the app starts.

```sql
CREATE DATABASE steve;
```

The app uses SQLAlchemy to create tables automatically when it boots, but the database itself must already exist.

## 3) Configure environment variables

Copy the example file to a real `.env` file and fill in the values:

```bash
cp example.env .env
```

The app expects these variables:

```env
SECRET_KEY=change-this-to-a-long-random-secret
ALGORITHM=HS256
SESSION_SECRET_KEY=change-this-to-a-long-random-session-secret
USER_PW=your_mysql_root_password
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
GOOGLE_AUTH_CLIENT_ID=your_google_client_id
GOOGLE_AUTH_CLIENT_SECRET_KEY=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
```

Notes:

- `SECRET_KEY` and `SESSION_SECRET_KEY` should be strong random strings.
- `USER_PW` is the password used in the app's MySQL connection string (`root:<USER_PW>@localhost/steve`).
- `GOOGLE_REDIRECT_URI` must match the redirect URL configured in your Google OAuth app.

## 4) Run the app

From the project root:

```bash
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Or use the project Makefile:

```bash
make run
```

Then open:

- http://localhost:8000/
- http://localhost:8000/login
- http://localhost:8000/signup

## How to use it locally

1. Start the app and open the login page.
2. Create a user account or sign in with Google.
3. Ask Steve for meal ideas using ingredients you have on hand.
4. Save a dish to your favorites list.
5. Open the planner to assign meals to dates.
6. Review your favorites and planner history from the app UI.

## Important app behavior

- The app loads environment variables from `.env` via `python-dotenv`.
- Missing values for Google Auth, session secrets, or JWT config will prevent the app from starting.
- The app expects a working local MySQL instance because user data, favorites, planner entries, and history are stored there.

## Common troubleshooting

- If the app fails to start, check that `.env` exists and contains all required variables.
- If the database connection fails, ensure MySQL is running and the database `steve` exists.
- If Google login fails, confirm the client ID, secret, and redirect URI in Google Cloud match the values in `.env`.
- If AI suggestions fail, verify the Groq and Tavily API keys are valid and present.

## License

This project is provided under the repository license.
