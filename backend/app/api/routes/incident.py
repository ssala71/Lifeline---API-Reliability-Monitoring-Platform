from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.Incident import Incident
from app.schemas.incident import IncidentResponse


router = APIRouter(
    prefix="/api/incidents",
    tags=["incidents"]
)


@router.get(
    "",
    response_model=list[IncidentResponse]
)
def get_incidents(db: Session = Depends(get_db)):
    return db.scalars(
        select(Incident)
        .order_by(Incident.started_at.desc())
    ).all()