from transformers import pipeline

def detect_violence(video_path):
    pipe = pipeline("video-classification", model="zeshi1990/videomae-base-finetuned-fightNoFight_dataset")
    result = pipe(video_path)
    return result
