from sqlalchemy.orm import Session
from datetime import datetime
from server.utils.database import SessionLocal, Alert
from fastapi import FastAPI, Depends

# ✅ Dependency: Get Database Session
def get_db(SessionLocal):
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# ✅ API to Retrieve Alerts from SQLite


def populate_alerts(db: Session = Depends(get_db)):
    for alert in mock_alerts:
        existing_alert = db.query(Alert).filter(Alert.id == alert["id"]).first()
        if not existing_alert:
            new_alert = Alert(**alert)
            db.add(new_alert)
    db.commit()
    return {"message": "Mock alerts added to database"}


def extract_midpoints_alerts(alerts):
    midpoints = []
    for alert in alerts:
        midpoints.append({
            "latitude": alert.latitude,
            "longitude": alert.longitude
        })
    return midpoints

