from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine, inspect, select, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)


class Model(DeclarativeBase):
    pass


sessionlocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    db = sessionlocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables on application startup."""
    import models

    Model.metadata.create_all(bind=engine)

    order_columns = inspect(engine).get_columns("orders")
    order_id_type = next(
        column["type"] for column in order_columns if column["name"] == "id"
    )
    if "INT" not in str(order_id_type).upper():
        with sessionlocal() as db:
            order_count = db.query(models.Order).count()
            payment_count = db.query(models.Payment).count()
        if order_count or payment_count:
            raise RuntimeError(
                "The orders table uses UUID identifiers, but this app expects integer "
                "order IDs. Back up and migrate existing orders and payments before "
                "starting the app; automatic conversion is only safe when both tables "
                "are empty."
            )

        with engine.begin() as connection:
            connection.execute(text("DROP TABLE orders"))
            Model.metadata.create_all(bind=connection)

    user_columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "hashed_password" not in user_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)")
            )

    defaults: list[tuple[type[Any], tuple[tuple[str, str], ...]]] = [
        (
            models.UserRole,
            (
                ("ADMIN", "Administrator with full access"),
                ("CUSTOMER", "Registered customer"),
                ("GUEST", "Unauthenticated or guest customer"),
            ),
        ),
        (
            models.OrderStatus,
            (
                ("PENDING", "Order is awaiting processing"),
                ("APPROVED", "Order has been approved"),
                ("SHIPPED", "Order has been shipped"),
                ("DELIVERED", "Order has been delivered"),
                ("CANCELLED", "Order has been cancelled"),
            ),
        ),
        (
            models.PaymentStatus,
            (
                ("PAID", "Payment has been completed"),
                ("NOT YET PAID", "Payment has not yet been received"),
                ("FAILED", "Payment attempt failed"),
            ),
        ),
        (
            models.PaymentMethod,
            (
                ("BANK", "Bank payment or transfer"),
                ("MOBILE MONEY", "Mobile money payment"),
                ("CRYPTO", "Cryptocurrency payment"),
            ),
        ),
        (
            models.ProductStatus,
            (
                ("AVAILABLE", "Product is available for purchase"),
                ("EMPTY", "Product is out of stock"),
            ),
        ),
    ]
    with sessionlocal() as db:
        for lookup_model, entries in defaults:
            name_column = getattr(lookup_model, "name")
            existing_names = set(db.scalars(select(name_column)).all())
            for name, description in entries:
                if name not in existing_names:
                    db.add(lookup_model(name=name, description=description))
        db.commit()
