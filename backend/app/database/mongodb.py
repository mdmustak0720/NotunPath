"""
MongoDB Connection

Purpose:
---------
Creates a single reusable connection to MongoDB Atlas
and verifies the connection when the application starts.
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.config.settings import settings

try:
    # Create MongoDB client using the URI from .env
    client = MongoClient(settings.MONGODB_URI)

    # Test the connection
    client.admin.command("ping")

    print("✅ Connected to MongoDB Atlas")

    # Select the database
    db = client["notunpath"]

except ConnectionFailure as error:
    print("❌ Failed to connect to MongoDB Atlas")
    print(error)