from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.Service import ServiceStatus


def utc_now():
    return datetime.now(timezone.utc)


class HealthCheck(Base):
    __tablename__ = "health_checks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now
    )

    status: Mapped[ServiceStatus] = mapped_column(
        SqlEnum(ServiceStatus),
        nullable=False
    )

    status_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    response_time_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    error_message: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )