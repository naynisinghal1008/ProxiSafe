// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('proxisafe_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
        }

        // Bind form events
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Password strength checker
        const signupPassword = document.getElementById('signup-password');
        if (signupPassword) {
            signupPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // Confirm password validation
        const confirmPassword = document.getElementById('confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => this.validatePasswordMatch());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Show loading state
        this.setButtonLoading(form.querySelector('.btn-primary'), true);

        try {
            // Simulate API call
            await this.simulateApiCall(1500);

            // Mock authentication - in real app, this would be an API call
            if (this.validateCredentials(email, password)) {
                const user = {
                    id: 1,
                    name: 'John Doe',
                    email: email,
                    avatar: null, // Will use CSS-based professional avatar
                    loginTime: new Date().toISOString()
                };

                this.currentUser = user;
                this.isAuthenticated = true;

                // Save to localStorage if remember me is checked
                if (remember) {
                    localStorage.setItem('proxisafe_user', JSON.stringify(user));
                }

                // Show success notification
                showNotification('Login successful! Welcome back.', 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    showDashboard();
                }, 1000);

            } else {
                throw new Error('Invalid email or password');
            }

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(form.querySelector('.btn-primary'), false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const terms = formData.get('terms');

        // Validate form
        if (!this.validateSignupForm(name, email, password, confirmPassword, terms)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(form.querySelector('.btn-primary'), true);

        try {
            // Simulate API call
            await this.simulateApiCall(2000);

            // Mock user creation
            const user = {
                id: Date.now(),
                name: name,
                email: email,
                avatar: null, // Will use CSS-based professional avatar
                signupTime: new Date().toISOString()
            };

            this.currentUser = user;
            this.isAuthenticated = true;

            // Save to localStorage
            localStorage.setItem('proxisafe_user', JSON.stringify(user));

            // Show success notification
            showNotification('Account created successfully! Welcome to PROXISAFE.', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                showDashboard();
            }, 1000);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(form.querySelector('.btn-primary'), false);
        }
    }

    validateCredentials(email, password) {
        // Mock validation - in real app, this would be handled by backend
        const validUsers = [
            { email: 'admin@proxisafe.com', password: 'admin123' },
            { email: 'demo@proxisafe.com', password: 'demo123' },
            { email: 'test@test.com', password: 'test123' }
        ];

        return validUsers.some(user => user.email === email && user.password === password) || 
               (email && password && password.length >= 6);
    }

    validateSignupForm(name, email, password, confirmPassword, terms) {
        if (!name || name.length < 2) {
            showNotification('Please enter a valid name (at least 2 characters)', 'error');
            return false;
        }

        if (!email || !this.isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        if (!password || password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return false;
        }

        if (!terms) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkPasswordStrength(password) {
        const strengthIndicator = document.querySelector('.password-strength');
        const strengthFill = document.querySelector('.strength-fill');
        const strengthLevel = document.getElementById('strength-level');

        if (!strengthIndicator || !strengthFill || !strengthLevel) return;

        let strength = 0;
        let level = 'Weak';

        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

        // Remove existing classes
        strengthIndicator.classList.remove('weak', 'medium', 'strong');

        if (strength >= 4) {
            level = 'Strong';
            strengthIndicator.classList.add('strong');
        } else if (strength >= 2) {
            level = 'Medium';
            strengthIndicator.classList.add('medium');
        } else {
            level = 'Weak';
            strengthIndicator.classList.add('weak');
        }

        strengthLevel.textContent = level;
    }

    validatePasswordMatch() {
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const confirmInput = document.getElementById('confirm-password');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.style.borderColor = '#ef4444';
        } else {
            confirmInput.style.borderColor = '#e5e7eb';
        }
    }

    setButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            button.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            button.disabled = false;
        }
    }

    async simulateApiCall(delay = 1000) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional API failures
                if (Math.random() < 0.1) {
                    reject(new Error('Network error. Please try again.'));
                } else {
                    resolve();
                }
            }, delay);
        });
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('proxisafe_user');
        
        showNotification('You have been logged out successfully', 'info');
        
        setTimeout(() => {
            showLogin();
        }, 1000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Page navigation functions
function showLogin() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
}

function showSignup() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('signup-page').classList.add('active');
}

function showDashboard() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('dashboard-page').classList.add('active');
    
    // Initialize dashboard if not already done
    if (window.dashboardManager) {
        window.dashboardManager.init();
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Make auth manager globally available
window.authManager = authManager;