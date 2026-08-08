"""
Authentication Routes

Purpose:
Handles authentication API endpoints.
"""

from fastapi import APIRouter, HTTPException, status

from app.core.security import (
    create_access_token,
    verify_google_token,
)
from app.schemas.auth import GoogleAuthRequest
from app.services.user_service import UserService


router = APIRouter(
    prefix="/auth",
)


@router.post("/google")
async def google_login(data: GoogleAuthRequest):
    """
    Authenticate a user using Google OAuth.

    Verifies the Google token, creates or retrieves
    the user, updates login activity, and returns
    an application JWT.
    """

    # Verify Google token.
    try:
        google_user = verify_google_token(data.token)

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed.",
        )

    # Get the verified Google account email.
    email = google_user.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email was not provided.",
        )

    # Find existing user.
    existing_user = UserService.find_by_email(email)

    # Create a new user or update login activity.
    if not existing_user:
        existing_user = UserService.create_user(
            google_user
        )
    else:
        existing_user = UserService.update_last_login(
            email
        )

    # Generate application JWT.
    access_token = create_access_token(
        {
            "sub": existing_user["email"]
        }
    )

    # Return authentication response.
    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "Bearer",
        "user": {
            "name": existing_user.get("name"),
            "email": existing_user.get("email"),
            "picture": existing_user.get("picture"),
        },
    }