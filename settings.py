"""Compatibility exports for code that still imports database objects here."""

from core.config import settings
from core.database import Model, engine, get_db, sessionlocal

DATABASE_URL = settings.DATABASE_URL

__all__ = ["DATABASE_URL", "Model", "engine", "get_db", "sessionlocal"]
