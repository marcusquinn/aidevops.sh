# AI DevOps website design and brand guide

This file records the approved styling and branding for `aidevops.sh`.
Keep it in sync with `styles.css`, `index.html`, `favicon.svg`, and `og-image.svg` when visual assets change.

AI DevOps has one brand and two design files:

| File | Owns |
|---|---|
| `marcusquinn/aidevops.sh` → `DESIGN.md` (this file) | The public website: page layout, hero, social graph image, favicon and avatar asset generation, website responsive rules |
| `marcusquinn/aidevops` → `DESIGN.md` | The apps and framework surfaces: desktop/web GUI, dashboards, chat sidebar, generated reports, README hero, agent avatars, and design/print artwork produced by agents |

The **Brand core** section below is byte-identical in both files. Change it in both repos in the same session, then run the sync check at the end of the section. For this website, the CSS custom properties in `styles.css` remain the implementation source of truth; the Brand core records them for every other surface.

<!-- BRAND-CORE:START (keep byte-identical in marcusquinn/aidevops and marcusquinn/aidevops.sh DESIGN.md) -->

## Brand core

### Identity and messaging

- Formal product name: `AI DevOps`. Wordmark: lowercase `aidevops` beside the prompt glyph. Domain signature: `aidevops.sh`.
- Positioning: `AI DevOps Assistant & OpenCode Plugin`.
- Approved headline (the elevator pitch): `Token-efficiency harness & curated skills for speed, teamwork, and secure 24/7 development agents.` Supporting line: `The open-source OpenCode plugin for AI Git workflow automation`. Eyebrow: `24/7 DEVELOPMENT`. Two-line layouts break after `for`, keeping the speed/teamwork/secure list together.
- Install command: `bash <(curl -fsSL aidevops.sh/install)`.
- Voice: terminal-native, precise, autonomous, trustworthy. Short declarative copy; no hype, exclamation marks, or emoji in brand surfaces.

### Look properties

Apply these to every brand surface - website, apps, reports, social images, print, and agent-made artwork:

1. **Black first.** Dark theme is the default brand expression: pure black `#000000` page, near-black `#030707` alternate sections, `#050606`/`#0b0d0e` surfaces. Never navy, slate, or GitHub grey (`#0d1117`, `#161b22`, `#21262d`).
2. **One accent.** Cyan `#66d9f2` is the only brand hue. Use it sparingly for the mark, primary action, active/focus state, key numbers, links, and command text - roughly 5-10% of a composition. No second brand colour.
3. **Light from the accent.** Depth comes from soft cyan radial glows (`rgba(102,217,242,0.18)` fading to transparent, heavily blurred) behind hero content, and from cyan-tinted hairline borders (`rgba(102,217,242,0.18)`, `0.42` on hover). Drop shadows are black, soft, and reserved for the app icon, the install box, and primary buttons.
4. **High contrast text.** White headlines; secondary copy at 86% white and muted copy at 66% white, never lower for readable text.
5. **Terminal motifs.** Prompt glyph `>_`, monospace command pills in cyan on a near-black surface, window-frame dots (`#ff5f57`, `#febc2e`, `#28c840`) only on terminal/window chrome.
6. **Generous, rounded, calm.** Rounded cards (12-16px), rounded buttons (10-16px), generous padding, centred hero compositions, restrained motion (0.2-0.3s ease).

### Colour tokens

Dark (default) - from aidevops.sh `styles.css` `:root`:

| Role | Value |
|---|---|
| Background primary / secondary / tertiary | `#000000` / `#030707` / `#0b1012` |
| Surface / raised surface / code surface | `#050606` / `#0b0d0e` / `#050606` |
| Text primary / secondary / muted | `#ffffff` / `rgba(255,255,255,0.86)` / `rgba(255,255,255,0.66)` |
| Accent / hover / strong | `#66d9f2` / `#8ce8ff` / `#42c8e8` |
| Text on accent fill | `#001014` |
| Accent subtle fill / glow / hover fill | `rgba(102,217,242,0.16)` / `0.18` / `0.22` |
| Border / border hover | `rgba(102,217,242,0.18)` / `rgba(102,217,242,0.42)` |

Light - from aidevops.sh `styles.css` `[data-theme="light"]`:

| Role | Value |
|---|---|
| Background primary / secondary / tertiary | `#f7fbfc` / `#edf6f8` / `#ffffff` |
| Surface / raised surface | `#ffffff` / `#f8fdff` |
| Text primary / secondary / muted | `#071013` / `rgba(7,16,19,0.84)` / `rgba(7,16,19,0.62)` |
| Accent / hover / strong | `#0d6f84` / `#0a8ca8` / `#064f60` |
| Text on accent fill | `#ffffff` |
| Border / border hover | `rgba(13,111,132,0.18)` / `rgba(13,111,132,0.38)` |

The accent hue is 191°; app themes may vary saturation/lightness for contrast modes but never the hue. Verified contrast: `#001014` on `#66d9f2` ≈ 11.8:1, white on `#0d6f84` ≈ 5.8:1, `#66d9f2` on black ≈ 12.8:1.

### Typography

- UI, marketing, and print copy: `Inter`, falling back to `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- Commands, code, and terminal surfaces: `Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`.
- Headlines: weight 700, tight tracking (`-0.02em` to `-0.03em`). The hero wordmark `AI DevOps` may use a white→cyan 135° text gradient on dark (white→`#064f60` on light).
- Body: weight 400, line-height 1.5-1.6, `text-wrap: pretty` for paragraphs and `balance` for headings.

### Brand mark and app icon

- The mark is the cyan terminal prompt glyph (Font Awesome `terminal` path, viewBox `0 0 576 512`) used in the aidevops.sh navigation. Never reintroduce the old `AI` letter mark.
- Inline/nav use: glyph in accent cyan beside the `aidevops` wordmark in primary text colour.
- App icon construction on a `1024x1024` canvas, as in aidevops.sh `favicon.svg` - reproduce every layer; a flat tint over the tile is off-brand:
  1. Tile: `848x848` at `88,88`, corner radius `188`, linear gradient top-left→bottom-right `#000000`→`#030707`.
  2. Glow: same tile shape filled with a radial gradient centred at 50%, radius 62%, `#66d9f2` at 22% opacity fading to 0%.
  3. Ring: `792x792` at `116,116`, radius `160`, stroke `#66d9f2` at 36% opacity, width `18`, no fill.
  4. Shadow on tile + glow + ring: offset `0,34`, blur `38`, black at 45%.
  5. Glyph: fill `#8ce8ff`, placement `translate(512 522) scale(0.94) translate(-288 -256)` - optically centred, nudged right/down because `>` is left-heavy.
- Scale every value proportionally for other canvas sizes; keep the glyph recognisable at 16px.
- Circular avatars: `1024x1024`, background inside radius `504`, essential detail inside radius `451`, glyph `translate(512 521) scale(1.08) translate(-288 -256)`.
- Content-bearing icon SVGs carry `<title>` and `<desc>`.

### Actions and status

- Primary action: cyan `#66d9f2` fill, `#001014` text, weight 700, hover `#8ce8ff` (light theme: `#0d6f84` fill, white text, hover `#064f60`; light `#0a8ca8` is for link/text hover only because white on it is 3.9:1). One primary action per view or artwork.
- Secondary action: accent-subtle fill (`rgba(102,217,242,0.16)`), primary text colour, hover `0.22`.
- Focus: 3px ring in border-hover cyan; never remove focus without a visible replacement.
- Green, amber, and red are **status and destructive semantics only** (success/running, warning, error/delete) - never a brand or primary-action colour. Always pair status colour with a text label.

### Artwork, print, and social

- Composition: black-to-near-black background, one soft cyan radial glow behind the focal area, the app icon or glyph as the anchor, white Inter headline, muted supporting copy, one cyan primary CTA or command pill, `aidevops.sh` signature in accent cyan.
- Social graph image: `1200x630`, icon top-left without a circular blob behind it, approved eyebrow/title/headline/supporting line, install command pill, right-aligned `aidevops.sh`.
- Print: design in sRGB with live Inter text and vector marks; PDF export keeps text live. Full-bleed black needs 3mm bleed for commercial print; proof `#66d9f2` because bright cyan can fall outside coated CMYK gamuts.
- Don't: GitHub-dark palettes, green or blue primary buttons, flat cyan tint over icon tiles, glassmorphism, multiple accent hues, low-contrast grey body text, or stock-photo backgrounds.

### Sync check

Run from a directory containing both checkouts; no output means the cores match:

```sh
diff <(sed -n '/BRAND-CORE:START/,/BRAND-CORE:END/p' aidevops/DESIGN.md) <(sed -n '/BRAND-CORE:START/,/BRAND-CORE:END/p' aidevops.sh/DESIGN.md)
```

<!-- BRAND-CORE:END -->

## Website messaging

The Brand core sets identity and voice for every surface. These are the approved website-specific lines:

- Hero strapline: `Automating development and scaling teamwork — designed to work 24/7, so you don't have to.` It sits directly under the `AI DevOps` wordmark as `.hero-strapline` in the accent colour (`--accent`), semibold and smaller than the headline.
- Hero headline: `A smarter, safer, faster AI harness — for maximum token-efficiency, with every skill you need to design & build, all managed for you.` (September 2026). This longer line is website-only; the Brand core headline is the short elevator pitch used on the social image and app surfaces.
- Typography: use curly apostrophes, `&nbsp;` before em-dashes and around `&`, and `&#8209;` in hyphenated words that must not break (for example `token&#8209;efficiency`, `Opus&#8209;5.5+`), so phrases never wrap mid-thought on mobile.
- Page descriptions: the meta, Open Graph, Twitter, JSON-LD `WebPage`, and `site.webmanifest` descriptions use the Brand core pitch verbatim (headline + supporting line); JSON-LD `WebSite` uses the headline alone, and `SoftwareApplication` appends the capability list (September 2026).

## Landing page structure

Keep the home page ordered for conversion: promise, how it works, install steps, public proof, depth, breadth, objections, then a final call to action.

1. Hero: release badge (`Free & open source / vX.Y.Z`, links to GitHub releases), `AI DevOps` wordmark, approved strapline, approved headline, three-paragraph description (`.hero-description` wrapper: what it is — managed agents plus the OpenCode optimisation plugin for automating projects, subagents, and background workers; how it works across 150+ services; guided setup, recommendations of free and low-cost services, and AI DevOps as a teacher for all experience levels), canonical install box (`#install-box-source`), proof strip, then `See how it works` (primary, in-page) and `View on GitHub` (secondary), then `Works with`. Keep the install box above the fold on desktop: a `1.2` wordmark line-height and trimmed hero margins fit it at 1440×900 and taller, and the `(min-width: 769px) and (max-height: 880px)` compaction fits it down to 1366×768 (September 2026). Re-measure the install box bottom against the viewport when hero copy or spacing changes.
2. `#how-it-works`: title `From one request to verified, shipped work`, approved subtitle `You bring vision, taste, priorities, and approvals. AI DevOps runs delivery, freeing your time for the things only you can do.` (September 2026), then four cards (`Ask`, `Plan`, `Build safely`, `Verify & ship`) in reading order, with no `01`–`04` index labels (removed September 2026 to save space; the same applies to the `#github-memory` trail). Each has a short mono terminal line on the fixed dark code surface. `Verify & ship` carries the CI/CD claim (workflows designed and managed for you, with an `<abbr>` expansion for beginners); keep card copy within about two lines of its neighbours so the equal-height row does not leave large gaps. Grid goes 4 → 2 → 1 columns at `920px` and `520px`.
3. `#quickstart`: three install steps as an ordered list (`ol.quickstart-steps`) separated by hairlines, with no number circles (removed September 2026). Keep model recommendations in step 3 current.
4. `#stats`: kicker `24/7 Development`, title `Built in public, shipping around the clock`, capability strip, then live issue, pull request, and commit charts.
5. `#github-memory`: kicker `Your Git platform becomes a parallel teamwork audit-trail.` (was `GitHub as memory`; "Git platform" matches the upstream term for GitHub, GitLab, Gitea, and Forgejo), title `Quite possibly the best Git workflow harness in the world right now`, subtitle ending `Don't take our word for it: every receipt is built in public.` (September 2026), five linked evidence metrics (issue closure rate, merged PRs, workflow labels, AI-hours-per-human-hour leverage, commit-history.com rank), a six-card who/what/where/when/why/how trail reusing the `.how-step` card style, then two notes: GitHub API-limit design and self-aware/self-improving behaviour.
6. `#features`, then `#services`, `#faq`, and `#install` (final CTA with kicker, subtitle, cloned install box, and docs, GitHub, and X links).

### Proof and count rules

- Never overstate numbers. Round live counts down, never up.
- Hero proof strip: GitHub stars, commits, and pull requests are rounded down to the nearest hundred with `+`, hydrated by `script.js` from `data/aidevops-stats.json`. Static HTML values are fallbacks and must not exceed the latest data.
- Capability strip labels must match the upstream README hero labels exactly: **main agents**, **sub agents**, **helper scripts**, and **slash commands**. Never merge overlapping categories into one total. Values come from the README's rounded hero alt text; the exact counts go in the pill `title`.
- MCP servers: active entries in the upstream `mcp-registry.mjs` (before `DEPRECATED_MCPS`), rounded down to the nearest five.
- Integrations: the number of unique links listed in `#services`, rounded down to the nearest ten. Update the hero description, capability pill, and JSON-LD together when the list changes.
- `scripts/update_site_stats.py` refreshes `inventory`, `release`, `repoStats`, `activity`, `maintainer`, and `commitHistory` in the stats JSON, the social graph metrics, the JSON-LD `softwareVersion` / hero badge fallback, and the commit-history.com rank card on every deploy. Parsing failures are non-fatal and leave the static fallbacks in place.
- Hero version badge: the upstream `update-website-docs.yml` push-triggered docs sync deploys this site a few minutes before each GitHub release is published, and its release-triggered run exits with "No changes", so build-time versions usually trail by one release until the next push or the daily cron. `script.js` therefore confirms `releases/latest` live through the keyless, 15-minute-cached `fetchJson` and only ever advances the badge. The JSON-LD `softwareVersion` stays build-time. Never add a token or secret for this: the repository is public.
- GitHub memory metrics (`activity`, from the same paginated issues list as the monthly charts, plus one labels request): issue closure rate and PR merge rate are floored to one decimal place; merged PRs and closed issues round down to the nearest hundred; labels round down to the nearest ten. The PR merge rate is merged ÷ (merged + closed unmerged); open PRs are excluded.
- Maintainer leverage (`maintainer`, parsed from the `Work with AI` table on the maintainer's GitHub profile README): floor(AI generation hours ÷ human attention hours) over the prior 365 days, shown as `N×`, with all-time tokens floored to whole billions. Link the card to the profile so visitors can verify it.
- Commit-history.com rank (`commitHistory`, parsed keylessly from the server-rendered `Total rank` on the public `commit-history.com/marcusquinn?metric=total` profile): the deploy rewrites `#memoryRank` as a conservative bracket (rank rounded up to the next hundred, or the next ten inside the top 100, e.g. `#404` → `Top 500`), `#memoryRankDetail` with the observed rank and month, and the card `title` with the full date. The card links to the live source. When the page is unreachable or its markup changes, the build logs a warning and keeps the committed fallback, so refresh the committed values if that warning persists.
- Signing claims must match the implementation: signature footers are provenance text (version, runtime, model, time, tokens), not cryptographic signatures; cryptographic claims are limited to SSH-signed commits, maintainer approvals, and release tags.

### Services and integrations links

- Brand names link to the provider's official site, never to the aidevops agent doc. Source each URL from the project's own metadata (upstream doc, GitHub repo `homepage`, or GitHub org website) and confirm it resolves before merging. Never guess vendor URLs.
- Open-source projects whose only home is their GitHub repository link to that repository.
- Existing affiliate (`rel="sponsored"`) links stay as they are.
- The agent guides stay reachable through the services footer links to the upstream `services` and `tools` folders.
- No per-service status badges (`soon`, `beta`, etc.): the list is not auto-maintained, so status labels go stale. List a service once aidevops has a guide or backend for it; link titles describe the product, never its support status (`.service-soon` retired, September 2026).
- Agent sandbox backends (Apple container, Firecracker microVMs, Linux Bubbles) sit after OrbStack in `Dev, Git & Agents`. `Linux Bubbles` is the site name for the `gonicus/bubbles` project (upstream backend id `bubbles`).
- Buzz (`buzz.xyz`, the aidevops team interface for people and agents) leads `Team Chat`. Don't confuse it with the unrelated Buzz transcription app in upstream `tools/voice/buzz.md`.
- A service may appear in more than one category when it is used for both (FluentCRM: `Business & Payments` and `Email`). The integrations count uses unique names, so duplicates never inflate it.
- Retired integrations are removed, not badged (Closte, September 2026).
- Adding, removing, or renaming a site service updates `data/services-sync.json` in the same PR. The scheduled services-sync check files a drift issue when upstream aidevops changes require a site review.

## Website colour usage

- Consume colours only through the `styles.css` custom properties (`--bg-*`, `--surface*`, `--text-*`, `--accent*`, `--border*`, `--code-bg`, `--dot-*`); do not hard-code hex values in new rules.
- Primary buttons (`.btn-primary`): `--accent` fill, `--accent-on-fill` text, 1rem radius, 700 weight, soft shadow; light-theme hover uses `--accent-strong` so white text keeps WCAG AA.
- Secondary and nav buttons (`.btn-secondary`, `.btn-nav`): `--accent-subtle` fill, `--text-primary` text, `--accent-hover-bg` on hover.
- Cards (`.feature-card`, `.stat-card`): `--surface-raised` with a `--border` hairline and 16px radius; hover moves the border to `--accent` with at most a 2px lift.
- Hero: a blurred radial `--accent-glow` ellipse behind centred content; the `AI DevOps` wordmark uses the white→accent 135° text gradient.
- Command text uses accent cyan on the `--surface` / `--code-bg` near-black command surface inside the window-frame install box.

## Website logo and asset placement

Construction values live in the Brand core; these are website-specific placements:

- Navigation: the prompt glyph inline SVG (`.nav-logo-icon`, 20px, `--accent`) beside the `aidevops` wordmark in `--text-primary`.
- App-icon glyph placement (`favicon.svg`): `translate(512 522) scale(0.94) translate(-288 -256)`.
- Profile avatar (`images/aidevops-avatar.svg`): `1024x1024`, circle inside radius `504`, essentials inside radius `451`, glyph `translate(512 521) scale(1.08) translate(-288 -256)`.
- Social-preview icon placement (`og-image.svg`): `translate(78 79) scale(0.145) translate(-288 -256)`.

## Social graph image rules

- Canvas: `1200x630`.
- Background: black-to-near-black gradient with soft cyan/teal radial glows and subtle wave accents.
- Top-left mark: clean rounded black icon box with cyan border and prompt glyph.
- Do not add a circular blob/glow behind the social graph icon mark.
- Approved eyebrow: `BUILD WEBSITES, APPS, CONTENT, MARKETING, SEO, BRAND ASSETS, AND BUSINESS AUTOMATIONS` (updated in #121).
- Approved title: `AI DevOps`.
- Approved headline: the Brand core headline in two lines at 32px (the elevator pitch shown when links are shared; September 2026): `Token-efficiency harness & curated skills for` / `speed, teamwork, and secure 24/7 development agents.` The second line must end inside the stats box's right edge (`x ≤ 1118`).
- Approved supporting line: the Brand core supporting line, `The open-source OpenCode plugin for AI Git workflow automation`.
- `og:image:alt` and `twitter:image:alt` in `index.html` repeat the headline and supporting line, so the alt text always describes what the image says. Update them together.
- Approved stats labels (numbers refreshed by `scripts/update_site_stats.py`):
  - `17 main agent experts` — upstream README `main agents`.
  - `6,900+ subagents skills & helpers` — `.agents` tree item count rounded down to the hundred.
  - `100+ /command shortcuts` — upstream README rounded `slash commands`.
- The middle stats label sits at `x="134"` so six-character values keep a visible gap.
- Install command pill:
  - Command: `bash <(curl -fsSL aidevops.sh/install)`.
  - Current pill width: `610`.
  - Preserve extra right padding so the command does not feel cramped.
- Footer/domain label: `aidevops.sh`, right-aligned in accent cyan.

## Asset generation and cache busting

- Source SVG files:
  - `images/aidevops-avatar.svg`
  - `favicon.svg`
  - `og-image.svg`
- Generated raster assets:
  - `images/aidevops-avatar.png`
  - `og-image.png`
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `favicon-48x48.png`
  - `favicon.ico`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
- Current public cache-buster versions: social image `og-image.png?v=5`; favicons and app icons `v=5`; manifest `site.webmanifest?v=6`; `styles.css?v=22`; `script.js?v=8`.
- CI rewrites `og-image.svg` but does not re-render `og-image.png`. Re-render the PNG with `sips` and bump its cache-buster when social metrics change materially.
- Bump the matching cache-buster whenever committed asset bytes change.
- Keep `index.html` and `site.webmanifest` cache-busters in sync.

macOS `sips` renders these SVG assets reliably in this repo. ImageMagick may fail on the social SVG when text, `letter-spacing`, or missing delegates are involved, but it remains suitable for combining PNG favicon sizes into `favicon.ico`.

Recommended generation commands:

```sh
sips -s format png images/aidevops-avatar.svg --out images/aidevops-avatar.png
sips -s format png og-image.svg --out og-image.png
sips -s format png -z 16 16 favicon.svg --out favicon-16x16.png
sips -s format png -z 32 32 favicon.svg --out favicon-32x32.png
sips -s format png -z 48 48 favicon.svg --out favicon-48x48.png
sips -s format png -z 180 180 favicon.svg --out apple-touch-icon.png
sips -s format png -z 192 192 favicon.svg --out android-chrome-192x192.png
sips -s format png -z 512 512 favicon.svg --out android-chrome-512x512.png
magick favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico
```

## Preview and review workflow

- Use a preview-first workflow for icon/social graph changes.
- Generate shareable previews or a contact sheet before committing visual changes.
- Verify `images/aidevops-avatar.svg` and `images/aidevops-avatar.png` are both
  `1024x1024`; the PNG must retain transparency outside its circular background
  and keep all essential avatar details inside the circle-crop safe area.
- Compare favicon sizes at `16`, `32`, and `48` pixels; the prompt glyph must stay recognisable.
- Check the social graph at full size and social-preview size; the install command needs visible right padding.
- Verify live deploys by comparing live asset hashes against committed bytes after GitHub Pages deployment.

## Responsive layout rules

- Mobile pages must avoid document-level horizontal scrolling; oversized components should wrap, stack, or scroll inside their own card. Decorative layers wider than the viewport (the hero glow is `min(800px, 150vw)`) sit inside an `overflow-x: clip` parent; `body { overflow-x: hidden }` alone does not stop `scrollWidth` growing. Check `document.documentElement.scrollWidth === clientWidth` at `390` and `360` pixels.
- Section gutters collapse to the section padding at tablet/mobile widths so cards keep enough internal space.
- Stats card headings and source pills stack on mobile; source text may wrap instead of forcing card overflow.
- Capability strip goes 6 → 3 → 2 columns at `920px` and `768px`; never a single column, so the six proof numbers stay in one phone viewport.
- GitHub memory metrics go 5 → 3 + 2 → 2 + 2 + 1 (last card full width) at `920px` and `768px`, with no orphan gaps. The who-to-how trail goes 3 → 2 → 1 columns at `920px` and `520px`; the two notes stack at `920px`.
- Hero proof strip stays on one row at desktop widths (`max-width: 820px`) and wraps naturally on narrow screens. Short inline commands such as `/full-loop` never break mid-token.
- Chart cards keep horizontal scroll contained within `.monthly-chart`; the whole page should remain width-safe at `320`, `360`, `390`, `414`, and `768` pixel viewports.
- Monthly bar charts must reserve enough vertical clearance for the tallest generated stack so rounded bar tops and glow are not clipped.
- Dense line charts should sit inside their own horizontal scroll wrapper on mobile instead of scaling until labels and peaks are unreadable.
- Mobile navigation should preserve Docs, GitHub, social, and theme actions as compact icon buttons rather than dropping links.
- The `.agents` file browser stacks tree above content on mobile. Search paths, breadcrumbs, file names, and preview text wrap within the card rather than clipping behind the right edge.
- Install commands, quickstart command snippets, service links, and other long strings should use wrapping/word-break rules that preserve tap targets and readability.

## Verification checklist

Before merging visual changes, run:

```sh
node --check script.js
python3 -m json.tool data/aidevops-stats.json >/dev/null
python3 -m json.tool site.webmanifest >/dev/null
python3 -m html.parser index.html >/dev/null
git diff --check
magick identify images/aidevops-avatar.svg images/aidevops-avatar.png og-image.svg og-image.png favicon.svg favicon-16x16.png favicon-32x32.png favicon-48x48.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png favicon.ico
```

- Inspect `images/aidevops-avatar.png` to confirm its corners are transparent
  and all essential avatar details remain inside the circle-crop safe area.
- If the Brand core changed, run its sync check against a `marcusquinn/aidevops` checkout.
