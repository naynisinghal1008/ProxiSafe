/**
 * ProxiSafe ML API Client
 * Connects to the ML model service for predictions, risk assessment, and anomaly detection.
 * Falls back gracefully when ML service is unavailable.
 */

const ML_API_CONFIG = {
    baseUrl: 'http://localhost:5000',
    timeout: 10000,
    enabled: true
};

class MLAPIClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || ML_API_CONFIG.baseUrl;
        this.timeout = config.timeout || ML_API_CONFIG.timeout;
        this.enabled = config.enabled !== false;
        this.isAvailable = null; // null = unknown, true/false = checked
    }

    /**
     * Convert violation to API format (ensure timestamp is ISO string)
     */
    _toApiViolation(v) {
        const ts = v.timestamp;
        let timestampStr = null;
        if (ts) {
            if (ts instanceof Date) {
                timestampStr = ts.toISOString();
            } else if (typeof ts === 'number') {
                timestampStr = new Date(ts).toISOString();
            } else if (typeof ts === 'string') {
                timestampStr = ts;
            }
        }
        return {
            id: v.id,
            type: v.type,
            location: v.location,
            timestamp: timestampStr,
            peopleCount: v.peopleCount,
            distance: parseFloat(v.distance) || null,
            duration: v.duration,
            confidence: v.confidence
        };
    }

    /**
     * Fetch ML stats (predictions + risk + anomalies) from the ML service
     */
    async fetchMLStats(violations) {
        if (!this.enabled || !violations || violations.length === 0) {
            return null;
        }

        const apiViolations = violations.slice(0, 200).map(v => this._toApiViolation(v));
        const url = `${this.baseUrl}/api/stats`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ violations: apiViolations }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            this.isAvailable = true;

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            const data = await response.json();
            return this._transformToAdvancedMetrics(data);
        } catch (error) {
            this.isAvailable = false;
            if (error.name !== 'AbortError') {
                console.warn('[ProxiSafe ML] Service unavailable, using analytics engine:', error.message);
            }
            return null;
        }
    }

    /**
     * Transform ML API response to match dashboard advancedMetrics format
     */
    _transformToAdvancedMetrics(mlData) {
        if (!mlData) return null;

        const { predictions = [], risk = {} } = mlData;
        const anomaliesData = mlData.anomalies;
        const anomalyList = anomaliesData && Array.isArray(anomaliesData.anomalies)
            ? anomaliesData.anomalies
            : (Array.isArray(anomaliesData) ? anomaliesData : []);

        return {
            riskAssessment: {
                overall: risk.score || 0,
                level: (risk.level || 'low').charAt(0).toUpperCase() + (risk.level || 'low').slice(1),
                components: this._riskFactorsToComponents(risk.factors),
                recommendations: risk.recommendations || []
            },
            predictions: {
                nextHour: predictions[0] ? [{ value: predictions[0].predicted_count }] : [],
                next24Hours: (predictions || []).map(p => ({ value: p.predicted_count })),
                confidence: predictions[0] ? predictions[0].confidence : 0
            },
            anomalies: {
                count: anomalyList.length,
                detected: anomalyList.map(a => ({
                    type: a.type || 'spike',
                    severity: a.type === 'spike' ? 'high' : 'medium',
                    description: `Z-score: ${a.z_score}, value: ${a.value}`,
                    timestamp: new Date()
                })),
                lastDetected: anomalyList.length > 0 ? new Date() : null
            },
            _mlSource: true
        };
    }

    _riskFactorsToComponents(factors) {
        const defaults = { trend: 25, volume: 25, volatility: 25 };
        if (!factors) return defaults;
        const components = {};
        if (factors.recent_volume !== undefined) {
            components.volume = Math.min(100, Math.max(0, factors.recent_volume * 5));
        }
        if (factors.trend_direction !== undefined) {
            components.trend = Math.min(100, Math.max(0, 50 + factors.trend_direction * 25));
        }
        if (factors.volatility !== undefined) {
            components.volatility = Math.min(100, Math.max(0, factors.volatility * 10));
        }
        return Object.keys(components).length ? components : defaults;
    }

    /**
     * Quick health check
     */
    async checkHealth() {
        try {
            const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
            this.isAvailable = res.ok;
            return this.isAvailable;
        } catch {
            this.isAvailable = false;
            return false;
        }
    }
}

// Global instance
window.MLAPIClient = MLAPIClient;
window.mlApiClient = new MLAPIClient(ML_API_CONFIG);
