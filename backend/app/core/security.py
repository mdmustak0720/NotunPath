# Purpose: Handles Google token verification and JWT generation.

from google.oauth2 import id_token
from google.auth.transport import requests
from jose import jwt

from app.config.settings import settings


def verify_google_token(token: str):
    # Verify Google ID token
    return id_token.verify_oauth2_token(
        token,
        requests.Request(),
        settings.GOOGLE_CLIENT_ID
    )


def create_access_token(data: dict):
    # Copy the payload
    payload = data.copy()

    # Generate JWT
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )