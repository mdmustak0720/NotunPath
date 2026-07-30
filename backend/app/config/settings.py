from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str

    DEBUG: bool
    HOST: str
    PORT: int

    MONGODB_URI: str

    class Config:
        env_file = ".env"

settings = Settings()