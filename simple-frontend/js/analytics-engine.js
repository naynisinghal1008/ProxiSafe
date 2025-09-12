// Advanced Analytics and Computation Engine
class AnalyticsEngine {
    constructor() {
        this.historicalData = [];
        this.riskFactors = {
            crowdDensity: 0.3,
            timeOfDay: 0.2,
            location: 0.25,
            weatherCondition: 0.15,
            eventType: 0.1
        };
        this.predictionModels = {};
        this.anomalyThresholds = {
            violationSpike: 2.5, // Standard deviations
            complianceDrop: 0.15, // 15% drop
            crowdSurge: 1.8
        };
    }

    // Advanced Statistical Calculations
    calculateAdvancedMetrics(violations, timeframe = '24h') {
        const metrics = {
            basic: this.calculateBasicStats(violations),
            trends: this.calculateTrends(violations, timeframe),
            predictions: this.generatePredictions(violations),
            riskAssessment: this.calculateRiskScore(violations),
            anomalies: this.detectAnomalies(violations),
            efficiency: this.calculateSystemEfficiency(violations)
        };

        return metrics;
    }

    calculateBasicStats(violations) {
        if (!violations.length) return {};

        const values = violations.map(v => v.value || v.peopleCount || 1);
        const sorted = [...values].sort((a, b) => a - b);
        
        return {
            mean: this.mean(values),
            median: this.median(sorted),
            mode: this.mode(values),
            standardDeviation: this.standardDeviation(values),
            variance: this.variance(values),
            range: Math.max(...values) - Math.min(...values),
            quartiles: this.calculateQuartiles(sorted),
            outliers: this.detectOutliers(values)
        };
    }

    calculateTrends(violations, timeframe) {
        const timeSeriesData = this.prepareTimeSeriesData(violations, timeframe);
        
        return {
            linearTrend: this.calculateLinearTrend(timeSeriesData),
            seasonality: this.detectSeasonality(timeSeriesData),
            cyclicalPatterns: this.detectCyclicalPatterns(timeSeriesData),
            growthRate: this.calculateGrowthRate(timeSeriesData),
            momentum: this.calculateMomentum(timeSeriesData),
            volatility: this.calculateVolatility(timeSeriesData)
        };
    }

    generatePredictions(violations) {
        const timeSeriesData = this.prepareTimeSeriesData(violations, '7d');
        
        return {
            nextHour: this.predictNextPeriod(timeSeriesData, 1),
            next24Hours: this.predictNextPeriod(timeSeriesData, 24),
            nextWeek: this.predictNextPeriod(timeSeriesData, 168),
            confidence: this.calculatePredictionConfidence(timeSeriesData),
            scenarios: this.generateScenarios(timeSeriesData)
        };
    }

    calculateRiskScore(violations) {
        const currentHour = new Date().getHours();
        const recentViolations = violations.filter(v => 
            new Date() - new Date(v.timestamp) < 3600000 // Last hour
        );

        const crowdDensity = this.calculateCrowdDensity(recentViolations);
        const timeRisk = this.getTimeBasedRisk(currentHour);
        const locationRisk = this.calculateLocationRisk(recentViolations);
        const trendRisk = this.calculateTrendRisk(violations);

        const riskScore = (
            crowdDensity * this.riskFactors.crowdDensity +
            timeRisk * this.riskFactors.timeOfDay +
            locationRisk * this.riskFactors.location +
            trendRisk * 0.2
        ) * 100;

        return {
            overall: Math.min(100, Math.max(0, riskScore)),
            components: {
                crowdDensity: crowdDensity * 100,
                timeOfDay: timeRisk * 100,
                location: locationRisk * 100,
                trend: trendRisk * 100
            },
            level: this.getRiskLevel(riskScore),
            recommendations: this.generateRiskRecommendations(riskScore)
        };
    }

    detectAnomalies(violations) {
        const recentData = violations.slice(-24); // Last 24 data points
        const baseline = this.calculateBasicStats(recentData);
        
        const anomalies = [];
        
        violations.forEach((violation, index) => {
            const value = violation.value || violation.peopleCount || 1;
            const zScore = Math.abs((value - baseline.mean) / baseline.standardDeviation);
            
            if (zScore > this.anomalyThresholds.violationSpike) {
                anomalies.push({
                    type: 'spike',
                    timestamp: violation.timestamp,
                    value: value,
                    severity: zScore > 3 ? 'critical' : 'high',
                    description: `Unusual spike detected: ${value} (${zScore.toFixed(2)}σ above normal)`
                });
            }
        });

        return {
            detected: anomalies,
            count: anomalies.length,
            lastDetected: anomalies.length > 0 ? anomalies[anomalies.length - 1].timestamp : null
        };
    }

    calculateSystemEfficiency(violations) {
        const resolvedViolations = violations.filter(v => v.status === 'resolved');
        const totalViolations = violations.length;
        
        if (totalViolations === 0) return {};

        const avgResolutionTime = this.calculateAverageResolutionTime(resolvedViolations);
        const resolutionRate = resolvedViolations.length / totalViolations;
        const falsePositiveRate = this.estimateFalsePositiveRate(violations);
        
        return {
            resolutionRate: resolutionRate * 100,
            averageResolutionTime: avgResolutionTime,
            falsePositiveRate: falsePositiveRate * 100,
            systemUptime: this.calculateSystemUptime(),
            detectionAccuracy: (1 - falsePositiveRate) * 100,
            overallEfficiency: this.calculateOverallEfficiency(resolutionRate, avgResolutionTime, falsePositiveRate)
        };
    }

    // Advanced Distance and Crowd Analysis
    calculateRealTimeDistance(person1, person2) {
        // Simulate real-time distance calculation
        const dx = person1.x - person2.x;
        const dy = person1.y - person2.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Convert pixel distance to real-world distance (assuming calibration)
        const realWorldDistance = pixelDistance * 0.02; // 2cm per pixel (example calibration)
        
        return {
            pixels: pixelDistance,
            meters: realWorldDistance,
            feet: realWorldDistance * 3.28084,
            isViolation: realWorldDistance < 1.8, // 6 feet = 1.8 meters
            riskLevel: this.getDistanceRiskLevel(realWorldDistance)
        };
    }

    calculateCrowdDensity(violations) {
        const areas = {};
        
        violations.forEach(violation => {
            const location = violation.location;
            if (!areas[location]) {
                areas[location] = { count: 0, area: this.getLocationArea(location) };
            }
            areas[location].count += violation.peopleCount || 1;
        });

        let totalDensity = 0;
        let locationCount = 0;

        Object.values(areas).forEach(area => {
            if (area.area > 0) {
                totalDensity += area.count / area.area;
                locationCount++;
            }
        });

        return locationCount > 0 ? totalDensity / locationCount : 0;
    }

    // Predictive Analytics
    predictNextPeriod(timeSeriesData, periods) {
        if (timeSeriesData.length < 3) return null;

        // Simple linear regression for trend
        const trend = this.calculateLinearTrend(timeSeriesData);
        const seasonal = this.detectSeasonality(timeSeriesData);
        
        const predictions = [];
        for (let i = 1; i <= periods; i++) {
            const trendValue = trend.slope * (timeSeriesData.length + i) + trend.intercept;
            const seasonalAdjustment = seasonal.pattern[i % seasonal.period] || 0;
            const predicted = Math.max(0, trendValue + seasonalAdjustment);
            
            predictions.push({
                period: i,
                value: Math.round(predicted * 100) / 100,
                confidence: this.calculatePredictionConfidence(timeSeriesData, i)
            });
        }

        return predictions;
    }

    generateScenarios(timeSeriesData) {
        const baseline = this.predictNextPeriod(timeSeriesData, 24);
        if (!baseline) return null;

        return {
            optimistic: baseline.map(p => ({ ...p, value: p.value * 0.7 })),
            realistic: baseline,
            pessimistic: baseline.map(p => ({ ...p, value: p.value * 1.4 })),
            worstCase: baseline.map(p => ({ ...p, value: p.value * 2.0 }))
        };
    }

    // Utility Functions
    mean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    median(sortedValues) {
        const mid = Math.floor(sortedValues.length / 2);
        return sortedValues.length % 2 === 0
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
            : sortedValues[mid];
    }

    mode(values) {
        const frequency = {};
        values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
        
        let maxFreq = 0;
        let mode = null;
        
        Object.entries(frequency).forEach(([val, freq]) => {
            if (freq > maxFreq) {
                maxFreq = freq;
                mode = parseFloat(val);
            }
        });
        
        return mode;
    }

    standardDeviation(values) {
        const avg = this.mean(values);
        const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
        return Math.sqrt(this.mean(squaredDiffs));
    }

    variance(values) {
        const avg = this.mean(values);
        const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
        return this.mean(squaredDiffs);
    }

    calculateQuartiles(sortedValues) {
        const q1Index = Math.floor(sortedValues.length * 0.25);
        const q3Index = Math.floor(sortedValues.length * 0.75);
        
        return {
            q1: sortedValues[q1Index],
            q2: this.median(sortedValues),
            q3: sortedValues[q3Index]
        };
    }

    detectOutliers(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const quartiles = this.calculateQuartiles(sorted);
        const iqr = quartiles.q3 - quartiles.q1;
        const lowerBound = quartiles.q1 - 1.5 * iqr;
        const upperBound = quartiles.q3 + 1.5 * iqr;
        
        return values.filter(val => val < lowerBound || val > upperBound);
    }

    calculateLinearTrend(data) {
        const n = data.length;
        const sumX = data.reduce((sum, _, i) => sum + i, 0);
        const sumY = data.reduce((sum, point) => sum + point.value, 0);
        const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0);
        const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept, direction: slope > 0 ? 'increasing' : 'decreasing' };
    }

    detectSeasonality(data) {
        // Simple seasonality detection for hourly/daily patterns
        const periods = [24, 7, 30]; // hourly, weekly, monthly
        let bestPeriod = 24;
        let bestCorrelation = 0;
        
        periods.forEach(period => {
            if (data.length >= period * 2) {
                const correlation = this.calculateAutocorrelation(data, period);
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestPeriod = period;
                }
            }
        });
        
        return {
            period: bestPeriod,
            strength: bestCorrelation,
            pattern: this.extractSeasonalPattern(data, bestPeriod)
        };
    }

    calculateAutocorrelation(data, lag) {
        if (data.length <= lag) return 0;
        
        const values = data.map(d => d.value);
        const mean = this.mean(values);
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < values.length - lag; i++) {
            numerator += (values[i] - mean) * (values[i + lag] - mean);
        }
        
        for (let i = 0; i < values.length; i++) {
            denominator += Math.pow(values[i] - mean, 2);
        }
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    extractSeasonalPattern(data, period) {
        const pattern = new Array(period).fill(0);
        const counts = new Array(period).fill(0);
        
        data.forEach((point, index) => {
            const seasonalIndex = index % period;
            pattern[seasonalIndex] += point.value;
            counts[seasonalIndex]++;
        });
        
        return pattern.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
    }

    prepareTimeSeriesData(violations, timeframe) {
        const now = new Date();
        let startTime, interval;
        
        switch (timeframe) {
            case '24h':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '7d':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            case '30d':
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                interval = 24 * 60 * 60 * 1000; // 1 day
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                interval = 60 * 60 * 1000;
        }
        
        const timeSlots = [];
        for (let time = startTime.getTime(); time <= now.getTime(); time += interval) {
            const slotViolations = violations.filter(v => {
                const vTime = new Date(v.timestamp).getTime();
                return vTime >= time && vTime < time + interval;
            });
            
            timeSlots.push({
                timestamp: new Date(time),
                value: slotViolations.length,
                violations: slotViolations
            });
        }
        
        return timeSlots;
    }

    getTimeBasedRisk(hour) {
        // Higher risk during peak hours
        const peakHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        const rushHours = [8, 9, 17, 18, 19];
        
        if (rushHours.includes(hour)) return 0.9;
        if (peakHours.includes(hour)) return 0.7;
        if (hour >= 6 && hour <= 22) return 0.5;
        return 0.2; // Night hours
    }

    calculateLocationRisk(violations) {
        const locationRiskMap = {
            'Mall Entrance': 0.8,
            'Food Court': 0.9,
            'Elevator Zone': 0.85,
            'Parking Area': 0.6,
            'Shopping Area': 0.7,
            'Restroom Area': 0.75
        };
        
        if (violations.length === 0) return 0.5;
        
        const avgRisk = violations.reduce((sum, v) => {
            return sum + (locationRiskMap[v.location] || 0.5);
        }, 0) / violations.length;
        
        return avgRisk;
    }

    getLocationArea(location) {
        // Estimated areas in square meters
        const areaMap = {
            'Mall Entrance': 200,
            'Food Court': 500,
            'Elevator Zone': 50,
            'Parking Area': 1000,
            'Shopping Area': 800,
            'Restroom Area': 100
        };
        
        return areaMap[location] || 100;
    }

    getRiskLevel(score) {
        if (score >= 80) return 'Critical';
        if (score >= 60) return 'High';
        if (score >= 40) return 'Medium';
        if (score >= 20) return 'Low';
        return 'Minimal';
    }

    generateRiskRecommendations(score) {
        const recommendations = [];
        
        if (score >= 80) {
            recommendations.push('Immediate intervention required');
            recommendations.push('Deploy additional security personnel');
            recommendations.push('Consider temporary capacity restrictions');
        } else if (score >= 60) {
            recommendations.push('Increase monitoring frequency');
            recommendations.push('Send preventive alerts to visitors');
            recommendations.push('Review crowd flow patterns');
        } else if (score >= 40) {
            recommendations.push('Monitor situation closely');
            recommendations.push('Prepare contingency measures');
        } else {
            recommendations.push('Continue normal operations');
            recommendations.push('Maintain standard monitoring');
        }
        
        return recommendations;
    }

    calculatePredictionConfidence(data, periods = 1) {
        if (data.length < 5) return 0.3;
        
        const recentVariability = this.calculateVolatility(data.slice(-10));
        const trendStability = this.calculateTrendStability(data);
        const dataQuality = Math.min(1, data.length / 50);
        
        const baseConfidence = 0.8;
        const variabilityPenalty = Math.min(0.4, recentVariability * 0.1);
        const periodsPenalty = Math.min(0.3, periods * 0.02);
        
        return Math.max(0.1, baseConfidence - variabilityPenalty - periodsPenalty + (trendStability * 0.2) + (dataQuality * 0.1));
    }

    calculateVolatility(data) {
        if (data.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            if (data[i-1].value !== 0) {
                returns.push((data[i].value - data[i-1].value) / data[i-1].value);
            }
        }
        
        return returns.length > 0 ? this.standardDeviation(returns) : 0;
    }

    calculateTrendStability(data) {
        if (data.length < 10) return 0.5;
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const trend1 = this.calculateLinearTrend(firstHalf);
        const trend2 = this.calculateLinearTrend(secondHalf);
        
        const slopeDifference = Math.abs(trend1.slope - trend2.slope);
        return Math.max(0, 1 - slopeDifference);
    }

    calculateOverallEfficiency(resolutionRate, avgResolutionTime, falsePositiveRate) {
        const resolutionScore = resolutionRate * 40; // 40% weight
        const timeScore = Math.max(0, 30 - (avgResolutionTime / 60)) * (30/30); // 30% weight, penalty for >30min
        const accuracyScore = (1 - falsePositiveRate) * 30; // 30% weight
        
        return Math.min(100, resolutionScore + timeScore + accuracyScore);
    }

    calculateAverageResolutionTime(resolvedViolations) {
        if (resolvedViolations.length === 0) return 0;
        
        const resolutionTimes = resolvedViolations.map(v => {
            // Simulate resolution time (in reality, this would be tracked)
            return Math.random() * 1800 + 300; // 5-35 minutes
        });
        
        return this.mean(resolutionTimes);
    }

    estimateFalsePositiveRate(violations) {
        // Simulate false positive estimation based on violation characteristics
        const suspiciousViolations = violations.filter(v => {
            return v.confidence < 85 || v.duration < 10 || v.distance > 5;
        });
        
        return violations.length > 0 ? suspiciousViolations.length / violations.length : 0;
    }

    calculateSystemUptime() {
        // Simulate system uptime calculation
        return 99.2 + Math.random() * 0.7; // 99.2% - 99.9%
    }

    getDistanceRiskLevel(distance) {
        if (distance < 1) return 'Critical';
        if (distance < 1.5) return 'High';
        if (distance < 1.8) return 'Medium';
        return 'Low';
    }
}

// Export for use in other modules
window.AnalyticsEngine = AnalyticsEngine;