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
- Approved headline: `Scaleable teamwork you can trust` (keep the approved spelling). Supporting line: `OpenCode plugin for autonomous project delivery`. Eyebrow: `24/7 DEVELOPMENT`.
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
- Current public cache-buster versions in `index.html`: icons (`favicon.*`, `favicon-*`, `apple-touch-icon.png`) `v=5`; social image (`og-image.png`) `v=3`; stylesheet `styles.css?v=15`.
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
magick identify images/aidevops-avatar.svg images/aidevops-avatar.png og-image.svg og-image.png favicon.svg favicon-16x16.png favicon-32x32.png favicon-48x48.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png favicon.ico
```

- Inspect `images/aidevops-avatar.png` to confirm its corners are transparent
  and all essential avatar details remain inside the circle-crop safe area.
- If the Brand core changed, run its sync check against a `marcusquinn/aidevops` checkout.
