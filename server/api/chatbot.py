# server/api/chatbot.py
import os
import pickle
import numpy as np
import faiss
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from server.services.search_service import embed_text, rerank_passages, generate_answer
from server.utils.logging_config import logger

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    conversation_history: list = []

@router.post("/chat_with_alert/{alert_id}")
def chat_with_alert(alert_id: int, request: ChatRequest):
    """
    Given an alert id and a user's query (with optional conversation history),
    load the associated vector store (or create one if needed), perform a retrieval,
    and generate an LLM response that respects both the alert context and conversation.
    """
    vectorstore_path = os.path.join("results", f"vectorstore_{alert_id}.pkl")
    
    if not os.path.exists(vectorstore_path):
        raise HTTPException(status_code=404, detail="Vector store not found. Please select the alert first.")
    
    try:
        with open(vectorstore_path, "rb") as f:
            vectorstore_data = pickle.load(f)
    except Exception as e:
        logger.error(f"Error loading vector store: {e}")
        raise HTTPException(status_code=500, detail="Error loading vector store.")
    
    index = vectorstore_data.get("index")
    doc_map = vectorstore_data.get("doc_map")
    if index is None or doc_map is None:
        raise HTTPException(status_code=500, detail="Invalid vector store format.")
    
    try:
        query_vec = embed_text(request.query, is_query=True)
    except Exception as e:
        logger.error(f"Error generating query embedding: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate query embedding.")
    
    query_vec = np.expand_dims(query_vec, axis=0)
    
    k = 5
    try:
        distances, ids = index.search(query_vec, k)
    except Exception as e:
        logger.error(f"Error during FAISS search: {e}")
        raise HTTPException(status_code=500, detail="Document retrieval failed.")
    
    passages = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        passage = doc_map.get(doc_id)
        if passage:
            passages.append(passage)
    
    if not passages:
        raise HTTPException(status_code=404, detail="No relevant passages found.")
    
    try:
        reranked = rerank_passages(request.query, passages)
        top_passages = [p["text"] for p in reranked[:3]] if reranked else passages[:3]
    except Exception as e:
        logger.error(f"Error during reranking: {e}")
        top_passages = passages[:3]
    
    messages = [{
        "role": "system",
        "content": (
            "You are an advanced virtual assistant. "
            "The following context is derived from an alert's data:\n\n" +
            "\n".join(top_passages) +
            "\n\nAnswer the user's questions accurately, "
            "taking into account the conversation history."
        )
    }]

    if request.conversation_history:
        messages.extend(request.conversation_history)
    messages.append({"role": "user", "content": request.query})
    
    try:
        answer = generate_answer(request.query, top_passages, messages=messages)
    except Exception as e:
        logger.error(f"Error generating LLM answer: {e}")
        raise HTTPException(status_code=500, detail="LLM query failed.")
    
    return {"answer": answer, "passages": top_passages}
