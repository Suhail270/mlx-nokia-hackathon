# server/api/vectorstore.py

import os
import pickle
import numpy as np
import faiss
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from db.session import get_db
from models.alert import Alert
from services.search_service import embed_text
from utils.logging_config import logger

router = APIRouter()


@router.get("/vectorstore/{alert_id}")
def generate_vectorstore(alert_id: str, db=Depends(get_db)):

    VECTORSTORE_PATH = os.path.join("results", f"vectorstore_{alert_id}.pkl")

    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    text_content = (
        f"Alert Type: {alert.type}. "
        f"Severity: {alert.severity}. "
        f"Location: {alert.location}. "
        f"Description: {alert.description}"
    )

    try:
        vec = embed_text(text_content, is_query=False)
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

    dim = vec.shape[0]
    index = faiss.IndexFlatL2(dim)
    index = faiss.IndexIDMap(index)
    
    vector = np.expand_dims(vec, axis=0)
    ids = np.array([0], dtype=np.int64)
    index.add_with_ids(vector, ids)
    
    doc_map = {0: text_content}
    
    os.makedirs("results", exist_ok=True)
    vectorstore_data = {"index": index, "doc_map": doc_map}
    with open(VECTORSTORE_PATH, "wb") as f:
        pickle.dump(vectorstore_data, f)
    
    logger.info(f"Vector store generated for alert_id {alert_id} and saved to {VECTORSTORE_PATH}")
    
    return FileResponse(
        VECTORSTORE_PATH,
        media_type="application/octet-stream",
        filename="vectorstore.pkl"
    )
