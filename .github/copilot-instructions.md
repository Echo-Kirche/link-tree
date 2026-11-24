# GitHub Copilot Instructions — Echo Link-Tree

You are assisting on the **Echo Kirche** static website and link-in-bio platform.

> **RULE OF PRECEDENCE**: [`link-tree/AGENTS.md`](../AGENTS.md) is the authoritative Single Source of Truth for all architectural rules, DO/DO NOT constraints, privacy guardrails, and coding conventions.

---

## 1. Coding Standards & Conventions
- **Strict Patterns**: Adhere strictly to established architectural patterns, folder structures, and conventions in the codebase.
- **Git Commits**: Follow Conventional Commits specification (`feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`, `test:`).
- **CSS / BEM**: Use strict BEM (`Block__Element--Modifier`) naming conventions for all CSS classes. Never use ID selectors for styling.
- **Minimal HTML**: Keep HTML semantic and minimal. Omit redundant wrapper elements, unused attributes, and boilerplate bloat.
- **Dependencies**: Vet external packages for high adoption and maintenance. Never install trivial one-liner micro-dependencies (`is-odd`, `left-pad`).

---

## 2. Core Architectural Invariants
- **Static Generation**: Eleventy (11ty) v3.x with Nunjucks templates.
- **Styles**: Dart Sass compiling `src/styles/main.scss` to `_site/css/main.css`. Always use semantic CSS variables (`var(--color-action-bg)`, `var(--color-text)`, etc.).
- **CMS**: Storyblok headless CMS with component schemas in `storyblok/components.json` and offline fallback in `src/_data/site.json`.
- **Zero JS Runtime**: No React/Vue/Svelte hydration. Interactivity uses pure HTML5/CSS (e.g. `<details>` / `<summary>` for dropdowns).
- **Privacy First (DSGVO)**: No external fonts, no cookies on initial visit, 2-click consent facade for YouTube embeds (`youtube-nocookie.com`).
- **Brand Color Constancy**: Colors (`#08415C` Dark Teal Blue, `#846B8A` Muted Lavender, `#FEFADC` Light Pastel Yellow) never change across routes.
- **Strict Iconography & No Custom Icons**: Never create or draw custom icons anytime. Use Font Awesome icons exclusively via self-hosted `FaIcon.njk`. The ONLY custom icons are official brand logos (`logo.svg`, `logo-circle.svg`, `favicon.webp`).
- **Roboto Icon Typography Invariant**: ONLY icons are displayed in `Roboto` (`font-family: var(--font-icon, "Roboto", sans-serif)`) and never in default fonts (`Clash Display`, `Inter`) to prevent glyph distortion. Normal text, headings, and labels must NEVER use Roboto.
- **Logo Clear Space**: Clear space equal to lowercase `"e"` on all four sides. Never distort or rotate.
- **External Legal Links**: Impressum and Datenschutz point to canonical external URLs (`https://kirche-echo.de/...`). Local routes must never be served.
- **Accessibility (a11y) Suite**: Skip link, floating trigger, HTML5 dialog for font scaling & 21:1 high contrast modes, mobile fixed positioning, and scroll locking.

---

## 3. Essential Commands
```bash
npm run validate
npm run build
npm test
```
Always verify that all 55+ tests pass before suggesting completion.
