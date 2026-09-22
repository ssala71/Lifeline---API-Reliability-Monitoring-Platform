from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.Service import ServiceStatus
from datetime import datetime, timezone

from fastapi import Query

from app.models.Service import ServiceStatus
from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident
from app.schemas.healthcheck import HealthCheckResponse
from app.services.healthchecker import check_service


class HealthCheckResponse(BaseModel):
    id: int
    service_id: int
    checked_at: datetime
    status: ServiceStatus
    status_code: int | None = None
    response_time_ms: int | None = None
    error_message: str | None = None

    model_config = ConfigDict(from_attributes=True)