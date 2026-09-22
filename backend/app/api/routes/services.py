from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import Query

from app.models.HealthCheck import HealthCheck
from app.schemas.healthcheck import HealthCheckResponse
from app.services.healthchecker import check_service
from app.services.monitoring import record_check

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

    health_check = record_check(db, service, result)

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

