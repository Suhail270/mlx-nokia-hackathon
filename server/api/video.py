import os
import requests
from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from utils.logging_config import logger

load_dotenv()

router = APIRouter()

INVOKE_URL = "https://ai.api.nvidia.com/v1/vlm/nvidia/vila"
API_KEY = "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"

if not API_KEY:
    raise RuntimeError("API_KEY is missing! Set it in your .env file or environment variables.")

NVCF_ASSET_URL = "https://api.nvcf.nvidia.com/v2/nvcf/assets"
SUPPORTED_LIST = {
    "png": ["image/png", "img"],
    "jpg": ["image/jpg", "img"],
    "jpeg": ["image/jpeg", "img"],
    "mp4": ["video/mp4", "video"],
}

def get_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext[1:].lower()

def mime_type(ext: str) -> str:
    return SUPPORTED_LIST[ext][0]

def media_type(ext: str) -> str:
    return SUPPORTED_LIST[ext][1]

def upload_asset_from_local(file_path: str, description: str) -> str:
    filename = os.path.basename(file_path)
    ext = get_extension(filename)
    if ext not in SUPPORTED_LIST:
        raise ValueError(f"Unsupported file format: {ext}")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    
    response = requests.post(
        NVCF_ASSET_URL,
        headers=headers,
        json={"contentType": mime_type(ext), "description": description},
        timeout=30,
    )
    response.raise_for_status()
    authorize_res = response.json()
    
    upload_url = authorize_res["uploadUrl"]
    asset_id = authorize_res["assetId"]

    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()
    except Exception as e:
        raise RuntimeError(f"Could not read file {file_path}: {e}")
    
    upload_response = requests.put(
        upload_url,
        data=file_bytes,
        headers={
            "x-amz-meta-nvcf-asset-description": description,
            "content-type": mime_type(ext),
        },
        timeout=300,
    )
    upload_response.raise_for_status()
    return asset_id

def delete_asset(asset_id: str):
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.delete(f"{NVCF_ASSET_URL}/{asset_id}", headers=headers, timeout=30)
    response.raise_for_status()

def chat_with_media_vila_local(
    query: str,
    file_path: str,
    stream: bool = False,
    max_tokens: int = 1024,
    temperature: float = 0.2,
    top_p: float = 0.7,
    seed: int = 50,
    num_frames_per_inference: int = 8,
):
    asset_list = []
    media_content = ""
    try:
        filename = os.path.basename(file_path)
        ext = get_extension(filename)
        if ext not in SUPPORTED_LIST:
            raise ValueError(f"Unsupported file format: {ext}")
        
        if media_type(ext) == "video":
            pass

        asset_id = upload_asset_from_local(file_path, "Reference media file")
        asset_list.append(asset_id)
        media_content = f'<{media_type(ext)} src="data:{mime_type(ext)};asset_id,{asset_id}" />'
        
        asset_seq = ",".join(asset_list)
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "NVCF-INPUT-ASSET-REFERENCES": asset_seq,
            "NVCF-FUNCTION-ASSET-IDS": asset_seq,
            "Accept": "application/json" if not stream else "text/event-stream",
        }
        
        messages = [{"role": "user", "content": f"{query} {media_content}"}]
        payload = {
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "seed": seed,
            "num_frames_per_inference": num_frames_per_inference,
            "messages": messages,
            "stream": stream,
            "model": "nvidia/vila"
        }
        
        response = requests.post(INVOKE_URL, headers=headers, json=payload, stream=stream)
        
        if stream:
            return {"stream": list(response.iter_lines())}
        else:
            return response.json()
    except Exception as e:
        logger.error(f"Error in chat_with_media_vila_local: {e}")
        return {"error": str(e)}
    finally:
        for asset_id in asset_list:
            try:
                delete_asset(asset_id)
            except Exception as del_err:
                logger.error(f"Error deleting asset {asset_id}: {del_err}")

class VideoQuery(BaseModel):
    query: str
    file_path: str
    stream: bool = False
    max_tokens: int = 1024
    temperature: float = 0.2
    top_p: float = 0.7
    seed: int = 50
    num_frames_per_inference: int = 8

@router.post("/nvidia-vila-local/")
def video_text_local(video_query: VideoQuery):
    try:
        result = chat_with_media_vila_local(
            query=video_query.query,
            file_path=video_query.file_path,
            stream=video_query.stream,
            max_tokens=video_query.max_tokens,
            temperature=video_query.temperature,
            top_p=video_query.top_p,
            seed=video_query.seed,
            num_frames_per_inference=video_query.num_frames_per_inference,
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in video_text_local endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
