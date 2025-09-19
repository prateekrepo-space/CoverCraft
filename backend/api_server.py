import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import PyPDF2

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/generate-letter": {"origins": ["https://cover-craft18.vercel.app", "http://localhost:3000", "http://localhost:5173"]}})

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    exit()

@app.route('/generate-letter', methods=['POST'])
def generate_letter_route():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided."}), 400
    
    resume_file = request.files['resume']
    job_description = request.form.get('jobDescription')
    tone = request.form.get('tone', 'Professional')
    user_skills = request.form.get('userSkills', '')
    company_info = request.form.get('companyInfo', '')

    if not job_description:
        return jsonify({"error": "No job description provided."}), 400

    try:
        resume_text = ""
        pdf_reader = PyPDF2.PdfReader(resume_file.stream)
        for page in pdf_reader.pages:
            resume_text += page.extract_text()
        
        if not resume_text.strip():
            return jsonify({"error": "Could not extract text from PDF."}), 400

        prompt = f"""
        **Persona:** You are the job applicant. Your task is to generate the content for a cover letter in a structured JSON format.

        **Core Task:** Based on my resume and the job description, generate content for all sections of a professional cover letter. The output MUST be a valid JSON object.

        **JSON Structure Requirements:**
        - "senderName": (string) My name. Extract it from the resume.
        - "senderAddress": (string) My full address. Extract it from the resume.
        - "senderContact": (string) My phone and email. Extract it from the resume.
        - "date": (string) The current date in the format "Month Day, Year".
        - "recipientName": (string) The Hiring Manager's name. If not in the job description, use "Hiring Manager".
        - "recipientTitle": (string) The Hiring Manager's title. If not known, use "Hiring Team".
        - "companyName": (string) The company name. Extract it from the job description if possible.
        - "companyAddress": (string) The company's address. If not known, create a plausible placeholder like "123 Business Rd, Business City, 12345".
        - "salutation": (string) e.g., "Dear Mr./Ms. [Last Name]," or "Dear Hiring Team,".
        - "body": (string) The main content of the letter. It must have at least 3 paragraphs and be written in the first person. Each paragraph should be separated by a '\\n\\n'.
        - "closing": (string) e.g., "Sincerely,".
        - "signature": (string) My name again, for the signature line.

        **Writing Style:** The 'body' content must be professional, confident, and connect my experiences from the resume to the job requirements. Use the specified tone.

        **Provided Information:**
        - **Tone:** {tone}
        - **My Resume:** --- {resume_text} ---
        - **Target Job Description:** --- {job_description} ---
        - **Key Skills to Emphasize:** --- {user_skills if user_skills else "None provided."} ---
        - **Company Info:** --- {company_info if company_info else "None provided."} ---

        **Final Output:** Respond ONLY with the valid JSON object. Do not include any other text or markdown formatting.
        """

        generation_config = genai.GenerationConfig(
            temperature=0.7,
            response_mime_type="application/json"
        )

        response = model.generate_content(prompt, generation_config=generation_config)
        
        letter_data = json.loads(response.text)
        
        return jsonify(letter_data)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "Failed to generate cover letter."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)