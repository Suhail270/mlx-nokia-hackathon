from fastapi import APIRouter
from pydantic import BaseModel
from services.chatbot_service import chat_with_document
from utils.logging_config import logger

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = chat_with_document(request.query)
    return {"response": response}
