import ollama
import json
import torch
import gc
import logging

MODEL_NAME = "qwen2.5:14b-instruct"

CHUNK_SUMMARY_PROMPT = """
Provide a summary strictly in one paragraph of the following meeting transcript, without bullet points:

\"\"\"{text}\"\"\"
"""

MERGE_SUMMARIES_PROMPT = """
Merge the summaries of the below meetings into a single summarized paragraph.
Do not include bullet points or lists.

{meetings}
"""

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/sessions.log"),  # Log to sessions.log in the logs folder
        logging.StreamHandler()  # Also log to console
    ]
)
logger = logging.getLogger(__name__)

def clear_memory():
    """Clear GPU and system RAM."""
    logger.info("Clearing memory...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
    
    gc.collect()
    logger.info("Memory cleared.")

def process_transcript(input_json):
    logger.info(f"Processing transcript from {input_json}...")
    try:
        with open(f"{input_json}", 'r') as file:
            data = json.load(file)
        
        merged_transcription = []
        previous_entry = None

        for entry in data["transcription"]:
            entry.pop("timestamp", None)
            if previous_entry and previous_entry["speaker"] ==  entry["speaker"]:
                previous_entry["text"] += " " + entry["text"]
            else:
                if previous_entry:
                    merged_transcription.append(previous_entry)
                previous_entry = entry

        if previous_entry:
            merged_transcription.append(previous_entry)

        data["transcription"] = merged_transcription

        with open('results/output.json', 'w') as file:
            json.dump(data, file, indent=4)
        logger.info("Transcript processed and saved to results/output.json.")

    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}")

def chunk_transcript(transcript='results/output.json', chunk_size=20000, overlap=3000):
    logger.info(f"Chunking transcript from {transcript}...")
    try:
        with open(f"{transcript}", 'r') as file:
            transcript = str(json.load(file))

        chunks = []
        start = 0
        n = len(transcript)

        while start < n:
            end = min(start + chunk_size, n)
            chunks.append(transcript[start:end])
            if end == n:
                break
            start += chunk_size - overlap
        
        logger.info(f"Transcript chunked into {len(chunks)} parts.")
        return chunks

    except Exception as e:
        logger.error(f"Error chunking transcript: {str(e)}")
        return []

def summarize_chunk(text_chunk):
    logger.info("Summarizing chunk of text...")
    try:
        prompt = CHUNK_SUMMARY_PROMPT.format(text=text_chunk)
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}]
        )
        logger.info("Chunk summary generated.")
        return response['message']['content']
    except Exception as e:
        logger.error(f"Error summarizing chunk: {str(e)}")
        return ""

def summarize_transcript():
    logger.info("Summarizing full transcript...")
    chunks = chunk_transcript()
    summaries = []
    for chunk in chunks:
        summary = summarize_chunk(chunk)
        if summary:
            summaries.append(summary)
    logger.info(f"Generated {len(summaries)} summaries from transcript.")
    return summaries

def merge_summaries(summaries):
    logger.info("Merging summaries...")
    try:
        meetings_text = ""
        for i, summary in enumerate(summaries, start=1):
            meetings_text += f"Meeting {i}:\n\n{summary}\n\n"
        
        prompt = MERGE_SUMMARIES_PROMPT.format(meetings=meetings_text)
        merged_response = ollama.chat(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}]
        )
        merged_summary = merged_response['message']['content']

        with open("results/OverallSummary.md", "w", encoding="utf-8") as md_file:
            md_file.write(f"# Overall Meeting Summary\n\n{merged_summary}")
        
        logger.info("Merged summary saved to results/OverallSummary.md.")
        return "Overall Summary Saved"
    except Exception as e:
        logger.error(f"Error merging summaries: {str(e)}")

    clear_memory()