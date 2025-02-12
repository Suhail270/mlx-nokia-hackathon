from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.session import engine, Base
from models.alert import Alert
from api import alerts, events, chatbot
from utils.logging_config import logger
from api import alerts, events, chatbot, vectorstore, summary, video, report_json, report_excel, report_json, report_pdf
from fastapi.staticfiles import StaticFiles
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# # Determine the absolute path to the 'annotated_videos' directory
# video_directory = os.path.abspath("annotated_videos/")

# # Mount the 'annotated_videos' directory to serve static files
# app.mount("/videos", StaticFiles(directory=video_directory), name="videos")

app.add_middleware(
    CORSMiddleware,

    allow_origins=["http://localhost:5173", "http://localhost:8081","http://localhost:8080","http://localhost:8082"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(vectorstore.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(video.router, prefix="/api")
app.include_router(report_json.router, prefix="/api")
app.include_router(report_excel.router, prefix="/api")
app.include_router(report_pdf.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
