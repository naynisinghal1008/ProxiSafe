// Premium Dashboard Enhancement Manager
class PremiumDashboard {
    constructor() {
        this.animationQueue = [];
        this.particleSystem = null;
        this.interactionEffects = new Map();
        this.init();
    }

    init() {
        this.setupPremiumAnimations();
        this.createParticleSystem();
        this.setupAdvancedInteractions();
        this.initializeCounterAnimations();
        this.setupHoverEffects();
        this.createFloatingElements();
    }

    setupPremiumAnimations() {
        // Staggered card entrance animations
        const cards = document.querySelectorAll('.stat-card-enhanced, .glass-card');
        cards.forEach((card, index) => {
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px) scale(0.9)';
                
                setTimeout(() => {
                    if (card) {
                        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }
                }, index * 150);
            }
        });

        // Premium loading sequence
        this.createLoadingSequence();
    }

    createLoadingSequence() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'premium-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="premium-loading-content">
                <div class="premium-logo">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="premium-loading-text">PROXISAFE</div>
                <div class="premium-loading-subtitle">Premium Dashboard Loading...</div>
                <div class="premium-progress-bar">
                    <div class="premium-progress-fill"></div>
                </div>
            </div>
        `;
        
        // Add loading styles
        const loadingStyles = `
            .premium-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: opacity 0.8s ease-out;
            }
            
            .premium-loading-content {
                text-align: center;
                color: white;
            }
            
            .premium-logo {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: premiumPulse 2s infinite;
            }
            
            .premium-loading-text {
                font-size: 2.5rem;
                font-weight: 900;
                margin-bottom: 0.5rem;
                letter-spacing: 3px;
            }
            
            .premium-loading-subtitle {
                font-size: 1rem;
                opacity: 0.8;
                margin-bottom: 2rem;
            }
            
            .premium-progress-bar {
                width: 300px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin: 0 auto;
            }
            
            .premium-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ffffff, #f8fafc);
                border-radius: 2px;
                animation: premiumProgress 3s ease-out forwards;
            }
            
            @keyframes premiumPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            
            @keyframes premiumProgress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = loadingStyles;
        document.head.appendChild(styleSheet);
        document.body.appendChild(loadingOverlay);
        
        // Remove loading overlay after animation
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(loadingOverlay);
            }, 800);
        }, 3500);
    }

    createParticleSystem() {
        if (!document.body) return;
        
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.6;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const particles = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        if (window) {
            window.addEventListener('resize', resizeCanvas);
        }
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: `hsl(${Math.random() * 60 + 220}, 70%, 70%)`
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    setupAdvancedInteractions() {
        // Advanced hover effects for cards
        const cards = document.querySelectorAll('.stat-card-enhanced, .glass-card');
        
        cards.forEach(card => {
            if (card) {
                card.addEventListener('mouseenter', (e) => {
                    this.createRippleEffect(e);
                    this.addGlowEffect(card);
                });
                
                card.addEventListener('mouseleave', () => {
                    this.removeGlowEffect(card);
                });
                
                card.addEventListener('click', (e) => {
                    this.createClickEffect(e);
                });
            }
        });
    }

    createRippleEffect(event) {
        const ripple = document.createElement('div');
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        event.currentTarget.style.position = 'relative';
        event.currentTarget.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Add ripple animation if not exists
        if (!document.querySelector('#ripple-styles')) {
            const rippleStyles = document.createElement('style');
            rippleStyles.id = 'ripple-styles';
            rippleStyles.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(rippleStyles);
        }
    }

    addGlowEffect(element) {
        element.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)';
        element.style.transform = 'translateY(-8px) scale(1.02)';
    }

    removeGlowEffect(element) {
        element.style.boxShadow = '';
        element.style.transform = '';
    }

    createClickEffect(event) {
        const burst = document.createElement('div');
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        burst.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #ffffff, transparent);
            border-radius: 50%;
            transform: scale(0);
            animation: burst 0.4s ease-out;
            pointer-events: none;
            z-index: 2;
        `;
        
        event.currentTarget.appendChild(burst);
        
        setTimeout(() => {
            burst.remove();
        }, 400);
        
        // Add burst animation if not exists
        if (!document.querySelector('#burst-styles')) {
            const burstStyles = document.createElement('style');
            burstStyles.id = 'burst-styles';
            burstStyles.textContent = `
                @keyframes burst {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(burstStyles);
        }
    }

    initializeCounterAnimations() {
        const counters = document.querySelectorAll('.stat-value-enhanced');
        
        if (counters.length === 0) return;
        
        const animateCounter = (element, target) => {
            if (!element) return;
            
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.round(start + (target - start) * easeOutQuart);
                
                if (element && element.textContent) {
                    if (element.textContent.includes('%')) {
                        element.textContent = current + '%';
                    } else if (element.textContent.includes(',')) {
                        element.textContent = current.toLocaleString();
                    } else {
                        element.textContent = current;
                    }
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        };
        
        // Trigger counter animations when elements come into view
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target) {
                        const textContent = entry.target.textContent || '';
                        const target = parseInt(textContent.replace(/[^\d]/g, '')) || 0;
                        animateCounter(entry.target, target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            counters.forEach(counter => {
                if (counter) {
                    observer.observe(counter);
                }
            });
        }
    }

    setupHoverEffects() {
        // Advanced navigation hover effects
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (item) {
                item.addEventListener('mouseenter', () => {
                    item.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)';
                    item.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
                    
                    const icon = item.querySelector('.nav-icon');
                    if (icon) {
                        icon.style.transform = 'scale(1.2) rotate(10deg)';
                        icon.style.filter = 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4))';
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (!item.classList.contains('active')) {
                        item.style.background = '';
                        item.style.boxShadow = '';
                    }
                    
                    const icon = item.querySelector('.nav-icon');
                    if (icon) {
                        icon.style.transform = '';
                        icon.style.filter = '';
                    }
                });
            }
        });
    }

    createFloatingElements() {
        // Create floating geometric shapes
        const shapes = ['circle', 'triangle', 'square'];
        
        for (let i = 0; i < 10; i++) {
            const shape = document.createElement('div');
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            
            shape.className = `floating-shape floating-${shapeType}`;
            shape.style.cssText = `
                position: fixed;
                width: ${Math.random() * 20 + 10}px;
                height: ${Math.random() * 20 + 10}px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: ${shapeType === 'circle' ? '50%' : shapeType === 'triangle' ? '0' : '4px'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
                animation-delay: ${Math.random() * 5}s;
                pointer-events: none;
                z-index: -1;
                opacity: 0.3;
            `;
            
            document.body.appendChild(shape);
        }
    }

    // Advanced chart styling
    enhanceCharts() {
        if (window.industryDashboard && window.industryDashboard.charts) {
            window.industryDashboard.charts.forEach((chart, key) => {
                if (chart.canvas) {
                    chart.canvas.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))';
                    chart.canvas.style.borderRadius = '1rem';
                }
            });
        }
    }

    // Premium notification system
    showPremiumNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `premium-notification premium-notification-${type}`;
        
        notification.innerHTML = `
            <div class="premium-notification-content">
                <div class="premium-notification-icon">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                </div>
                <div class="premium-notification-message">${message}</div>
                <button class="premium-notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add notification styles
        if (!document.querySelector('#premium-notification-styles')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'premium-notification-styles';
            notificationStyles.textContent = `
                .premium-notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    max-width: 400px;
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: slideIn 0.4s ease-out forwards;
                }
                
                .premium-notification-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .premium-notification-icon {
                    font-size: 1.5rem;
                    color: white;
                }
                
                .premium-notification-message {
                    flex: 1;
                    color: white;
                    font-weight: 500;
                }
                
                .premium-notification-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                }
                
                .premium-notification-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(notificationStyles);
        }
        
        document.body.appendChild(notification);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.premium-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.style.animation = 'slideOut 0.4s ease-out forwards';
                setTimeout(() => notification.remove(), 400);
            });
        }
        
        // Auto-remove after duration
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.4s ease-out forwards';
                setTimeout(() => notification.remove(), 400);
            }
        }, duration);
    }
}

// Initialize premium dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other scripts to load
    setTimeout(() => {
        window.premiumDashboard = new PremiumDashboard();
        
        // Show welcome notification
        setTimeout(() => {
            if (window.premiumDashboard) {
                window.premiumDashboard.showPremiumNotification(
                    'Welcome to PROXISAFE Premium Dashboard! 🚀',
                    'success',
                    6000
                );
            }
        }, 4000);
        
        // Enhance charts after they're loaded
        setTimeout(() => {
            if (window.premiumDashboard) {
                window.premiumDashboard.enhanceCharts();
            }
        }, 5000);
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumDashboard;
}