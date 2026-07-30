from fastapi import FastAPI
from app.config.settings import settings
from app.api.router import api_router
from app.database.mongodb import db

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)

app.include_router(
    api_router,
    prefix="/api/v1"
)

@app.get("/")

def home():
    return {"message": "Welcome to NotunPath 🚀"} 