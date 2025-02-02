from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.search_service import ingest_events, search_events, rag_query
from utils.logging_config import logger

router = APIRouter()

class EventItem(BaseModel):
    camera_id: str
    timestamp: str
    location: str
    event_class: str
    details: str

class QueryInput(BaseModel):
    query: str
    k: int = 5

class RAGQuery(BaseModel):
    query: str
    k: int = 5
    top_n: int = 3

@router.post("/ingest")
def ingest_data(events: List[EventItem]):
    event_dicts = [e.dict() for e in events]
    size = ingest_events(event_dicts)
    return {"faiss_size": size}

@router.post("/search")
def search_data(q: QueryInput):
    results = search_events(q.query, q.k)
    return {"results": results}

@router.post("/rag")
def rag(q: RAGQuery):
    result = rag_query(q.query, q.k, q.top_n)
    return result
