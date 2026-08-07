"""
Main API Router

Purpose:
--------
Registers all application routes.
"""

from fastapi import APIRouter

# Import route files
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router

# Create main router
api_router = APIRouter()

# Register Health routes
api_router.include_router(
    health_router,
    tags=["Health"]
)

# Register Authentication routes
api_router.include_router(
    auth_router,
    tags=["Authentication"]
)

# Register Resume routes

api_router.include_router(
    resume_router,
    prefix="/resume",
    tags=["Resume"]
)