from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.incident  import router as incidents_router

from app.core.config import settings
from app.core.exceptions import ServiceNotFoundError
from app.db.database import Base, engine, ensure_schema_compatibility

from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
)

from app.models.Service import Service
from app.models.HealthCheck import HealthCheck
from app.models.Incident import Incident

from app.api.routes.services import router as services_router
from app.services.scheduler import create_scheduler

Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

app = FastAPI(title=settings.app_name, version= "0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services_router)
app.include_router(incidents_router)

scheduler = create_scheduler()


@app.on_event("startup")
async def start_scheduler():
    scheduler.start()


@app.on_event("shutdown")
async def stop_scheduler():
    scheduler.shutdown(wait=False)

@app.get("/")
async def root():
    return {
        "message": "Lifeline backend is running",
        "environment": settings.environment,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.exception_handler(ServiceNotFoundError)
async def service_not_found_handler(
    request: Request,
    exception: ServiceNotFoundError,
):
    return JSONResponse(
        status_code=404,
        content={
            "detail": f"Service {exception.service_id} was not found"
        },
    )
