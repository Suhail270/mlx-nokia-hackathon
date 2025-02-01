# server/api/chatbot.py

import os
import pickle
import numpy as np
import faiss
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db.session import get_db
from models.alert import Alert
from services.search_service import embed_text, rerank_passages, generate_answer
from utils.logging_config import logger

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat_with_alert/{alert_id}")
def chat_with_alert(alert_id: int, request: ChatRequest, db=Depends(get_db)):

    vectorstore_path = os.path.join("results", f"vectorstore_{alert_id}.pkl")

    if not os.path.exists(vectorstore_path):
        logger.info(f"Vector store for alert_id {alert_id} not found. Creating a new one.")
        alert = db.query(Alert).filter(Alert.id == str(alert_id)).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found in the database.")
        text_content = (
            f"Alert Type: {alert.type}. "
            f"Severity: {alert.severity}. "
            f"Location: {alert.location}. "
            f"Description: {alert.description}"
        )
        try:
            vec = embed_text(text_content, is_query=False)
        except Exception as e:
            logger.error(f"Error generating embedding for alert text: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate embedding for alert.")
        
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
            with open(vectorstore_path, "wb") as f:
                pickle.dump(vectorstore_data, f)
            logger.info(f"Vector store created and saved at {vectorstore_path}.")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}")
            raise HTTPException(status_code=500, detail="Error saving vector store.")
    
    try:
        with open(vectorstore_path, "rb") as f:
            vectorstore_data = pickle.load(f)
    except Exception as e:
        logger.error(f"Error loading vector store from {vectorstore_path}: {e}")
        raise HTTPException(status_code=500, detail="Error loading vector store.")
    
    index = vectorstore_data.get("index")
    doc_map = vectorstore_data.get("doc_map")
    if index is None or doc_map is None:
        logger.error("Invalid vector store format.")
        raise HTTPException(status_code=500, detail="Invalid vector store data.")
    
    try:
        query_vec = embed_text(request.query, is_query=True)
    except Exception as e:
        logger.error(f"Error generating embedding for query: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate query embedding.")
    
    query_vec = np.expand_dims(query_vec, axis=0)
    
    k = 5
    try:
        distances, ids = index.search(query_vec, k)
    except Exception as e:
        logger.error(f"Error during FAISS search: {e}")
        raise HTTPException(status_code=500, detail="Error during document retrieval.")
    
    passages = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        text = doc_map.get(doc_id)
        if text:
            passages.append(text)
    
    if not passages:
        raise HTTPException(status_code=404, detail="No relevant passages found.")
    
    try:
        reranked = rerank_passages(request.query, passages)
        top_passages = [p["text"] for p in reranked[:3]] if reranked else passages[:3]
    except Exception as e:
        logger.error(f"Error during passage reranking: {e}")
        top_passages = passages[:3]
    
    try:
        answer = generate_answer(request.query, top_passages)
    except Exception as e:
        logger.error(f"Error generating answer from LLM: {e}")
        raise HTTPException(status_code=500, detail="Error generating answer from LLM.")
    
    return {"answer": answer, "passages": top_passages}
