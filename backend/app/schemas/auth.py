"""
Authentication Schemas

Purpose:
--------
Validates authentication request data.
"""

from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    """
    Request body for Google Login.
    """

    # Google ID Token received from the frontend
    token: str