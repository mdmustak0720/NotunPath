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
from app.core.security import verify_google_token, create_access_token

router = APIRouter(
    prefix="/auth"
)


@router.post("/google")
async def google_login(data: GoogleAuthRequest):

    # Verify Google token
    google_user = verify_google_token(data.token)

    # Find existing user
    existing_user = UserService.find_by_email(google_user["email"])

    # Create user if not found
    if not existing_user:
        existing_user = UserService.create_user(google_user)

    # Generate JWT
    access_token = create_access_token(
        {
            "sub": existing_user["email"]
        }
    )

    # Return login response
    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "Bearer",
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "picture": existing_user["picture"]
        }
    }