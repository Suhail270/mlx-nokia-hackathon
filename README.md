# mlx-nokia-hackathon

# AI-Powered Surveillance System

## Overview
Our AI-Powered Surveillance System is an advanced security dashboard designed to automatically detect and report instances of fire, smoke, and assault using state-of-the-art AI models. The system leverages modern deep-learning techniques and integrates various components such as React for the frontend, FastAPI for the backend, and multiple AI models, including YOLO (You Only Look Once), Video Masked AutoEncoders (VideoMAEs), and LLMs like LLaMA, DeepSeek and Cosmos Nemotron to analyze incidents and generate reports.

*Our system is built using <b>entirely open source</b> models and software. Due to the lack computational power, we have hosted our models on NVIDIA's online architecure.*

*In order to reduce the overall computational overload caused by models due to constant monitoring, we have included a special motion based attention, to ensure that the frames processing is only done when required. This leads to an overall decrease in the number of frames undergoing model classification, ultimately reducing computations per incident.*

*Developement of this project began right after our group's registration for the hackathon and in no part contains legacy code.*


## Features
- **Real-time Surveillance:** Continuously monitors video feeds for potential security threats.
- **Object Detection & Classification:** Uses YOLO and VideoMAEs to detect fire, smoke, and violent incidents.
- **Incident Reporting:** Automatically generates structured reports based on detected events.
- **LLM-Powered Summarization:** Utilizes LLaMA, DeepSeek and Cosmos Nemotron for generating human-readable summaries of incidents.
- **Interactive Dashboard:** Built with React for a user-friendly experience.
- **FastAPI Backend:** Ensures efficient communication between the frontend and AI models.
- **Arabic Translation:** Allows text translation for the entire system for wider accessibility.

## Tech Stack
### Frontend
- **React.js**: Used for building the interactive user interface.
- **Tailwind CSS**: For styling and responsiveness.

### Backend
- **FastAPI**: Provides a high-performance REST API with an n-tier architecture based on microservices.

### AI Models
- **YOLO (You Only Look Once):** Detects fire and smoke in video streams.
- **Video Masked AutoEncoders (VideoMAEs):** Used for assault detection in videos.
- **DeepSeek:** Generates natural language reports from detected incidents using video metadata and frames inference.
- **Cosmos Nemotron 34B:** A multimodal LLM to analyse video feeds.
- **LLama:** Generates embeddings and re-ranks them.
- **Faiss:** Used to store vector embeddings.
- **MicroSoft Deep Translator:** Used for translation of system text.


### Database
- **SQLite:** Used for rapid prototyping.


## System Architecture
1. **Video Feed Ingestion:**
   - Streams from CCTV or uploaded videos are processed in real-time.
   - Frames are extracted for object detection.
   - Motion sensing is used to avoid unnecessary compute of normal frames to reduce system overload.

2. **AI Model Processing:**
   - YOLO and VideoMAEs (Masked AutoEncoders) analyze the video streams for potential threats.
   - If a threat is detected, report is generated with the extracted frames.

3. **Report Generation:**
   - DeepSeek to process detected incidents to generate structured reports.
   - Faiss, which stores vector embeddings along with Llama which helps genrate and rank them, ensures that the model's overall computation is reduced leading to more efficeint storage and retrival of incident reports.
   - Reports include event time, location, and a summary.
   - Metadata from the video is used to further add information to the reports.
   - Further geographic location is extracted to generate insights about nearby establishments, to assist in decision making and enhanced response quality. 

4. **Dashboard Display & Alerts:**
   - The React frontend displays live alerts and past incidents.
   - Users can review reports and take necessary actions.

5. **ChatBot:** 
    - Retrival based model that assits surveillance officials to generate quick reports of incidents. 

## Installation & Setup
### Prerequisites
- Python 3.8+
- Node.js 16+

### Environment Variables
- Create .env files in client and server directories
- For NVIDIA API Key
   - Visit 'https://build.nvidia.com/explore/discover' 
   - Click on DeepSeek R1 model.
   - Create an account.
   - Click on _Build with NIM_.
   - Chose self hosting.
   - Click on generate API key.
   - Copy API KEY and place it in .env file under server directory.
- For RoboFlow
   - Visit 'https://roboflow.com/'.
   - Sign up
   - Under settings click on API keys.
   - Copy API keys and place it in the env file under server directory.

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/Suhail270/mlx-nokia-hackathon.git
cd mlx-nokia-hackathon/server


# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app 
```

### Frontend Setup
```bash
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage
1. Open the React dashboard.
2. Monitor real-time alerts and view generated reports.
3. Take necessary actions based on the detected incidents.

## Future Enhancements

- **Edge AI Deployment**: Optimize models for deployment on edge devices.
- **Expanded Threat Detection**: Include additional incidents such as kidnapping, burglary, child predation and sexual assault.
- **Mobile App Integration**: Provide real-time alerts via mobile applications.
- **Overall system optimization**: Improving real-time detection & accuracy​ with smart network solutions and lossless compression modules.
- **Exapanding source feeds**: UAVs (drones) will be used for real-time fire hazard detection and immediate relief dispatch until human officers arrive on scene.
- **Response Optimization**: Cluster identification will be used to strategically position fire brigades, police fand ambulances for  efficient patrolling and rapid response in high-risk areas.
## Contributors
- **Suhail Ahmed (Team Lead)**
- **Archisa Kar** 
- **Asmitha Krishnakumar**
- **Mohamed Tahir**
- **Mujtaba Mohimtulay**



