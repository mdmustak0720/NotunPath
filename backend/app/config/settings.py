"""
Application Settings

Purpose:
Centralized configuration management for NotunPath.

All environment-based application configuration should
be declared here and consumed through the Settings object.
"""

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


# Settings

class Settings(BaseSettings):
    """
    Central application configuration.
    """

    # Application
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str

    DEBUG: bool

    HOST: str
    PORT: int

    # Database

    MONGODB_URI: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

    # AI
    AI_PROVIDER: str

    GEMINI_API_KEY: str

    GEMINI_MODEL: str

    GEMINI_TIMEOUT_MS: int = 120000

    GEMINI_MAX_ATTEMPTS: int = 1

    # Pydantic Settings Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="forbid",
    )


# Application Settings Instance

settings = Settings()