from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserSchema(BaseModel):
    google_id: str
    name: str
    email: EmailStr
    picture: str
    created_at: datetime
    last_login: datetime

    