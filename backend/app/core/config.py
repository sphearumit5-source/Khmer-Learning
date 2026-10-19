import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Khmer Learning API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: Defaults to SQLite for immediate local zero-setup, can be set to PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./khmer_learning.db")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "khmer-learning-super-secret-key-2026-cambodia-primary")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI API Key (Gemini or generic AI provider)
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    # gemini-1.5-flash was retired upstream; override in .env when needed
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-flash-latest")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
