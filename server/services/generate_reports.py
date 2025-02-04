import sqlite3
from http.client import HTTPException
import os
import textwrap
from openai import OpenAI
from dotenv import load_dotenv
import re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os.path
# from db.session import get_db
load_dotenv()
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

LLM_MODEL = "meta/llama-3.1-70b-instruct"
SUMMARIZER_MODEL = "deepseek-ai/deepseek-r1"

def extract_post_think_content(text: str) -> str:
    """Extract content after </think> tag."""
    match = re.search(r'</think>\s*(.*?)$', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text

def engage_llm(prompt):
    try:
        messages = [
            {"role": "system", "content": "You are an AI assistant generating a periodic incident report."},
            {"role": "user", "content": prompt}
        ]
        response = llm_client.chat.completions.create(
            model=SUMMARIZER_MODEL,
            messages=messages,
            temperature=0.6,
            top_p=0.7,
            max_tokens=4096,
            stream=False
        )
        summary = response.choices[0].message.content.strip()
        processed_summary = extract_post_think_content(summary)
        return processed_summary
    except Exception as e:
        # logger.error(f"Error generating summary: {e}")
        print("error")
        # raise HTTPException(status_code=500, detail="Error generating summary.")

embedding_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")
llm_client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")


def create_reports(interval):
    # Connect to the database
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, "../alerts.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    query = f"""
    SELECT type, severity, location, status
    FROM alerts
    WHERE timestamp >= DATE('now', '-{interval} days')
    ORDER BY timestamp DESC;
    """

    cursor.execute(query)
    incidents = cursor.fetchall()  # Fetch all rows

    # Close the database connection
    conn.close()
    prompt = generate_report_from_data(incidents)
    processed_summary = engage_llm(prompt)
    save_report_to_pdf(processed_summary)

def generate_report_from_data(incidents):

    # Format incidents into a readable string
    incident_text = "\n".join(
        f"Date: Type: {row[0]}, Severity: {row[1]}, Location: {row[2]}, Status: {row[3]}"
        for row in incidents
    )

    # Create the prompt for Gen AI
    prompt = f"""
    You are an AI assistant generating a periodic (defined in number of days) incident report. Be straight forward and maintain a structure that can be placed into a pdf file. Do not talk to me. Only give me the text that would be put in the PDF.
    Analyze the following incident data and summarize key insights:

    {incident_text}

    Generate a structured report with:
    - Total incidents
    - Most common incident type
    - Severity distribution
    - Locations with the highest incidents
    - Open vs closed case summary
    - Key observations & recommendations
    """
    return prompt

def save_report_to_pdf(report_text, filename="server/report/incident_report.pdf"):
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
    max_line_length = 80
    wrapped_lines = []
    for line in report_text.split("\n"):
        wrapped_lines.extend(textwrap.wrap(line, width=max_line_length))

    for line in wrapped_lines:
        words = re.split(r"(\*\*.*?\*\*)", line)  
        x_position = margin_x + 10

        for word in words:
            if word.startswith("**") and word.endswith("**"):
                c.setFont("Helvetica-Bold", 12)  # Apply bold font
                word = word[2:-2]  # Remove **
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

    c.save()
    print(f"Report saved as {filename}")

create_reports(7)
