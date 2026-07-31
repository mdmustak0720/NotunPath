"""
Authentication Routes

Purpose:
--------
Handles authentication APIs.
"""

from fastapi import APIRouter

# Request schema
from app.schemas.auth import GoogleAuthRequest

# Security function
from app.core.security import verify_google_token

# User service
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth"
)


@router.post("/google")
async def google_login(data: GoogleAuthRequest):
    """
    Authenticate a user using Google ID Token.
    """

    # Verify Google token
    user = verify_google_token(data.token)

    # Check if the user already exists
    existing_user = UserService.find_by_email(user["email"])

    # Temporary response
    return {
        "google_user": user,
        "existing_user": existing_user
    }