from settings import engine, sessionlocal, get_db, Model
import models  # Ensure all models are registered with DeclarativeBase


def init_db():
    """Create all database tables on application startup."""
    Model.metadata.create_all(bind=engine)
