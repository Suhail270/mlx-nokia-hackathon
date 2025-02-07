from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, index=True)
    severity = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(String)
    description = Column(String)
    image = Column(String)
    video_path = Column(String)
    geo_info = Column(String)
    responder_type = Column(String)
    response_time = Column(Integer)
    resolution_time = Column(Integer)
    status = Column(String)
    dispatch = relationship("Dispatch", back_populates="alert", cascade="all, delete-orphan")
    aiSummary = Column(String)


class Police(Base):
    __tablename__ = "police"

    id = Column(String, primary_key=True, index=True)
    zone = Column(String)
    startZoneLat = Column(String)
    startZoneLong = Column(String)

class Firefighter(Base):
    __tablename__ = "firefighter"

    id = Column(String, primary_key=True, index=True)
    zone = Column(String)
    startZoneLat = Column(String)
    startZoneLong = Column(String)

class Ambulance(Base):
    __tablename__ = "ambulance"

    id = Column(String, primary_key=True, index=True)
    zone = Column(String)
    startZoneLat = Column(String)
    startZoneLong = Column(String)


class Drone(Base):
    __tablename__ = "drone"

    id = Column(String, primary_key=True, index=True)
    zone = Column(String)
    startZoneLat = Column(String)
    startZoneLong = Column(String)

class Dispatch(Base):
    __tablename__ = "dispatch"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"))
    police_id = Column(String, ForeignKey("police.id"))
    ambulance_id = Column(String, ForeignKey("ambulance.id"))
    firefighter_id = Column(String, ForeignKey("firefighter.id"))
    drone_id = Column(String, ForeignKey("drone.id"))
    dispatch_time = Column(String)
    alert = relationship("Alert", back_populates="dispatch")
    police = relationship("Police")
    ambulance = relationship("Ambulance")
    firefighter = relationship("Firefighter")
    drone = relationship("Drone")

