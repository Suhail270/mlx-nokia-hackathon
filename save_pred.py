import os
import cv2
import supervision as sv
from inference import InferencePipeline
from inference.core.interfaces.camera.entities import VideoFrame

# Input & Output directories
input_folder = "./mlx-nokia-hackathon/videos"
output_folder = "./mlx-nokia-hackathon/annotated_videos"

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Create annotation tools
label_annotator = sv.LabelAnnotator()
box_annotator = sv.BoxAnnotator()

def process_video(video_path, output_path):
    global video_writer
    video_writer = None  # Reset video writer for each video

    def my_custom_sink(predictions: dict, video_frame: VideoFrame):
        global video_writer

        # Extract labels for predictions
        labels = [p["class"] for p in predictions["predictions"]]
        detections = sv.Detections.from_inference(predictions)

        # Annotate frame
        image = label_annotator.annotate(video_frame.image.copy(), detections=detections, labels=labels)
        image = box_annotator.annotate(image, detections=detections)

        # Initialize video writer if not set
        if video_writer is None:
            height, width, _ = image.shape
            # print(f"Processing: {video_path} → {output_path}")
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            video_writer = cv2.VideoWriter(output_path, fourcc, 30, (width, height))

            if not video_writer.isOpened():
                print("❌ VideoWriter failed to open! Check output path and permissions.")

        # Write frame to video
        if video_writer:
            video_writer.write(image)

        # Display frame (optional)
        cv2.imshow("Predictions", image)
        cv2.waitKey(1)

    # Start inference pipeline
    pipeline = InferencePipeline.init(
        model_id="fire-and-smoke-detection-o4uhv/2",
        video_reference=video_path,
        on_prediction=my_custom_sink,
    )

    pipeline.start()
    pipeline.join()

    # Release video writer
    if video_writer is not None:
        video_writer.release()
        # print(f"✅ Saved: {output_path}")
    else:
        print(f"No frames written for {video_path}")

    cv2.destroyAllWindows()

# Process all videos in the input folder
for filename in os.listdir(input_folder):
    if filename.endswith((".mp4", ".avi", ".mov")):  # Add more formats if needed
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, f"annotated_{filename}")
        process_video(input_path, output_path)

print("✅ Batch processing complete!")
