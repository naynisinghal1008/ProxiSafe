// Enhanced Charts and Data Visualization Module
class ChartsManager {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6',
            pink: '#ec4899',
            indigo: '#6366f1',
            teal: '#14b8a6'
        };
        this.currentPeriod = '24h';
    }

    init() {
        this.createViolationsChart();
        this.createComplianceChart();
        this.initAnalyticsCharts();
    }

    initAnalyticsCharts() {
        this.createHourlyViolationsChart();
        this.createWeeklyTrendsChart();
        this.createLocationViolationsChart();
        this.createViolationTypesChart();
        this.updateComplianceScore();
    }

    createViolationsChart() {
        const canvas = document.getElementById('violations-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateViolationsData(this.currentPeriod);

        this.drawLineChart(ctx, data, {
            title: 'Violations Over Time',
            color: this.chartColors.danger,
            fillColor: this.chartColors.danger + '20',
            showGrid: true,
            showPoints: true
        });

        this.charts['violations'] = { canvas, data };
    }

    createComplianceChart() {
        const canvas = document.getElementById('compliance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateComplianceData();

        this.drawLineChart(ctx, data, {
            title: 'Compliance Rate',
            color: this.chartColors.success,
            fillColor: this.chartColors.success + '20',
            showGrid: true,
            showPoints: true,
            yAxisSuffix: '%'
        });

        this.charts['compliance'] = { canvas, data };
    }

    createHourlyViolationsChart() {
        const canvas = document.getElementById('hourly-violations-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateHourlyData();

        this.drawBarChart(ctx, data, {
            title: 'Hourly Violations',
            color: this.chartColors.primary,
            showGrid: true
        });

        this.charts['hourly'] = { canvas, data };
    }

    createWeeklyTrendsChart() {
        const canvas = document.getElementById('weekly-trends-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateWeeklyTrendsData();

        this.drawMultiLineChart(ctx, data, {
            title: 'Weekly Trends',
            colors: [this.chartColors.primary, this.chartColors.success, this.chartColors.warning],
            showGrid: true,
            showLegend: true
        });

        this.charts['weekly'] = { canvas, data };
    }

    createLocationViolationsChart() {
        const canvas = document.getElementById('location-violations-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateLocationData();

        this.drawBarChart(ctx, data, {
            title: 'Violations by Location',
            color: this.chartColors.info,
            horizontal: true,
            showGrid: true
        });

        this.charts['location'] = { canvas, data };
    }

    createViolationTypesChart() {
        const canvas = document.getElementById('violation-types-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateViolationTypesData();

        this.drawDonutChart(ctx, data, {
            title: 'Violation Types',
            colors: [
                this.chartColors.danger,
                this.chartColors.warning,
                this.chartColors.info,
                this.chartColors.purple,
                this.chartColors.pink
            ],
            showLegend: true
        });

        this.charts['types'] = { canvas, data };
    }

    generateViolationsData(period = '24h') {
        const data = [];
        let points, timeUnit;

        switch (period) {
            case '24h':
                points = 24;
                timeUnit = 'hour';
                break;
            case '7d':
                points = 7;
                timeUnit = 'day';
                break;
            case '30d':
                points = 30;
                timeUnit = 'day';
                break;
            default:
                points = 24;
                timeUnit = 'hour';
        }

        for (let i = points - 1; i >= 0; i--) {
            const date = new Date();
            if (timeUnit === 'hour') {
                date.setHours(date.getHours() - i);
                data.push({
                    label: date.getHours() + ':00',
                    value: Math.floor(Math.random() * 15) + 2
                });
            } else {
                date.setDate(date.getDate() - i);
                data.push({
                    label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    value: Math.floor(Math.random() * 25) + 5
                });
            }
        }

        return data;
    }

    generateComplianceData() {
        const data = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: Math.floor(Math.random() * 20) + 75
            });
        }
        
        return data;
    }

    generateHourlyData() {
        const data = [];
        const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
        
        hours.forEach(hour => {
            data.push({
                label: hour,
                value: Math.floor(Math.random() * 20) + 3
            });
        });
        
        return data;
    }

    generateWeeklyTrendsData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const datasets = [
            { name: 'Violations', data: [] },
            { name: 'Compliance', data: [] },
            { name: 'Alerts', data: [] }
        ];

        days.forEach(day => {
            datasets[0].data.push({
                label: day,
                value: Math.floor(Math.random() * 25) + 10
            });
            datasets[1].data.push({
                label: day,
                value: Math.floor(Math.random() * 15) + 80
            });
            datasets[2].data.push({
                label: day,
                value: Math.floor(Math.random() * 10) + 5
            });
        });

        return datasets;
    }

    generateLocationData() {
        const locations = [
            'Mall Entrance',
            'Food Court',
            'Parking Area',
            'Elevator Zone',
            'Shopping Area',
            'Restroom Area'
        ];

        return locations.map(location => ({
            label: location,
            value: Math.floor(Math.random() * 30) + 5
        }));
    }

    generateViolationTypesData() {
        return [
            { label: 'Social Distancing', value: 45 },
            { label: 'Mask Violation', value: 25 },
            { label: 'Crowd Formation', value: 15 },
            { label: 'Queue Violation', value: 10 },
            { label: 'Other', value: 5 }
        ];
    }

    drawLineChart(ctx, data, options = {}) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const chartWidth = canvas.offsetWidth - 80;
        const chartHeight = canvas.offsetHeight - 80;
        const startX = 60;
        const startY = 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Set styles
        ctx.font = '12px Inter, sans-serif';
        ctx.strokeStyle = options.color || this.chartColors.primary;
        ctx.fillStyle = options.fillColor || this.chartColors.primary + '20';
        ctx.lineWidth = 3;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value));
        const stepX = chartWidth / (data.length - 1);
        const stepY = chartHeight / maxValue;

        // Draw grid lines
        if (options.showGrid) {
            this.drawGrid(ctx, startX, startY, chartWidth, chartHeight);
        }

        // Draw data line
        ctx.strokeStyle = options.color || this.chartColors.primary;
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = startX + stepX * index;
            const y = startY + chartHeight - (point.value * stepY);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw fill area
        if (options.fillColor) {
            ctx.fillStyle = options.fillColor;
            ctx.beginPath();
            
            data.forEach((point, index) => {
                const x = startX + stepX * index;
                const y = startY + chartHeight - (point.value * stepY);
                
                if (index === 0) {
                    ctx.moveTo(x, startY + chartHeight);
                    ctx.lineTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.lineTo(startX + stepX * (data.length - 1), startY + chartHeight);
            ctx.closePath();
            ctx.fill();
        }

        // Draw data points
        if (options.showPoints) {
            ctx.fillStyle = options.color || this.chartColors.primary;
            data.forEach((point, index) => {
                const x = startX + stepX * index;
                const y = startY + chartHeight - (point.value * stepY);
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw labels
        this.drawLabels(ctx, data, startX, startY, chartWidth, chartHeight, stepX, maxValue, options);
    }

    drawBarChart(ctx, data, options = {}) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const chartWidth = canvas.offsetWidth - 120;
        const chartHeight = canvas.offsetHeight - 80;
        const startX = options.horizontal ? 100 : 60;
        const startY = 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        const maxValue = Math.max(...data.map(d => d.value));

        if (options.horizontal) {
            this.drawHorizontalBars(ctx, data, startX, startY, chartWidth, chartHeight, maxValue, options);
        } else {
            this.drawVerticalBars(ctx, data, startX, startY, chartWidth, chartHeight, maxValue, options);
        }
    }

    drawVerticalBars(ctx, data, startX, startY, chartWidth, chartHeight, maxValue, options) {
        const barWidth = chartWidth / data.length * 0.6;
        const barSpacing = chartWidth / data.length;

        // Draw grid
        if (options.showGrid) {
            this.drawGrid(ctx, startX, startY, chartWidth, chartHeight);
        }

        // Draw bars
        ctx.fillStyle = options.color || this.chartColors.primary;
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = startX + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = startY + chartHeight - barHeight;

            // Add gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, options.color || this.chartColors.primary);
            gradient.addColorStop(1, (options.color || this.chartColors.primary) + '80');
            ctx.fillStyle = gradient;

            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value on top
            ctx.fillStyle = '#374151';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
        });

        // Draw x-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        data.forEach((item, index) => {
            const x = startX + index * barSpacing + barSpacing / 2;
            ctx.fillText(item.label, x, startY + chartHeight + 20);
        });

        // Draw y-axis labels
        this.drawYAxisLabels(ctx, startX, startY, chartHeight, maxValue);
    }

    drawHorizontalBars(ctx, data, startX, startY, chartWidth, chartHeight, maxValue, options) {
        const barHeight = chartHeight / data.length * 0.6;
        const barSpacing = chartHeight / data.length;

        // Draw bars
        ctx.fillStyle = options.color || this.chartColors.primary;
        data.forEach((item, index) => {
            const barWidth = (item.value / maxValue) * chartWidth;
            const x = startX;
            const y = startY + index * barSpacing + (barSpacing - barHeight) / 2;

            // Add gradient
            const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
            gradient.addColorStop(0, options.color || this.chartColors.primary);
            gradient.addColorStop(1, (options.color || this.chartColors.primary) + '80');
            ctx.fillStyle = gradient;

            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value at end
            ctx.fillStyle = '#374151';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.value.toString(), x + barWidth + 5, y + barHeight / 2 + 4);
        });

        // Draw y-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'right';
        data.forEach((item, index) => {
            const y = startY + index * barSpacing + barSpacing / 2 + 4;
            ctx.fillText(item.label, startX - 10, y);
        });
    }

    drawMultiLineChart(ctx, datasets, options = {}) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const chartWidth = canvas.offsetWidth - 80;
        const chartHeight = canvas.offsetHeight - 100;
        const startX = 60;
        const startY = 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Find max value across all datasets
        const maxValue = Math.max(...datasets.flatMap(dataset => dataset.data.map(d => d.value)));
        const stepX = chartWidth / (datasets[0].data.length - 1);
        const stepY = chartHeight / maxValue;

        // Draw grid
        if (options.showGrid) {
            this.drawGrid(ctx, startX, startY, chartWidth, chartHeight);
        }

        // Draw each dataset
        datasets.forEach((dataset, datasetIndex) => {
            const color = options.colors[datasetIndex] || this.chartColors.primary;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            dataset.data.forEach((point, index) => {
                const x = startX + stepX * index;
                const y = startY + chartHeight - (point.value * stepY);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            ctx.fillStyle = color;
            dataset.data.forEach((point, index) => {
                const x = startX + stepX * index;
                const y = startY + chartHeight - (point.value * stepY);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Draw legend
        if (options.showLegend) {
            this.drawLegend(ctx, datasets, options.colors, startX, startY + chartHeight + 40);
        }

        // Draw labels
        this.drawLabels(ctx, datasets[0].data, startX, startY, chartWidth, chartHeight, stepX, maxValue, options);
    }

    drawDonutChart(ctx, data, options = {}) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        const radius = Math.min(centerX, centerY) - 60;
        const innerRadius = radius * 0.6;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const color = options.colors[index] || this.getColorByIndex(index);

            // Draw slice
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fill();

            // Draw percentage in the middle of slice
            const midAngle = currentAngle + sliceAngle / 2;
            const textRadius = (radius + innerRadius) / 2;
            const textX = centerX + Math.cos(midAngle) * textRadius;
            const textY = centerY + Math.sin(midAngle) * textRadius;

            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round((item.value / total) * 100)}%`, textX, textY);

            currentAngle += sliceAngle;
        });

        // Draw center text
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Total', centerX, centerY - 5);
        ctx.fillText(total.toString(), centerX, centerY + 15);

        // Draw legend
        if (options.showLegend) {
            this.drawDonutLegend(ctx, data, options.colors, 20, 20);
        }
    }

    drawGrid(ctx, startX, startY, chartWidth, chartHeight) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = startY + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + chartWidth, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let i = 0; i <= 6; i++) {
            const x = startX + (chartWidth / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + chartHeight);
            ctx.stroke();
        }
    }

    drawLabels(ctx, data, startX, startY, chartWidth, chartHeight, stepX, maxValue, options) {
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        
        // X-axis labels
        data.forEach((point, index) => {
            const x = startX + stepX * index;
            ctx.fillText(point.label, x, startY + chartHeight + 20);
        });

        // Y-axis labels
        this.drawYAxisLabels(ctx, startX, startY, chartHeight, maxValue, options.yAxisSuffix);
    }

    drawYAxisLabels(ctx, startX, startY, chartHeight, maxValue, suffix = '') {
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue / 5) * (5 - i));
            const y = startY + (chartHeight / 5) * i + 4;
            ctx.fillText(value.toString() + suffix, startX - 10, y);
        }
    }

    drawLegend(ctx, datasets, colors, startX, startY) {
        ctx.font = '12px Inter, sans-serif';
        
        datasets.forEach((dataset, index) => {
            const x = startX + index * 100;
            const color = colors[index] || this.chartColors.primary;
            
            // Draw color box
            ctx.fillStyle = color;
            ctx.fillRect(x, startY, 12, 12);
            
            // Draw text
            ctx.fillStyle = '#374151';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.name, x + 16, startY + 9);
        });
    }

    drawDonutLegend(ctx, data, colors, startX, startY) {
        ctx.font = '12px Inter, sans-serif';
        
        data.forEach((item, index) => {
            const y = startY + index * 20;
            const color = colors[index] || this.getColorByIndex(index);
            
            // Draw color box
            ctx.fillStyle = color;
            ctx.fillRect(startX, y, 12, 12);
            
            // Draw text
            ctx.fillStyle = '#374151';
            ctx.textAlign = 'left';
            ctx.fillText(`${item.label} (${item.value})`, startX + 16, y + 9);
        });
    }

    updateComplianceScore() {
        const scoreElement = document.getElementById('compliance-score');
        if (!scoreElement) return;

        const percentage = 75 + Math.floor(Math.random() * 20);
        const circle = scoreElement.querySelector('.score-progress');
        const text = scoreElement.querySelector('.score-percentage');
        
        if (circle && text) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (percentage / 100) * circumference;
            
            circle.style.strokeDashoffset = offset;
            text.textContent = percentage + '%';
        }
    }

    updateChartsForPeriod(period) {
        this.currentPeriod = period;
        this.createViolationsChart();
    }

    getColorByIndex(index) {
        const colors = [
            this.chartColors.primary,
            this.chartColors.success,
            this.chartColors.warning,
            this.chartColors.danger,
            this.chartColors.info,
            this.chartColors.secondary,
            this.chartColors.purple,
            this.chartColors.pink,
            this.chartColors.indigo,
            this.chartColors.teal
        ];
        return colors[index % colors.length];
    }

    updateCharts() {
        // Refresh all charts with new data
        Object.keys(this.charts).forEach(chartKey => {
            const chart = this.charts[chartKey];
            if (chart && chart.canvas) {
                // Regenerate data and redraw
                switch (chartKey) {
                    case 'violations':
                        this.createViolationsChart();
                        break;
                    case 'compliance':
                        this.createComplianceChart();
                        break;
                    case 'hourly':
                        this.createHourlyViolationsChart();
                        break;
                    case 'weekly':
                        this.createWeeklyTrendsChart();
                        break;
                    case 'location':
                        this.createLocationViolationsChart();
                        break;
                    case 'types':
                        this.createViolationTypesChart();
                        break;
                }
            }
        });
    }

    exportChart(chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    // Real-time chart updates
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateCharts();
        }, 60000); // Update every minute
    }

    // Responsive chart resizing
    handleResize() {
        setTimeout(() => {
            this.updateCharts();
        }, 300);
    }
}

// Initialize charts manager
const chartsManager = new ChartsManager();

// Make charts manager globally available
window.chartsManager = chartsManager;

// Handle window resize
window.addEventListener('resize', () => {
    if (window.chartsManager) {
        window.chartsManager.handleResize();
    }
});