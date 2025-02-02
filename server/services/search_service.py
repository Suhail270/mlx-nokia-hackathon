import os
import requests
import numpy as np
import faiss
from openai import OpenAI
from dotenv import load_dotenv
from utils.logging_config import logger

load_dotenv()
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

EMBED_MODEL = "nvidia/llama-3.2-nv-embedqa-1b-v2"
RERANK_MODEL = "nvidia/llama-3.2-nv-rerankqa-1b-v2"
LLM_MODEL = "meta/llama-3.1-70b-instruct"
SUMMARIZER_MODEL = "deepseek-ai/deepseek-r1"

embedding_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
llm_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")

faiss_index = None
doc_map = {}
next_id = 0

def embed_text(text: str, is_query: bool):
    input_type = "query" if is_query else "passage"
    r = embedding_client.embeddings.create(
        input=[text],
        model=EMBED_MODEL,
        encoding_format="float",
        extra_body={"input_type": input_type, "truncate": "NONE"}
    )
    return np.array(r.data[0].embedding, dtype=np.float32)

def ingest_events(events):
    global faiss_index, doc_map, next_id
    logger.info("Ingesting %d events", len(events))
    for e in events:
        text_passage = (f"Camera ID: {e['camera_id']}. Timestamp: {e['timestamp']}. "
                        f"Location: {e['location']}. Event Class: {e['event_class']}. Details: {e['details']}")
        vec = embed_text(text_passage, False)
        if faiss_index is None:
            dim = vec.shape[0]
            index_flat = faiss.IndexFlatL2(dim)
            faiss_index = faiss.IndexIDMap(index_flat)
        vec_2d = np.expand_dims(vec, axis=0)
        ids_np = np.array([next_id], dtype=np.int64)
        faiss_index.add_with_ids(vec_2d, ids_np)
        doc_map[next_id] = text_passage
        next_id += 1
    logger.info("FAISS index size after ingest: %d", faiss_index.ntotal if faiss_index else 0)
    return faiss_index.ntotal if faiss_index else 0

def search_events(query, k=5):
    if faiss_index is None:
        logger.info("FAISS index is empty")
        return []
    query_vec = embed_text(query, True)
    query_vec_2d = np.expand_dims(query_vec, axis=0)
    distances, ids = faiss_index.search(query_vec_2d, k)
    results = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        results.append({"id": int(doc_id), "text": doc_map[doc_id], "distance": float(dist)})
    logger.info("Search returned %d results", len(results))
    return results

def rerank_passages(query, passages):
    url = "https://ai.api.nvidia.com/v1/retrieval/nvidia/llama-3_2-nv-rerankqa-1b-v2/reranking"
    headers = {"Authorization": f"Bearer {NVIDIA_API_KEY}", "Accept": "application/json"}
    payload = {"model": RERANK_MODEL, "query": {"text": query}, "passages": [{"text": x} for x in passages]}
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    rankings = []
    for item in data.get("rankings", []):
        idx = item["index"]
        score = item["logit"]
        rankings.append({"text": passages[idx], "score": score})
    rankings.sort(key=lambda x: x["score"], reverse=True)
    return rankings

def generate_answer(query, passages, messages=None):
    if messages is None:
        context = "\n\n".join(passages)
        system_prompt = (
            f"You are an AI security event analysis assistant. You have the following event data:\n\n{context}\n\n"
            "Answer the user's query based on this data. If unsure, say 'I don't know'."
        )
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]
    resp = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=messages,
        max_tokens=256,
        temperature=0.2
    )
    return resp.choices[0].message.content.strip()


def rag_query(query, k=5, top_n=3):
    if faiss_index is None:
        logger.info("FAISS index is empty for RAG query")
        return {"answer": "", "passages": []}
    query_vec = embed_text(query, True)
    query_vec_2d = np.expand_dims(query_vec, axis=0)
    distances, ids = faiss_index.search(query_vec_2d, k)
    passages = []
    for dist, doc_id in zip(distances[0], ids[0]):
        if doc_id == -1:
            continue
        passages.append(doc_map[doc_id])
    reranked = rerank_passages(query, passages)
    top_passages = [p["text"] for p in reranked[:top_n]]
    answer = generate_answer(query, top_passages)
    logger.info("RAG query answer generated")
    return {"answer": answer, "passages": top_passages}
