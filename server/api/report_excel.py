from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from io import BytesIO
import pandas as pd
from db.session import get_db
from models.alert import Alert, Dispatch, Ambulance, Police, Firefighter, Drone
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

router = APIRouter()

@router.get("reports/excel/{days}")
def get_excel_data(days: int, db: Session = Depends(get_db)):
    # Get the date range
    date_from = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d %H:%M:%S')

    # Query the database
    alerts = db.query(Alert).filter(Alert.timestamp >= date_from).all()
    ambulances = db.query(Ambulance).all()
    police = db.query(Police).all()
    firefighters = db.query(Firefighter).all()
    drones = db.query(Drone).all()
    dispatches = db.query(Dispatch).filter(Dispatch.dispatch_time >= date_from).all()

    # Convert data into lists for Pandas
    alerts_data = [{
        "id": alert.id,
        "type": alert.type,
        "severity": alert.severity,
        "location": alert.location,
        "timestamp": alert.timestamp,
        "responder_type": alert.responder_type,
        "response_time": alert.response_time,
        "resolution_time": alert.resolution_time,
        "status": alert.status
    } for alert in alerts]

    ambulances_data = [{"id": item.id, "zone": item.zone} for item in ambulances]
    police_data = [{"id": item.id, "zone": item.zone} for item in police]
    firefighters_data = [{"id": item.id, "zone": item.zone} for item in firefighters]
    drones_data = [{"id": item.id, "zone": item.zone} for item in drones]
    dispatches_data = [{
        "id": dispatch.id,
        "alert_id": dispatch.alert_id,
        "police_id": dispatch.police_id,
        "drone_id": dispatch.drone_id,
        "ambulance_id": dispatch.ambulance_id,
        "firefighter_id": dispatch.firefighter_id,
        "dispatch_time": dispatch.dispatch_time
    } for dispatch in dispatches]

    # Create pandas DataFrame for each type of data
    alerts_df = pd.DataFrame(alerts_data)
    ambulances_df = pd.DataFrame(ambulances_data)
    police_df = pd.DataFrame(police_data)
    firefighters_df = pd.DataFrame(firefighters_data)
    drones_df = pd.DataFrame(drones_data)
    dispatches_df = pd.DataFrame(dispatches_data)

    # Create a BytesIO buffer to save the file in memory
    excel_buffer = BytesIO()

    # Create an Excel writer and save data to the buffer
    with pd.ExcelWriter(excel_buffer, engine='xlsxwriter') as excel_writer:
        alerts_df.to_excel(excel_writer, sheet_name="Alerts", index=False)
        ambulances_df.to_excel(excel_writer, sheet_name="Ambulances", index=False)
        police_df.to_excel(excel_writer, sheet_name="Police", index=False)
        firefighters_df.to_excel(excel_writer, sheet_name="Firefighters", index=False)
        drones_df.to_excel(excel_writer, sheet_name="Drones", index=False)
        dispatches_df.to_excel(excel_writer, sheet_name="Dispatches", index=False)

 
    directory = "./reports/excel_reports" 
    if not os.path.exists(directory):
        os.makedirs(directory)

    
    num_alerts = len(alerts)  
    file_name = f"{datetime.now().strftime('%d-%m')}-{num_alerts}.xlsx"
    file_path = os.path.join(directory, file_name)

    # Save the file to the specified path
    with open(file_path, 'wb') as f:
        f.write(excel_buffer.getvalue())

    # Return the file as a response
    return FileResponse(file_path, filename=file_name)
