from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ServiceStatus(str, Enum):
    UNKNOWN = "UNKNOWN"
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    url: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # Time values are stored in seconds
    check_interval: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=60
    )

    timeout: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10
    )

    # Request is DEGRADED if it exceeds this time in milliseconds
    slow_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1000
    )

    # Number of failures before marking service DOWN
    failure_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    current_status: Mapped[ServiceStatus] = mapped_column(
        SqlEnum(ServiceStatus),
        nullable=False,
        default=ServiceStatus.UNKNOWN
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )