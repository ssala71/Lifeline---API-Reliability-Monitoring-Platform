from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def ensure_schema_compatibility() -> None:
    """Apply the small additive changes needed by local pre-migration databases."""
    columns = {column["name"] for column in inspect(engine).get_columns("incidents")}
    missing_columns = []
    if "downtime_seconds" not in columns:
        missing_columns.append("downtime_seconds FLOAT")
    if "recovery_alert_sent" not in columns:
        missing_columns.append("recovery_alert_sent BOOLEAN NOT NULL DEFAULT 0")
    for column_definition in missing_columns:
        with engine.begin() as connection:
            connection.execute(
                text(f"ALTER TABLE incidents ADD COLUMN {column_definition}")
            )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
