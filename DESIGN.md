# AI DevOps website design and brand guide

This file records the current approved styling and branding preferences for `aidevops.sh`.
Keep it in sync with `styles.css`, `index.html`, `favicon.svg`, and `og-image.svg` when visual assets change.

## Brand identity

- Formal product name: `AI DevOps`.
- Navigation wordmark: `aidevops` with the terminal prompt glyph.
- Site/domain signature: `aidevops.sh`.
- Primary positioning: `AI DevOps Assistant & OpenCode Plugin`.
- Approved headline/tagline: `Scaleable teamwork you can trust`.
- Supporting line: `OpenCode plugin for autonomous project delivery`.
- Visual tone: terminal-native, precise, autonomous, trustworthy, and high-contrast.

## Colour system

Use the CSS custom properties in `styles.css` as the source of truth.

### Dark theme

- Primary background: `#000000`.
- Secondary background: `#030707`.
- Tertiary background: `#0b1012`.
- Surface: `#050606`.
- Raised surface: `#0b0d0e`.
- Primary text: `#ffffff`.
- Secondary text: `rgba(255, 255, 255, 0.86)`.
- Muted text: `rgba(255, 255, 255, 0.66)`.
- Accent cyan: `#66d9f2`.
- Accent hover: `#8ce8ff`.
- Strong accent: `#42c8e8`.

### Light theme

- Primary background: `#f7fbfc`.
- Secondary background: `#edf6f8`.
- Surface: `#ffffff`.
- Primary text: `#071013`.
- Accent: `#0d6f84`.
- Accent hover: `#0a8ca8`.
- Strong accent: `#064f60`.

### Terminal details

- Red dot: `#ff5f57`.
- Yellow dot: `#febc2e`.
- Green dot: `#28c840`.
- Command text should use accent cyan on a near-black command surface.

## Typography

- UI and marketing copy: `Inter`, then system sans fallbacks.
- Code, shell commands, and terminal surfaces: `Menlo`, `Monaco`, `Consolas`, `Liberation Mono`, `Courier New`, monospace.
- Headlines may use heavy weights and tight tracking.
- Body copy should stay readable and balanced with `text-wrap: pretty` / `text-wrap: balance` where already used.

## Logo and icon rules

- The approved brand mark is the cyan terminal prompt glyph from the website navigation logo.
- Do not reintroduce the old `AI` letter mark for favicon, app icon, or social preview usage.
- Use the same SVG path as `index.html` navigation logo and current `favicon.svg` / `og-image.svg` assets.
- The prompt glyph should be optically centred, not mathematically centred, because the `>` shape is visually left-heavy.
- Current app-icon glyph placement: `translate(512 522) scale(0.94) translate(-288 -256)`.
- Current social-preview icon placement: `translate(78 79) scale(0.145) translate(-288 -256)`.
- Favicon/app icons use a rounded black square with a subtle cyan glow and cyan stroke.
- Keep icon SVGs accessible with `<title>` and `<desc>` metadata.

## Social graph image rules

- Canvas: `1200x630`.
- Background: black-to-near-black gradient with soft cyan/teal radial glows and subtle wave accents.
- Top-left mark: clean rounded black icon box with cyan border and prompt glyph.
- Do not add a circular blob/glow behind the social graph icon mark.
- Approved eyebrow: `24/7 DEVELOPMENT`.
- Approved title: `AI DevOps`.
- Approved headline: `Scaleable teamwork you can trust`.
- Approved supporting line: `OpenCode plugin for autonomous project delivery`.
- Approved stats labels:
  - `12 main agent experts`
  - `4,700+ subagents skills & helpers`
  - `185+ /command shortcuts`
- Install command pill:
  - Command: `bash <(curl -fsSL aidevops.sh/install)`.
  - Current pill width: `610`.
  - Preserve extra right padding so the command does not feel cramped.
- Footer/domain label: `aidevops.sh`, right-aligned in accent cyan.

## Asset generation and cache busting

- Source SVG files:
  - `favicon.svg`
  - `og-image.svg`
- Generated raster assets:
  - `og-image.png`
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `favicon-48x48.png`
  - `favicon.ico`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
- Current public cache-buster version for icon/social assets: `v=3`.
- Bump the cache-buster whenever committed asset bytes change.
- Keep `index.html` and `site.webmanifest` cache-busters in sync.

macOS `sips` renders these SVG assets reliably in this repo. ImageMagick may fail on the social SVG when text, `letter-spacing`, or missing delegates are involved, but it remains suitable for combining PNG favicon sizes into `favicon.ico`.

Recommended generation commands:

```sh
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
- Compare favicon sizes at `16`, `32`, and `48` pixels; the prompt glyph must stay recognisable.
- Check the social graph at full size and social-preview size; the install command needs visible right padding.
- Verify live deploys by comparing live asset hashes against committed bytes after GitHub Pages deployment.

## Responsive layout rules

- Mobile pages must avoid document-level horizontal scrolling; oversized components should wrap, stack, or scroll inside their own card.
- Section gutters collapse to the section padding at tablet/mobile widths so cards keep enough internal space.
- Stats card headings and source pills stack on mobile; source text may wrap instead of forcing card overflow.
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
magick identify og-image.svg og-image.png favicon.svg favicon-16x16.png favicon-32x32.png favicon-48x48.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png favicon.ico
```
