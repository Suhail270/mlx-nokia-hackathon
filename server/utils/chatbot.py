import os
import pickle
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings, ChatNVIDIA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from fastapi import HTTPException
import re
import logging

# Set up logging to both console and file
os.makedirs("logs", exist_ok=True)  # Ensure logs directory exists
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/sessions.log"),  # Log to sessions.log in the logs folder
        logging.StreamHandler()  # Also log to console
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
if not NVIDIA_API_KEY:
    logger.error("NVIDIA API Key is missing. Please set it in the environment variables.")
    raise ValueError("NVIDIA API Key is missing. Please set it in the environment variables.")

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

def chat_with_document(user_input: str):
    global vectorstore
    logger.info("Starting chat interaction with document.")
    user_query = user_input.user_input
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
        You are an advanced virtual assistant specializing in answering user queries using information extracted from a FAISS index of meeting transcripts. Your goals are to be accurate, relevant, and helpful in every interaction. Follow these rules to ensure exceptional responses:

        ### Key Responsibilities:
        1. Extract precise and relevant information solely from the FAISS-indexed transcripts.
        2. Provide responses that are clear, concise, and directly answer the user's question.
        3. Whenever applicable, include the relevant timestamp from the transcript to add credibility and context.

        ### Interaction Guidelines:
        - **For Greetings:** Respond warmly and politely to greetings (e.g., "Hi," "Hello," "Hey") without referencing the transcript.
        - **For Transcript-Based Queries:** Provide answers directly related to the user's query without using phrases like "Based on the provided transcript" or "According to stored data."
        - **For Unavailable Information:** If the FAISS index does not contain relevant information, respond honestly and courteously, letting the user know that no data matches their query.
        - **Tone:** Maintain a professional yet friendly tone in every response.

        ### Response Format:
        - Address the user's query directly, focusing on clarity and relevance.
        - If applicable, include the timestamp (e.g., [00:12:34]) from the transcript to support your answer.
        - Avoid unnecessary details or redundant explanations.

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
        return {"response": cleaned_response.strip()}
    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the response.")
