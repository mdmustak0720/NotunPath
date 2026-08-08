"""
User Service

Purpose:
Handles all database operations related to users.
"""

from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.database.mongodb import db


# Users collection.
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

        return users_collection.find_one(
            {"email": email}
        )

    @staticmethod
    def create_user(user_data: dict):
        """
        Create a new user from verified Google user data.

        Returns:
            The newly created user document.
        """

        now = datetime.now(timezone.utc)

        new_user = {
            "google_id": user_data["sub"],
            "name": user_data.get("name", ""),
            "email": user_data["email"],
            "picture": user_data.get("picture", ""),
            "created_at": now,
            "last_login": now,
        }

        try:
            result = users_collection.insert_one(new_user)

        except DuplicateKeyError:
            return users_collection.find_one(
                {"email": user_data["email"]}
            )

        new_user["_id"] = result.inserted_id

        return new_user

    @staticmethod
    def update_last_login(email: str):
        """
        Update the last login time for an existing user.
        """

        now = datetime.now(timezone.utc)

        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "last_login": now
                }
            }
        )

        return users_collection.find_one(
            {"email": email}
        )