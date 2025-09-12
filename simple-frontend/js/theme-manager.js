// Advanced Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'Light Mode',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    info: '#3b82f6',
                    background: '#ffffff',
                    surface: '#f9fafb',
                    text: '#111827',
                    textSecondary: '#6b7280',
                    border: '#e5e7eb',
                    shadow: 'rgba(0, 0, 0, 0.1)',
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    cardBackground: '#ffffff',
                    sidebarBackground: '#ffffff'
                }
            },
            dark: {
                name: 'Dark Mode',
                colors: {
                    primary: '#818cf8',
                    secondary: '#a78bfa',
                    success: '#34d399',
                    warning: '#fbbf24',
                    danger: '#f87171',
                    info: '#60a5fa',
                    background: '#0f172a',
                    surface: '#1e293b',
                    text: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    border: '#334155',
                    shadow: 'rgba(0, 0, 0, 0.3)',
                    gradient: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                    cardBackground: '#1e293b',
                    sidebarBackground: '#0f172a'
                }
            },
            blue: {
                name: 'Ocean Blue',
                colors: {
                    primary: '#0ea5e9',
                    secondary: '#0284c7',
                    success: '#059669',
                    warning: '#d97706',
                    danger: '#dc2626',
                    info: '#2563eb',
                    background: '#f0f9ff',
                    surface: '#e0f2fe',
                    text: '#0c4a6e',
                    textSecondary: '#0369a1',
                    border: '#bae6fd',
                    shadow: 'rgba(14, 165, 233, 0.1)',
                    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    cardBackground: '#ffffff',
                    sidebarBackground: '#f0f9ff'
                }
            },
            purple: {
                name: 'Royal Purple',
                colors: {
                    primary: '#8b5cf6',
                    secondary: '#7c3aed',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    info: '#6366f1',
                    background: '#faf5ff',
                    surface: '#f3e8ff',
                    text: '#581c87',
                    textSecondary: '#7c2d92',
                    border: '#d8b4fe',
                    shadow: 'rgba(139, 92, 246, 0.1)',
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    cardBackground: '#ffffff',
                    sidebarBackground: '#faf5ff'
                }
            }
        };
        this.animations = {
            duration: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms'
            },
            easing: {
                ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
                easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
                bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
        };
        this.init();
    }

    init() {
        try {
            this.loadSavedTheme();
            this.createThemeToggle();
            this.bindEvents();
            this.applyTheme(this.currentTheme);
        } catch (error) {
            console.error('Theme manager initialization error:', error);
            // Continue with default theme
            this.applyTheme('light');
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('proxisafe-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }

    createThemeToggle() {
        try {
            // Add theme toggle to the top navigation
            const navRight = document.querySelector('.nav-right');
            if (!navRight) return;

            // Check if already exists
            if (document.querySelector('.theme-toggle-container')) return;

            const themeToggle = document.createElement('div');
            themeToggle.className = 'theme-toggle-container';
            themeToggle.innerHTML = `
                <button class="theme-toggle-btn" onclick="window.themeManager.toggleTheme()" title="Toggle Theme">
                    <i class="fas fa-palette"></i>
                </button>
                <div class="theme-dropdown" id="theme-dropdown">
                    <div class="theme-option" onclick="window.themeManager.setTheme('light')">
                        <div class="theme-preview light"></div>
                        <span>Light</span>
                    </div>
                    <div class="theme-option" onclick="window.themeManager.setTheme('dark')">
                        <div class="theme-preview dark"></div>
                        <span>Dark</span>
                    </div>
                    <div class="theme-option" onclick="window.themeManager.setTheme('blue')">
                        <div class="theme-preview blue"></div>
                        <span>Ocean</span>
                    </div>
                    <div class="theme-option" onclick="window.themeManager.setTheme('purple')">
                        <div class="theme-preview purple"></div>
                        <span>Purple</span>
                    </div>
                </div>
            `;

            navRight.insertBefore(themeToggle, navRight.firstChild);
        } catch (error) {
            console.error('Error creating theme toggle:', error);
        }
    }

    bindEvents() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('theme-dropdown');
            const toggleBtn = document.querySelector('.theme-toggle-btn');
            
            if (dropdown && !dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    }

    toggleTheme() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;

        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.saveTheme(themeName);
        
        // Close dropdown
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }

        // Show notification
        if (window.showNotification) {
            showNotification(`Theme changed to ${this.themes[themeName].name}`, 'success');
        }

        // Update charts if available
        if (window.chartsManager) {
            setTimeout(() => {
                window.chartsManager.updateChartColors(this.themes[themeName].colors);
                window.chartsManager.updateCharts();
            }, 300);
        }
    }

    cycleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.setTheme(themeNames[nextIndex]);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${this.camelToKebab(key)}`, value);
        });

        // Apply animation properties
        Object.entries(this.animations.duration).forEach(([key, value]) => {
            root.style.setProperty(`--duration-${key}`, value);
        });

        Object.entries(this.animations.easing).forEach(([key, value]) => {
            root.style.setProperty(`--easing-${key}`, value);
        });

        // Update body class for theme-specific styles
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        // Update meta theme color for mobile browsers
        this.updateMetaThemeColor(theme.colors.primary);

        // Apply theme-specific adjustments
        this.applyThemeSpecificStyles(themeName, theme);
    }

    applyThemeSpecificStyles(themeName, theme) {
        // Remove existing theme-specific styles
        const existingStyle = document.getElementById('theme-specific-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new theme-specific styles
        const style = document.createElement('style');
        style.id = 'theme-specific-styles';
        
        let css = `
            /* Theme: ${theme.name} */
            :root {
                --shadow-sm: 0 1px 2px 0 ${theme.colors.shadow};
                --shadow: 0 1px 3px 0 ${theme.colors.shadow}, 0 1px 2px 0 ${theme.colors.shadow};
                --shadow-md: 0 4px 6px -1px ${theme.colors.shadow}, 0 2px 4px -1px ${theme.colors.shadow};
                --shadow-lg: 0 10px 15px -3px ${theme.colors.shadow}, 0 4px 6px -2px ${theme.colors.shadow};
                --shadow-xl: 0 20px 25px -5px ${theme.colors.shadow}, 0 10px 10px -5px ${theme.colors.shadow};
            }

            .stat-card, .card, .auth-card {
                background: ${theme.colors.cardBackground} !important;
                box-shadow: var(--shadow) !important;
                border: 1px solid ${theme.colors.border} !important;
            }

            .sidebar {
                background: ${theme.colors.sidebarBackground} !important;
                border-right: 1px solid ${theme.colors.border} !important;
            }

            .top-nav {
                background: ${theme.colors.cardBackground} !important;
                border-bottom: 1px solid ${theme.colors.border} !important;
            }

            .dashboard-container {
                background: ${theme.colors.surface} !important;
            }

            .violations-table th {
                background: ${theme.colors.surface} !important;
                color: ${theme.colors.text} !important;
            }

            .form-input {
                background: ${theme.colors.cardBackground} !important;
                color: ${theme.colors.text} !important;
                border-color: ${theme.colors.border} !important;
            }

            .form-input:focus {
                border-color: ${theme.colors.primary} !important;
                box-shadow: 0 0 0 3px ${theme.colors.primary}20 !important;
            }

            .modal-content {
                background: ${theme.colors.cardBackground} !important;
                color: ${theme.colors.text} !important;
            }

            .notification-toast {
                background: ${theme.colors.cardBackground} !important;
                color: ${theme.colors.text} !important;
                border: 1px solid ${theme.colors.border} !important;
            }
        `;

        // Dark theme specific adjustments
        if (themeName === 'dark') {
            css += `
                .chart-container {
                    background: ${theme.colors.surface} !important;
                }

                .violations-table tbody tr:hover {
                    background: ${theme.colors.surface} !important;
                }

                .violation-item:hover {
                    background: ${theme.colors.surface} !important;
                }

                .user-profile:hover,
                .notification-btn:hover {
                    background: ${theme.colors.surface} !important;
                }

                .nav-item:hover,
                .nav-item.active {
                    background: ${theme.colors.surface} !important;
                }
            `;
        }

        style.textContent = css;
        document.head.appendChild(style);
    }

    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    saveTheme(themeName) {
        localStorage.setItem('proxisafe-theme', themeName);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeColors() {
        return this.themes[this.currentTheme].colors;
    }

    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Animation utilities
    animateElement(element, animation, duration = 'normal') {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.animation = `${animation} ${this.animations.duration[duration]} ${this.animations.easing.ease}`;
            
            const handleAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    // Smooth transitions for theme changes
    transitionTheme(fromTheme, toTheme) {
        const body = document.body;
        body.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            this.applyTheme(toTheme);
            setTimeout(() => {
                body.style.transition = '';
            }, 300);
        }, 50);
    }

    // Accessibility features
    enableHighContrast() {
        document.body.classList.add('high-contrast');
    }

    disableHighContrast() {
        document.body.classList.remove('high-contrast');
    }

    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
    }

    disableReducedMotion() {
        document.body.classList.remove('reduced-motion');
    }

    // Auto theme based on system preference
    enableAutoTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                this.setTheme(e.matches ? 'dark' : 'light');
            };
            
            mediaQuery.addListener(handleChange);
            handleChange(mediaQuery);
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
window.themeManager = themeManager;