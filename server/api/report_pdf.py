from fastapi import APIRouter, Depends, HTTPException, responses, status,FastAPI
from fastapi.encoders import jsonable_encoder
import json

import sqlite3
import os
import textwrap
from fastapi.responses import FileResponse
from openai import OpenAI
from dotenv import load_dotenv
import re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os.path
from db.session import get_db
from models.alert import Alert
from datetime import datetime,timedelta
router = APIRouter()

load_dotenv()
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

LLM_MODEL = "meta/llama-3.1-70b-instruct"
SUMMARIZER_MODEL = "meta/llama-3.1-8b-instruct"

def extract_post_think_content(text: str) -> str:
    """Extract content after </think> tag."""
    match = re.search(r'</think>\s*(.*?)$', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text

def engage_llm(prompts):
    sections=[]
    try:
        for prompt in prompts:
            messages = [
                {"role": "system", "content": "You are an AI assistant generating a periodic incident report."},
                {"role": "user", "content": prompt}
            ]
            response = llm_client.chat.completions.create(
                model=SUMMARIZER_MODEL,
                messages=messages,
                temperature=0.2,
                top_p=0.7,
                max_tokens=1024,
                stream=True

            )
            # print("here")
            # print("response is ",response.choices[0].message.content)
            # summary = response.choices[0].message.content.strip()
            # su = "fdas"
            summary=""
            for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    summary=summary+chunk.choices[0].delta.content
                    # print("break here!!")
                    print(chunk.choices[0].delta.content, end="")
            
            processed_summary = extract_post_think_content(summary)
            sections.append(processed_summary)
        return sections
    except Exception as e:
        # logger.error(f"Error generating summary: {e}")
        print("error")
        raise HTTPException(status_code=500, detail="Error generating summary.")

embedding_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
llm_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")

@router.get("/report-pdf/{interval}")
def create_reports(interval ,db=Depends(get_db)):
    # Connect to the database
    # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    # db_path = os.path.join(BASE_DIR, "../alerts.db")
    # conn = sqlite3.connect(db_path)
    # cursor = conn.cursor()

    # query = f"""
    # SELECT type, severity, location, status
    # FROM alerts
    # WHERE timestamp >= DATE('now', '-{interval} days')
    # ORDER BY timestamp DESC;
    # """

    # cursor.execute(query)
    # incidents = cursor.fetchall()  # Fetch all rows

    # # Close the database connection
    # conn.close()

    
    alert = db.query(Alert).filter(Alert.timestamp >= (datetime.now() - timedelta(days=int(interval)))).all()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    data = jsonable_encoder(alert)
    # print(data[0])
    # Filter JSON
    keys_to_keep = ["type", "severity","location","status"]
    incidents=[]
    for json_obj in data:
        filtered_json = {key: json_obj[key] for key in keys_to_keep if key in json_obj}
        # print("curr->",filtered_json)
        incidents.append(filtered_json)
    
    
    incident_text = "\n".join(
        f"Date: Type: {row["type"]}, Severity: {row["severity"]}, Location: {row["location"]}, Status: {row["status"]}"
        for row in incidents
    )
    prompt = generate_report_from_data(incident_text)
    processed_summary = engage_llm(prompt)
    PDF_FILE_PATH = save_report_to_pdf(processed_summary)

    return FileResponse(PDF_FILE_PATH, media_type="application/pdf", filename="incident_report.pdf")

def generate_report_from_data(incidents):

    # Create the prompt for Gen AI
    prompts=[]
    headings=["Total incidents","Most common incident type","Severity distribution","Locations with the highest incidents","Open vs closed case summary","Key observations & recommendations"]
    for heading in headings:

        # prompt = f"""
        # You are an AI assistant generating a periodic (defined in number of days) incident report. Be straight forward and maintain a structure that can be placed into a pdf file.
        # Analyze the following incident data and summarize:

        # {incidents}

        # Generate a report summary with the {heading}
        # Add no other information.
        
        # """

        prompt = f"""
        You are an AI assistant generating an incident report. Analyse the following incident data and generate only the {heading} section of the report:

        {incidents}

        """
        prompts.append(prompt)
   
    return prompts

def save_report_to_pdf(report_texts, filename="./reports/pdf/incident_report.pdf"):
    """Generate a PDF file with a bordered report."""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    

    c.setFont("Helvetica", 12)

    margin_x = 40
    margin_y = 50
    text_width = width - 2 * margin_x
    text_height = height - 2 * margin_y

    c.setStrokeColor(colors.black)
    c.setLineWidth(2)  
    c.rect(margin_x, margin_y, text_width, text_height)  

    # Write text inside the border
    y_position = height - margin_y - 20  # Start position for text
    line_height = 14  # Spacing between lines
    max_line_length = 90
    title=0
    
    for report_text in report_texts:
        
        wrapped_lines = []
        for line in report_text.split("\n"):
            if line.startswith("* "):
                ls= textwrap.wrap(line, width=max_line_length)
                wrapped_lines.append(ls[0])
                for i in range(1,len(ls)):
                    wrapped_lines.append("* "+ls[i])
            else:
                wrapped_lines.extend(textwrap.wrap(line, width=max_line_length))

        for line in wrapped_lines:
            words = re.split(r"(\*\*.*?\*\*)", line)  
            x_position = margin_x + 10

            for word in words:
                if word.startswith("**") and word.endswith("**"):
                    c.setFont("Helvetica-Bold", 12)  # Apply bold font
                    word = word[2:-2]  # Remove **
                elif word.startswith("* "):
                    c.setFont("Times-Italic", 12)  # Apply bold font
                    word = word[1:]
                else:
                    c.setFont("Helvetica", 12)  # Normal font

                c.drawString(x_position, y_position, word)

                x_position += c.stringWidth(word, c._fontname, 12) + 5  # Move right

            y_position -= line_height
            if y_position < margin_y + 20:  # Create new page if needed
                c.showPage()
                c.setFont("Helvetica", 12)
                y_position = height - margin_y - 20
                c.setStrokeColor(colors.black)
                c.setLineWidth(2)
                c.rect(margin_x, margin_y, text_width, text_height)
        if title==1:
            image_path = os.path.abspath("api/graphs/type.jpg")
            c.drawImage(image_path, 100, y_position -150, width=200, height=150)  
            image_path = os.path.abspath("api/graphs/status.jpg")
            c.drawImage(image_path, 350, y_position -150, width=200, height=150)  

            y_position -= (150+line_height)
        elif title==2:
            image_path = os.path.abspath("api/graphs/severity.jpg")
            c.drawImage(image_path, 100, y_position -150, width=200, height=150) 
            y_position -= (150+line_height)
        title+=1
        c.drawString(x_position, y_position, "")
        y_position -= 20
        if y_position < margin_y + 20:  # Create new page if needed
                c.showPage()
                c.setFont("Helvetica", 12)
                y_position = height - margin_y - 20
                c.setStrokeColor(colors.black)
                c.setLineWidth(2)
                c.rect(margin_x, margin_y, text_width, text_height)
        
    

    directory = "./reports/pdf" 
    if not os.path.exists(directory):
        os.makedirs(directory)
    c.save()
    
    print(f"Report saved as {filename}")
    return filename


