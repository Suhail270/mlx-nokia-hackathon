# Use a pipeline as a high-level helper
from transformers import pipeline

def detect_violence(violentvid):
    pipe = pipeline("video-classification", model="zeshi1990/videomae-base-finetuned-fightNoFight_dataset")
    result = pipe(violentvid)
    return result