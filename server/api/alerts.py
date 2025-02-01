from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from db.session import get_db
from models.alert import Alert
from utils.logging_config import logger

router = APIRouter()

def extract_midpoints_alerts(alerts):
    if not alerts:
        return [40.7128, -74.0060]
    latitudes = [alert.latitude for alert in alerts]
    longitudes = [alert.longitude for alert in alerts]
    mid_lat = sum(latitudes) / len(latitudes)
    mid_lon = sum(longitudes) / len(longitudes)
    return [mid_lat, mid_lon]

@router.get("/alerts")
def get_alerts(db=Depends(get_db)):
    alerts = db.query(Alert).all()
    return jsonable_encoder(alerts)

@router.get("/alerts_with_midpoint")
def get_alerts_with_midpoint(db=Depends(get_db)):
    alerts = db.query(Alert).all()
    midpoint = extract_midpoints_alerts(alerts)
    return {"alerts": jsonable_encoder(alerts), "midpoint": midpoint}
