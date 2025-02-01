import os
import pickle
import re
from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings, ChatNVIDIA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
from utils.logging_config import logger

load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
if not NVIDIA_API_KEY:
    logger.error("NVIDIA API Key is missing. Please set it in the environment variables.")
    raise ValueError("NVIDIA API Key is missing.")

VECTOR_STORE_PATH = os.path.join("results", "vectorstore.pkl")
vectorstore = None

nvidia_embedder = NVIDIAEmbeddings(model="nvidia/nv-embedqa-mistral-7b-v2", api_key=NVIDIA_API_KEY)
client = ChatNVIDIA(
    model="ibm/granite-3.0-8b-instruct",
    api_key=NVIDIA_API_KEY,
    temperature=0.2,
    top_p=0.7,
    max_tokens=1024,
)

def load_vectorstore():
    global vectorstore
    logger.info("Attempting to load vector store.")
    if not vectorstore and os.path.exists(VECTOR_STORE_PATH):
        try:
            with open(VECTOR_STORE_PATH, "rb") as f:
                vectorstore = pickle.load(f)
            logger.info("Vector store loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            raise

def extract_text(file_path: str):
    logger.info(f"Extracting text from file: {file_path}")
    try:
        if file_path.endswith(".pdf"):
            pdf_reader = PdfReader(file_path)
            text = "".join(page.extract_text() for page in pdf_reader.pages)
            logger.info("Text extracted from PDF successfully.")
            return text
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                logger.info("Text extracted from file successfully.")
                return text
    except Exception as e:
        logger.error(f"Error extracting text from file {file_path}: {e}")
        raise

def split_text(text: str):
    logger.info("Splitting text into smaller chunks.")
    try:
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_text(text)
        logger.info(f"Text split into {len(chunks)} chunks.")
        return chunks
    except Exception as e:
        logger.error(f"Error splitting text: {e}")
        raise

def chat_with_document(user_query: str):
    global vectorstore
    logger.info("Starting chat interaction with document.")
    load_vectorstore()
    
    if not vectorstore:
        logger.error("No vector store or documents available.")
        raise HTTPException(status_code=404, detail="No vector store or documents available.")
    
    retriever = vectorstore.as_retriever(search_k=100)
    try:
        logger.info(f"Retrieving relevant documents for query: {user_query}")
        docs = retriever.invoke(user_query)
        passages = [doc.page_content for doc in docs]
        if not passages:
            logger.warning("No relevant passages found for the query.")
            raise HTTPException(status_code=404, detail="No relevant passages found.")
    except Exception as e:
        logger.error(f"Error during retrieval: {e}")
        raise

    context = "\n".join(passages)
    logger.info(f"Retrieved {len(passages)} passages for context.")

    messages = [
        {"role": "user", "content": f"""
You are an advanced virtual assistant that uses information extracted from FAISS‑indexed transcripts to answer queries. Please follow these guidelines:
  
- Extract precise and relevant information only from the transcripts.
- Provide a clear, concise, and direct answer.
- If available, include a relevant timestamp (e.g. [00:12:34]) from the transcript.
- If no relevant data is found, respond honestly that no matching information exists.

Context: {context}
Question: {user_query}
        """}
    ]

    try:
        final_response = ""
        for chunk in client.stream(messages):
            if chunk.content:
                final_response += chunk.content
        cleaned_response = re.sub(r"(\*\*|###|[\w-]+\.pdf)", "", final_response)
        logger.info("Chat response generated successfully.")
        return cleaned_response.strip()
    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the response.")
