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
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
    
    // Listen for system preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
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
    const source = document.getElementById('install-box-source');
    const target = document.getElementById('install-box-clone');
    if (!source || !target) return;

    const clone = source.cloneNode(true);
    const PREFIX = 'cta-';

    // Re-prefix all IDs so the clone has its own unique set
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((el) => {
        el.id = PREFIX + el.id;
    });

    // Update ARIA cross-references to match the new IDs
    clone.querySelectorAll('[aria-controls]').forEach((el) => {
        el.setAttribute('aria-controls', PREFIX + el.getAttribute('aria-controls'));
    });
    clone.querySelectorAll('[aria-labelledby]').forEach((el) => {
        el.setAttribute('aria-labelledby', PREFIX + el.getAttribute('aria-labelledby'));
    });

    target.replaceWith(clone);
})();

// Install Tabs — WAI-ARIA tabs pattern with keyboard navigation
// Implements roving tabindex, Arrow Left/Right (wrapping), Home/End,
// and Enter/Space activation per WAI-ARIA Authoring Practices.
// Scoped per install-box so hero and CTA clones operate independently.
(function() {
    document.querySelectorAll('.install-box').forEach((box) => {
        const tabs = Array.from(box.querySelectorAll('.install-tab'));
        const panels = box.querySelectorAll('.install-panel');

        // Activate a tab: update ARIA state, roving tabindex, panels, and focus
        const activateTab = (tab, moveFocus) => {
            const targetPanel = tab.dataset.tab;

            // Deactivate all tabs in this box
            tabs.forEach((t) => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            // Activate the target tab
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');

            // Switch panels and update aria-hidden
            panels.forEach((p) => {
                const isTarget = p.dataset.panel === targetPanel;
                p.classList.toggle('active', isTarget);
                if (isTarget) {
                    p.removeAttribute('aria-hidden');
                } else {
                    p.setAttribute('aria-hidden', 'true');
                }
            });

            if (moveFocus) {
                tab.focus();
            }
        };

        // Click handler — activate on click (mouse or implicit Enter/Space on button)
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                activateTab(tab, false);
            });
        });

        // Keyboard handler on the tablist for arrow navigation
        const tablist = box.querySelector('[role="tablist"]');
        if (tablist) {
            tablist.addEventListener('keydown', (e) => {
                const currentIndex = tabs.indexOf(e.target);
                if (currentIndex === -1) return;

                let nextIndex;
                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = (currentIndex + 1) % tabs.length;
                        break;
                    case 'ArrowLeft':
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = tabs.length - 1;
                        break;
                    default:
                        return; // Let other keys propagate normally
                }

                e.preventDefault();
                activateTab(tabs[nextIndex], true);
            });
        }
    });
})();

// Copy to Clipboard
(function() {
    function setupCopyButton(button) {
        if (!button) return;
        
        button.addEventListener('click', async () => {
            const command = button.dataset.command;
            
            try {
                await navigator.clipboard.writeText(command);
                showCopied(button);
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
                showCopied(button);
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
            const target = document.getElementById(href.slice(1));
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
            const hashTarget = document.getElementById(window.location.hash.slice(1));
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
