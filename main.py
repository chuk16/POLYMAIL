from flask import Flask, render_template, request, jsonify
import os
import openai
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)

# Get OpenAI API key from environment variables
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Gmail configuration
GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS")  # your Gmail, e.g., polymail.website@gmail.com
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")  # Gmail App Password

# Supported professional/business languages
SUPPORTED_LANGUAGES = [
    "Arabic", "Bengali", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)",
    "Croatian", "Czech", "Danish", "Dutch", "English (UK)", "English (US)", "Estonian",
    "Finnish", "French", "German", "Greek", "Hebrew", "Hindi", "Hungarian", "Indonesian",
    "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Malay", "Norwegian",
    "Polish", "Portuguese", "Romanian", "Russian", "Serbian", "Slovak", "Slovene",
    "Spanish", "Swedish", "Swahili", "Thai", "Turkish", "Ukrainian", "Urdu"
]

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    email_text = data.get("email", "").strip()
    target_language = data.get("language", "").strip()
    email_style = data.get("style", "").strip().lower()

    if not email_text or not target_language:
        return jsonify({"error": "Missing email text or target language"}), 400

    if target_language not in SUPPORTED_LANGUAGES:
        return jsonify({
            "error": f"Unsupported language. Supported languages include: {', '.join(SUPPORTED_LANGUAGES)}"
        }), 400

    tone_instruction = (
        f"- Analyze the tone of the original email, but adjust it to align with the user's desired tone: '{email_style}'. "
        "Blend both tones naturally for the best result."
    ) if email_style else "- Detect the tone of the original email and maintain it naturally in the translation."

    prompt = f"""
You are a professional email translator and tone editor. Translate the email below into {target_language}.

Instructions:
- Translate accurately and preserve meaning.
{tone_instruction}
- Make the translation sound natural and fluent to a native {target_language} speaker.
- Preserve proper nouns (company names, product names, people).
- Use idiomatic expressions where appropriate.
- Keep formatting suitable for professional emails (greeting, structure, sign-off).
- Output only the translated email — no commentary.

Original Email:
{email_text}

Translated Email ({target_language}):
"""

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert translator specializing in professional emails and tone adaptation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.25,
            max_tokens=1000,
        )

        translated_email = response.choices[0].message.content.strip()
        return jsonify({"translation": translated_email})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


# NEW: AJAX endpoint for contact form
@app.route("/send_contact", methods=["POST"])
def send_contact():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "All fields are required."}), 400

    body = f"Name: {name}\nEmail: {email}\nMessage:\n{message}"
    msg = MIMEText(body)
    msg['Subject'] = 'New Contact Form Message'
    msg['From'] = GMAIL_ADDRESS
    msg['To'] = GMAIL_ADDRESS

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return jsonify({"success": "Message sent successfully!"})

    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=81)
