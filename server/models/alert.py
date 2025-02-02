from sqlalchemy import Column, String, Float
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