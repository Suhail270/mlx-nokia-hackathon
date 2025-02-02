from fastapi import APIRouter, Depends, HTTPException
from db.session import get_db
from models.alert import Alert
from utils.logging_config import logger
from utils.translation import translation_service
from services.search_service import llm_client, LLM_MODEL, SUMMARIZER_MODEL
from api.video import video_text_local
from pydantic import BaseModel
import re

router = APIRouter()

class VideoQuery(BaseModel):
    file_path: str
    stream: bool = False
    max_tokens: int = 1024
    temperature: float = 0.2
    top_p: float = 0.7
    seed: int = 50
    num_frames_per_inference: int = 8
    prompt: str = "Analyze the video and provide a summary."

def extract_post_think_content(text: str) -> str:
    """Extract content after </think> tag."""
    match = re.search(r'</think>\s*(.*?)$', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text

def call_vlm_model(alert_id: int, db=Depends(get_db)):
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
    
    print("alert.video_path", alert.video_path)
    vid_path = alert.video_path[7:]
    print("replace_video_path", vid_path)
    
    prompt = f"""You are an AI security agent. You have been tasked with analyzing a video feed from a security camera. 
    Please provide a detailed analysis of the video feed, including any potential security threats, incidents, and the 
    number or possible number of people involved, with a detailed description of each person. 
    This is the information you currently have:\n\n{alert_text}"""
    
    video_query = VideoQuery(
        file_path=vid_path,
        stream=False,
        max_tokens=1024,
        temperature=0.2,
        top_p=0.7,
        seed=50,
        num_frames_per_inference=8,
        prompt=prompt
    )
    
    try:
        result = video_text_local(video_query)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        if isinstance(result, dict):
            if "choices" in result and result["choices"]:
                return result["choices"][0]["message"]["content"]
            else:
                raise HTTPException(status_code=500, detail="Invalid response format from video analysis")
        else:
            raise HTTPException(status_code=500, detail="Unexpected response type from video analysis")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in video analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@router.get("/summary/{alert_id}")
def get_alert_summary(alert_id: int, lang: str = 'en', db=Depends(get_db)):
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
        f"Other Information: {alert.geo_info}"
    )
    
    vlm_analysis = call_vlm_model(alert_id, db)
    
    prompt = (
        f"""You have been given details of the same alert by two agents.

        Agent 1:
        {alert_text}

        Agent 2:
        {vlm_analysis}
        
        Please provide a concise, descriptive summary of the above alert details in one paragraph. If there are conflicting pieces of information, only consider the threat and important alert."""
    )
    
    try:
        messages = [
            {"role": "system", "content": "You are a helpful emergency response operator."},
            {"role": "user", "content": prompt}
        ]
        response = llm_client.chat.completions.create(
            model=SUMMARIZER_MODEL,
            messages=messages,
            temperature=0.6,
            top_p=0.7,
            max_tokens=4096,
            stream=False
        )
        summary = response.choices[0].message.content.strip()
        processed_summary = extract_post_think_content(summary)
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Error generating summary.")
    
    response_data = {
        "alert_id": alert_id,
        "summary": processed_summary
    }
    return translation_service.translate_dict(response_data, lang)

