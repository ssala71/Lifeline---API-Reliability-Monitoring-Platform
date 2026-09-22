import asyncio
from types import SimpleNamespace
from unittest.mock import patch

import httpx

from app.models.Service import ServiceStatus
from app.services.healthchecker import check_service


class FakeAsyncClient:
    def __init__(self, response=None, error=None, delay=0):
        self.response = response
        self.error = error
        self.delay = delay

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return None

    async def get(self, *_args, **_kwargs):
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.error:
            raise self.error
        return self.response


def service(**overrides):
    values = {
        "url": "https://example.com/health",
        "timeout": 1,
        "slow_threshold": 1000,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_successful_response_records_status_code_and_time():
    client = FakeAsyncClient(httpx.Response(200))

    with patch("app.services.healthchecker.httpx.AsyncClient", return_value=client):
        result = asyncio.run(check_service(service()))

    assert result.status is ServiceStatus.HEALTHY
    assert result.status_code == 200
    assert result.response_time_ms is not None
    assert result.response_time_ms >= 0
    assert result.error_message is None


def test_slow_response_is_degraded():
    client = FakeAsyncClient(httpx.Response(200), delay=0.02)

    with patch("app.services.healthchecker.httpx.AsyncClient", return_value=client):
        result = asyncio.run(check_service(service(slow_threshold=1)))

    assert result.status is ServiceStatus.DEGRADED
    assert result.status_code == 200
    assert result.response_time_ms >= 1


def test_timeout_is_down_and_keeps_elapsed_time():
    client = FakeAsyncClient(error=httpx.ReadTimeout("timed out"))

    with patch("app.services.healthchecker.httpx.AsyncClient", return_value=client):
        result = asyncio.run(check_service(service()))

    assert result.status is ServiceStatus.DOWN
    assert result.status_code is None
    assert result.response_time_ms is not None
    assert result.error_message == "Request timed out"


def test_connection_error_is_down():
    client = FakeAsyncClient(error=httpx.ConnectError("connection refused"))

    with patch("app.services.healthchecker.httpx.AsyncClient", return_value=client):
        result = asyncio.run(check_service(service()))

    assert result.status is ServiceStatus.DOWN
    assert result.response_time_ms is not None
    assert "connection refused" in result.error_message
