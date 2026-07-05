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

    // Re-prefix IDs and update ARIA cross-references in a single pass
    clone.removeAttribute('id');
    clone.querySelectorAll('[id], [aria-controls], [aria-labelledby]').forEach((el) => {
        if (el.id) {
            el.id = PREFIX + el.id;
        }
        if (el.hasAttribute('aria-controls')) {
            el.setAttribute('aria-controls', PREFIX + el.getAttribute('aria-controls'));
        }
        if (el.hasAttribute('aria-labelledby')) {
            el.setAttribute('aria-labelledby', PREFIX + el.getAttribute('aria-labelledby'));
        }
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

    function ensureDocsFavicons() {
        if (!document.body.classList.contains('docs-page')) return;

        const faviconLinks = [
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=5' },
            { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/favicon.svg?v=5' },
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=5' },
            { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png?v=5' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png?v=5' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png?v=5' },
            { rel: 'manifest', href: '/site.webmanifest?v=5' }
        ];

        document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').forEach((link) => {
            link.remove();
        });

        faviconLinks.forEach((config) => {
            const link = document.createElement('link');
            Object.entries(config).forEach(([key, value]) => link.setAttribute(key, value));
            document.head.appendChild(link);
        });
    }

    function ensureDocsMetricBadges() {
        if (!document.body.classList.contains('docs-page')) return;

        const githubBlobPrefix = 'https://github.com/marcusquinn/aidevops/blob/main/docs/metrics/badges/';
        const rawGithubPrefix = 'https://raw.githubusercontent.com/marcusquinn/aidevops/main/docs/metrics/badges/';

        document.querySelectorAll(`.docs-content img[src^="${githubBlobPrefix}"]`).forEach((image) => {
            image.src = image.src.replace(githubBlobPrefix, rawGithubPrefix);
        });
    }

    function createDocsSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'docs-sidebar';
        sidebar.setAttribute('aria-label', 'Documentation navigation');
        sidebar.innerHTML = `
            <nav class="docs-sidebar-inner">
                <div class="docs-sidebar-section">
                    <p class="docs-sidebar-label">Pages</p>
                    <a class="docs-sidebar-link active" href="docs.html">Documentation</a>
                    <a class="docs-sidebar-link docs-sidebar-child active" href="docs.html" aria-current="page">README</a>
                </div>
                <div class="docs-sidebar-section docs-toc-section">
                    <p class="docs-sidebar-label">On this page</p>
                    <ol class="docs-toc" id="docsToc" aria-label="Table of contents"></ol>
                </div>
            </nav>`;
        return sidebar;
    }

    function createDocsMobileNav() {
        const mobileNav = document.createElement('details');
        mobileNav.className = 'docs-mobile-nav';
        mobileNav.innerHTML = `
            <summary>Documentation navigation</summary>
            <div class="docs-mobile-nav-panel">
                <a class="docs-sidebar-link active" href="docs.html">Documentation</a>
                <a class="docs-sidebar-link docs-sidebar-child active" href="docs.html" aria-current="page">README</a>
                <p class="docs-sidebar-label">On this page</p>
                <ol class="docs-toc" id="docsMobileToc" aria-label="Mobile table of contents"></ol>
            </div>`;
        return mobileNav;
    }

    function ensureDocsShell() {
        if (!document.body.classList.contains('docs-page')) return;
        if (document.querySelector('.docs-shell')) return;

        const legacyContainer = document.querySelector('main.docs-container');
        if (!legacyContainer) return;

        const shell = document.createElement('main');
        shell.className = 'docs-shell';
        legacyContainer.replaceWith(shell);
        shell.appendChild(createDocsSidebar());
        shell.appendChild(createDocsMobileNav());

        const contentContainer = document.createElement('div');
        contentContainer.className = 'docs-container';
        while (legacyContainer.firstChild) {
            contentContainer.appendChild(legacyContainer.firstChild);
        }
        shell.appendChild(contentContainer);
    }

    ensureDocsFavicons();
    ensureDocsMetricBadges();
    ensureDocsShell();

    const tocTargets = Array.from(document.querySelectorAll('.docs-content h2, .docs-content h3'));
    const tocContainers = [
        document.getElementById('docsToc'),
        document.getElementById('docsMobileToc')
    ].filter(Boolean);

    function buildToc(container) {
        if (!container || tocTargets.length === 0) return;
        const fragment = document.createDocumentFragment();

        tocTargets.forEach((heading) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
            link.className = `docs-toc-link depth-${heading.tagName.slice(1)}`;
            link.dataset.tocTarget = heading.id;
            item.appendChild(link);
            fragment.appendChild(item);
        });

        container.replaceChildren(fragment);
    }

    tocContainers.forEach(buildToc);

    const tocLinks = Array.from(document.querySelectorAll('.docs-toc-link'));

    function setActiveTocLink(id) {
        if (!id) return;
        tocLinks.forEach((link) => {
            if (link.dataset.tocTarget === id) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'location');
            } else if (link.classList.contains('active')) {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    if ('IntersectionObserver' in window && tocTargets.length > 0) {
        const intersectingHeadings = new Set();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    intersectingHeadings.add(entry.target.id);
                } else {
                    intersectingHeadings.delete(entry.target.id);
                }
            });

            const activeHeading = tocTargets.find((heading) => intersectingHeadings.has(heading.id));
            if (activeHeading) {
                setActiveTocLink(activeHeading.id);
            }
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0.01 });

        tocTargets.forEach((heading) => observer.observe(heading));
    }

    if (tocTargets[0]) {
        setActiveTocLink(tocTargets[0].id);
    }

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
                setActiveTocLink(target.id);
                const mobileNav = anchor.closest('.docs-mobile-nav');
                if (mobileNav) mobileNav.open = false;
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

// Repository Stats Panel
(function() {
    const REPO = 'marcusquinn/aidevops';
    const API = 'https://api.github.com';
    const CACHE_TTL_MS = 15 * 60 * 1000;
    const SITE_STATS_PATH = 'data/aidevops-stats.json';
    const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/HEAD/`;
    const MONTHLY_STATS = {
        generatedAt: '2026-07-03',
        issues: [{month:'2025-11',opened:0,closed:0},{month:'2025-12',opened:0,closed:0},{month:'2026-01',opened:4,closed:4},{month:'2026-02',opened:947,closed:944},{month:'2026-03',opened:8055,closed:7631},{month:'2026-04',opened:3328,closed:3704},{month:'2026-05',opened:1138,closed:1164},{month:'2026-06',opened:1022,closed:1010},{month:'2026-07',opened:142,closed:166}],
        prs: [{month:'2025-11',opened:4,closed:4},{month:'2025-12',opened:3,closed:3},{month:'2026-01',opened:260,closed:260},{month:'2026-02',opened:1384,closed:1384},{month:'2026-03',opened:4384,closed:4224},{month:'2026-04',opened:3600,closed:3758},{month:'2026-05',opened:1223,closed:1224},{month:'2026-06',opened:763,closed:759},{month:'2026-07',opened:125,closed:128}]
    };
    let agentsTreeItems = [];
    let currentAgentsPath = '.agents';
    let selectedAgentsPath = '.agents';
    let filePreviews = {};
    let siteStats = null;
    let chartTooltip = null;

    const $ = (id) => document.getElementById(id);

    function formatNumber(value) {
        if (typeof value !== 'number' || Number.isNaN(value)) return '--';
        return new Intl.NumberFormat('en').format(value);
    }

    function setText(id, value) {
        const el = $(id);
        if (!el) return;
        el.textContent = value;
    }

    function setSource(id, value) {
        const el = $(id);
        if (!el) return;
        el.textContent = value;
    }

    function ensureTooltip() {
        if (chartTooltip) return chartTooltip;
        chartTooltip = document.createElement('div');
        chartTooltip.className = 'chart-tooltip';
        document.body.appendChild(chartTooltip);
        return chartTooltip;
    }

    function showTooltip(text, event) {
        const tooltip = ensureTooltip();
        tooltip.textContent = text;
        tooltip.style.left = `${event.clientX + 14}px`;
        tooltip.style.top = `${event.clientY + 14}px`;
        tooltip.classList.add('visible');
    }

    function hideTooltip() {
        if (chartTooltip) chartTooltip.classList.remove('visible');
    }

    function clearChartHighlights(container) {
        if (!container) return;
        container.querySelectorAll('.is-hovered').forEach((el) => el.classList.remove('is-hovered'));
        if (container.id === 'commitChart') {
            const line = container.querySelector('.chart-hover-line');
            const dot = container.querySelector('.chart-hover-dot');
            if (line) line.setAttribute('hidden', '');
            if (dot) dot.setAttribute('hidden', '');
        }
    }

    function updateChartHighlight(container, target) {
        clearChartHighlights(container);
        const monthlyGroup = target.closest('.monthly-group');
        if (monthlyGroup) monthlyGroup.classList.add('is-hovered');

        if (container.id === 'commitChart' && target.dataset.chartX && target.dataset.chartY) {
            const x = target.dataset.chartX;
            const y = target.dataset.chartY;
            const line = container.querySelector('.chart-hover-line');
            const dot = container.querySelector('.chart-hover-dot');
            if (line) {
                line.setAttribute('x1', x);
                line.setAttribute('x2', x);
                line.removeAttribute('hidden');
            }
            if (dot) {
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.removeAttribute('hidden');
            }
        }
    }

    function bindTooltip(container) {
        if (!container || container.dataset.tooltipBound === 'true') return;
        container.dataset.tooltipBound = 'true';
        container.addEventListener('mousemove', (event) => {
            const target = event.target.closest('[data-tooltip]');
            if (!target || !container.contains(target)) {
                hideTooltip();
                clearChartHighlights(container);
                return;
            }
            updateChartHighlight(container, target);
            showTooltip(target.dataset.tooltip, event);
        });
        container.addEventListener('mouseleave', () => {
            hideTooltip();
            clearChartHighlights(container);
        });
    }

    async function fetchJson(path) {
        const cacheKey = `aidevops-stats:${path}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.savedAt < CACHE_TTL_MS) {
                    return parsed.data;
                }
            }
        } catch (error) {
            // Ignore storage errors; live data is best-effort.
        }

        const response = await fetch(`${API}${path}`, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }
        const data = await response.json();
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data }));
        } catch (error) {
            // Ignore quota or privacy-mode storage errors.
        }
        return data;
    }

    async function loadSiteStats() {
        try {
            const response = await fetch(SITE_STATS_PATH, { cache: 'no-store' });
            if (!response.ok) throw new Error(`stats fetch ${response.status}`);
            siteStats = await response.json();
        } catch (error) {
            siteStats = null;
        }
    }

    async function searchCount(query) {
        const data = await fetchJson(`/search/issues?q=${encodeURIComponent(query)}`);
        return data.total_count;
    }

    function updateMonthlySummary(prefix, rows) {
        const opened = rows.reduce((sum, row) => sum + row.opened, 0);
        const closed = rows.reduce((sum, row) => sum + row.closed, 0);
        setText(`${prefix}Open`, formatNumber(opened));
        setText(`${prefix}Closed`, formatNumber(closed));
    }

    function markUnavailable(prefix, labelId, chartId) {
        setSource(labelId, 'GitHub unavailable');
        setText(`${prefix}Open`, '--');
        setText(`${prefix}Closed`, '--');
        const chart = $(chartId);
        if (chart) chart.innerHTML = '<span class="monthly-loading">GitHub data unavailable</span>';
    }

    function monthLabel(month) {
        const [year, monthNumber] = month.split('-').map(Number);
        return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleString('en', {
            month: 'short',
            year: '2-digit'
        });
    }

    function shapeStack(count, maxCount, className) {
        const maxShapes = 18;
        const shapeCount = count > 0 ? Math.max(1, Math.round((count / maxCount) * maxShapes)) : 0;
        const shapes = Array.from({ length: shapeCount }, () => '<span class="monthly-shape"></span>').join('');
        return `<div class="monthly-bar ${className}">${shapes}</div>`;
    }

    function renderMonthlyChart(prefix, rows) {
        const chart = $(`${prefix}MonthlyChart`);
        if (!chart) return;
        const maxCount = Math.max(1, ...rows.flatMap((row) => [row.opened, row.closed]));
        chart.innerHTML = rows.map((row) => `
            <div class="monthly-group" data-tooltip="${monthLabel(row.month)}\nOpened: ${formatNumber(row.opened)}\nClosed: ${formatNumber(row.closed)}">
                <div class="monthly-bars">
                    ${shapeStack(row.opened, maxCount, 'monthly-open')}
                    ${shapeStack(row.closed, maxCount, 'monthly-closed')}
                </div>
                <div class="monthly-label">${monthLabel(row.month)}</div>
            </div>
        `).join('');
        bindTooltip(chart);
    }

    async function refreshTotals(prefix, sourceId, rows, generatedAt) {
        updateMonthlySummary(prefix, rows);
        renderMonthlyChart(prefix, rows);
        setSource(sourceId, `opened/closed by month, ${generatedAt}`);
    }

    function renderCommitChart(days) {
        const chart = $('commitChart');
        if (!chart) return;
        if (!days.length) {
            chart.innerHTML = '<text x="450" y="132" text-anchor="middle">Commit data unavailable</text>';
            return;
        }
        const width = 900;
        const height = 260;
        const pad = { top: 28, right: 24, bottom: 44, left: 52 };
        const chartWidth = width - pad.left - pad.right;
        const chartHeight = height - pad.top - pad.bottom;
        const maxValue = Math.max(1, ...days.map((day) => day.count));
        const step = chartWidth / Math.max(1, days.length - 1);
        let runningTotal = 0;
        const daysWithTotals = days.map((day) => {
            runningTotal += day.count;
            return { ...day, total: runningTotal };
        });
        const maxTotal = Math.max(1, runningTotal);
        const points = days.map((day, index) => {
            const x = pad.left + index * step;
            const y = pad.top + chartHeight - (day.count / maxValue) * chartHeight;
            const total = daysWithTotals[index].total;
            const totalY = pad.top + chartHeight - (total / maxTotal) * chartHeight;
            return { ...day, total, x, y, totalY };
        });
        const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
        const cumulativePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.totalY.toFixed(1)}`).join(' ');
        const area = `${path} L${points[points.length - 1].x.toFixed(1)},${pad.top + chartHeight} L${points[0].x.toFixed(1)},${pad.top + chartHeight} Z`;
        const monthTicks = points.filter((point, index) => index === 0 || point.date.endsWith('-01'));
        setText('commitsHeading', `Commits per day (${formatNumber(runningTotal)} to date)`);
        chart.innerHTML = `
            <line class="chart-grid" x1="${pad.left}" y1="${pad.top + chartHeight}" x2="${width - pad.right}" y2="${pad.top + chartHeight}"></line>
            <line class="chart-grid" x1="${pad.left}" y1="${pad.top + chartHeight / 2}" x2="${width - pad.right}" y2="${pad.top + chartHeight / 2}"></line>
            <path class="chart-line-cumulative" d="${cumulativePath}"></path>
            <path class="chart-area" d="${area}"></path>
            <path class="chart-line" d="${path}"></path>
            <line class="chart-hover-line" y1="${pad.top}" y2="${pad.top + chartHeight}" hidden></line>
            <circle class="chart-hover-dot" r="5" hidden></circle>
            ${points.map((point) => `<rect class="chart-hit" x="${(point.x - step / 2).toFixed(1)}" y="${pad.top}" width="${Math.max(4, step).toFixed(1)}" height="${chartHeight}" data-chart-x="${point.x.toFixed(1)}" data-chart-y="${point.y.toFixed(1)}" data-tooltip="${point.date}\nCommits: ${formatNumber(point.count)}\nTotal: ${formatNumber(point.total)}"></rect>`).join('')}
            ${monthTicks.map((point) => `<text x="${point.x.toFixed(1)}" y="238" text-anchor="middle">${monthLabel(point.date.slice(0, 7))}</text>`).join('')}
            <text x="${pad.left}" y="18" text-anchor="start">${formatNumber(maxValue)} commits</text>
        `;
        bindTooltip(chart);
    }

    async function loadCommitActivity() {
        if (siteStats?.commitsDaily?.length) {
            renderCommitChart(siteStats.commitsDaily);
            setSource('commitsSource', `daily worker, ${siteStats.generatedAt || 'latest'}`);
            return;
        }
        const weeks = await fetchJson(`/repos/${REPO}/stats/commit_activity`);
        if (!Array.isArray(weeks)) throw new Error('Commit activity unavailable');
        const days = [];
        weeks.forEach((week) => {
            week.days.forEach((count, offset) => {
                if (count === 0 && week.week < Date.UTC(2025, 10, 1) / 1000) return;
                const date = new Date((week.week + offset * 86400) * 1000).toISOString().slice(0, 10);
                if (date >= '2025-11-09') days.push({ date, count });
            });
        });
        renderCommitChart(days);
        setSource('commitsSource', 'GitHub commit activity');
    }

    function escapeHtml(value) {
        return value.replace(/[&<>"]/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[char]));
    }

    function decodeBase64Utf8(value) {
        if (!value) return '';
        try {
            const binary = atob(value);
            const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
            if (typeof TextDecoder !== 'undefined') {
                return new TextDecoder().decode(bytes);
            }
            return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
        } catch (error) {
            return '';
        }
    }

    function normalizeAgentTree(rawItems) {
        if (!Array.isArray(rawItems)) return [];
        return rawItems
            .map((item) => ({
                path: item.path || decodeBase64Utf8(item.path64),
                type: item.type
            }))
            .filter((item) => item.path && (item.type === 'tree' || item.type === 'blob'));
    }

    function normalizeAgentPreviews(rawPreviews, encoding) {
        const previews = {};
        Object.entries(rawPreviews || {}).forEach(([key, value]) => {
            const path = encoding === 'base64' ? decodeBase64Utf8(key) : key;
            const content = encoding === 'base64' ? decodeBase64Utf8(value) : value;
            if (path && typeof content === 'string') previews[path] = content;
        });
        return previews;
    }

    function displayPath(path) {
        return path === '.agents' ? '.agents/' : path;
    }

    function childItems(path) {
        const prefix = path === '.agents' ? '.agents/' : `${path}/`;
        const children = new Map();
        agentsTreeItems.forEach((item) => {
            if (!item.path.startsWith(prefix) || item.path === path) return;
            const remainder = item.path.slice(prefix.length);
            const next = remainder.split('/')[0];
            const childPath = `${prefix}${next}`;
            if (!children.has(childPath)) {
                const existing = agentsTreeItems.find((candidate) => candidate.path === childPath);
                children.set(childPath, existing || { path: childPath, type: 'tree' });
            }
        });
        return Array.from(children.values()).sort((a, b) => {
            if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
            return a.path.localeCompare(b.path);
        });
    }

    function parentPath(path) {
        if (path === '.agents') return '.agents';
        const parts = path.split('/');
        parts.pop();
        return parts.join('/') || '.agents';
    }

    function itemForPath(path) {
        return agentsTreeItems.find((candidate) => candidate.path === path) || { path, type: 'tree' };
    }

    function githubLinkForPath(path, type) {
        return `https://github.com/${REPO}/${type === 'blob' ? 'blob' : 'tree'}/main/${path}`;
    }

    function renderPathHeader(path) {
        const header = $('agentsContentPath');
        if (!header) return;
        const parts = path.split('/');
        const crumbs = parts.map((part, index) => {
            const crumbPath = parts.slice(0, index + 1).join('/');
            const suffix = index === parts.length - 1 && itemForPath(path).type === 'tree' ? '/' : '';
            return `<button class="agents-path-link" type="button" data-path="${escapeHtml(crumbPath)}">${escapeHtml(part)}${suffix}</button>`;
        });
        header.innerHTML = crumbs.join('<span class="agents-path-separator">/</span>');
        header.querySelectorAll('.agents-path-link').forEach((button) => {
            button.addEventListener('click', () => selectTreeItem(button.dataset.path));
        });
    }

    function setContent(path, text, link) {
        renderPathHeader(path);
        const content = $('agentsContent');
        const anchor = $('agentsContentLink');
        if (content) content.innerHTML = highlightContent(path, text);
        if (anchor) anchor.href = link;
    }

    function setDirectoryContent(path, html, link) {
        renderPathHeader(path);
        const content = $('agentsContent');
        const anchor = $('agentsContentLink');
        if (content) content.innerHTML = html;
        if (anchor) anchor.href = link;
    }

    function highlightCode(text, options = {}) {
        const isMarkdown = Boolean(options.isMarkdown);
        const escapedLines = text.split('\n').map((line) => {
            const escaped = escapeHtml(line);
            if (isMarkdown && /^\s*#{1,6}\s/.test(line)) return `<span class="syntax-heading">${escaped}</span>`;
            if (/^\s*```/.test(line)) return `<span class="syntax-fence">${escaped}</span>`;
            if (/^\s*(#|\/\/|<!--)/.test(line)) return `<span class="syntax-comment">${escaped}</span>`;
            if (/^\s*[-*+]\s/.test(line)) return `<span class="syntax-list">${escaped}</span>`;
            return escaped
                .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="syntax-string">$1</span>')
                .replace(/\b(async|await|case|const|done|do|else|export|fi|for|function|if|import|let|local|return|then|var|while)\b/g, '<span class="syntax-keyword">$1</span>')
                .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-number">$1</span>');
        });
        return escapedLines.join('\n');
    }

    window.aidevopsHighlightCode = highlightCode;

    function highlightContent(path, text) {
        return highlightCode(text, { isMarkdown: /\.(md|markdown)$/i.test(path) });
    }

    function renderDirectory(path) {
        const children = childItems(path);
        const rows = [];
        if (path !== '.agents') {
            const parent = parentPath(path);
            rows.push(`<a class="agents-content-item parent" href="${githubLinkForPath(parent, 'tree')}" data-path="${escapeHtml(parent)}">↰ ../</a>`);
        }
        children.slice(0, 240).forEach((child) => {
            const icon = child.type === 'tree' ? '▸' : '•';
            const name = `${child.path.split('/').pop()}${child.type === 'tree' ? '/' : ''}`;
            rows.push(`<a class="agents-content-item ${child.type === 'tree' ? 'folder' : 'file'}" href="${githubLinkForPath(child.path, child.type)}" data-path="${escapeHtml(child.path)}">${icon} ${escapeHtml(name)}</a>`);
        });
        if (children.length > 240) rows.push(`<span class="agents-directory-more">… ${children.length - 240} more items</span>`);
        setDirectoryContent(path, rows.join(''), githubLinkForPath(path, 'tree'));
        const content = $('agentsContent');
        if (content) {
            content.querySelectorAll('.agents-content-item').forEach((link) => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    selectTreeItem(link.dataset.path);
                });
            });
        }
    }

    async function renderFile(path) {
        if (filePreviews[path]) {
            setContent(path, filePreviews[path], githubLinkForPath(path, 'blob'));
            return;
        }
        setContent(path, 'Loading file...', githubLinkForPath(path, 'blob'));
        try {
            const response = await fetch(`${RAW_BASE}${path}`);
            if (!response.ok) throw new Error(`raw fetch ${response.status}`);
            const text = await response.text();
            if (selectedAgentsPath !== path) return;
            setContent(path, text.slice(0, 60000), githubLinkForPath(path, 'blob'));
        } catch (error) {
            if (selectedAgentsPath !== path) return;
            setContent(path, 'Could not load this file from GitHub raw content.', githubLinkForPath(path, 'blob'));
        }
    }

    function selectTreeItem(path) {
        const item = itemForPath(path);
        selectedAgentsPath = path;
        document.querySelectorAll('.agents-tree-item').forEach((button) => {
            button.classList.toggle('active', button.dataset.path === path);
        });
        if (item.type === 'tree') {
            currentAgentsPath = path;
            renderDirectory(path);
            const search = $('agentsSearch');
            if (search) search.value = '';
            renderAgentsTree('');
        } else {
            currentAgentsPath = parentPath(path);
            renderFile(path);
            const search = $('agentsSearch');
            if (search) search.value = '';
            renderAgentsTree('');
        }
    }

    function treeButton(item, label, extraClass) {
        const isActive = item.path === selectedAgentsPath;
        return `<button class="agents-tree-item ${item.type === 'tree' ? 'folder' : 'file'} ${extraClass || ''} ${isActive ? 'active' : ''}" type="button" role="treeitem" data-path="${escapeHtml(item.path)}">${escapeHtml(label)}</button>`;
    }

    function renderAgentsTree(filter) {
        const tree = $('agentsTree');
        if (!tree) return;
        const query = filter.trim().toLowerCase();
        let visible;
        if (query) {
            visible = agentsTreeItems
                .filter((item) => item.path.toLowerCase().includes(query))
                .slice(0, 500)
                .map((item) => treeButton(item, `${item.type === 'tree' ? '▸' : '•'} ${item.path}`, 'search-result'));
        } else {
            const rows = [treeButton(itemForPath(currentAgentsPath), displayPath(currentAgentsPath), 'current')];
            if (currentAgentsPath !== '.agents') {
                rows.push(treeButton(itemForPath(parentPath(currentAgentsPath)), '↰ ../', 'parent'));
            }
            childItems(currentAgentsPath).forEach((item) => {
                const name = item.path.split('/').pop();
                rows.push(treeButton(item, `${item.type === 'tree' ? '▸' : '•'} ${name}${item.type === 'tree' ? '/' : ''}`, ''));
            });
            visible = rows;
        }
        tree.innerHTML = visible.join('');
        tree.querySelectorAll('.agents-tree-item').forEach((button) => {
            button.addEventListener('click', () => selectTreeItem(button.dataset.path));
        });
    }

    async function loadAgentsExplorer() {
        if (siteStats?.agents?.tree?.length > 20) {
            agentsTreeItems = [{ path: '.agents', type: 'tree' }].concat(normalizeAgentTree(siteStats.agents.tree));
            filePreviews = normalizeAgentPreviews(siteStats.agents.previews, siteStats.agents.encoding);
            currentAgentsPath = '.agents';
            selectedAgentsPath = '.agents';
            renderAgentsTree('');
            renderDirectory('.agents');
            setSource('folderSource', `${formatNumber(Math.max(0, agentsTreeItems.length - 1))} agents & helpers`);
            const search = $('agentsSearch');
            if (search) search.addEventListener('input', () => renderAgentsTree(search.value));
            return;
        }
        const data = await fetchJson(`/repos/${REPO}/git/trees/HEAD?recursive=1`);
        agentsTreeItems = [{ path: '.agents', type: 'tree' }].concat(
            data.tree
                .filter((item) => item.path.startsWith('.agents/'))
                .map((item) => ({ path: item.path, type: item.type }))
                .sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
                    return a.path.localeCompare(b.path);
                })
        );
        currentAgentsPath = '.agents';
        selectedAgentsPath = '.agents';
        renderAgentsTree('');
        renderDirectory('.agents');
        setSource('folderSource', `${formatNumber(Math.max(0, agentsTreeItems.length - 1))} agents & helpers`);

        const search = $('agentsSearch');
        if (search) {
            search.addEventListener('input', () => renderAgentsTree(search.value));
        }
    }

    function initAgentsFallback() {
        agentsTreeItems = [
            { path: '.agents', type: 'tree' },
            { path: '.agents/scripts', type: 'tree' },
            { path: '.agents/workflows', type: 'tree' },
            { path: '.agents/reference', type: 'tree' },
            { path: '.agents/tools', type: 'tree' },
            { path: '.agents/AGENTS.md', type: 'blob' }
        ];
        currentAgentsPath = '.agents';
        selectedAgentsPath = '.agents';
        renderAgentsTree('');
        renderDirectory('.agents');
        setSource('folderSource', 'sample agents & helpers');
    }

    async function initStatsPanel() {
        if (!$('issuesMonthlyChart')) return;
        await loadSiteStats();
        const monthly = siteStats?.monthly || MONTHLY_STATS;
        const generatedAt = siteStats?.generatedAt || MONTHLY_STATS.generatedAt;
        try {
            await Promise.all([
                refreshTotals('issues', 'issuesSource', monthly.issues || MONTHLY_STATS.issues, generatedAt).catch(() => markUnavailable('issues', 'issuesSource', 'issuesMonthlyChart')),
                refreshTotals('prs', 'prsSource', monthly.prs || MONTHLY_STATS.prs, generatedAt).catch(() => markUnavailable('prs', 'prsSource', 'prsMonthlyChart')),
                loadCommitActivity().catch(() => setSource('commitsSource', 'unavailable')),
                loadAgentsExplorer().catch(() => {
                    initAgentsFallback();
                })
            ]);
        } catch (error) {
            // Per-panel fallbacks above handle failures.
        }
    }

    initStatsPanel();
})();

// Documentation Code Blocks — reuse the .agents preview syntax palette
(function() {
    const highlighter = window.aidevopsHighlightCode;
    if (typeof highlighter !== 'function') return;

    document.querySelectorAll('.docs-content pre code').forEach((code) => {
        const languageClass = Array.from(code.classList).find((className) => className.startsWith('language-')) || '';
        const isMarkdown = /language-(markdown|md)/i.test(languageClass);
        code.innerHTML = highlighter(code.textContent, { isMarkdown });
        code.closest('pre')?.classList.add('docs-codeblock-coloured');
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
    
    // Observe feature cards and service categories. Stats panels stay visible immediately.
    document.querySelectorAll('.feature-card, .service-category').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
})();
