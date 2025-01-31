import os
import cv2
import numpy as np
import json
import random

metadata_cache = {}

def extract_key_frames(video_path, output_root, min_frame_gap=15, max_batches=20, motion_sensitivity=0.8):
    class_name = os.path.basename(os.path.dirname(video_path))
    video_name = os.path.basename(video_path).split(".")[0]

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return

    prev_gray = None
    frame_count = 0
    motion_data = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(prev_gray, gray_frame, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            motion_magnitude = np.linalg.norm(flow)

            motion_data.append((frame, frame_count, motion_magnitude))

        prev_gray = gray_frame
        frame_count += 1

    cap.release()

    if not motion_data:
        print(f"No motion data for {video_name}. Skipping...")
        return

    # Apply motion sensitivity threshold
    motion_values = [m[2] for m in motion_data]
    motion_threshold = np.percentile(motion_values, (1 - motion_sensitivity) * 100)  # Keep top X% motion frames
    filtered_motion_data = [m for m in motion_data if m[2] >= motion_threshold]

    # Sort by motion magnitude (descending)
    filtered_motion_data.sort(key=lambda x: x[2], reverse=True)

    selected_frames = []
    last_selected_frame = -min_frame_gap  

    for frame, frame_num, motion in filtered_motion_data:
        if frame_num - last_selected_frame >= min_frame_gap:
            selected_frames.append((frame, frame_num, motion))
            last_selected_frame = frame_num

        if len(selected_frames) >= max_batches:
            break

    save_selected_frames(selected_frames, output_root, class_name, video_name)

    print(f"Extracted {len(selected_frames)} key frames from {class_name}/{video_name}")

def save_selected_frames(selected_frames, output_root, class_name, video_name):
    class_folder = os.path.join(output_root, class_name)
    video_folder = os.path.join(class_folder, video_name)
    os.makedirs(video_folder, exist_ok=True)

    for i, (frame, frame_count, _) in enumerate(selected_frames):
        frame_filename = os.path.join(video_folder, f"frame_{frame_count:05d}.jpg")
        cv2.imwrite(frame_filename, frame)

        metadata = video_metadata(video_name, frame_count)
        metadata_filename = frame_filename.replace(".jpg", ".json")
        with open(metadata_filename, "w") as f:
            json.dump(metadata, f, indent=4)

def video_metadata(video_name, frame_count):
    if video_name in metadata_cache:
        metadata = metadata_cache[video_name]
    else:
        camera_ids = ["CAM001", "CAM002", "CAM003", "CAM004"]
        locations = ["Building A - Lobby", "Building B - Parking", "Building C - Entrance", "Building D - Hallway"]

        metadata = {
            "camera_id": random.choice(camera_ids),
            "location": random.choice(locations)
        }
        metadata_cache[video_name] = metadata

    metadata["frame_number"] = frame_count
    return metadata

# Run the function
video_root = "/Users/asmithakrishnakumar/Desktop/mlx-nokia-hackathon/trial"
output_root = "/Users/asmithakrishnakumar/Desktop/mlx-nokia-hackathon/output3"

for class_folder in os.listdir(video_root):
    class_path = os.path.join(video_root, class_folder)
    if os.path.isdir(class_path): 
        for video_file in os.listdir(class_path):
            video_path = os.path.join(class_path, video_file)
            extract_key_frames(video_path, output_root, min_frame_gap=15, max_batches=20, motion_sensitivity=0.8)
