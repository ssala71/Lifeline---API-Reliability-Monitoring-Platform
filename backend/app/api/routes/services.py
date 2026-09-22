from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from datetime import datetime, timezone

from datetime import datetime, timezone

from fastapi import Query

from app.models.Service import ServiceStatus
from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident
from app.schemas.healthcheck import HealthCheckResponse
from app.services.healthchecker import check_service

from app.core.exceptions import ServiceNotFoundError
from app.db.database import get_db
from app.models.Service import Service
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate



router = APIRouter(
    prefix="/api/services",
    tags=["services"]
)


@router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db)
):
    service = Service(
        name=service_data.name,
        url=str(service_data.url),
        check_interval=service_data.check_interval,
        timeout=service_data.timeout,
        slow_threshold=service_data.slow_threshold,
        failure_threshold=service_data.failure_threshold,
        enabled=service_data.enabled,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@router.get(
    "",
    response_model=list[ServiceResponse]
)
def get_services(db: Session = Depends(get_db)):
    result = db.execute(
        select(Service).order_by(Service.id)
    )

    return result.scalars().all()

def find_service(service_id: int, db: Session) -> Service:
    service = db.get(Service, service_id)

    if service is None:
        raise ServiceNotFoundError(service_id)

    return service


@router.get(
    "/{service_id}",
    response_model=ServiceResponse
)
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    return find_service(service_id, db)


@router.patch(
    "/{service_id}",
    response_model=ServiceResponse
)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db)
):
    service = find_service(service_id, db)

    updates = service_data.model_dump(exclude_unset=True)

    if "url" in updates:
        updates["url"] = str(updates["url"])

    for field, value in updates.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)

    return service


@router.delete(
    "/{service_id}",
    status_code=204
)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = find_service(service_id, db)

    db.delete(service)
    db.commit()

    return None
@router.post(
    "/{service_id}/check",
    response_model=HealthCheckResponse
)
async def run_health_check(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = find_service(service_id, db)

    result = await check_service(service)

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
        .order_by(HealthCheck.checked_at.desc())
        .limit(service.failure_threshold)
    ).all()

    consecutive_failures = 0

    for check in recent_checks:
        if check.status == ServiceStatus.DOWN:
            consecutive_failures += 1
        else:
            break

    open_incident = db.scalar(
        select(Incident)
        .where(
            Incident.service_id == service.id,
            Incident.resolved_at.is_(None)
        )
    )

    if result.status == ServiceStatus.DOWN:
        if consecutive_failures >= service.failure_threshold:
            service.current_status = ServiceStatus.DOWN

            if open_incident is None:
                db.add(
                    Incident(
                        service_id=service.id,
                        failure_count=consecutive_failures,
                        reason=result.error_message
                    )
                )
            else:
                open_incident.failure_count = consecutive_failures
        else:
            service.current_status = ServiceStatus.DEGRADED

    else:
        service.current_status = result.status

        if open_incident is not None:
            open_incident.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(health_check)

    return health_check


@router.get(
    "/{service_id}/history",
    response_model=list[HealthCheckResponse]
)
def get_service_history(
    service_id: int,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    find_service(service_id, db)

    return db.scalars(
        select(HealthCheck)
        .where(HealthCheck.service_id == service_id)
        .order_by(HealthCheck.checked_at.desc())
        .limit(limit)
    ).all()

