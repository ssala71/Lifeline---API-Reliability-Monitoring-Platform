from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import ServiceNotFoundError

app = FastAPI(title=settings.PROJECT_NAME, version= settings.PROJECT_VERSION)


@app.get("/")
async def root():
    return {
        "message": "Lifeline backend is running",
        "enviorment": settings.enviorment,
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