"""
UrbanFix AI Microservice
FastAPI service that runs Gemini 2.5 Flash to detect
the category and severity of urban problems from uploaded images.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

import json
import os
import io

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="UrbanFix AI Service",
    description="Gemini-powered image analysis for urban problem detection",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Laravel is the only caller in production
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

CATEGORIES = [
    "Road Damage",
    "Trash Collection",
    "Traffic Lights",
    "Water Leak",
    "Lighting Issue",
    "Sidewalk Repair",
    "Parks & Recreation"
]

# ──────────────────────────────────────────────
# Core inference logic
# ──────────────────────────────────────────────

async def run_gemini_model(image_bytes: bytes, mime_type: str) -> dict:
    """
    Call Gemini 2.5 Flash and return a structured JSON response.
    Returns a dict with the prediction results.
    """
    prompt = f"""
    You are an AI assistant for the UrbanFix smart city application.
    Analyze the provided image to detect any urban problems that need reporting.
    
    IMPORTANT SEVERITY GUIDELINES:
    - "low": Minor issues, mostly cosmetic or small inconveniences. No immediate danger (e.g., very small cracks, minor litter, faded paint).
    - "medium": Noticeable issues that require attention soon but aren't immediately dangerous (e.g., moderate potholes, broken sidewalk sections, large garbage piles).
    - "high": Urgent issues that pose an immediate safety hazard, risk of injury, or major disruption (e.g., massive sinkholes, completely blocked roads, exposed live wires, major water main bursts).
    DO NOT default to "high" unless there is clear evidence of an immediate, severe hazard in the image.
    
    Respond strictly in JSON format with the exact following structure:
    {{
        "detected": boolean (true if an urban issue is clearly detected, false otherwise),
        "category": string (MUST be exactly one of {CATEGORIES}, or null if not detected),
        "severity": string (MUST be one of "low", "medium", "high", or null if not detected),
        "confidence": float (a numerical confidence score of your detection from 0.0 to 1.0),
        "class_detected": string (a brief 1-5 word description of the observed issue, e.g., "large pothole" or "overflowing garbage bin", or null if not detected)
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        # In current versions, generate_content_async is supported using asyncio under the hood
        response = await model.generate_content_async([prompt, image_part])
        
        # Parse the JSON response
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            print(f"Failed to parse Gemini output as JSON. Raw output: {response.text}")
            return {
                "detected": False,
                "category": None,
                "severity": None,
                "confidence": 0.0,
                "class_detected": None,
                "success": False,
                "error": "Failed to parse JSON response."
            }
            
        data["success"] = True
        return data

    except Exception as e:
        print(f"[Gemini 2.5 Flash] ERROR: {e}")
        return {
            "detected": False,
            "category": None,
            "severity": None,
            "confidence": 0.0,
            "class_detected": None,
            "success": False,
            "error": str(e),
        }

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check — used by Laravel to verify the service is up."""
    return {
        "status": "ok",
        "model_loaded": "gemini-2.5-flash",
        "gemini_configured": bool(GEMINI_API_KEY),
    }


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    """
    Analyze an uploaded image using Gemini 2.5 Flash.

    Returns:
        detected (bool): Whether any problem was found.
        category (str|null): The best UrbanFix category.
        severity (str|null): "low" | "medium" | "high".
        confidence (float|null): Confidence percentage (0–100).
        model_used (str|null): Which model made the top detection.
        class_detected (str|null): Brief description of the issue.
        all_results (list): Raw results for debugging.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the AI service.",
        )

    # Read the image
    image_bytes = await image.read()
    mime_type = image.content_type or "image/jpeg"

    # Log action
    print(f"\n=== ANALYSIS REQUEST [{mime_type}] ===")

    # Run inference
    result = await run_gemini_model(image_bytes, mime_type)
    
    confidence_raw = result.get("confidence", 0.0)
    detected = result.get("detected", False)
    success = result.get("success", False)

    print(f"  Gemini Response: {result}")
    print("========================\n")

    # If the LLM says nothing is detected, or confidence is too low/API failed
    if not success or not detected or confidence_raw < 0.20:
        return {
            "detected": False,
            "category": None,
            "severity": None,
            "confidence": None,
            "model_used": "gemini-2.5-flash",
            "class_detected": None,
            "all_results": [result],
            "message": "No urban problem detected clearly. Please fill the fields manually.",
        }

    # Format the confidence as a percentage
    confidence_perc = round(confidence_raw * 100, 1)

    return {
        "detected": True,
        "category": result.get("category"),
        "severity": result.get("severity"),
        "confidence": confidence_perc,
        "model_used": "gemini-2.5-flash",
        "class_detected": result.get("class_detected"),
        "all_results": [result],
        "message": f"Detected {result.get('category')} via Gemini 2.5 Flash with {confidence_perc}% confidence.",
    }


@app.post("/debug")
async def debug_analyze(image: UploadFile = File(...)):
    """
    Debug endpoint — returns the full raw predictions from Gemini without any thresholding.
    Use this to diagnose why a model isn't detecting something.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set.")

    image_bytes = await image.read()
    mime_type = image.content_type or "image/jpeg"

    result = await run_gemini_model(image_bytes, mime_type)

    # Return everything with no filtering
    return {
        "model_used": "gemini-2.5-flash",
        "raw_results": [result],
        "tip": "This endpoint bypasses confidence thresholding.",
    }
