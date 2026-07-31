from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.config.settings import settings

client = None
db = None

try:
    client = MongoClient(settings.MONGODB_URI)

    client.admin.command("ping")

    print("✅ Connected to MongoDB Atlas")

    db = client["notunpath"]

except ConnectionFailure as error:
    print("❌ Failed to connect to MongoDB Atlas")
    print(error)