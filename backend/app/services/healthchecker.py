from dataclasses import dataclass
from time import perf_counter

import httpx

from app.models.Service import Service, ServiceStatus


@dataclass
class CheckResult:
    status: ServiceStatus
    status_code: int | None
    response_time_ms: int | None
    error_message: str | None


async def check_service(service: Service) -> CheckResult:
    start_time = perf_counter()

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                service.url,
                timeout=service.timeout
            )

        response_time_ms = round(
            (perf_counter() - start_time) * 1000
        )

        if response.status_code >= 400:
            return CheckResult(
                status=ServiceStatus.DOWN,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                error_message=f"HTTP {response.status_code}"
            )

        if response_time_ms > service.slow_threshold:
            current_status = ServiceStatus.DEGRADED
        else:
            current_status = ServiceStatus.HEALTHY

        return CheckResult(
            status=current_status,
            status_code=response.status_code,
            response_time_ms=response_time_ms,
            error_message=None
        )

    except httpx.TimeoutException:
        return CheckResult(
            status=ServiceStatus.DOWN,
            status_code=None,
            response_time_ms=None,
            error_message="Request timed out"
        )

    except httpx.RequestError as error:
        return CheckResult(
            status=ServiceStatus.DOWN,
            status_code=None,
            response_time_ms=None,
            error_message=str(error)
        )