"""
ProxiSafe ML Model Service - REST API for predictions and risk assessment.
Run with: uvicorn app:app --reload --host 0.0.0.0 --port 5000
"""

import os
from datetime import datetime

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from models.predictor import ViolationPredictor
from models.video_detector import VideoDetector

# Configuration
PORT = int(os.getenv("PORT", "5000"))
HOST = os.getenv("HOST", "0.0.0.0")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080").split(",")

app = FastAPI(
    title="ProxiSafe ML API",
    description="Machine learning predictions and risk assessment for social distancing monitoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = ViolationPredictor()
video_detector = VideoDetector()


# Request/Response Models
class ViolationInput(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    timestamp: Optional[str] = None
    peopleCount: Optional[int] = None
    distance: Optional[float] = None
    duration: Optional[int] = None
    confidence: Optional[float] = None


class PredictRequest(BaseModel):
    violations: List[ViolationInput]


@app.get("/")
def root():
    """Health check and API info."""
    return {
        "service": "ProxiSafe ML API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "POST /api/predict",
            "risk": "POST /api/risk",
            "anomalies": "POST /api/anomalies",
            "stats": "POST /api/stats",
            "detect_frame": "POST /api/detect-frame (OpenCV)",
        },
    }


@app.get("/health")
def health():
    """Health check for load balancers."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "detector": video_detector.info(),
    }


@app.post("/api/predict")
def predict_violations(request: PredictRequest):
    """Predict violation counts for the next 24 hours using ML."""
    violations = [v.model_dump() for v in request.violations]
    # Ensure timestamp format
    for v in violations:
        if v.get("timestamp") and hasattr(v["timestamp"], "isoformat"):
            v["timestamp"] = v["timestamp"].isoformat()
    predictor.fit(violations)
    predictions = predictor.predict_next_hours(violations, hours_ahead=24)
    return {
        "predictions": predictions,
        "model": "linear_regression",
        "trained_on": len(violations),
    }


@app.post("/api/risk")
def calculate_risk(request: PredictRequest):
    """Calculate ML-enhanced risk score."""
    violations = [v.model_dump() for v in request.violations]
    risk = predictor.calculate_ml_risk_score(violations, recent_hours=1)
    return risk


@app.post("/api/anomalies")
def detect_anomalies(request: PredictRequest):
    """Detect anomalous violation patterns."""
    violations = [v.model_dump() for v in request.violations]
    anomalies = predictor.detect_anomalies(violations, threshold=2.0)
    return {
        "anomalies": anomalies,
        "count": len(anomalies),
    }


@app.post("/api/stats")
def get_ml_stats(request: PredictRequest):
    """Combined endpoint: predictions + risk + anomalies for dashboard."""
    violations = [v.model_dump() for v in request.violations]
    predictor.fit(violations)
    predictions = predictor.predict_next_hours(violations, hours_ahead=24)
    risk = predictor.calculate_ml_risk_score(violations)
    anomalies = predictor.detect_anomalies(violations)
    return {
        "predictions": predictions,
        "risk": risk,
        "anomalies": anomalies,
        "summary": {
            "total_violations": len(violations),
            "next_hour_prediction": predictions[0]["predicted_count"] if predictions else 0,
            "risk_level": risk["level"],
        },
    }


@app.post("/api/detect-frame")
async def detect_frame(file: UploadFile = File(...)):
    """
    OpenCV person detection - upload image/video frame.
    Returns detections with bboxes and violation count.
    """
    content = await file.read()
    result = video_detector.process_frame(content)
    return result


@app.post("/api/detect-frame-image")
async def detect_frame_image(file: UploadFile = File(...)):
    """
    OpenCV detection - returns annotated image (green=OK, red=violation).
    """
    content = await file.read()
    annotated = video_detector.process_frame_with_overlay(content)
    return Response(content=annotated, media_type="image/jpeg")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
