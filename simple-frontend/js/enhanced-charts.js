class EnhancedChartManager {
    constructor() {
        this.charts = new Map();
        this.chartData = new Map();
        this.animationDuration = 1000;
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        };
        this.gradients = new Map();
        this.realTimeInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateMockData();
        this.createAllCharts();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Chart period change handlers
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('chart-period')) {
                this.updateChartPeriod(e.target.value, e.target.dataset.chart);
            }
        });

        // Chart type toggle handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-type-btn')) {
                this.toggleChartType(e.target.dataset.chart, e.target.dataset.type);
            }
        });

        // Theme change handler
        document.addEventListener('themeChanged', () => {
            this.updateChartsForTheme();
        });

        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.resizeAllCharts();
        }, 250));
    }

    generateMockData() {
        // Distance analytics data
        this.chartData.set('distance-analytics', {
            labels: ['< 1m', '1-2m', '2-3m', '3-4m', '4-5m', '> 5m'],
            datasets: [{
                label: 'Frequency',
                data: [45, 78, 123, 89, 34, 12],
                backgroundColor: this.colors.info,
                borderColor: this.colors.primary,
                borderWidth: 2
            }]
        });

        // Risk assessment data
        this.chartData.set('risk-assessment', {
            labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
            datasets: [{
                data: [45, 30, 20, 5],
                backgroundColor: [
                    this.colors.success,
                    this.colors.warning,
                    this.colors.danger,
                    '#8b0000'
                ],
                borderWidth: 0
            }]
        });

        // Performance metrics data
        this.chartData.set('performance-metrics', {
            labels: ['Detection Rate', 'False Positives', 'Response Time', 'Accuracy'],
            datasets: [{
                label: 'Current',
                data: [95, 8, 85, 92],
                backgroundColor: this.colors.primary + '40',
                borderColor: this.colors.primary,
                borderWidth: 2
            }, {
                label: 'Target',
                data: [98, 5, 90, 95],
                backgroundColor: this.colors.success + '40',
                borderColor: this.colors.success,
                borderWidth: 2
            }]
        });

        // Predictive analytics data
        this.chartData.set('predictive-analytics', {
            labels: this.generateFutureDates(14),
            datasets: [{
                label: 'Predicted Violations',
                data: this.generatePredictiveData(14),
                borderColor: this.colors.warning,
                backgroundColor: this.colors.warning + '20',
                tension: 0.4,
                fill: true,
                borderDash: [5, 5]
            }]
        });

        // Real-time monitoring data
        this.chartData.set('realtime-monitoring', {
            labels: this.generateTimeLabels(20),
            datasets: [{
                label: 'Active Violations',
                data: this.generateRealtimeData(20),
                borderColor: this.colors.danger,
                backgroundColor: this.colors.danger + '20',
                tension: 0.4,
                fill: true
            }]
        });

        // Heatmap data for zone analysis
        this.chartData.set('zone-heatmap', {
            datasets: [{
                label: 'Zone Activity',
                data: this.generateHeatmapData(),
                backgroundColor: function(context) {
                    const value = context.parsed.v;
                    const alpha = Math.min(value / 100, 1);
                    return `rgba(239, 68, 68, ${alpha})`;
                }
            }]
        });

        // Trend analysis data
        this.chartData.set('trend-analysis', {
            labels: this.generateWeeklyLabels(12),
            datasets: [{
                label: 'Weekly Violations',
                data: this.generateTrendData(12),
                borderColor: this.colors.primary,
                backgroundColor: this.colors.primary + '20',
                tension: 0.4,
                fill: true
            }, {
                label: 'Moving Average',
                data: this.generateMovingAverage(12),
                borderColor: this.colors.secondary,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4
            }]
        });
    }

    generateFutureDates(days) {
        const labels = [];
        const now = new Date();

        for (let i = 1; i <= days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        return labels;
    }

    generatePredictiveData(days) {
        const data = [];
        let baseValue = 25;

        for (let i = 0; i < days; i++) {
            baseValue += (Math.random() - 0.5) * 5;
            baseValue = Math.max(0, Math.min(50, baseValue));
            data.push(Math.round(baseValue));
        }

        return data;
    }

    generateTimeLabels(count) {
        const labels = [];
        const now = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
            labels.push(time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
        }

        return labels;
    }

    generateRealtimeData(count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * 10));
        }
        return data;
    }

    generateHeatmapData() {
        const data = [];
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                data.push({
                    x: x,
                    y: y,
                    v: Math.floor(Math.random() * 100)
                });
            }
        }
        return data;
    }

    generateWeeklyLabels(weeks) {
        const labels = [];
        const now = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 7);
            labels.push(`Week ${weeks - i}`);
        }

        return labels;
    }

    generateTrendData(weeks) {
        const data = [];
        let baseValue = 100;

        for (let i = 0; i < weeks; i++) {
            baseValue += (Math.random() - 0.5) * 20;
            baseValue = Math.max(50, Math.min(200, baseValue));
            data.push(Math.round(baseValue));
        }

        return data;
    }

    generateMovingAverage(weeks) {
        const trendData = this.chartData.get('trend-analysis')?.datasets[0]?.data || this.generateTrendData(weeks);
        const movingAvg = [];
        const window = 3;

        for (let i = 0; i < trendData.length; i++) {
            if (i < window - 1) {
                movingAvg.push(null);
            } else {
                const sum = trendData.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
                movingAvg.push(Math.round(sum / window));
            }
        }

        return movingAvg;
    }

    createAllCharts() {
        this.createDistanceAnalyticsChart();
        this.createRiskAssessmentChart();
        this.createPerformanceMetricsChart();
        this.createPredictiveAnalyticsChart();
        this.createRealtimeMonitoringChart();
        this.createZoneHeatmapChart();
        this.createTrendAnalysisChart();
    }

    createDistanceAnalyticsChart() {
        const canvas = document.getElementById('distance-analytics-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('distance-analytics');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distance Distribution Analysis',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return `Frequency: ${context.parsed.y} violations`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Distance Range',
                            color: '#6b7280'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('distance-analytics', chart);
    }

    createRiskAssessmentChart() {
        const canvas = document.getElementById('risk-assessment-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('risk-assessment');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk Assessment Distribution',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#6b7280'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('risk-assessment', chart);
    }

    createPerformanceMetricsChart() {
        const canvas = document.getElementById('performance-metrics-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('performance-metrics');

        const chart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Metrics Comparison',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#6b7280'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#f3f4f6'
                        },
                        pointLabels: {
                            color: '#6b7280'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('performance-metrics', chart);
    }

    createPredictiveAnalyticsChart() {
        const canvas = document.getElementById('predictive-analytics-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('predictive-analytics');

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Predictive Analytics - Next 14 Days',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#6b7280'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Predicted Violations',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('predictive-analytics', chart);
    }

    createRealtimeMonitoringChart() {
        const canvas = document.getElementById('realtime-monitoring-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('realtime-monitoring');

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-time Violation Monitoring',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#6b7280'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Active Violations',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: 500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('realtime-monitoring', chart);
    }

    createZoneHeatmapChart() {
        const canvas = document.getElementById('zone-heatmap-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('zone-heatmap');

        const chart = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Zone Activity Heatmap',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return `Zone (${context.parsed.x}, ${context.parsed.y}): ${context.parsed.v} violations`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Zone X',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Zone Y',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('zone-heatmap', chart);
    }

    createTrendAnalysisChart() {
        const canvas = document.getElementById('trend-analysis-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.chartData.get('trend-analysis');

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trend Analysis - 12 Week Overview',
                        color: '#374151',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#6b7280'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time Period',
                            color: '#6b7280'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Violations',
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('trend-analysis', chart);
    }

    startRealTimeUpdates() {
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 5000); // Update every 5 seconds
    }

    updateRealTimeData() {
        const realtimeChart = this.charts.get('realtime-monitoring');
        if (realtimeChart) {
            // Add new data point
            const newValue = Math.floor(Math.random() * 10);
            const newTime = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            realtimeChart.data.labels.push(newTime);
            realtimeChart.data.datasets[0].data.push(newValue);

            // Keep only last 20 data points
            if (realtimeChart.data.labels.length > 20) {
                realtimeChart.data.labels.shift();
                realtimeChart.data.datasets[0].data.shift();
            }

            realtimeChart.update('none');
        }
    }

    updateChartsForTheme() {
        this.charts.forEach((chart) => {
            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(scaleId => {
                    const scale = chart.options.scales[scaleId];
                    if (scale.grid) {
                        scale.grid.color = getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-border').trim();
                    }
                    if (scale.ticks) {
                        scale.ticks.color = getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-secondary').trim();
                    }
                });
            }
            chart.update('none');
        });
    }

    resizeAllCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateCharts() {
        // Method for compatibility with existing app.js calls
        this.charts.forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
        this.chartData.clear();
    }
}

// Initialize enhanced chart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart !== 'undefined') {
        window.enhancedChartManager = new EnhancedChartManager();
        
        // Also make it available as chartsManager for compatibility
        if (!window.chartsManager) {
            window.chartsManager = window.enhancedChartManager;
        }
    }
});