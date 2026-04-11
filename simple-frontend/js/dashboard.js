// Enhanced Dashboard Manager with Advanced Analytics
class DashboardManager {
    constructor() {
        this.currentSection = 'overview';
        this.stats = {
            totalViolations: 0,
            activeCameras: 0,
            peopleDetected: 0,
            complianceRate: 0
        };
        this.violations = [];
        this.cameras = [];
        this.users = [];
        this.reports = [];
        this.currentViolation = null;
        this.isInitialized = false;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            status: 'all',
            type: 'all',
            location: 'all',
            dateFrom: '',
            dateTo: ''
        };
        
        // Initialize analytics engine safely
        this.analyticsEngine = null;
        this.advancedMetrics = {};
        this.realTimeData = {
            lastUpdate: new Date(),
            updateInterval: 30000, // 30 seconds
            isLive: true
        };
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize analytics engine safely
            if (window.AnalyticsEngine) {
                this.analyticsEngine = new AnalyticsEngine();
            }
            
            this.bindEvents();
            this.loadMockData();
            
            // Only calculate advanced metrics if analytics engine is available
            if (this.analyticsEngine) {
                this.calculateAdvancedMetrics();
                this.createAdvancedDashboardElements();
            }
            
            this.startRealTimeUpdates();
            this.updateUserInfo();
            this.initializeFilters();
            this.isInitialized = true;
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            // Continue with basic functionality
            this.bindEvents();
            this.loadMockData();
            this.startRealTimeUpdates();
            this.updateUserInfo();
            this.initializeFilters();
            this.isInitialized = true;
        }
    }

    bindEvents() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter events
        this.bindFilterEvents();

        // Chart period change
        const chartPeriod = document.querySelector('.chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => this.updateChartsForPeriod(e.target.value));
        }
    }

    bindFilterEvents() {
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');
        const locationFilter = document.getElementById('location-filter');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
            });
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.filters.location = e.target.value;
                this.applyFilters();
            });
        }

        if (dateFrom) {
            dateFrom.addEventListener('change', (e) => {
                this.filters.dateFrom = e.target.value;
                this.applyFilters();
            });
        }

        if (dateTo) {
            dateTo.addEventListener('change', (e) => {
                this.filters.dateTo = e.target.value;
                this.applyFilters();
            });
        }
    }

    loadMockData() {
        // Generate mock statistics
        this.stats = {
            totalViolations: Math.floor(Math.random() * 50) + 20,
            activeCameras: Math.floor(Math.random() * 10) + 15,
            peopleDetected: Math.floor(Math.random() * 200) + 100,
            complianceRate: Math.floor(Math.random() * 30) + 70
        };

        // Generate mock violations
        this.violations = this.generateMockViolations(50);

        // Generate mock cameras
        this.cameras = this.generateMockCameras(25);

        // Generate mock users
        this.users = this.generateMockUsers(10);

        // Generate mock reports
        this.reports = this.generateMockReports(15);

        // Update UI
        this.updateStats();
        this.updateViolationsList();
        this.updateCameraStatus();
        this.updateViolationsTable();
        this.updateCamerasGrid();
        this.updateUsersList();
        this.updateReportsList();
        this.updateAdvancedMetrics();
    }

    generateMockViolations(count) {
        const violations = [];
        const locations = ['Mall Entrance', 'Food Court', 'Parking Area', 'Elevator Zone', 'Shopping Area', 'Restroom Area', 'Security Desk'];
        const types = ['Social Distancing', 'Mask Violation', 'Crowd Formation', 'Queue Violation', 'Capacity Exceeded'];
        const severities = ['high', 'medium', 'low'];
        const statuses = ['active', 'resolved', 'investigating'];
        
        for (let i = 0; i < count; i++) {
            const violation = {
                id: `VIO-2024-${String(i + 1).padStart(3, '0')}`,
                type: types[Math.floor(Math.random() * types.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                camera: `CAM-${String(Math.floor(Math.random() * 25) + 1).padStart(3, '0')}`,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                peopleCount: Math.floor(Math.random() * 8) + 2,
                distance: (Math.random() * 4 + 1).toFixed(1),
                duration: Math.floor(Math.random() * 120) + 15,
                confidence: Math.floor(Math.random() * 20) + 80,
                notes: ''
            };
            violations.push(violation);
        }

        return violations.sort((a, b) => b.timestamp - a.timestamp);
    }

    generateMockCameras(count) {
        const cameras = [];
        const locations = ['Mall Entrance', 'Food Court', 'Parking Area', 'Elevator Zone', 'Shopping Area', 'Restroom Area', 'Security Desk'];
        const statuses = ['online', 'offline', 'maintenance'];
        
        for (let i = 0; i < count; i++) {
            const camera = {
                id: `CAM-${String(i + 1).padStart(3, '0')}`,
                name: `Camera ${i + 1}`,
                location: locations[Math.floor(Math.random() * locations.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
                violationsToday: Math.floor(Math.random() * 10),
                resolution: '1920x1080',
                fps: 30
            };
            cameras.push(camera);
        }

        return cameras;
    }

    generateMockUsers(count) {
        const users = [];
        const departments = ['Security', 'Management', 'IT', 'Operations'];
        const roles = ['Administrator', 'Operator', 'Viewer'];
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Tom Anderson', 'Emily Taylor', 'Chris Martin', 'Anna Garcia'];
        
        for (let i = 0; i < count; i++) {
            const user = {
                id: i + 1,
                name: names[i] || `User ${i + 1}`,
                email: `user${i + 1}@proxisafe.com`,
                department: departments[Math.floor(Math.random() * departments.length)],
                role: roles[Math.floor(Math.random() * roles.length)],
                lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                status: Math.random() > 0.2 ? 'active' : 'inactive',
                avatar: null // Will use CSS-based professional avatar
            };
            users.push(user);
        }

        return users;
    }

    generateMockReports(count) {
        const reports = [];
        const types = ['Daily Report', 'Weekly Report', 'Monthly Report', 'Custom Report'];
        
        for (let i = 0; i < count; i++) {
            const report = {
                id: i + 1,
                name: `${types[Math.floor(Math.random() * types.length)]} - ${new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
                type: types[Math.floor(Math.random() * types.length)],
                generatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
                downloadUrl: '#'
            };
            reports.push(report);
        }

        return reports;
    }

    updateStats() {
        // Update stat cards with animation
        this.animateCounter('total-violations', this.stats.totalViolations);
        this.animateCounter('active-cameras', this.stats.activeCameras);
        this.animateCounter('people-detected', this.stats.peopleDetected);
        this.animateCounter('compliance-rate', this.stats.complianceRate, '%');
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateViolationsList() {
        const violationsList = document.getElementById('recent-violations');
        if (!violationsList) return;

        violationsList.innerHTML = '';

        this.violations.slice(0, 5).forEach(violation => {
            const violationElement = this.createViolationElement(violation);
            violationsList.appendChild(violationElement);
        });
    }

    createViolationElement(violation) {
        const div = document.createElement('div');
        div.className = 'violation-item';
        div.onclick = () => this.showViolationDetail(violation);
        
        const timeAgo = this.getTimeAgo(violation.timestamp);
        const statusClass = violation.status === 'active' ? 'active' : violation.status === 'resolved' ? 'resolved' : 'investigating';
        
        div.innerHTML = `
            <div class="violation-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="violation-details">
                <div class="violation-title">${violation.type} - ${violation.location}</div>
                <div class="violation-time">${timeAgo}</div>
            </div>
            <div class="violation-status ${statusClass}">
                ${violation.status}
            </div>
        `;

        return div;
    }

    updateCameraStatus() {
        const cameraStatus = document.getElementById('camera-status');
        if (!cameraStatus) return;

        cameraStatus.innerHTML = '';

        const onlineCameras = this.cameras.filter(c => c.status === 'online').length;
        const offlineCameras = this.cameras.filter(c => c.status === 'offline').length;
        const maintenanceCameras = this.cameras.filter(c => c.status === 'maintenance').length;

        const statusItems = [
            { label: 'Online', count: onlineCameras, class: 'online' },
            { label: 'Offline', count: offlineCameras, class: 'offline' },
            { label: 'Maintenance', count: maintenanceCameras, class: 'maintenance' }
        ];

        statusItems.forEach(item => {
            const div = document.createElement('div');
            div.className = `camera-status-item ${item.class}`;
            div.innerHTML = `
                <div style="font-weight: 600; font-size: 1.5rem;">${item.count}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">${item.label}</div>
            `;
            cameraStatus.appendChild(div);
        });
    }

    updateViolationsTable() {
        const tableBody = document.getElementById('violations-table-body');
        if (!tableBody) return;

        const filteredViolations = this.getFilteredViolations();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageViolations = filteredViolations.slice(startIndex, endIndex);

        tableBody.innerHTML = '';

        pageViolations.forEach(violation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${violation.id}</td>
                <td>${violation.type}</td>
                <td>${violation.location}</td>
                <td>${violation.timestamp.toLocaleString()}</td>
                <td><span class="severity-badge ${violation.severity}">${violation.severity}</span></td>
                <td><span class="status-badge ${violation.status}">${violation.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="window.dashboardManager.showViolationDetail('${violation.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.updatePagination(filteredViolations.length);
    }

    updateCamerasGrid() {
        const camerasGrid = document.getElementById('cameras-grid');
        if (!camerasGrid) return;

        camerasGrid.innerHTML = '';

        this.cameras.forEach(camera => {
            const div = document.createElement('div');
            div.className = 'camera-card';
            div.innerHTML = `
                <div class="camera-preview" onclick="openMLDemo()" style="cursor: pointer;">
                    <i class="fas fa-video" style="font-size: 2rem; color: #6b7280;"></i>
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">ML demo</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="font-weight: 600; color: #111827;">${camera.name}</h4>
                    <span class="status-badge ${camera.status}">${camera.status}</span>
                </div>
                <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">${camera.location}</div>
                <div style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.75rem;">
                    <div>Violations Today: ${camera.violationsToday}</div>
                    <div>Last Seen: ${this.getTimeAgo(camera.lastSeen)}</div>
                </div>
                <button type="button" class="btn btn-primary" style="width: 100%;" onclick="openMLDemo()">
                    <i class="fas fa-flask"></i> Explore ML demo
                </button>
            `;
            camerasGrid.appendChild(div);
        });
    }

    updateUsersList() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        usersList.innerHTML = '';

        this.users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar-small professional-avatar">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.role} - ${user.department}</p>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-secondary">Edit</button>
                    <button class="btn btn-danger">Remove</button>
                </div>
            `;
            usersList.appendChild(div);
        });
    }

    updateReportsList() {
        const reportsList = document.getElementById('reports-list');
        if (!reportsList) return;

        reportsList.innerHTML = '';

        this.reports.slice(0, 10).forEach(report => {
            const div = document.createElement('div');
            div.className = 'report-item';
            div.innerHTML = `
                <div class="report-info">
                    <h4>${report.name}</h4>
                    <p>Generated: ${report.generatedAt.toLocaleDateString()} • Size: ${report.size}</p>
                </div>
                <a href="${report.downloadUrl}" class="report-download">
                    <i class="fas fa-download"></i> Download
                </a>
            `;
            reportsList.appendChild(div);
        });
    }

    getFilteredViolations() {
        return this.violations.filter(violation => {
            if (this.filters.status !== 'all' && violation.status !== this.filters.status) return false;
            if (this.filters.type !== 'all' && violation.type.toLowerCase().replace(' ', '-') !== this.filters.type) return false;
            if (this.filters.location !== 'all' && violation.location.toLowerCase().replace(' ', '-') !== this.filters.location) return false;
            
            if (this.filters.dateFrom) {
                const fromDate = new Date(this.filters.dateFrom);
                if (violation.timestamp < fromDate) return false;
            }
            
            if (this.filters.dateTo) {
                const toDate = new Date(this.filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (violation.timestamp > toDate) return false;
            }
            
            return true;
        });
    }

    applyFilters() {
        this.currentPage = 1;
        this.updateViolationsTable();
    }

    updatePagination(totalItems) {
        const pagination = document.getElementById('violations-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.changePage(this.currentPage - 1);
        pagination.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = this.currentPage === i ? 'active' : '';
            pageBtn.onclick = () => this.changePage(i);
            pagination.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        pagination.appendChild(nextBtn);
    }

    changePage(page) {
        this.currentPage = page;
        this.updateViolationsTable();
    }

    initializeFilters() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (dateFrom) dateFrom.value = weekAgo.toISOString().split('T')[0];
        if (dateTo) dateTo.value = today.toISOString().split('T')[0];
    }

    showViolationDetail(violationId) {
        const violation = this.violations.find(v => v.id === violationId);
        if (!violation) return;

        this.currentViolation = violation;
        
        // Update modal content
        document.getElementById('detail-violation-id').textContent = violation.id;
        document.getElementById('detail-violation-type').textContent = violation.type;
        document.getElementById('detail-violation-location').textContent = violation.location;
        document.getElementById('detail-violation-camera').textContent = violation.camera;
        document.getElementById('detail-violation-time').textContent = violation.timestamp.toLocaleString();
        document.getElementById('detail-violation-severity').textContent = violation.severity;
        document.getElementById('detail-violation-severity').className = `severity-badge ${violation.severity}`;
        document.getElementById('detail-violation-status').textContent = violation.status;
        document.getElementById('detail-violation-status').className = `status-badge ${violation.status}`;
        document.getElementById('detail-people-count').textContent = violation.peopleCount;

        // Show modal
        const modal = document.getElementById('violation-detail-modal');
        modal.classList.add('show');
    }

    showUserProfile() {
        const modal = document.getElementById('user-profile-modal');
        modal.classList.add('show');
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);

        // Update violations list every 10 seconds
        setInterval(() => {
            this.addRandomViolation();
        }, 10000);
    }

    updateRealTimeData() {
        // Simulate small changes in statistics
        this.stats.totalViolations += Math.floor(Math.random() * 3);
        this.stats.peopleDetected += Math.floor(Math.random() * 10) - 5;
        this.stats.complianceRate += Math.floor(Math.random() * 6) - 3;
        
        // Keep compliance rate within reasonable bounds
        this.stats.complianceRate = Math.max(60, Math.min(95, this.stats.complianceRate));
        this.stats.peopleDetected = Math.max(50, this.stats.peopleDetected);

        this.updateStats();
    }

    addRandomViolation() {
        const newViolation = this.generateMockViolations(1)[0];
        this.violations.unshift(newViolation);
        
        // Keep only the latest 100 violations
        this.violations = this.violations.slice(0, 100);
        
        this.updateViolationsList();
        this.updateViolationsTable();
        
        // Show notification for new violation
        if (Math.random() > 0.7) {
            showNotification(`New ${newViolation.type} detected at ${newViolation.location}`, 'info');
        }
    }

    updateUserInfo() {
        const user = window.authManager?.getCurrentUser();
        if (!user) return;

        const userNameElement = document.querySelector('.user-name');
        const userAvatarElement = document.querySelector('.user-avatar');

        if (userNameElement) {
            userNameElement.textContent = user.name;
        }

        if (userAvatarElement && user.avatar) {
            userAvatarElement.src = user.avatar;
            userAvatarElement.alt = user.name;
        }
    }
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    showDashboardSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        event.target.classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            const titles = {
                overview: 'Dashboard Overview',
                violations: 'Violations Management',
                analytics: 'Analytics & Reports',
                cameras: 'Camera Management',
                reports: 'Reports & Documentation',
                settings: 'System Settings'
            };
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }

        this.currentSection = sectionName;

        // Initialize section-specific content
        if (sectionName === 'analytics' && window.chartsManager) {
            setTimeout(() => {
                window.chartsManager.initAnalyticsCharts();
            }, 100);
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.updateViolationsTable();
            return;
        }

        // Filter violations based on search query
        const filteredViolations = this.violations.filter(violation => 
            violation.id.toLowerCase().includes(query.toLowerCase()) ||
            violation.type.toLowerCase().includes(query.toLowerCase()) ||
            violation.location.toLowerCase().includes(query.toLowerCase()) ||
            violation.camera.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(filteredViolations, query);
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            showNotification(`No violations found matching "${query}"`, 'info');
            return;
        }

        showNotification(`Found ${results.length} violation(s) matching "${query}"`, 'success');
        
        // Update violations table with search results
        const tableBody = document.getElementById('violations-table-body');
        if (tableBody && this.currentSection === 'violations') {
            tableBody.innerHTML = '';
            results.slice(0, this.itemsPerPage).forEach(violation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${violation.id}</td>
                    <td>${violation.type}</td>
                    <td>${violation.location}</td>
                    <td>${violation.timestamp.toLocaleString()}</td>
                    <td><span class="severity-badge ${violation.severity}">${violation.severity}</span></td>
                    <td><span class="status-badge ${violation.status}">${violation.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="window.dashboardManager.showViolationDetail('${violation.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    updateChartsForPeriod(period) {
        if (window.chartsManager) {
            window.chartsManager.updateChartsForPeriod(period);
        }
    }

    exportData() {
        const data = {
            stats: this.stats,
            violations: this.violations,
            cameras: this.cameras,
            advancedMetrics: this.advancedMetrics,
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `proxisafe-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Data exported successfully', 'success');
    }

    // Advanced Analytics Methods
    async calculateAdvancedMetrics() {
        if (this.violations.length === 0) return;

        try {
            // Try ML API first (when service is running)
            if (window.mlApiClient) {
                const mlData = await window.mlApiClient.fetchMLStats(this.violations);
                if (mlData && mlData._mlSource) {
                    this.advancedMetrics = mlData;
                    this.updateAdvancedMetrics();
                    this.updateMLBadge(true);
                    return;
                }
            }

            // Fallback to built-in analytics engine
            if (this.analyticsEngine) {
                this.advancedMetrics = this.analyticsEngine.calculateAdvancedMetrics(this.violations, '24h');
                this.updateAdvancedMetrics();
            }
            this.updateMLBadge(false);
        } catch (error) {
            console.error('Error calculating advanced metrics:', error);
            if (this.analyticsEngine) {
                this.advancedMetrics = this.analyticsEngine.calculateAdvancedMetrics(this.violations, '24h');
                this.updateAdvancedMetrics();
            }
            this.updateMLBadge(false);
        }
    }

    updateMLBadge(mlActive) {
        const container = document.querySelector('.advanced-metrics-container');
        if (!container) return;
        let badge = container.querySelector('.ml-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'ml-badge';
            badge.title = 'ML Model Status';
            const subtitle = container.querySelector('.section-subtitle');
            if (subtitle) subtitle.appendChild(badge);
        }
        badge.className = 'ml-badge ' + (mlActive ? 'ml-active' : 'ml-offline');
        badge.textContent = mlActive ? 'ML Powered' : 'Analytics';
        badge.title = mlActive ? 'Predictions from ML model' : 'Using built-in analytics';
    }

    updateAdvancedMetrics() {
        if (!this.advancedMetrics || !this.advancedMetrics.basic) return;

        try {
            // Update risk assessment display
            this.updateRiskAssessment();
            
            // Update predictions display
            this.updatePredictions();
            
            // Update anomaly detection
            this.updateAnomalyDetection();
            
            // Update system efficiency metrics
            this.updateSystemEfficiency();
        } catch (error) {
            console.error('Error updating advanced metrics:', error);
        }
    }

    updateRiskAssessment() {
        const riskData = this.advancedMetrics.riskAssessment;
        if (!riskData) return;

        // Create or update risk assessment card
        let riskCard = document.getElementById('risk-assessment-card');
        if (!riskCard) {
            riskCard = this.createRiskAssessmentCard();
        }

        const riskLevel = riskCard.querySelector('.risk-level');
        const riskScore = riskCard.querySelector('.risk-score');
        const riskComponents = riskCard.querySelector('.risk-components');
        const riskRecommendations = riskCard.querySelector('.risk-recommendations');

        if (riskLevel) riskLevel.textContent = riskData.level;
        if (riskScore) riskScore.textContent = Math.round(riskData.overall);
        
        if (riskComponents) {
            riskComponents.innerHTML = Object.entries(riskData.components)
                .map(([key, value]) => `
                    <div class="risk-component">
                        <span class="component-label">${this.formatLabel(key)}:</span>
                        <span class="component-value">${Math.round(value)}%</span>
                        <div class="component-bar">
                            <div class="component-fill" style="width: ${value}%"></div>
                        </div>
                    </div>
                `).join('');
        }

        if (riskRecommendations) {
            riskRecommendations.innerHTML = riskData.recommendations
                .map(rec => `<li>${rec}</li>`)
                .join('');
        }

        // Update risk level styling
        riskCard.className = `card risk-assessment-card risk-${riskData.level.toLowerCase()}`;
    }

    updatePredictions() {
        const predictions = this.advancedMetrics.predictions;
        if (!predictions || !predictions.next24Hours) return;

        let predictionsCard = document.getElementById('predictions-card');
        if (!predictionsCard) {
            predictionsCard = this.createPredictionsCard();
        }

        const nextHourPrediction = predictionsCard.querySelector('.next-hour-prediction');
        const next24HoursPrediction = predictionsCard.querySelector('.next-24hours-prediction');
        const confidenceLevel = predictionsCard.querySelector('.confidence-level');

        if (nextHourPrediction && predictions.nextHour && predictions.nextHour.length > 0) {
            nextHourPrediction.textContent = Math.round(predictions.nextHour[0].value);
        }

        if (next24HoursPrediction && predictions.next24Hours) {
            const totalPredicted = predictions.next24Hours.reduce((sum, p) => sum + p.value, 0);
            next24HoursPrediction.textContent = Math.round(totalPredicted);
        }

        if (confidenceLevel && predictions.confidence) {
            const confidence = Math.round(predictions.confidence * 100);
            confidenceLevel.textContent = `${confidence}%`;
            confidenceLevel.className = `confidence-level confidence-${this.getConfidenceClass(confidence)}`;
        }
    }

    updateAnomalyDetection() {
        const anomalies = this.advancedMetrics.anomalies;
        if (!anomalies) return;

        let anomalyCard = document.getElementById('anomaly-detection-card');
        if (!anomalyCard) {
            anomalyCard = this.createAnomalyDetectionCard();
        }

        const anomalyCount = anomalyCard.querySelector('.anomaly-count');
        const anomalyList = anomalyCard.querySelector('.anomaly-list');
        const lastDetected = anomalyCard.querySelector('.last-detected');

        if (anomalyCount) {
            anomalyCount.textContent = anomalies.count;
            anomalyCount.className = `anomaly-count ${anomalies.count > 0 ? 'has-anomalies' : 'no-anomalies'}`;
        }

        if (anomalyList) {
            if (anomalies.detected.length > 0) {
                anomalyList.innerHTML = anomalies.detected.slice(0, 3)
                    .map(anomaly => `
                        <div class="anomaly-item severity-${anomaly.severity}">
                            <div class="anomaly-type">${anomaly.type}</div>
                            <div class="anomaly-description">${anomaly.description}</div>
                            <div class="anomaly-time">${this.getTimeAgo(anomaly.timestamp)}</div>
                        </div>
                    `).join('');
            } else {
                anomalyList.innerHTML = '<div class="no-anomalies">No anomalies detected</div>';
            }
        }

        if (lastDetected) {
            lastDetected.textContent = anomalies.lastDetected
                ? this.getTimeAgo(anomalies.lastDetected)
                : 'None';
        }
    }

    updateSystemEfficiency() {
        const efficiency = this.advancedMetrics.efficiency;
        if (!efficiency) return;

        let efficiencyCard = document.getElementById('system-efficiency-card');
        if (!efficiencyCard) {
            efficiencyCard = this.createSystemEfficiencyCard();
        }

        const resolutionRate = efficiencyCard.querySelector('.resolution-rate');
        const avgResolutionTime = efficiencyCard.querySelector('.avg-resolution-time');
        const detectionAccuracy = efficiencyCard.querySelector('.detection-accuracy');
        const overallEfficiency = efficiencyCard.querySelector('.overall-efficiency');

        if (resolutionRate) {
            resolutionRate.textContent = `${Math.round(efficiency.resolutionRate)}%`;
        }

        if (avgResolutionTime) {
            const minutes = Math.round(efficiency.averageResolutionTime / 60);
            avgResolutionTime.textContent = `${minutes}m`;
        }

        if (detectionAccuracy) {
            detectionAccuracy.textContent = `${Math.round(efficiency.detectionAccuracy)}%`;
        }

        if (overallEfficiency) {
            const score = Math.round(efficiency.overallEfficiency);
            overallEfficiency.textContent = `${score}%`;
            overallEfficiency.className = `overall-efficiency efficiency-${this.getEfficiencyClass(score)}`;
        }
    }

    createAdvancedDashboardElements() {
        const overviewSection = document.getElementById('overview-section');
        if (!overviewSection) return;

        // Check if already created
        if (document.getElementById('risk-assessment-card')) return;

        // Create advanced metrics container
        const advancedMetricsContainer = document.createElement('div');
        advancedMetricsContainer.className = 'advanced-metrics-container';
        advancedMetricsContainer.innerHTML = `
            <h3 class="section-subtitle">Advanced Analytics</h3>
            <div class="advanced-metrics-grid">
                <div id="risk-assessment-card" class="card risk-assessment-card">
                    <div class="card-header">
                        <h4 class="card-title">Risk Assessment</h4>
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="risk-content">
                        <div class="risk-score-display">
                            <span class="risk-score">0</span>
                            <span class="risk-level">Low</span>
                        </div>
                        <div class="risk-components"></div>
                        <div class="risk-recommendations-container">
                            <h5>Recommendations:</h5>
                            <ul class="risk-recommendations"></ul>
                        </div>
                    </div>
                </div>

                <div id="predictions-card" class="card predictions-card">
                    <div class="card-header">
                        <h4 class="card-title">Predictions</h4>
                        <i class="fas fa-crystal-ball"></i>
                    </div>
                    <div class="predictions-content">
                        <div class="prediction-item">
                            <span class="prediction-label">Next Hour:</span>
                            <span class="next-hour-prediction">0</span>
                        </div>
                        <div class="prediction-item">
                            <span class="prediction-label">Next 24 Hours:</span>
                            <span class="next-24hours-prediction">0</span>
                        </div>
                        <div class="prediction-confidence">
                            <span class="prediction-label">Confidence:</span>
                            <span class="confidence-level">0%</span>
                        </div>
                    </div>
                </div>

                <div id="anomaly-detection-card" class="card anomaly-detection-card">
                    <div class="card-header">
                        <h4 class="card-title">Anomaly Detection</h4>
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="anomaly-content">
                        <div class="anomaly-summary">
                            <span class="anomaly-count">0</span>
                            <span class="anomaly-label">Anomalies Detected</span>
                        </div>
                        <div class="anomaly-list"></div>
                        <div class="last-detected-container">
                            <span class="last-detected-label">Last Detected:</span>
                            <span class="last-detected">None</span>
                        </div>
                    </div>
                </div>

                <div id="system-efficiency-card" class="card system-efficiency-card">
                    <div class="card-header">
                        <h4 class="card-title">System Efficiency</h4>
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="efficiency-content">
                        <div class="efficiency-metric">
                            <span class="metric-label">Resolution Rate:</span>
                            <span class="resolution-rate">0%</span>
                        </div>
                        <div class="efficiency-metric">
                            <span class="metric-label">Avg Resolution:</span>
                            <span class="avg-resolution-time">0m</span>
                        </div>
                        <div class="efficiency-metric">
                            <span class="metric-label">Detection Accuracy:</span>
                            <span class="detection-accuracy">0%</span>
                        </div>
                        <div class="efficiency-overall">
                            <span class="metric-label">Overall Efficiency:</span>
                            <span class="overall-efficiency">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after the overview grid
        const overviewGrid = overviewSection.querySelector('.overview-grid');
        if (overviewGrid) {
            overviewGrid.parentNode.insertBefore(advancedMetricsContainer, overviewGrid.nextSibling);
        }
    }

    createRiskAssessmentCard() {
        return document.getElementById('risk-assessment-card');
    }

    createPredictionsCard() {
        return document.getElementById('predictions-card');
    }

    createAnomalyDetectionCard() {
        return document.getElementById('anomaly-detection-card');
    }

    createSystemEfficiencyCard() {
        return document.getElementById('system-efficiency-card');
    }

    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    getConfidenceClass(confidence) {
        if (confidence >= 80) return 'high';
        if (confidence >= 60) return 'medium';
        return 'low';
    }

    getEfficiencyClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    // Enhanced real-time updates with advanced analytics
    updateRealTimeData() {
        // Simulate small changes in statistics
        this.stats.totalViolations += Math.floor(Math.random() * 3);
        this.stats.peopleDetected += Math.floor(Math.random() * 10) - 5;
        this.stats.complianceRate += Math.floor(Math.random() * 6) - 3;
        
        // Keep compliance rate within reasonable bounds
        this.stats.complianceRate = Math.max(60, Math.min(95, this.stats.complianceRate));
        this.stats.peopleDetected = Math.max(50, this.stats.peopleDetected);

        this.updateStats();
        
        // Recalculate advanced metrics
        this.calculateAdvancedMetrics();
        
        // Update real-time data timestamp
        this.realTimeData.lastUpdate = new Date();
    }
}

// Global functions for HTML onclick handlers
function showDashboardSection(sectionName) {
    if (window.dashboardManager) {
        window.dashboardManager.showDashboardSection(sectionName);
    }
}

function toggleSidebar() {
    if (window.dashboardManager) {
        window.dashboardManager.toggleSidebar();
    }
}

function logout() {
    if (window.authManager) {
        window.authManager.logout();
    }
}

function showUserProfile() {
    if (window.dashboardManager) {
        window.dashboardManager.showUserProfile();
    }
}

function closeUserProfile() {
    const modal = document.getElementById('user-profile-modal');
    modal.classList.remove('show');
}

function closeViolationDetail() {
    const modal = document.getElementById('violation-detail-modal');
    modal.classList.remove('show');
}

function showMediaTab(tabName) {
    document.querySelectorAll('.media-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function saveProfile() {
    showNotification('Profile updated successfully', 'success');
    closeUserProfile();
}

function changePassword() {
    showNotification('Password change functionality would be implemented here', 'info');
}

function resolveViolation() {
    if (window.dashboardManager.currentViolation) {
        window.dashboardManager.currentViolation.status = 'resolved';
        showNotification('Violation marked as resolved', 'success');
        closeViolationDetail();
        window.dashboardManager.updateViolationsTable();
    }
}

function investigateViolation() {
    if (window.dashboardManager.currentViolation) {
        window.dashboardManager.currentViolation.status = 'investigating';
        showNotification('Violation marked for investigation', 'info');
        closeViolationDetail();
        window.dashboardManager.updateViolationsTable();
    }
}

function escalateViolation() {
    if (window.dashboardManager.currentViolation) {
        showNotification('Violation escalated to security team', 'warning');
        closeViolationDetail();
    }
}

function saveNotes() {
    const notes = document.querySelector('.notes-textarea').value;
    if (window.dashboardManager.currentViolation) {
        window.dashboardManager.currentViolation.notes = notes;
        showNotification('Notes saved successfully', 'success');
    }
}

function downloadImage() {
    showNotification('Image download functionality would be implemented here', 'info');
}

function enhanceImage() {
    showNotification('Image enhancement functionality would be implemented here', 'info');
}

function downloadVideo() {
    showNotification('Video download functionality would be implemented here', 'info');
}

function analyzeVideo() {
    showNotification('Video analysis functionality would be implemented here', 'info');
}

function showNotifications() {
    const notifications = [
        'New violation detected in Mall Entrance',
        'Camera #5 is offline',
        'Daily report is ready',
        'System maintenance scheduled for tonight',
        'Compliance rate improved by 5%'
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    showNotification(randomNotification, 'info');
}

function exportViolations() {
    if (window.dashboardManager) {
        window.dashboardManager.exportData();
    }
}

function refreshViolations() {
    if (window.dashboardManager) {
        window.dashboardManager.updateViolationsTable();
        showNotification('Violations data refreshed', 'success');
    }
}

function exportAnalytics() {
    showNotification('Analytics report exported successfully', 'success');
}

function addCamera() {
    showNotification('Add camera functionality would be implemented here', 'info');
}

function refreshCameras() {
    if (window.dashboardManager) {
        window.dashboardManager.updateCamerasGrid();
        showNotification('Camera data refreshed', 'success');
    }
}

function generateReport() {
    showNotification('Report generation started', 'info');
    setTimeout(() => {
        showNotification('Report generated successfully', 'success');
    }, 2000);
}

function generateDailyReport() {
    showNotification('Generating daily report...', 'info');
    setTimeout(() => {
        showNotification('Daily report generated successfully', 'success');
    }, 1500);
}

function generateWeeklyReport() {
    showNotification('Generating weekly report...', 'info');
    setTimeout(() => {
        showNotification('Weekly report generated successfully', 'success');
    }, 2000);
}

function generateMonthlyReport() {
    showNotification('Generating monthly report...', 'info');
    setTimeout(() => {
        showNotification('Monthly report generated successfully', 'success');
    }, 2500);
}

function generateCustomReport() {
    showNotification('Custom report builder would be implemented here', 'info');
}

function addUser() {
    showNotification('Add user functionality would be implemented here', 'info');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        showNotification('Settings reset to defaults', 'success');
    }
}

function saveSettings() {
    showNotification('Settings saved successfully', 'success');
}

// Initialize dashboard manager
const dashboardManager = new DashboardManager();

// Make dashboard manager globally available
window.dashboardManager = dashboardManager;
        window.dashboardManager.current