from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    """
    Represents a user document stored in the 'users' collection.
    """

    google_id: str
    name: str
    email: str
    picture: str
    created_at: datetime
    last_login: datetime