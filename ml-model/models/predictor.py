"""
ProxiSafe ML Predictor - Violation forecasting and risk assessment.
Uses scikit-learn for time-series forecasting and statistical analysis.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import List, Dict, Any


class ViolationPredictor:
    """ML-powered violation and risk prediction."""

    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _prepare_time_series(self, violations: List[Dict]) -> tuple:
        """Convert violations into hourly time series for forecasting."""
        if not violations:
            return np.array([]).reshape(-1, 1), []

        # Group violations by hour
        hourly_counts = {}
        for v in violations:
            ts = v.get("timestamp") or v.get("detectedAt") or datetime.now().isoformat()
            if isinstance(ts, (int, float)):
                dt = datetime.fromtimestamp(ts / 1000 if ts > 1e10 else ts)
            else:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00")) if isinstance(ts, str) else datetime.now()
            hour_key = dt.replace(minute=0, second=0, microsecond=0)
            hourly_counts[hour_key] = hourly_counts.get(hour_key, 0) + 1

        # Sort and create sequences
        sorted_hours = sorted(hourly_counts.keys())
        values = [hourly_counts[h] for h in sorted_hours]
        return sorted_hours, values

    def fit(self, violations: List[Dict]) -> bool:
        """Train the predictor on historical violation data."""
        hours, values = self._prepare_time_series(violations)
        if len(values) < 3:
            return False

        # Create feature matrix: use lagged values (last 6 hours)
        X = []
        y = []
        lag = min(6, len(values) - 1)
        for i in range(lag, len(values)):
            X.append(values[i - lag : i])
            y.append(values[i])

        X = np.array(X)
        y = np.array(y)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_fitted = True
        return True

    def predict_next_hours(self, violations: List[Dict], hours_ahead: int = 24) -> List[Dict]:
        """Predict violation counts for the next N hours."""
        _, values = self._prepare_time_series(violations)
        if len(values) < 2:
            # Fallback: return simple average-based predictions
            avg = np.mean(values) if values else 5
            return [
                {"hour": i, "predicted_count": round(avg * (1 + 0.02 * i)), "confidence": 0.6}
                for i in range(1, hours_ahead + 1)
            ]

        predictions = []
        current = list(values[-6:]) if len(values) >= 6 else list(values)
        base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

        for i in range(hours_ahead):
            if len(current) >= 6 and self.is_fitted:
                X = np.array([current[-6:]])
                X_scaled = self.scaler.transform(X)
                pred = max(0, self.model.predict(X_scaled)[0])
            else:
                pred = max(0, np.mean(current) * (1 + 0.01 * (i % 24)) if current else 5)
            pred_val = round(float(pred), 1)
            confidence = 0.85 - (i * 0.01)  # Confidence decreases with time
            predictions.append({
                "hour_offset": i + 1,
                "timestamp": (base_time + timedelta(hours=i + 1)).isoformat(),
                "predicted_count": pred_val,
                "confidence": round(min(0.95, confidence), 2),
            })
            current.append(pred_val)
            if len(current) > 6:
                current.pop(0)

        return predictions

    def calculate_ml_risk_score(self, violations: List[Dict], recent_hours: int = 1) -> Dict[str, Any]:
        """Calculate ML-enhanced risk score based on trends and patterns."""
        _, values = self._prepare_time_series(violations)
        recent_count = sum(values[-recent_hours * 12 :]) if len(values) > recent_hours * 12 else sum(values)
        avg_count = np.mean(values) if values else 0
        std_count = np.std(values) if len(values) > 1 else 1

        # Trend component: is it increasing?
        trend = 0
        if len(values) >= 6:
            trend = (values[-1] - values[-6]) / 6 if values[-6] else 0
        trend_score = min(1, max(0, (trend + 2) / 4)) * 30  # 0-30 points

        # Volume component
        volume_score = min(50, (recent_count / 10) * 25) if recent_count else 10

        # Volatility component (std dev)
        volatility_score = min(20, std_count * 5) if std_count else 5

        total = min(100, trend_score + volume_score + volatility_score)
        if total < 30:
            level = "low"
        elif total < 60:
            level = "medium"
        elif total < 85:
            level = "high"
        else:
            level = "critical"

        return {
            "score": round(total, 1),
            "level": level,
            "trend": "increasing" if trend > 0.5 else "decreasing" if trend < -0.5 else "stable",
            "factors": {
                "recent_volume": recent_count,
                "trend_direction": round(trend, 2),
                "volatility": round(float(std_count), 2),
            },
            "recommendations": self._get_recommendations(level, trend),
        }

    def _get_recommendations(self, level: str, trend: float) -> List[str]:
        """Generate context-aware recommendations."""
        recs = []
        if level == "critical":
            recs.extend(["Deploy additional staff immediately", "Consider temporary capacity limits"])
        elif level == "high":
            recs.append("Increase monitoring frequency")
        if trend > 0.5:
            recs.append("Violations trending up - prepare for peak hours")
        if level in ["low", "medium"] and trend < 0:
            recs.append("Compliance improving - maintain current protocols")
        return recs or ["Monitor situation", "No immediate action required"]

    def detect_anomalies(self, violations: List[Dict], threshold: float = 2.0) -> List[Dict]:
        """Detect anomalous violation spikes using z-score."""
        _, values = self._prepare_time_series(violations)
        if len(values) < 5:
            return []

        mean = np.mean(values)
        std = np.std(values)
        if std == 0:
            return []

        anomalies = []
        for i, v in enumerate(values):
            z = (v - mean) / std
            if abs(z) > threshold:
                anomalies.append({
                    "index": i,
                    "value": v,
                    "z_score": round(float(z), 2),
                    "type": "spike" if z > 0 else "drop",
                })
        return anomalies
