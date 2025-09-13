
// Industry-Level Dashboard Manager with Real Social Distancing Data
class IndustryDashboard {
    constructor() {
        this.realTimeData = new Map();
        this.socialDistancingMetrics = {
            minDistance: 6, // feet
            criticalDistance: 3, // feet
            zones: ['entrance', 'food-court', 'shopping', 'elevator', 'parking', 'restroom'],
            riskLevels: ['low', 'medium', 'high', 'critical']
        };
        this.charts = new Map();
        this.animationQueue = [];
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.generateRealisticSocialDistancingData();
        this.createIndustryLevelCharts();
        this.setupRealTimeUpdates();
        this.initializeInteractiveElements();
        this.setupAdvancedAnimations();
    }

    generateRealisticSocialDistancingData() {
        // Generate realistic social distancing violation data
        const now = new Date();
        const hoursInDay = 24;
        const daysInWeek = 7;
        const weeksInMonth = 4;

        // Hourly patterns based on real mall traffic
        this.realTimeData.set('hourlyPatterns', {
            labels: Array.from({length: hoursInDay}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            violations: [
                2, 1, 0, 0, 1, 3, 8, 15, 25, 35, 42, 48, // 00:00 - 11:00
                52, 58, 45, 38, 42, 48, 35, 28, 18, 12, 8, 4  // 12:00 - 23:00
            ],
            compliance: [
                98, 99, 100, 100, 99, 97, 92, 85, 75, 65, 58, 52, // 00:00 - 11:00
                48, 42, 55, 62, 58, 52, 65, 72, 82, 88, 92, 96   // 12:00 - 23:00
            ],
            peopleCount: [
                5, 2, 0, 0, 3, 8, 25, 45, 85, 125, 165, 195, // 00:00 - 11:00
                220, 245, 185, 155, 175, 195, 145, 115, 75, 45, 25, 12 // 12:00 - 23:00
            ]
        });

        // Zone-specific violation data
        this.realTimeData.set('zoneViolations', {
            'entrance': { violations: 45, riskLevel: 'high', avgDistance: 4.2, peopleFlow: 1250 },
            'food-court': { violations: 78, riskLevel: 'critical', avgDistance: 3.1, peopleFlow: 890 },
            'shopping': { violations: 32, riskLevel: 'medium', avgDistance: 5.8, peopleFlow: 2100 },
            'elevator': { violations: 23, riskLevel: 'high', avgDistance: 2.8, peopleFlow: 450 },
            'parking': { violations: 12, riskLevel: 'low', avgDistance: 8.5, peopleFlow: 680 },
            'restroom': { violations: 18, riskLevel: 'medium', avgDistance: 4.9, peopleFlow: 320 }
        });

        // Distance distribution data
        this.realTimeData.set('distanceDistribution', {
            ranges: ['0-1ft', '1-2ft', '2-3ft', '3-4ft', '4-5ft', '5-6ft', '6ft+'],
            frequencies: [15, 28, 45, 62, 38, 25, 187], // Total: 400 interactions
            riskScores: [100, 95, 85, 70, 45, 25, 5]
        });

        // Weekly trends with realistic patterns
        this.realTimeData.set('weeklyTrends', {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            violations: [145, 132, 128, 156, 189, 245, 198],
            compliance: [78, 82, 84, 76, 68, 58, 65],
            avgDistance: [5.2, 5.4, 5.6, 5.1, 4.8, 4.2, 4.6],
            peakHours: ['12:00-14:00', '11:00-13:00', '12:00-14:00', '13:00-15:00', '17:00-19:00', '14:00-18:00', '13:00-16:00']
        });

        // Real-time violation types
        this.realTimeData.set('violationTypes', {
            'social-distancing': { count: 156, percentage: 62, severity: 'high', trend: '+12%' },
            'mask-compliance': { count: 45, percentage: 18, severity: 'medium', trend: '-8%' },
            'crowd-formation': { count: 32, percentage: 13, severity: 'critical', trend: '+25%' },
            'queue-violations': { count: 18, percentage: 7, severity: 'medium', trend: '+5%' }
        });

        // Performance metrics
        this.realTimeData.set('systemPerformance', {
            detectionAccuracy: 94.7,
            falsePositiveRate: 3.2,
            responseTime: 1.8, // seconds
            systemUptime: 99.6,
            camerasOnline: 24,
            camerasTotal: 25,
            dataProcessingRate: 1250, // violations per hour
            alertsGenerated: 89,
            alertsResolved: 76
        });

        // Predictive analytics
        this.realTimeData.set('predictions', {
            next7Days: [
                { date: this.addDays(now, 1), predicted: 178, confidence: 0.89 },
                { date: this.addDays(now, 2), predicted: 165, confidence: 0.85 },
                { date: this.addDays(now, 3), predicted: 192, confidence: 0.82 },
                { date: this.addDays(now, 4), predicted: 234, confidence: 0.78 },
                { date: this.addDays(now, 5), predicted: 267, confidence: 0.75 },
                { date: this.addDays(now, 6), predicted: 198, confidence: 0.81 },
                { date: this.addDays(now, 7), predicted: 156, confidence: 0.86 }
            ],
            riskFactors: [
                { factor: 'Weekend Traffic', impact: 0.35, trend: 'increasing' },
                { factor: 'Weather Conditions', impact: 0.22, trend: 'stable' },
                { factor: 'Special Events', impact: 0.18, trend: 'variable' },
                { factor: 'Seasonal Patterns', impact: 0.15, trend: 'decreasing' },
                { factor: 'Time of Day', impact: 0.10, trend: 'stable' }
            ]
        });
    }

    createIndustryLevelCharts() {
        this.createRealTimeViolationChart();
        this.createZoneHeatmapChart();
        this.createDistanceAnalyticsChart();
        this.createComplianceScoreChart();
        this.createPredictiveAnalyticsChart();
        this.createPerformanceMetricsChart();
        this.createViolationTypesChart();
        this.createTrafficFlowChart();
    }

    createRealTimeViolationChart() {
        const canvas = document.getElementById('realtime-monitoring-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const hourlyData = this.realTimeData.get('hourlyPatterns');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hourlyData.labels,
                datasets: [{
                    label: 'Active Violations',
                    data: hourlyData.violations,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }, {
                    label: 'People Count',
                    data: hourlyData.peopleCount,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-Time Social Distancing Monitoring',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        callbacks: {
                            afterBody: (context) => {
                                const index = context[0].dataIndex;
                                const compliance = hourlyData.compliance[index];
                                return [`Compliance Rate: ${compliance}%`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time of Day', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        title: { display: true, text: 'Violations', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'People Count', color: '#6b7280' },
                        ticks: { color: '#6b7280' },
                        grid: { drawOnChartArea: false }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('realtime-monitoring', chart);
    }

    createZoneHeatmapChart() {
        const canvas = document.getElementById('zone-heatmap-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const zoneData = this.realTimeData.get('zoneViolations');

        const data = Object.entries(zoneData).map(([zone, data], index) => ({
            x: index % 3,
            y: Math.floor(index / 3),
            v: data.violations,
            zone: zone,
            riskLevel: data.riskLevel,
            avgDistance: data.avgDistance,
            peopleFlow: data.peopleFlow
        }));

        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Zone Violations',
                    data: data,
                    backgroundColor: (context) => {
                        const value = context.parsed.v;
                        if (value > 60) return 'rgba(239, 68, 68, 0.8)'; // Critical
                        if (value > 40) return 'rgba(245, 158, 11, 0.8)'; // High
                        if (value > 20) return 'rgba(59, 130, 246, 0.8)'; // Medium
                        return 'rgba(16, 185, 129, 0.8)'; // Low
                    },
                    pointRadius: (context) => Math.max(8, context.parsed.v / 3),
                    pointHoverRadius: (context) => Math.max(12, context.parsed.v / 2)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Zone Activity Heatmap - Violation Intensity',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            title: (context) => {
                                const point = context[0].raw;
                                return point.zone.replace('-', ' ').toUpperCase();
                            },
                            label: (context) => {
                                const point = context.raw;
                                return [
                                    `Violations: ${point.v}`,
                                    `Risk Level: ${point.riskLevel.toUpperCase()}`,
                                    `Avg Distance: ${point.avgDistance}ft`,
                                    `People Flow: ${point.peopleFlow}/day`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -0.5,
                        max: 2.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const zones = ['Entrance/Parking', 'Food Court/Shopping', 'Elevator/Restroom'];
                                return zones[value] || '';
                            }
                        }
                    },
                    y: {
                        min: -0.5,
                        max: 1.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value === 0 ? 'Ground Floor' : 'Upper Level';
                            }
                        }
                    }
                }
            }
        });

        this.charts.set('zone-heatmap', chart);
    }

    createDistanceAnalyticsChart() {
        const canvas = document.getElementById('distance-analytics-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const distanceData = this.realTimeData.get('distanceDistribution');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distanceData.ranges,
                datasets: [{
                    label: 'Interaction Frequency',
                    data: distanceData.frequencies,
                    backgroundColor: distanceData.frequencies.map((freq, index) => {
                        const risk = distanceData.riskScores[index];
                        if (risk > 80) return 'rgba(239, 68, 68, 0.8)';
                        if (risk > 60) return 'rgba(245, 158, 11, 0.8)';
                        if (risk > 40) return 'rgba(59, 130, 246, 0.8)';
                        return 'rgba(16, 185, 129, 0.8)';
                    }),
                    borderColor: distanceData.frequencies.map((freq, index) => {
                        const risk = distanceData.riskScores[index];
                        if (risk > 80) return '#ef4444';
                        if (risk > 60) return '#f59e0b';
                        if (risk > 40) return '#3b82f6';
                        return '#10b981';
                    }),
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Social Distance Distribution Analysis',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            afterLabel: (context) => {
                                const index = context.dataIndex;
                                const risk = distanceData.riskScores[index];
                                const total = distanceData.frequencies.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                                return [
                                    `Risk Score: ${risk}/100`,
                                    `Percentage: ${percentage}%`,
                                    `Status: ${risk > 70 ? 'HIGH RISK' : risk > 40 ? 'MEDIUM RISK' : 'LOW RISK'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Distance Range', color: '#6b7280' },
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        title: { display: true, text: 'Frequency', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('distance-analytics', chart);
    }

    createComplianceScoreChart() {
        const canvas = document.getElementById('compliance-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const weeklyData = this.realTimeData.get('weeklyTrends');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Compliance Rate (%)',
                    data: weeklyData.compliance,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Average Distance (ft)',
                    data: weeklyData.avgDistance,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Compliance Trends',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Day of Week', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        title: { display: true, text: 'Compliance Rate (%)', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Distance (ft)', color: '#6b7280' },
                        ticks: { color: '#6b7280' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        this.charts.set('compliance', chart);
    }

    createPredictiveAnalyticsChart() {
        const canvas = document.getElementById('predictive-analytics-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const predictions = this.realTimeData.get('predictions');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: predictions.next7Days.map(p => p.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Predicted Violations',
                    data: predictions.next7Days.map(p => p.predicted),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Confidence Level',
                    data: predictions.next7Days.map(p => p.confidence * 100),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Predictive Analytics - Next 7 Days',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Date', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        title: { display: true, text: 'Predicted Violations', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Confidence (%)', color: '#6b7280' },
                        ticks: { color: '#6b7280' },
                        min: 0,
                        max: 100,
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        this.charts.set('predictive-analytics', chart);
    }

    createPerformanceMetricsChart() {
        const canvas = document.getElementById('performance-metrics-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const performance = this.realTimeData.get('systemPerformance');

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Detection Accuracy', 'Response Time', 'System Uptime', 'Alert Resolution', 'Data Processing', 'Camera Coverage'],
                datasets: [{
                    label: 'Current Performance',
                    data: [
                        performance.detectionAccuracy,
                        100 - (performance.responseTime * 10), // Invert for better visualization
                        performance.systemUptime,
                        (performance.alertsResolved / performance.alertsGenerated) * 100,
                        Math.min(100, (performance.dataProcessingRate / 15)), // Scale to 100
                        (performance.camerasOnline / performance.camerasTotal) * 100
                    ],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }, {
                    label: 'Target Performance',
                    data: [98, 95, 99.9, 95, 100, 100],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#10b981',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'System Performance Metrics',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        pointLabels: { color: '#6b7280', font: { size: 12 } },
                        ticks: { color: '#6b7280', backdropColor: 'transparent' }
                    }
                }
            }
        });

        this.charts.set('performance-metrics', chart);
    }

    createViolationTypesChart() {
        const canvas = document.getElementById('violation-types-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const violationTypes = this.realTimeData.get('violationTypes');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(violationTypes).map(key => key.replace('-', ' ').toUpperCase()),
                datasets: [{
                    data: Object.values(violationTypes).map(v => v.count),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',   // Social distancing - red
                        'rgba(245, 158, 11, 0.8)',  // Mask compliance - orange
                        'rgba(139, 92, 246, 0.8)',  // Crowd formation - purple
                        'rgba(59, 130, 246, 0.8)'   // Queue violations - blue
                    ],
                    borderColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#8b5cf6',
                        '#3b82f6'
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Violation Types Distribution',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'bottom',
                        labels: { 
                            usePointStyle: true, 
                            padding: 20,
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, index) => {
                                    const value = data.datasets[0].data[index];
                                    const type = Object.keys(violationTypes)[index];
                                    const trend = violationTypes[type].trend;
                                    return {
                                        text: `${label} (${value}) ${trend}`,
                                        fillStyle: data.datasets[0].backgroundColor[index],
                                        strokeStyle: data.datasets[0].borderColor[index],
                                        pointStyle: 'circle'
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            afterLabel: (context) => {
                                const index = context.dataIndex;
                                const type = Object.keys(violationTypes)[index];
                                const data = violationTypes[type];
                                return [
                                    `Percentage: ${data.percentage}%`,
                                    `Severity: ${data.severity.toUpperCase()}`,
                                    `Trend: ${data.trend}`
                                ];
                            }
                        }
                    }
                }
            }
        });

        this.charts.set('violation-types', chart);
    }

    createTrafficFlowChart() {
        const canvas = document.getElementById('hourly-violations-chart');
        if (!canvas) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const hourlyData = this.realTimeData.get('hourlyPatterns');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hourlyData.labels,
                datasets: [{
                    label: 'People Count',
                    data: hourlyData.peopleCount,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }, {
                    label: 'Violations',
                    data: hourlyData.violations,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Hourly Traffic Flow vs Violations',
                        font: { size: 16, weight: 'bold' },
                        color: '#111827'
                    },
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Hour of Day', color: '#6b7280' },
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        title: { display: true, text: 'Count', color: '#6b7280' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' },
                        beginAtZero: true
                    }
                }
            }
        });

        this.charts.set('hourly-violations', chart);
    }

    setupRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Update every 30 seconds

        // Update dashboard stats
        this.updateDashboardStats();
    }

    updateRealTimeData() {
        // Simulate real-time data updates
        const realtimeChart = this.charts.get('realtime-monitoring');
        if (realtimeChart) {
            const now = new Date();
            const newTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const newViolations = Math.floor(Math.random() * 15) + 5;
            const newPeopleCount = Math.floor(Math.random() * 50) + 100;

            // Add new data point
            realtimeChart.data.labels.push(newTime);
            realtimeChart.data.datasets[0].data.push(newViolations);
            realtimeChart.data.datasets[1].data.push(newPeopleCount);

            // Keep only last 24 points
            if (realtimeChart.data.labels.length > 24) {
                realtimeChart.data.labels.shift();
                realtimeChart.data.datasets[0].data.shift();
                realtimeChart.data.datasets[1].data.shift();
            }

            realtimeChart.update('none');
        }

        // Update zone heatmap with new violation data
        this.updateZoneData();
    }

    updateZoneData() {
        const zoneData = this.realTimeData.get('zoneViolations');
        Object.keys(zoneData).forEach(zone => {
            const variation = (Math.random() - 0.5) * 10;
            zoneData[zone].violations = Math.max(0, Math.round(zoneData[zone].violations + variation));
            
            // Update risk level based on violations
            if (zoneData[zone].violations > 60) zoneData[zone].riskLevel = 'critical';
            else if (zoneData[zone].violations > 40) zoneData[zone].riskLevel = 'high';
            else if (zoneData[zone].violations > 20) zoneData[zone].riskLevel = 'medium';
            else zoneData[zone].riskLevel = 'low';
        });

        // Update heatmap chart
        const heatmapChart = this.charts.get('zone-heatmap');
        if (heatmapChart) {
            const newData = Object.entries(zoneData).map(([zone, data], index) => ({
                x: index % 3,
                y: Math.floor(index / 3),
                v: data.violations,
                zone: zone,
                riskLevel: data.riskLevel,
                avgDistance: data.avgDistance,
                peopleFlow: data.peopleFlow
            }));
            
            heatmapChart.data.datasets[0].data = newData;
            heatmapChart.update('none');
        }
    }

    updateDashboardStats() {
        const performance = this.realTimeData.get('systemPerformance');
        const zoneData = this.realTimeData.get('zoneViolations');
        const violationTypes = this.realTimeData.get('violationTypes');

        // Update total violations
        const totalViolations = Object.values(zoneData).reduce((sum, zone) => sum + zone.violations, 0);
        const violationsElement = document.getElementById('total-violations');
        if (violationsElement) {
            this.animateNumber(violationsElement, parseInt(violationsElement.textContent) || 0, totalViolations);
        }

        // Update active cameras
        const camerasElement = document.getElementById('active-cameras');
        if (camerasElement) {
            this.animateNumber(camerasElement, parseInt(camerasElement.textContent) || 0, performance.camerasOnline);
        }

        // Update people detected
        const peopleElement = document.getElementById('people-detected');
        if (peopleElement) {
            const totalPeople = Object.values(zoneData).reduce((sum, zone) => sum + zone.peopleFlow, 0);
            this.animateNumber(peopleElement, parseInt(peopleElement.textContent) || 0, Math.round(totalPeople / 10));
        }

        // Update compliance rate
        const complianceElement = document.getElementById('compliance-rate');
        if (complianceElement) {
            const avgCompliance = this.calculateOverallCompliance();
            this.animateNumber(complianceElement, parseInt(complianceElement.textContent) || 0, avgCompliance, '%');
        }
    }

    calculateOverallCompliance() {
        const weeklyData = this.realTimeData.get('weeklyTrends');
        const avgCompliance = weeklyData.compliance.reduce((sum, val) => sum + val, 0) / weeklyData.compliance.length;
        return Math.round(avgCompliance);
    }

    animateNumber(element, start, end, suffix = '') {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + (end - start) * this.easeOutQuart(progress));
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    initializeInteractiveElements() {
        // Add click handlers for chart interactions
        this.setupChartClickHandlers();
        
        // Add hover effects for cards
        this.setupCardHoverEffects();
        
        // Add real-time status indicators
        this.setupStatusIndicators();
    }

    setupChartClickHandlers() {
        // Add click handlers for drilling down into chart data
        this.charts.forEach((chart, key) => {
            if (chart.canvas) {
                chart.canvas.addEventListener('click', (event) => {
                    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                    if (points.length) {
                        this.handleChartClick(key, points[0], chart);
                    }
                });
            }
        });
    }

    handleChartClick(chartKey, point, chart) {
        const dataIndex = point.index;
        const datasetIndex = point.datasetIndex;
        
        switch (chartKey) {
            case 'zone-heatmap':
                const zoneData = chart.data.datasets[datasetIndex].data[dataIndex];
                this.showZoneDetails(zoneData);
                break;
            case 'distance-analytics':
                const distanceRange = chart.data.labels[dataIndex];
                this.showDistanceDetails(distanceRange, dataIndex);
                break;
            case 'violation-types':
                const violationType = chart.data.labels[dataIndex];
                this.showViolationTypeDetails(violationType);
                break;
        }
    }

    showZoneDetails(zoneData) {
        if (window.showNotification) {
            showNotification(
                `Zone: ${zoneData.zone.toUpperCase()}\nViolations: ${zoneData.v}\nRisk: ${zoneData.riskLevel.toUpperCase()}\nAvg Distance: ${zoneData.avgDistance}ft`,
                'info'
            );
        }
    }

    showDistanceDetails(range, index) {
        const distanceData = this.realTimeData.get('distanceDistribution');
        const frequency = distanceData.frequencies[index];
        const risk = distanceData.riskScores[index];
        
        if (window.showNotification) {
            showNotification(
                `Distance Range: ${range}\nFrequency: ${frequency} interactions\nRisk Score: ${risk}/100`,
                risk > 70 ? 'warning' : 'info'
            );
        }
    }

    showViolationTypeDetails(violationType) {
        const violationTypes = this.realTimeData.get('violationTypes');
        const typeKey = Object.keys(violationTypes).find(key =>
            key.replace('-', ' ').toUpperCase() === violationType
        );
        
        if (typeKey && window.showNotification) {
            const data = violationTypes[typeKey];
            showNotification(
                `${violationType}\nCount: ${data.count}\nSeverity: ${data.severity.toUpperCase()}\nTrend: ${data.trend}`,
                data.severity === 'critical' ? 'error' : data.severity === 'high' ? 'warning' : 'info'
            );
        }
    }

    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.stat-card, .card, .analytics-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            });
        });
    }

    setupStatusIndicators() {
        // Add real-time status indicators
        this.createStatusIndicator('system-status', 'System Status', 'online');
        this.createStatusIndicator('detection-status', 'AI Detection', 'active');
        this.createStatusIndicator('alert-status', 'Alert System', 'monitoring');
    }

    createStatusIndicator(id, label, status) {
        const indicator = document.createElement('div');
        indicator.id = id;
        indicator.className = 'status-indicator';
        indicator.innerHTML = `
            <div class="status-dot ${status}"></div>
            <span class="status-label">${label}</span>
            <span class="status-text">${status.toUpperCase()}</span>
        `;
        
        // Add to top navigation if it exists
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            navRight.insertBefore(indicator, navRight.firstChild);
        }
    }

    setupAdvancedAnimations() {
        // Add staggered animations for chart loading
        this.charts.forEach((chart, index) => {
            setTimeout(() => {
                if (chart.canvas) {
                    chart.canvas.style.opacity = '0';
                    chart.canvas.style.transform = 'translateY(20px)';
                    chart.canvas.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    setTimeout(() => {
                        chart.canvas.style.opacity = '1';
                        chart.canvas.style.transform = 'translateY(0)';
                    }, 100);
                }
            }, index * 200);
        });
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    exportDashboardData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            realTimeData: Object.fromEntries(this.realTimeData),
            systemPerformance: this.realTimeData.get('systemPerformance'),
            charts: Array.from(this.charts.keys())
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `proxisafe-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showNotification) {
            showNotification('Dashboard data exported successfully', 'success');
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        
        this.charts.clear();
        this.realTimeData.clear();
    }
}

// Initialize industry dashboard when DOM is loaded and Chart.js is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js to load
    const initDashboard = () => {
        if (typeof Chart !== 'undefined') {
            // Destroy existing charts first to prevent conflicts
            if (window.industryDashboard) {
                window.industryDashboard.destroy();
            }
            
            // Create new dashboard instance
            window.industryDashboard = new IndustryDashboard();
            
            // Make it available globally for compatibility
            if (!window.chartsManager) {
                window.chartsManager = window.industryDashboard;
            }
            
            console.log('Industry dashboard initialized successfully');
        } else {
            // Retry after a short delay if Chart.js isn't loaded yet
            setTimeout(initDashboard, 500);
        }
    };
    
    // Start initialization
    initDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndustryDashboard;
}