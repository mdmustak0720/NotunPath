"""
User Routes

Purpose:
Handles authenticated user-related API endpoints.
"""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user


router = APIRouter(
    prefix="/user",
)


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
):
    """
    Return the currently authenticated user's profile.
    """

    return {
        "message": "Authenticated user retrieved successfully.",
        "user": {
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "picture": current_user.get("picture"),
        },
    }