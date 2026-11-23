# Echo Kirche — Official Design System & Styleguide

## Purpose

This document is the authoritative design system and styleguide for **Echo Kirche** and all related digital properties (including link-in-bio sites, web applications, and CMS components).

> **RULE OF PRECEDENCE**: [`AGENTS.md`](file:///Users/Shared/projeckt/goto/link-tree/AGENTS.md) is the authoritative Single Source of Truth for architectural rules, DO/DO NOT constraints, and quality standards.

All development agents (Antigravity, Claude Code, Cursor, GitHub Copilot, ChatGPT, and human contributors) must strictly adhere to the tokens, typography scales, brand colors, media rules, and invariants defined here.

---

## 1. Brand Colors

Use only the official Echo Kirche color palette:

* **Primary / Dark Teal Blue (`#08415C`)**:
  * RGB: `rgb(8, 65, 92)`
  * Usage: Primary headings, body text, logos, and dark UI accents.
  * Semantic tokens: `--color-action-bg`, `--color-focus-ring`, `--color-text`, `--ek-ink`, `--echo-teal`.
* **Secondary / Muted Lavender (`#846B8A`)**:
  * RGB: `rgb(132, 107, 138)`
  * Usage: Secondary text, highlights, buttons/accents, and logo variations.
  * Semantic tokens: `--color-text-muted`, `--ek-mauve`, `--echo-purple`.
* **Background / Light Pastel Yellow (`#FEFADC`)**:
  * RGB: `rgb(254, 250, 220)`
  * Usage: Soft page backgrounds, section surfaces, and warm accents.
  * Semantic tokens: `--color-page-bg` (in warm theme), `--ek-warm`, `--echo-cream`.

*(Note: High-contrast black (`#000000`) and white (`#FFFFFF`) are permitted for inverted logo applications, dark mode surfaces, and high-contrast card backgrounds.)*

### Invariant: Brand Color Constancy
Brand colors must **never** change based on URL parameters, surfaces, campus routes (e.g. `/gf`, `/wob`, `/he`), or sublinks. City switches and surfaces filter content visibility only; they never alter brand identity or action colors.

---

## 2. Typography & Font Families

* **Headings & Sub-brand Wordmark**: `Clash Display` (Weight: `600` / Semibold)
  * CSS Token: `var(--font-heading)`
  * *Sub-brand logo rule*: When displaying the sub-brand text logo, **echo** is set in `Clash Display Semibold` (`600`) and **kids** is set in `Clash Display Regular` (`400`).
* **Body & UI Text**: `Inter` (Weight: `400` / Regular)
  * CSS Token: `var(--font-body)`
  * System fallback stack: `"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
* **Optional Digital Accent Fonts** (for special banners, callouts, or magazine-style sections):
  * **Display/Headline Accent**: `Perandory Condensed` (`--font-accent-display`)
  * **Script/Subheading Accent**: `Sloop Script Pro` (`--font-accent-script`)

---

## 3. Font Sizes & Type Scale (Web / Digital)

Apply this exact pixel hierarchy across all pages and components:

| Element / Role | Font Family | Weight | Size (px) | CSS Variable / Rem | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | Clash Display | Semibold (600) | `48px` | `3rem` (clamp: `clamp(1.75rem, 4vw + 0.5rem, 3rem)`) | Main page hero titles |
| **H2** | Clash Display | Semibold (600) | `40px` | `2.5rem` (clamp: `clamp(1.35rem, 3vw + 0.25rem, 2.5rem)`) | Major section headings |
| **H3** | Clash Display | Semibold (600) | `32px` | `2rem` | Subsection headings |
| **H4** | Clash Display | Semibold (600) | `24px` | `1.5rem` | Smaller headings / sub-brand |
| **H5** | Clash Display | Semibold (600) | `20px` | `1.25rem` | Cards & UI panels |
| **H6** | Clash Display | Semibold (600) | `18px` | `1.125rem` | Small headings |
| **Body Large** | Inter | Regular (400) | `18px` | `1.125rem` (`.body-large`) | Lead paragraphs / large body copy |
| **Body** | Inter | Regular (400) | `16px` | `1rem` (standard `body`) | Standard body text |
| **Body Small** | Inter | Regular (400) | `14px` | `0.875rem` (`.body-small`) | Secondary text & metadata |
| **Caption** | Inter | Regular (400) | `12px` | `0.75rem` (`.caption`) | Image captions & footnotes |
| **Overline / Label** | Inter | Regular (400) | `10px–11px` | `0.625rem–0.6875rem` (`.overline`, `.label`) | Tags, badges & category labels |

---

## 4. Logo & Media Rules

### 4.1 Approved Brand Logos & Media Inventory

All official visual assets, brand marks, and photography are self-hosted in [`src/assets/images/`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/) (served in production under `/assets/images/`). Development agents must use only these verified local assets:

| Asset / File | Production Path | Format | Role / Usage | Dimensions / Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Logo** | [`/assets/images/logo.svg`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/logo.svg) | SVG | Primary geometric symbol / mark of Echo Kirche. Default header avatar and official branding. | Scalable vector (`100x100` viewBox) |
| **Echo Kids Logo** | [`/assets/images/echo-kids.png`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/echo-kids.png) | PNG | Official sub-brand logo for Echo Kids children's ministry and family services. | `645x387` (transparent) |
| **Site Favicon** | [`/assets/images/favicon.webp`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/favicon.webp) | WebP | Browser tab icon and PWA touch icon. | `150x150` square |
| **Avatar Fallback** | [`/assets/images/avatar.svg`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/avatar.svg) | SVG | Generic profile silhouette avatar placeholder. | `160x160` circle |
| **Gifhorn Hero** | [`/assets/images/echo-home-gifhorn-1024x682.webp`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/echo-home-gifhorn-1024x682.webp) | WebP | Campus hero photography for Gifhorn (`/gf`, `/gifhorn`). | `1024x682` (`3:2`) |
| **Helmstedt Hero** | [`/assets/images/echo-home-helmstedt-803x1024.webp`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/echo-home-helmstedt-803x1024.webp) | WebP | Campus hero photography for Helmstedt (`/he`, `/helmstedt`). | `803x1024` (`3:4`) |
| **Wolfsburg Hero** | [`/assets/images/echo-home-wolfsburg-1024x666.webp`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/echo-home-wolfsburg-1024x666.webp) | WebP | Campus hero photography for Wolfsburg (`/wob`, `/wolfsburg`). | `1024x666` (`3:2`) |
| **Event / ES26 Banner** | [`/assets/images/es26-hero-1-1536x864.webp`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/es26-hero-1-1536x864.webp) | WebP | Featured hero image banner for Echo Summer / churchwide events. | `1536x864` (`16:9`) |
| **Vertical Photo Placeholder** | [`/assets/images/photo-vertical.svg`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/photo-vertical.svg) | SVG | Fallback media placeholder for vertical portrait cards. | `3:4` aspect ratio |
| **Horizontal Project Placeholder** | [`/assets/images/project-horizontal.svg`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/project-horizontal.svg) | SVG | Fallback media placeholder for horizontal event cards. | `16:9` aspect ratio |
| **Video Thumbnail Facade** | [`/assets/images/video-thumbnail.svg`](file:///Users/Shared/projeckt/goto/link-tree/src/assets/images/video-thumbnail.svg) | SVG | Fallback graphic facade for the 2-click consent YouTube video player. | `16:9` aspect ratio |

### 4.2 Logo Usage & Clear Space (*Schutzzone*)

* **Logo Clear Space (*Schutzzone*)**:
  * Maintain a minimum clear space equal to the width/height of the lowercase letter **"e"** from the logo on all four sides (`padding: 1rem` on `.profile-header__avatar-wrapper`).
  * Never stretch, rotate, distort, compress, or recolor the logo outside approved brand colors.
  * Inverted logo: White logo is strictly used on dark backgrounds (e.g. dark, teal, and lavender theme modes via `filter: brightness(0) invert(1)`).
* **Sub-brand Wordmark**:
  * When rendering text wordmarks, **echo** is Semibold 600 (`.wordmark-echo`) and **kids** is Regular 400 (`.wordmark-kids`).

### 4.3 Web Image Rules & Budget

* **Format**: `.webp` format only for photography and raster assets (SVG for scalable vector icons).
* **File size budget**: **max 400 KB** per image.
* **Max dimensions**:
  * **1900px** max width for hero images.
  * **1400px** max width for standard images.
* **Standard aspect ratios**:
  * `16:9` (e.g. horizontal video/event cards).
  * `3:2` (landscape campus photography).
  * `4:3` (standard cards/flyers).
  * `3:4` (vertical portrait cards).

---

## 5. Token Hierarchy & CSS Architecture

### Primitive tokens (`src/styles/tokens/_primitives.scss`)
Raw palette and font family values:
- `--echo-teal`: `#08415C`
- `--echo-purple`: `#846B8A`
- `--echo-cream`: `#FEFADC`
- `--primitive-font-heading`: `"Clash Display", ...`
- `--primitive-font-body`: `"Inter", ...`
- `--primitive-font-accent-display`: `"Perandory Condensed", ...`
- `--primitive-font-accent-script`: `"Sloop Script Pro", ...`

### Semantic tokens (`src/styles/tokens/_semantic.scss`)
Application roles and paired surfaces:
- Canvas / Surface: `--color-page-bg`, `--color-surface`, `--color-on-surface`, `--color-surface-subtle`, `--color-border`
- Interactive Actions: `--color-primary`, `--color-on-primary`, `--color-secondary`, `--color-on-secondary`, `--color-action-bg`, `--color-action-text`
- Muted & Accent: `--color-muted`, `--color-on-muted`, `--color-accent`, `--color-on-accent`
- Typography: `--color-text`, `--color-text-muted`
- Accessibility: `--color-focus-ring`

Components must consume semantic tokens, not raw hex codes directly. See [Section 8](#8-color-contrast-token-pairing--automated-css-testing) for token pairing and contrast invariants.

---

## 6. Layout, Spacing & BEM Standards

- **Strict BEM Naming**: All CSS classes must use BEM (`Block__Element--Modifier`).
- **Mobile-first**: Layouts scale gracefully from 320px up to desktop viewports.
- **Max Width**: Centered page shell max-width approximately `42rem` (`672px`).
- **Touch Targets**: Minimum `44px` height/width for all interactive touch targets.
- **Radii**:
  - Small (`4px` / `--primitive-radius-sm`): Input fields and minor badges.
  - Medium (`8px` / `--primitive-radius-md`): Buttons and cards.
  - Large (`16px` / `--primitive-radius-lg`): Modal/flyout cards.
  - Pill (`999px` / `--primitive-radius-pill`): Badges and pill buttons.
- **Motion**:
  - Respect `@media (prefers-reduced-motion: reduce)`.
  - Animations must be subtle, fast (< 250ms), and never block user interaction.

---

## 7. Accessibility (WCAG 2.2 AA)

- All text colors must achieve at least 4.5:1 contrast against their backgrounds (3:1 for large text).
- Focus states must feature a visibly distinct focus ring (`:focus-visible`).
- State must never be communicated by color alone.
- Pure CSS interactivity (e.g. `<details>` / `<summary>`) must remain fully accessible via keyboard.
- Images require meaningful `alt` attributes or empty `alt=""` for decorative assets.
- Automated code-based contrast testing is enforced across all themes without screenshot regression tools.

### 7.1 Accessibility (a11y) Button Component

The `.a11y-button` component provides an accessible, keyboard-first interactive element designed for utility functions such as skip-to-content links, contrast toggles, and accessibility preference actions.

#### BEM Class Hierarchy & Structure

| Class Name | Type | Description |
| :--- | :--- | :--- |
| `.a11y-button` | Block | Base button container (`<a>` or `<button>`). Enforces min 44px (`2.75rem`) touch target and paired tokens. |
| `.a11y-button__icon` | Element | Icon container for vector SVG glyphs (`fill: currentColor`). Marked `aria-hidden="true"`. |
| `.a11y-button__label` | Element | Text label container ensuring inline display and text alignment. |
| `.a11y-button--skip` | Modifier | Skip link pattern. Positioned off-screen (`top: -9999px`) until focused via keyboard (`:focus`, `:focus-visible`), then smoothly transitions into top center view. |
| `.a11y-button--secondary` | Modifier | Secondary action variant paired with `--color-secondary` and `--color-on-secondary`. |
| `.a11y-button--surface` | Modifier | Surface outline variant paired with `--color-surface` and `--color-on-surface`. |
| `.a11y-button--floating` | Modifier | Floating pill button variant positioned fixed at the bottom-right of the viewport for persistent visual accessibility access. |

#### Token Pairing & Contrast Guarantee

The component strictly consumes paired design system tokens to ensure minimum 4.5:1 WCAG AA contrast across all 6 brand themes (`light`, `pale`, `soft`, `dark`, `teal`, `lavender`):
- **Base / Primary**: `background-color: var(--color-primary); color: var(--color-on-primary);`
- **Secondary**: `background-color: var(--color-secondary); color: var(--color-on-secondary);`
- **Surface**: `background-color: var(--color-surface); color: var(--color-on-surface);`
- **Focus Ring**: `outline: 3px solid var(--color-focus-ring); outline-offset: 3px;`

#### Semantic HTML Patterns

1. **Skip-to-Content Link** (placed at start of `<body>` targeting `<main id="content">`):
```html
<a href="#content" class="a11y-button a11y-button--skip">
  <span class="a11y-button__icon" aria-hidden="true">
    <svg class="fa-svg fa-arrow-down" viewBox="0 0 384 512" fill="currentColor" width="16" height="16">...</svg>
  </span>
  <span class="a11y-button__label">Zum Hauptinhalt springen</span>
</a>
```

2. **Interactive Action / Utility Button**:
```html
<button type="button" class="a11y-button" aria-label="Barrierefreiheit Menü">
  <span class="a11y-button__icon" aria-hidden="true">
    <svg class="fa-svg fa-universal-access" viewBox="0 0 512 512" fill="currentColor" width="16" height="16">...</svg>
  </span>
  <span class="a11y-button__label">Barrierefreiheit</span>
</button>
```

---

## 8. Color Contrast, Token Pairing & Automated CSS Testing

### 8.1 Objective & Scope

To ensure high legibility and accessibility across all dynamic themes, every UI component must maintain standard contrast ratios regardless of the active color scheme.
This rule is **color-agnostic**—it applies universally to any foreground/background color combination across light, dark, pastel, or custom themes.

### 8.2 Token Architecture & Pairing Rules

#### Rule 2.1: Strict Paired Tokens
Never apply background colors (`background`, `background-color`) in isolation without explicitly declaring its paired text/icon color (`color`).

```css
/* BAD: Inherits text color from parent container, risking zero contrast */
.badge {
  background-color: var(--theme-accent-light);
}

/* GOOD: Always explicitly bind background to its corresponding 'on-*' foreground token */
.badge {
  background-color: var(--badge-bg);
  color: var(--badge-text-on-bg);
}
```

#### Rule 2.2: Semantic Naming Structure
All design system tokens must follow explicit `on-[surface]` foreground pairing semantics:

| Token Category | Background Token | Mandatory Foreground Token |
| :--- | :--- | :--- |
| **Surface / Card** | `--color-surface` | `--color-on-surface` |
| **Primary Button / Pill** | `--color-primary` | `--color-on-primary` |
| **Secondary Button / Pill** | `--color-secondary` | `--color-on-secondary` |
| **Muted Container** | `--color-muted` | `--color-on-muted` |
| **Accent / Badge** | `--color-accent` | `--color-on-accent` |

### 8.3 WCAG Contrast Standards

All color pairs across every registered theme configuration must meet minimum WCAG 2.1 contrast ratios:
- **Body Text & Small Labels** (`< 18px` / `14pt bold`): Minimum **4.5:1** contrast ratio (WCAG AA).
- **Large Text & Headings** (`≥ 24px` or `≥ 18.5px bold`): Minimum **3.0:1** contrast ratio (WCAG AA).
- **Interactive UI Components, Icons & Badges**: Minimum **3.0:1** contrast ratio against their immediate background.

### 8.4 Code-Based Automated Testing (No Screenshots)

Rather than using screenshot-based visual regression testing, theme contrast must be verified programmatically at the CSS token / code level.

#### 4.1 Automated Token Matrix Testing (CI / Unit Tests)
Write an automated unit test (e.g., native Node test runner, Vitest, Jest, or custom Node script) that reads CSS variable tokens per theme and calculates relative luminance programmatically:

```javascript
// Example code-based test using 'culori' or standard WCAG contrast formula
import { wcagContrast } from 'culori';

describe('Theme Contrast Validation', () => {
  const themes = getDefinedThemes(); // Parses CSS custom properties per theme

  themes.forEach((theme) => {
    test(`Theme [${theme.name}] meets WCAG 2.1 AA text contrast`, () => {
      const bg = theme.tokens['--badge-bg'];
      const text = theme.tokens['--badge-text-on-bg'];
      
      const ratio = wcagContrast(bg, text);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
```

#### 4.2 Native CSS Relative Color Math (Modern Browsers)
When generating dynamic theme tokens in CSS, leverage CSS Relative Colors or HSL/OKLCH lightness calculation to automatically enforce readable text:

```css
:root {
  /* Dynamic text color derived programmatically from background lightness */
  --badge-bg: oklch(0.9 0.1 90);
  
  /* Fall back to dark text if bg lightness > 60%, otherwise white text */
  --badge-text-on-bg: color-mix(
    in oklab,
    var(--badge-bg),
    oklch(from var(--badge-bg) calc(1 - l) 0 0) 100%
  );
}
```

#### 4.3 Static Analysis / Stylelint Rules
Enforce token usage during development via CSS linters:
- **Stylelint Configuration**: Ban hardcoded hex/RGB color values inside component files (forces usage of defined design system tokens).
- **No orphan background rules**: Require a `color` property within any rule block that overrides `background` or `background-color`.

### 8.5 Checklist for Developer & Code Reviews

- [ ] Does every themed element (card, pill, button, badge) explicitly define both `background-color` and `color`?
- [ ] Are dynamic background variants paired with their respective `--color-on-*` semantic tokens?
- [ ] Have all newly added theme color variables passed the automated math-based contrast test suite?
- [ ] Is icon fill/stroke explicitly set to match the paired text color (`fill: currentColor`)?
