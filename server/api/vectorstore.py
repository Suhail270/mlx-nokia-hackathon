# server/api/vectorstore.py
import os
import pickle
import numpy as np
import faiss
from fastapi import APIRouter, Depends, HTTPException
from db.session import get_db
from models.alert import Alert
from services.search_service import embed_text
from utils.logging_config import logger

router = APIRouter()

@router.get("/vectorstore/{alert_id}")
def ensure_vectorstore(alert_id: int, db=Depends(get_db)):

    vectorstore_path = os.path.join("results", f"vectorstore_{alert_id}.pkl")
    
    if not os.path.exists(vectorstore_path):
        logger.info(f"Vector store for alert_id {alert_id} not found. Creating one.")
        alert = db.query(Alert).filter(Alert.id == str(alert_id)).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found.")
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
            raise HTTPException(status_code=500, detail="Embedding creation failed.")
        
        dim = vec.shape[0]
        index = faiss.IndexFlatL2(dim)
        index = faiss.IndexIDMap(index)
        vector = np.expand_dims(vec, axis=0)
        ids = np.array([0], dtype=np.int64)
        index.add_with_ids(vector, ids)
        doc_map = {0: text_content}
        
        os.makedirs("results", exist_ok=True)
        vectorstore_data = {"index": index, "doc_map": doc_map}
        try:
            print("vectorstore_path", vectorstore_path)
            with open(vectorstore_path, "wb") as f:
                pickle.dump(vectorstore_data, f)
            logger.info(f"Vector store created and saved at {vectorstore_path}.")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}")
            raise HTTPException(status_code=500, detail="Saving vector store failed.")
    
    return {"message": "Vector store is ready."}
