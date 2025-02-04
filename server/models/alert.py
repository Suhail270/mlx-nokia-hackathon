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

    police = relationship("Police", back_populates="alert", cascade="all, delete")
    firefighter = relationship("Firefighter", back_populates="alert", cascade="all, delete")
    ambulance = relationship("Ambulance", back_populates="alert", cascade="all, delete")
    drone = relationship("Drone", back_populates="alert", cascade="all, delete")

class Police(Base):
    __tablename__ = "police"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    status = Column(Boolean, default=False)
    dispatched_at = Column(String)
    
    alert = relationship("Alert", back_populates="police")


class Firefighter(Base):
    __tablename__ = "firefighter"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    status = Column(Boolean, default=False)
    dispatched_at = Column(String)
    
    alert = relationship("Alert", back_populates="firefighter")

class Ambulance(Base):
    __tablename__ = "ambulance"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    status = Column(Boolean, default=False)
    dispatched_at = Column(String)
    
    alert = relationship("Alert", back_populates="ambulance")

class Drone(Base):
    __tablename__ = "drone"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    status = Column(Boolean, default=False)
    dispatched_at = Column(String)
    
    alert = relationship("Alert", back_populates="drone")
