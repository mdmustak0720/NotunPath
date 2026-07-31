"""
User Service

Purpose:
--------
Handles all database operations related to users.
"""

# Import database
from app.database.mongodb import db
from datetime import datetime, timezone

# Get the users collection
users_collection = db["users"]


class UserService:
    """
    Handles user-related database operations.
    """

    @staticmethod
    def get_collection():
        """
        Return the MongoDB users collection.
        """
        return users_collection

    @staticmethod
    def find_by_email(email: str):
        """
        Find a user by email.

        Returns:
            User document if found, otherwise None.
        """

        # Search for the user using email
        return users_collection.find_one(
            {"email": email}
        )
    
    @staticmethod
    def create_user(user_data: dict):
        # Create a new user document
        new_user = {
            "google_id": user_data["sub"],
            "name": user_data["name"],
            "email": user_data["email"],
            "picture": user_data.get("picture", ""),
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc)
        }

        # Insert the user into MongoDB
        users_collection.insert_one(new_user)

        # Return the created user
        return new_user