# UrbanFix AI Service

A lightweight Python FastAPI microservice that analyzes urban problem images using 4 Roboflow models in parallel.

## Models Used

| Model | Version | Detects | Maps To |
|---|---|---|---|
| Pothole Detection | v12 | Potholes, road cracks | Road Damage |
| Garbage Detection | v5 | Litter, trash piles | Trash Collection |
| Traffic Sign Detection | v3 | Damaged/missing signs | Traffic Lights |
| Water Leakage Detection | v4 | Pipe leaks, water damage | Water Leak |

## Setup

### 1. Create the `.env` file
```bash
cp .env.example .env
```
Edit `.env` and paste your Roboflow API key:
```
ROBOFLOW_API_KEY=your_actual_key_here
```
Get your key at: https://app.roboflow.com → Settings → Roboflow API

### 2. Create a virtual environment
```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the service
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at: http://localhost:8001

## API Endpoints

### `GET /health`
Returns service status and loaded models.

### `POST /analyze`
Accepts a multipart image upload and returns AI detection results.

**Request:**
```
Content-Type: multipart/form-data
image: <file>
```

**Response (detected):**
```json
{
  "detected": true,
  "category": "Road Damage",
  "severity": "high",
  "confidence": 91.3,
  "model_used": "Pothole Detection",
  "class_detected": "pothole",
  "all_results": [...]
}
```

**Response (nothing detected):**
```json
{
  "detected": false,
  "category": null,
  "severity": null,
  "confidence": null,
  "model_used": null,
  "class_detected": null,
  "all_results": [...]
}
```

## Interactive API Docs
Visit http://localhost:8001/docs for Swagger UI.
