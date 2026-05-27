# ProxiSafe ML Model Service

Machine learning backend for violation predictions, risk assessment, and anomaly detection.

## Quick Start

```bash
# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the service (default: http://localhost:5000)
python app.py

# Or with uvicorn for auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

> **Tip:** If `pip` is not found, use `python3 -m pip` instead.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/api/predict` | POST | 24-hour violation predictions |
| `/api/risk` | POST | ML risk score |
| `/api/anomalies` | POST | Anomaly detection |
| `/api/stats` | POST | Combined: predictions + risk + anomalies |
| `/api/detect-frame` | POST | **OpenCV** – Person detection + violation count (image/video frame) |
| `/api/detect-frame-image` | POST | **OpenCV** – Returns annotated image (green/red boxes) |

### Request Format

All POST endpoints accept:
```json
{
  "violations": [
    {
      "id": "VIO-001",
      "type": "Social Distancing",
      "location": "Mall Entrance",
      "timestamp": "2024-01-15T14:30:00Z",
      "peopleCount": 4,
      "distance": 3.2,
      "duration": 45,
      "confidence": 94
    }
  ]
}
```

## Frontend Integration

**Video/Camera Detection:** Upload a video or open your camera – the app sends frames to the OpenCV model and displays green boxes (compliant) and red boxes (violations) with the violation count.

When the ML service is running at `http://localhost:5000`, the ProxiSafe dashboard automatically uses ML-powered predictions for:

- **Risk Assessment** – Score, level, and recommendations
- **Predictions** – Next hour and 24-hour violation forecasts
- **Anomaly Detection** – Statistical anomaly identification

If the ML service is down, the dashboard falls back to the built-in analytics engine.

## Configuration

Copy `.env.example` to `.env` and adjust:

- `PORT` – API port (default: 5000)
- `CORS_ORIGINS` – Allowed frontend origins (comma-separated)

### Higher-accuracy person detection (YOLO)

The default **HOG** detector is fast and needs no extra packages, but **YOLOv8** is much more accurate for people in varied poses and lighting.

```bash
pip install -r requirements-yolo.txt
export DETECTOR_BACKEND=yolo
# optional: YOLO_MODEL=yolov8s.pt  (slower, often more accurate than yolov8n.pt)
python app.py
```

Tune **`MIN_DISTANCE_PIXELS`** (how close two people can be before a “violation”) and **`YOLO_CONF`** (higher = fewer false positives, more missed detections). Check **`GET /health`** for `detector.backend` and loaded model info.

## Tech Stack

- **FastAPI** – REST API
- **scikit-learn** – Time-series forecasting
- **NumPy** – Numerical computation
