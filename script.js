// Theme Management
(function() {
    const THEME_KEY = 'aidevops-theme';
    const themeToggle = document.getElementById('themeToggle');
    
    // Get initial theme from localStorage or system preference
    function getInitialTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }
    
    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }
    
    // Initialize theme on page load
    applyTheme(getInitialTheme());
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
    
    // Listen for system preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only apply if user hasn't manually set a preference
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
})();

// Copy to Clipboard
(function() {
    const installCommand = 'bash <(curl -fsSL https://raw.githubusercontent.com/marcusquinn/aidevops/main/setup.sh)';
    
    function setupCopyButton(buttonId) {
        const copyBtn = document.getElementById(buttonId);
        if (!copyBtn) return;
        
        copyBtn.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(installCommand);
                
                // Visual feedback
                const copyIcon = this.querySelector('.copy-icon');
                const checkIcon = this.querySelector('.check-icon');
                
                if (copyIcon && checkIcon) {
                    copyIcon.style.display = 'none';
                    checkIcon.style.display = 'block';
                    this.classList.add('copied');
                    
                    setTimeout(() => {
                        copyIcon.style.display = 'block';
                        checkIcon.style.display = 'none';
                        this.classList.remove('copied');
                    }, 2000);
                }
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = installCommand;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                // Visual feedback
                const copyIcon = copyBtn.querySelector('.copy-icon');
                const checkIcon = copyBtn.querySelector('.check-icon');
                
                if (copyIcon && checkIcon) {
                    copyIcon.style.display = 'none';
                    checkIcon.style.display = 'block';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyIcon.style.display = 'block';
                        checkIcon.style.display = 'none';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }
            }
        });
    }
    
    // Setup both copy buttons
    setupCopyButton('copyBtn');
    setupCopyButton('copyBtn2');
})();

// Smooth scroll for anchor links
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();

// Add intersection observer for fade-in animations
(function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and service categories
    document.querySelectorAll('.feature-card, .service-category').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
})();
