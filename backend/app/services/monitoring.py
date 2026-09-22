from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident
from app.models.Service import Service, ServiceStatus


@dataclass
class MonitoringEvent:
    health_check: HealthCheck
    incident_opened: Incident | None = None
    incident_resolved: Incident | None = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def record_check(
    db: Session,
    service: Service,
    result,
) -> MonitoringEvent:
    """Persist a check and apply the service/incident state machine.

    A failed request is first DEGRADED while failures accumulate.  Once the
    configured threshold is reached, one incident is opened and remains open
    until any successful HTTP response is received.
    """
    health_check = HealthCheck(
        service_id=service.id,
        status=result.status,
        status_code=result.status_code,
        response_time_ms=result.response_time_ms,
        error_message=result.error_message,
    )
    db.add(health_check)
    db.flush()

    recent_checks = db.scalars(
        select(HealthCheck)
        .where(HealthCheck.service_id == service.id)
        .order_by(HealthCheck.checked_at.desc(), HealthCheck.id.desc())
        .limit(service.failure_threshold)
    ).all()
    consecutive_failures = 0
    for check in recent_checks:
        if check.status is ServiceStatus.DOWN:
            consecutive_failures += 1
        else:
            break

    open_incident = db.scalar(
        select(Incident)
        .where(
            Incident.service_id == service.id,
            Incident.resolved_at.is_(None),
        )
        .order_by(Incident.started_at.desc())
    )

    incident_opened = None
    incident_resolved = None

    if result.status is ServiceStatus.DOWN:
        if consecutive_failures >= service.failure_threshold:
            service.current_status = ServiceStatus.DOWN
            if open_incident is None:
                incident_opened = Incident(
                    service_id=service.id,
                    started_at=health_check.checked_at,
                    failure_count=consecutive_failures,
                    reason=result.error_message,
                )
                db.add(incident_opened)
            else:
                open_incident.failure_count = consecutive_failures
                if result.error_message:
                    open_incident.reason = result.error_message
                if not open_incident.alert_sent:
                    incident_opened = open_incident
        else:
            service.current_status = ServiceStatus.DEGRADED
    else:
        service.current_status = result.status
        if open_incident is not None:
            resolved_at = as_utc(health_check.checked_at or utc_now())
            started_at = as_utc(open_incident.started_at)
            open_incident.resolved_at = resolved_at
            open_incident.downtime_seconds = max(
                0.0, (resolved_at - started_at).total_seconds()
            )
            incident_resolved = open_incident

    db.flush()
    return MonitoringEvent(health_check, incident_opened, incident_resolved)
