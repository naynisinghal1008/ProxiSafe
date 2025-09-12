// Main Application Controller
class ProxiSafeApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'login';
        this.notificationTimeout = null;
    }

    init() {
        if (this.isInitialized) return;

        // Show loading screen
        this.showLoadingScreen();

        // Initialize after a short delay to show loading animation
        setTimeout(() => {
            this.initializeApp();
        }, 2000);
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    initializeApp() {
        try {
            // Check if user is already authenticated
            if (window.authManager && window.authManager.isUserAuthenticated()) {
                this.showDashboard();
            } else {
                this.showLogin();
            }

            // Initialize global event listeners
            this.bindGlobalEvents();
            
            // Initialize mobile menu
            this.initializeMobileMenu();

            // Initialize charts if on dashboard
            if (this.currentPage === 'dashboard') {
                this.initializeCharts();
            }

            this.hideLoadingScreen();
            this.isInitialized = true;

            // Show welcome message
            setTimeout(() => {
                if (window.showNotification) {
                    showNotification('Welcome to PROXISAFE - Social Distancing Tracker', 'info');
                }
            }, 1000);
        } catch (error) {
            console.error('App initialization error:', error);
            // Ensure loading screen is hidden even if there's an error
            this.hideLoadingScreen();
            this.showLogin(); // Fallback to login page
            this.isInitialized = true;
        }
    }

    bindGlobalEvents() {
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Handle online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));

        // Prevent form submission on Enter key in search
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('search-input') && e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    initializeMobileMenu() {
        // Mobile menu toggle functionality
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Close sidebar when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1023 && sidebar && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // Handle escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }
    
    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.classList.add('show');
        }
    }
    
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('show');
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape key to close modals/notifications
        if (e.key === 'Escape') {
            this.hideNotification();
        }

        // Alt + D for dashboard
        if (e.altKey && e.key === 'd' && this.currentPage === 'dashboard') {
            e.preventDefault();
            showDashboardSection('overview');
        }

        // Alt + L for logout
        if (e.altKey && e.key === 'l' && this.currentPage === 'dashboard') {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        }
    }

    handleResize() {
        // Redraw charts on resize
        if (this.currentPage === 'dashboard' && window.chartsManager) {
            setTimeout(() => {
                window.chartsManager.updateCharts();
            }, 300);
        }

        // Close mobile sidebar on desktop resize
        if (window.innerWidth > 1023) {
            this.closeMobileMenu();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause real-time updates
            console.log('Page hidden - pausing updates');
        } else {
            // Page is visible - resume updates
            console.log('Page visible - resuming updates');
            if (this.currentPage === 'dashboard' && window.dashboardManager) {
                window.dashboardManager.updateRealTimeData();
            }
        }
    }

    handleOnlineStatus(isOnline) {
        if (isOnline) {
            showNotification('Connection restored', 'success');
        } else {
            showNotification('Connection lost - working offline', 'warning');
        }
    }

    showLogin() {
        this.currentPage = 'login';
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('login-page').classList.add('active');
    }

    showSignup() {
        this.currentPage = 'signup';
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('signup-page').classList.add('active');
    }

    showDashboard() {
        try {
            this.currentPage = 'dashboard';
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('dashboard-page').classList.add('active');
            
            // Initialize dashboard and charts with delay to ensure DOM is ready
            setTimeout(() => {
                if (window.dashboardManager) {
                    window.dashboardManager.init();
                }
                
                this.initializeCharts();
            }, 100);
        } catch (error) {
            console.error('Error showing dashboard:', error);
        }
    }

    initializeCharts() {
        if (window.chartsManager) {
            setTimeout(() => {
                try {
                    window.chartsManager.init();
                } catch (error) {
                    console.error('Error initializing charts:', error);
                }
            }, 500);
        }
    }

    // Utility method to show notifications
    showNotification(message, type = 'info', duration = 5000) {
        showNotification(message, type, duration);
    }

    hideNotification() {
        hideNotification();
    }
}

// Global notification system
function showNotification(message, type = 'info', duration = 5000) {
    const toast = document.getElementById('notification-toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');

    // Set icon based on type
    icon.className = 'toast-icon';
    switch (type) {
        case 'success':
            icon.innerHTML = '<i class="fas fa-check-circle"></i>';
            icon.classList.add('success');
            break;
        case 'error':
            icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            icon.classList.add('error');
            break;
        case 'warning':
            icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            icon.classList.add('warning');
            break;
        default:
            icon.innerHTML = '<i class="fas fa-info-circle"></i>';
            icon.classList.add('info');
    }

    messageEl.textContent = message;
    toast.classList.add('show');

    // Clear existing timeout
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }

    // Auto-hide after duration
    window.notificationTimeout = setTimeout(() => {
        hideNotification();
    }, duration);
}

function hideNotification() {
    const toast = document.getElementById('notification-toast');
    toast.classList.remove('show');
    
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
        window.notificationTimeout = null;
    }
}

// // Error handling
// window.addEventListener('error', (e) => {
//     console.error('Application error:', e.error);
//     showNotification('An unexpected error occurred. Please refresh the page.', 'error');
// });

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('A network error occurred. Please check your connection.', 'error');
});

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn('Slow page load detected');
                }
            }, 0);
        });
    }
}

// Initialize performance monitoring
measurePerformance();

// Service Worker registration (for future PWA features)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Accessibility improvements
function initializeAccessibility() {
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Add ARIA labels dynamically
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (button.textContent.trim()) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
}

// Theme management (for future dark mode)
function initializeTheme() {
    const savedTheme = localStorage.getItem('proxisafe-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme and accessibility
    initializeTheme();
    initializeAccessibility();
    
    // Create and initialize the main app
    const app = new ProxiSafeApp();
    app.init();
    
    // Make app globally available for debugging
    window.proxiSafeApp = app;
    
    // Register service worker for future PWA features
    // registerServiceWorker();
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProxiSafeApp, showNotification, hideNotification };
}