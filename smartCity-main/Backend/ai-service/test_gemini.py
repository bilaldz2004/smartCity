import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

# Try using a dummy image dict
try:
    with open("test.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\xff\xd9")
        
    with open("test.jpg", "rb") as f:
        data = f.read()
        
    image_part = {
        "mime_type": "image/jpeg",
        "data": data
    }
    response = model.generate_content(["hello", image_part])
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
