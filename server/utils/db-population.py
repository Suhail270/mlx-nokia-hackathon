def populate_alerts(db: Session = Depends(get_db)):
    for alert in mock_alerts:
        existing_alert = db.query(Alert).filter(Alert.id == alert["id"]).first()
        if not existing_alert:
            new_alert = Alert(**alert)
            db.add(new_alert)
    db.commit()
    return {"message": "Mock alerts added to database"}