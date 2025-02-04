import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from db.session import get_db
from models.alert import Dispatch, Alert, Police, Firefighter, Ambulance, Drone
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

router = APIRouter()

# Helper function to extract the data and convert it into dictionary format
def get_alerts_data(alerts):
    return [
        {
            "id": alert.id,
            "type": alert.type,
            "severity": alert.severity,
            "location": alert.location,
            "timestamp": alert.timestamp,  # Keep timestamp as it is
            "responder_type": alert.responder_type,
            "response_time": alert.response_time,
            "resolution_time": alert.resolution_time,
            "status": alert.status
        }
        for alert in alerts
    ]

def get_zones_data(data):
    return [
        {
            "id": item.id,
            "zone": item.zone
        }
        for item in data
    ]

def get_dispatch_data(dispatches):
    return [
        {
            "id": dispatch.id,
            "alert_id": dispatch.alert_id,
            "police_id": dispatch.police_id,
            "drone_id": dispatch.drone_id,
            "ambulance_id": dispatch.ambulance_id,
            "firefighter_id": dispatch.firefighter_id,
            "dispatch_time": dispatch.dispatch_time,  # Keep dispatch time as it is
        }
        for dispatch in dispatches
    ]

@router.get("/json/{days}")
def get_json_data(days: int, db: Session = Depends(get_db)):
    # Get the date range
    date_from = datetime.now() - timedelta(days=days)
    
    # Query the database and filter by the calculated date range
    alerts = db.query(Alert).all()
    ambulances = db.query(Ambulance).all()
    police = db.query(Police).all()
    firefighters = db.query(Firefighter).all()
    drones = db.query(Drone).all()
    dispatches = db.query(Dispatch).all()

    # Filter the alerts and dispatches based on the calculated date range
    alerts = [alert for alert in alerts if datetime.fromisoformat(alert.timestamp) >= date_from]
    dispatches = [dispatch for dispatch in dispatches if datetime.fromisoformat(dispatch.dispatch_time) >= date_from]

    # Format data for each category
    alerts_data = get_alerts_data(alerts)
    ambulances_data = get_zones_data(ambulances)
    police_data = get_zones_data(police)
    firefighters_data = get_zones_data(firefighters)
    drones_data = get_zones_data(drones)
    dispatches_data = get_dispatch_data(dispatches)

    # Create the response data as a dictionary
    response_data = {
        "alerts": alerts_data,
        "ambulances": ambulances_data,
        "police": police_data,
        "firefighters": firefighters_data,
        "drones": drones_data,
        "dispatches": dispatches_data
    }

    # Return the JSON response directly
    return JSONResponse(content=response_data)
