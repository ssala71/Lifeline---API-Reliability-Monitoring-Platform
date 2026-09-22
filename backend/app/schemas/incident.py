from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentResponse(BaseModel):
    id: int
    service_id: int
    started_at: datetime
    resolved_at: datetime | None = None
    failure_count: int
    reason: str | None = None
    alert_sent: bool

    model_config = ConfigDict(from_attributes=True)