from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from db.session import get_db
from models.alert import Alert
from utils.logging_config import logger
from utils.translation import translation_service
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()

# Pydantic model for request body
class AlertStatusUpdate(BaseModel):
    status: str

@router.patch("/alerts/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    status_update: AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    # Fetch the alert from the database
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Update the status
    alert.status = status_update.status
    db.commit()
    db.refresh(alert)

    return {"message": "Status updated successfully", "alert": alert}

def extract_midpoints_alerts(alerts):
    if not alerts:
        return [40.7128, -74.0060]
    latitudes = [alert.latitude for alert in alerts]
    longitudes = [alert.longitude for alert in alerts]
    mid_lat = sum(latitudes) / len(latitudes)
    mid_lon = sum(longitudes) / len(longitudes)
    return [mid_lat, mid_lon]

@router.get("/alerts")
def get_alerts(lang: str = 'en', db=Depends(get_db)):
    alerts = db.query(Alert).all()
    data = jsonable_encoder(alerts)
    return translation_service.translate_list(data, lang)

@router.get("/alerts/{alert_id}")
def get_alert_details(alert_id: str, lang: str = 'en', db=Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    data = jsonable_encoder(alert)
    return translation_service.translate_dict(data, lang)

@router.get("/alerts_with_midpoint")
def get_alerts_with_midpoint(lang: str = 'en', db=Depends(get_db)):
    alerts = db.query(Alert).all()
    midpoint = extract_midpoints_alerts(alerts)
    data = {
        "alerts": jsonable_encoder(alerts),
        "midpoint": midpoint
    }
    return translation_service.translate_dict(data, lang)
