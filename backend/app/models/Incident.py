from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    downtime_seconds: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    failure_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    alert_sent: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
