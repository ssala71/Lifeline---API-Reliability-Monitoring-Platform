from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident
from app.models.Service import Service
from app.services.healthchecker import check_service
from app.services.monitoring import record_check
from app.services.notifier import send_discord_alert


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def run_due_checks() -> None:
    db = SessionLocal()
    try:
        services = db.scalars(select(Service).where(Service.enabled.is_(True))).all()
        now = utc_now()
        for service in services:
            last_check = db.scalar(
                select(HealthCheck.checked_at)
                .where(HealthCheck.service_id == service.id)
                .order_by(HealthCheck.checked_at.desc(), HealthCheck.id.desc())
                .limit(1)
            )
            if last_check is not None and last_check.tzinfo is None:
                last_check = last_check.replace(tzinfo=timezone.utc)
            if last_check is not None and last_check > now - timedelta(seconds=service.check_interval):
                continue

            event = record_check(db, service, await check_service(service))
            db.commit()

            incident_to_alert = event.incident_opened or db.scalar(
                select(Incident)
                .where(
                    Incident.service_id == service.id,
                    Incident.resolved_at.is_(None),
                    Incident.alert_sent.is_(False),
                )
                .order_by(Incident.started_at.desc())
            )
            if incident_to_alert:
                if await send_discord_alert(service, incident_to_alert):
                    incident_to_alert.alert_sent = True
                    db.commit()

            recovery_to_alert = event.incident_resolved or db.scalar(
                select(Incident)
                .where(
                    Incident.service_id == service.id,
                    Incident.resolved_at.is_not(None),
                    Incident.recovery_alert_sent.is_(False),
                )
                .order_by(Incident.resolved_at.desc())
            )
            if recovery_to_alert:
                if await send_discord_alert(service, recovery_to_alert, recovered=True):
                    recovery_to_alert.recovery_alert_sent = True
                    db.commit()
    finally:
        db.close()


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_due_checks,
        "interval",
        seconds=settings.scheduler_poll_interval_seconds,
        id="lifeline-due-health-checks",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    return scheduler
