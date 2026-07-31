# Purpose: Creates the FastAPI application and configures middleware and routes.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config.settings import settings
from app.database.mongodb import db

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)

# Allow frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routes
app.include_router(
    api_router,
    prefix="/api/v1",
)

# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to NotunPath 🚀"
    }