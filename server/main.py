from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.session import engine, Base
from models.alert import Alert
from api import alerts, events, chatbot
from utils.logging_config import logger
from api import alerts, events, chatbot, vectorstore, summary

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8081","http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(vectorstore.router, prefix="/api")
app.include_router(summary.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="localhost", port=8000, reload=True)
