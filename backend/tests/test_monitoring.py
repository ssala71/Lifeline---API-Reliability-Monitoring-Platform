from datetime import datetime, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.routes.services import delete_service
from app.db.database import Base
from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident
from app.models.Service import Service, ServiceStatus
from app.services.healthchecker import CheckResult
from app.services.monitoring import record_check


def make_database():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return engine


def make_service(db: Session, **overrides) -> Service:
    values = {
        "name": "Example API",
        "url": "https://example.com/health",
        "failure_threshold": 2,
        "current_status": ServiceStatus.UNKNOWN,
    }
    values.update(overrides)
    monitored_service = Service(**values)
    db.add(monitored_service)
    db.commit()
    db.refresh(monitored_service)
    return monitored_service


def down_result(message="HTTP 503"):
    return CheckResult(ServiceStatus.DOWN, 503, 25, message)


def healthy_result():
    return CheckResult(ServiceStatus.HEALTHY, 200, 20, None)


def test_repeated_failures_create_one_incident_and_mark_service_down():
    engine = make_database()
    with Session(engine) as db:
        monitored_service = make_service(db)

        first = record_check(db, monitored_service, down_result())
        db.commit()
        assert first.incident_opened is None
        assert monitored_service.current_status is ServiceStatus.DEGRADED

        second = record_check(db, monitored_service, down_result())
        db.commit()

        incidents = db.scalars(select(Incident)).all()
        assert second.incident_opened is incidents[0]
        assert len(incidents) == 1
        assert incidents[0].failure_count == 2
        assert monitored_service.current_status is ServiceStatus.DOWN


def test_recovery_closes_incident_and_calculates_downtime():
    engine = make_database()
    with Session(engine) as db:
        monitored_service = make_service(db, failure_threshold=1)
        record_check(db, monitored_service, down_result())
        db.commit()

        event = record_check(db, monitored_service, healthy_result())
        db.commit()

        incident = db.scalar(select(Incident))
        assert event.incident_resolved is incident
        assert incident.resolved_at is not None
        assert incident.downtime_seconds is not None
        assert incident.downtime_seconds >= 0
        assert incident.recovery_alert_sent is False
        assert monitored_service.current_status is ServiceStatus.HEALTHY


def test_health_checks_are_persisted_for_history():
    engine = make_database()
    with Session(engine) as db:
        monitored_service = make_service(db, failure_threshold=1)
        record_check(db, monitored_service, healthy_result())
        db.commit()

        checks = db.scalars(select(HealthCheck)).all()
        assert len(checks) == 1
        assert checks[0].status_code == 200
        assert checks[0].response_time_ms == 20
        assert checks[0].checked_at.tzinfo in (None, timezone.utc)


def test_deleting_service_removes_incidents_and_health_checks():
    engine = make_database()
    with Session(engine) as db:
        monitored_service = make_service(db, failure_threshold=1)
        record_check(db, monitored_service, down_result())
        db.commit()

        delete_service(monitored_service.id, db)

        assert db.get(Service, monitored_service.id) is None
        assert db.scalars(select(Incident)).all() == []
        assert db.scalars(select(HealthCheck)).all() == []
