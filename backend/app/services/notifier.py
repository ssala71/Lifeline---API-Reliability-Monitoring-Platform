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

    if recovered:
        title = f"✅ {service.name} recovered"
        description = f"{service.name} is responding normally again."
        content = f"@here ✅ {service.name} recovered."
        color = 5763719
        fields = [{"name": "Downtime", "value": format_downtime(incident.downtime_seconds), "inline": True}]
    else:
        title = f"🚨 {service.name} is down"
        description = incident.reason or "The service failed its health check."
        content = f"@here 🚨 {service.name} is down."
        color = 15548997
        fields = [{"name": "Failures", "value": str(incident.failure_count), "inline": True}]

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
