from fastapi import APIRouter, Depends, HTTPException
from db.session import get_db
from models.alert import Alert
from utils.logging_config import logger
from services.search_service import llm_client, LLM_MODEL

router = APIRouter()

@router.get("/summary/{alert_id}")
def get_alert_summary(alert_id: int, db=Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == str(alert_id)).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    
    alert_text = (
        f"Alert ID: {alert.id}\n"
        f"Type: {alert.type}\n"
        f"Severity: {alert.severity}\n"
        f"Location: {alert.location}\n"
        f"Timestamp: {alert.timestamp}\n"
        f"Description: {alert.description}\n"
        f"Image: {alert.image}"
    )
    
    prompt = (
        "Please provide a concise, descriptive summary of the following alert details in one paragraph:\n\n"
        f"{alert_text}"
    )
    
    try:
        messages = [
            {"role": "system", "content": "You are a helpful summarization assistant."},
            {"role": "user", "content": prompt}
        ]
        response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            max_tokens=256,
            temperature=0.2
        )
        summary = response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Error generating summary.")
    

    # return {"alert_id": alert_id, "summary": summary}
    return summary
