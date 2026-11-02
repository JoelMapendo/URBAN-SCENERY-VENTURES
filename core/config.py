from __future__ import annotations
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Urban Scenery Ventures - Electronics Store API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL") or "sqlite:///./urban_ventures.db"
    if DATABASE_URL == "None" or not DATABASE_URL.strip():
        DATABASE_URL = "sqlite:///./urban_ventures.db"
        
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "urbanventures-super-secret-jwt-key-2026-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Auto-seed initial users and sample electronics on startup if missing
    AUTO_SEED: bool = os.getenv("AUTO_SEED", "true").strip().lower() in ("1", "true", "yes")

    # CORS
    _raw_cors: str = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: List[str] = (
        [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
        if _raw_cors.strip()
        else [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
    )


settings = Settings()
