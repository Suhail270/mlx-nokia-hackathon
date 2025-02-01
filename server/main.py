import logging
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import os
import requests
import numpy as np
import faiss
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal, Alert

load_dotenv()

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "YOUR_NVIDIA_API_KEY")
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

# ✅ Dependency: Get Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Mock Alerts Data
mock_alerts = [
    {
        "id": "1",
        "type": "fire",
        "severity": "critical",
        "location": "123 Main St, New York, NY",
        "latitude": 40.7128,
        "longitude": -74.006,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Large fire detected in residential building. Multiple heat signatures detected.",
        "image": '@/images/fire.png',
    },
    {
        "id": "2",
        "type": "fire",
        "severity": "warning",
        "location": "456 Park Ave, New York, NY",
        "latitude": 40.7528,
        "longitude": -73.9765,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Potential assault detected in parking garage. Two individuals involved.",
        "image": '@/images/fire.png',
    },
    {
        "id": "3",
        "type": "assault",
        "severity": "critical",
        "location": "789 River Rd, Miami, FL",
        "latitude": 25.7617,
        "longitude": -80.1918,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Severe flooding detected near residential areas. Rising water levels due to heavy rainfall.",
        "image": '@/images/fire.png',
    },
    {
        "id": "4",
        "type": "assault",
        "severity": "critical",
        "location": "102 Elm St, Los Angeles, CA",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Earthquake detected with magnitude 6.2. Possible structural damage reported.",
        "image": '@/images/fire.png',
    },
    {
        "id": "5",
        "type": "fire",
        "severity": "warning",
        "location": "555 Lincoln Blvd, San Francisco, CA",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Suspicious activity detected at a closed business. Potential burglary in progress.",
        "image": '@/images/fire.png',
    },
    {
        "id": "6",
        "type": "fire",
        "severity": "critical",
        "location": "222 Oak St, Chicago, IL",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "High levels of gas detected in the area. Evacuation may be required.",
        "image": '@/images/fire.png',
    },
    {
        "id": "7",
        "type": "assault",
        "severity": "high",
        "location": "777 Maple Ave, Houston, TX",
        "latitude": 29.7604,
        "longitude": -95.3698,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Person collapsed in a public area. CPR being performed by a bystander.",
        "image" : '@/images/fire.png',
    },
]

# ✅ API to Insert Mock Alerts into SQLite
@app.post("/populate-alerts")
def populate_alerts(db: Session = Depends(get_db)):
    for alert in mock_alerts:
        existing_alert = db.query(Alert).filter(Alert.id == alert["id"]).first()
        if not existing_alert:
            new_alert = Alert(**alert)
            db.add(new_alert)
    db.commit()
    return {"message": "Mock alerts added to database"}

# ✅ API to Retrieve Alerts from SQLite
@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()

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
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)