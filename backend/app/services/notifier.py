from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.models.Incident import Incident
from app.models.Service import Service


async def send_discord_alert(
    service: Service,
    incident: Incident,
    recovered: bool = False,
) -> bool:
    if not settings.discord_webhook_url:
        return False

    request_method = "GET"
    started_at = format_timestamp(incident.started_at)

    if recovered:
        title = f"✅ {service.name} recovered"
        description = f"{service.name} is responding normally again."
        recovered_at = format_timestamp(incident.resolved_at)
        content = (
            f"Lifeline recovery\n"
            f"@here\n"
            f"**Service:** {service.name}\n"
            f"**Request:** {request_method} {service.url}\n"
            f"**Went down:** {started_at}\n"
            f"**Recovered:** {recovered_at}\n"
            f"**Downtime:** {format_downtime(incident.downtime_seconds)}"
        )
        color = 5763719
        fields = [
            {"name": "Request type", "value": request_method, "inline": True},
            {"name": "Went down", "value": started_at, "inline": True},
            {"name": "Recovered", "value": recovered_at, "inline": True},
            {"name": "Downtime", "value": format_downtime(incident.downtime_seconds), "inline": True},
        ]
    else:
        title = f"🚨 {service.name} is down"
        description = incident.reason or "The service failed its health check."
        content = (
            f"Lifeline outage\n"
            f"@here\n"
            f"**Service:** {service.name}\n"
            f"**Request:** {request_method} {service.url}\n"
            f"**Went down:** {started_at}\n"
            f"**Reason:** {description}\n"
            f"**Failures:** {incident.failure_count}"
        )
        color = 15548997
        fields = [
            {"name": "Request type", "value": request_method, "inline": True},
            {"name": "Went down", "value": started_at, "inline": True},
            {"name": "Reason", "value": description, "inline": False},
            {"name": "Failures", "value": str(incident.failure_count), "inline": True},
        ]

    payload = {
        "content": content,
        "allowed_mentions": {"parse": ["everyone"]},
        "embeds": [{
            "title": title,
            "description": description,
            "url": service.url,
            "color": color,
            "fields": fields,
        }]
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(settings.discord_webhook_url, json=payload)
            response.raise_for_status()
        return True
    except httpx.HTTPError:
        return False


def format_downtime(seconds: float | None) -> str:
    if seconds is None:
        return "Unknown"
    total_seconds = max(0, round(seconds))
    minutes, remaining_seconds = divmod(total_seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}h {minutes}m"
    if minutes:
        return f"{minutes}m {remaining_seconds}s"
    return f"{remaining_seconds}s"


def format_timestamp(value: datetime | None) -> str:
    if value is None:
        return "Unknown"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
