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

// Clone Install Box — single source of truth for install commands
// The hero section (#install-box-source) is the canonical install component.
// The CTA section (#install-box-clone) receives a deep clone so commands
// only need to be updated in one place.  IDs are re-prefixed with "cta-"
// and ARIA cross-references (aria-controls, aria-labelledby) are updated
// to point at the new IDs, keeping both tab widgets independently accessible.
(function() {
    var source = document.getElementById('install-box-source');
    var target = document.getElementById('install-box-clone');
    if (!source || !target) return;

    var clone = source.cloneNode(true);
    var PREFIX = 'cta-';

    // Re-prefix all IDs so the clone has its own unique set
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(function(el) {
        el.id = PREFIX + el.id;
    });

    // Update ARIA cross-references to match the new IDs
    clone.querySelectorAll('[aria-controls]').forEach(function(el) {
        el.setAttribute('aria-controls', PREFIX + el.getAttribute('aria-controls'));
    });
    clone.querySelectorAll('[aria-labelledby]').forEach(function(el) {
        el.setAttribute('aria-labelledby', PREFIX + el.getAttribute('aria-labelledby'));
    });

    target.replaceWith(clone);
})();

// Install Tabs — scoped per install-box so each operates independently
(function() {
    document.querySelectorAll('.install-box').forEach(function(box) {
        var tabs = box.querySelectorAll('.install-tab');
        var panels = box.querySelectorAll('.install-panel');

        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetPanel = this.dataset.tab;

                // Update tabs within this box only
                tabs.forEach(function(t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // Update panels within this box only
                panels.forEach(function(p) {
                    p.classList.remove('active');
                    if (p.dataset.panel === targetPanel) {
                        p.classList.add('active');
                    }
                });
            });
        });
    });
})();

// Copy to Clipboard
(function() {
    function setupCopyButton(button) {
        if (!button) return;
        
        button.addEventListener('click', async function() {
            const command = this.dataset.command;
            
            try {
                await navigator.clipboard.writeText(command);
                showCopied(this);
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = command;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showCopied(this);
            }
        });
    }
    
    function showCopied(button) {
        button.classList.add('copied');
        setTimeout(() => {
            button.classList.remove('copied');
        }, 2000);
    }
    
    // Setup install command buttons (includes cloned CTA buttons)
    document.querySelectorAll('.install-command').forEach(setupCopyButton);
})();

// Auto-generate heading IDs and smooth scroll for anchor links
(function() {
    // Generate GitHub-style slug from heading text
    // GitHub preserves consecutive dashes (e.g. " - " becomes "---")
    const slugify = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Add id attributes to all headings that don't have one.
    // Uses DOM-based uniqueness check to avoid duplicate IDs when a heading's
    // text naturally produces a slug matching a previous duplicate's suffixed
    // slug (e.g. headings "My Title", "My Title", "My Title-2").
    document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4').forEach((heading) => {
        if (heading.id) return;
        const baseSlug = slugify(heading.textContent);
        if (!baseSlug) return;

        let slug = baseSlug;
        let counter = 1;
        while (document.getElementById(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
        heading.id = slug;
    });

    // Smooth scroll for anchor links, update URL hash
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.replaceState(null, '', window.location.pathname);
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', href);
            }
        });
    });

    // On page load, scroll to hash target after all resources (CSS, images)
    // are loaded so layout is stable and scrollIntoView positions correctly.
    window.addEventListener('load', () => {
        if (window.location.hash) {
            const hashTarget = document.querySelector(window.location.hash);
            if (hashTarget) {
                hashTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
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
