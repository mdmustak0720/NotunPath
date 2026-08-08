"""
Main API Router

Purpose:
Registers all application routes.
"""

from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router
from app.api.routes.user import router as user_router


# Create the main API router.
api_router = APIRouter()


# Register health routes.
api_router.include_router(
    health_router,
    tags=["Health"],
)


# Register authentication routes.
api_router.include_router(
    auth_router,
    tags=["Authentication"],
)


# Register resume routes.
api_router.include_router(
    resume_router,
    prefix="/resume",
    tags=["Resume"],
)

# Register authenticated user routes

# Register User routes
api_router.include_router(
    user_router,
    tags=["User"],
)