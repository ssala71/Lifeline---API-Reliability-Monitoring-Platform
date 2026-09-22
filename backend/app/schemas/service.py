from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.models.Service import ServiceStatus


class ServiceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    url: HttpUrl
    check_interval: int = Field(default=60, ge=10)
    timeout: int = Field(default=10, ge=1)
    slow_threshold: int = Field(default=1000, ge=1)
    failure_threshold: int = Field(default=3, ge=1)
    enabled: bool = True


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    url: HttpUrl | None = None
    check_interval: int | None = Field(default=None, ge=10)
    timeout: int | None = Field(default=None, ge=1)
    slow_threshold: int | None = Field(default=None, ge=1)
    failure_threshold: int | None = Field(default=None, ge=1)
    enabled: bool | None = None


class ServiceResponse(ServiceCreate):
    id: int
    current_status: ServiceStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)