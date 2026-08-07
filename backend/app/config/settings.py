from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str

    DEBUG: bool
    HOST: str
    PORT: int

    MONGODB_URI: str

    # Google OAuth Client ID
    GOOGLE_CLIENT_ID:str

    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

    AI_PROVIDER:str
    GEMINI_API_KEY:str
    GEMINI_MODEL:str
    
    class Config:
        env_file = ".env"

settings = Settings()