import logging
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List
import os
import requests
import numpy as np
import faiss
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi.encoders import jsonable_encoder


from sqlalchemy import create_engine, Column, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(levelname)s - %(message)s", 
    handlers=[
        logging.FileHandler("logs/sessions.log"), 
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# ✅ Connect to SQLite Database
DATABASE_URL = "sqlite:///./alerts.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMBED_MODEL = "nvidia/llama-3.2-nv-embedqa-1b-v2"
RERANK_MODEL = "nvidia/llama-3.2-nv-rerankqa-1b-v2"
LLM_MODEL = "meta/llama-3.1-70b-instruct"
embedding_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
llm_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
faiss_index = None
doc_map = {}
next_id = 0

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Existing endpoint to get all alerts from the database
@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()

# ✅ New function to calculate the midpoint from alerts
def extract_midpoints_alerts(alerts):
    """
    Calculate the geographic midpoint of a list of alerts.

    Args:
        alerts (list): A list of Alert objects (or dictionaries) expected to have
                       `latitude` and `longitude` attributes/keys.

    Returns:
        list: A list containing two floats [mid_latitude, mid_longitude]. If no alerts
              are provided or valid coordinates are found, returns a default coordinate.
    """
    # Default coordinate if no alerts are available
    if not alerts:
        return [40.7128, -74.0060]  # Defaults to NYC coordinates

    latitudes = []
    longitudes = []

    for alert in alerts:
        # If the alert is a SQLAlchemy model instance with attributes
        if hasattr(alert, "latitude") and hasattr(alert, "longitude"):
            latitudes.append(alert.latitude)
            longitudes.append(alert.longitude)
        # If the alert is a dictionary
        elif isinstance(alert, dict):
            latitudes.append(alert.get("latitude", 0))
            longitudes.append(alert.get("longitude", 0))

    # In case no valid coordinates were found, return the default
    # if not latitudes or not longitudes:
    #     return [40.7128, -74.0060]

    mid_lat = sum(latitudes) / len(latitudes)
    mid_lon = sum(longitudes) / len(longitudes)
    return [mid_lat, mid_lon]

@app.get("/alerts_with_midpoint")
def get_alerts_with_midpoint(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    midpoint = extract_midpoints_alerts(alerts)
    return {"alerts": jsonable_encoder(alerts), "midpoint": midpoint}

@app.post("/ingest")
def ingest_data(events: List[EventItem]):
    global faiss_index, doc_map, next_id
    logger.info("Ingest request received with %d events", len(events))
    for e in events:
        text_passage = f"Camera ID: {e.camera_id}. Timestamp: {e.timestamp}. Location: {e.location}. Event Class: {e.event_class}. Details: {e.details}"
        vec = embed_text(text_passage, False)
        if faiss_index is None:
            dim = vec.shape[0]
            index_flat = faiss.IndexFlatL2(dim)
            index_with_ids = faiss.IndexIDMap(index_flat)
            faiss_index = index_with_ids
        vec_2d = np.expand_dims(vec, axis=0)
        ids_np = np.array([next_id], dtype=np.int64)
        faiss_index.add_with_ids(vec_2d, ids_np)
        doc_map[next_id] = text_passage
        next_id += 1
    logger.info("FAISS index size after ingest: %d", faiss_index.ntotal if faiss_index else 0)
    return {"faiss_size": faiss_index.ntotal if faiss_index else 0}

@app.post("/search")
def search_data(q: QueryInput):
    if faiss_index is None:
        logger.info("Search requested but FAISS is empty")
        return {"results": []}
    logger.info("Search request: %s", q.query)
    query_vec = embed_text(q.query, True)
    query_vec_2d = np.expand_dims(query_vec, axis=0)
    distances, ids = faiss_index.search(query_vec_2d, q.k)
    results = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        results.append({"id": int(doc_id), "text": doc_map[doc_id], "distance": float(dist)})
    logger.info("Search returned %d results", len(results))
    return {"results": results}

@app.post("/rag")
def rag_query(rq: RAGQuery):
    if faiss_index is None:
        logger.info("RAG query requested but FAISS is empty")
        return {"answer": "", "passages": []}
    logger.info("RAG query: %s", rq.query)
    query_vec = embed_text(rq.query, True)
    query_vec_2d = np.expand_dims(query_vec, axis=0)
    distances, ids = faiss_index.search(query_vec_2d, rq.k)
    passages = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        passages.append(doc_map[doc_id])
    reranked = rerank_passages(rq.query, passages)
    top_passages = [p["text"] for p in reranked[:rq.top_n]]
    answer = generate_answer(rq.query, top_passages)
    logger.info("RAG answer generated")
    return {"answer": answer, "passages": top_passages}

def embed_text(text: str, is_query: bool):
    t = "query" if is_query else "passage"
    r = embedding_client.embeddings.create(
        input=[text],
        model=EMBED_MODEL,
        encoding_format="float",
        extra_body={"input_type": t, "truncate": "NONE"}
    )
    return np.array(r.data[0].embedding, dtype=np.float32)

def rerank_passages(query: str, passages: list):
    u = "https://ai.api.nvidia.com/v1/retrieval/nvidia/llama-3_2-nv-rerankqa-1b-v2/reranking"
    h = {"Authorization": f"Bearer {NVIDIA_API_KEY}", "Accept": "application/json"}
    p = {"model": RERANK_MODEL, "query": {"text": query}, "passages": [{"text": x} for x in passages]}
    x = requests.post(u, headers=h, json=p)
    x.raise_for_status()
    d = x.json()
    r = []
    for i in d["rankings"]:
        idx = i["index"]
        logit = i["logit"]
        r.append({"text": passages[idx], "score": logit})
    r.sort(key=lambda z: z["score"], reverse=True)
    return r

def generate_answer(query: str, passages: list):
    c = "\n\n".join(passages)
    system_prompt = f"You are an AI security event analysis assistant. You have the following event data:\n\n{c}\n\nAnswer the user's query based on this data. If unsure, say 'I don't know'."
    m = [{"role": "system", "content": system_prompt}, {"role": "user", "content": query}]
    resp = llm_client.chat.completions.create(model=LLM_MODEL, messages=m, max_tokens=256, temperature=0.2)
    return resp.choices[0].message.content.strip()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
