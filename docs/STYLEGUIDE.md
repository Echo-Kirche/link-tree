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

* **Logo Clear Space (*Schutzzone*)**:
  * Maintain a minimum clear space equal to the width/height of the lowercase letter **"e"** from the logo on all four sides.
  * Never stretch, rotate, distort, or recolor the logo outside approved brand colors.
  * Inverted logo: White logo is strictly used on dark backgrounds (e.g. dark, teal, and lavender theme modes).
* **Web Images**:
  * Format: `.webp` format only.
  * File size budget: **max 400 KB** per image.
  * Max dimensions:
    * **1900px** max width for hero images.
    * **1400px** max width for standard images.
  * Standard aspect ratios:
    * `16:9` (e.g. horizontal video/event cards).
    * `3:2` (landscape photography).
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
Application roles:
- `--color-page-bg`: Surface canvas color
- `--color-text`: Primary typography color (`#08415C` or `#1B1B1B`)
- `--color-text-muted`: Secondary typography color (`#846B8A`)
- `--color-surface`: Card/panel background
- `--color-border`: Separation borders
- `--color-action-bg`: Primary interactive button fill (`#08415C`)
- `--color-action-text`: Button label color (`#FFFFFF`)
- `--color-focus-ring`: Focus state outline (`#08415C`)

Components must consume semantic tokens, not raw hex codes directly.

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
