# SKILLS.md — Task-Oriented Engineering Procedures

This document provides step-by-step procedural playbooks for common engineering tasks in the `link-tree` repository.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](./AGENTS.md) is the authoritative Single Source of Truth for architectural rules, DO/DO NOT constraints, privacy guardrails, and coding conventions. All procedures below must strictly adhere to `AGENTS.md`.

---

## Skill Index

1. [`skill: static-site-development`](#skill-static-site-development)
2. [`skill: dropdown-card-and-times`](#skill-dropdown-card-and-times)
3. [`skill: dual-tier-curation`](#skill-dual-tier-curation)
4. [`skill: content-schema-management`](#skill-content-schema-management)
5. [`skill: storyblok-component-sync`](#skill-storyblok-component-sync)
6. [`skill: sass-design-system`](#skill-sass-design-system)
7. [`skill: surface-routing-and-switching`](#skill-surface-routing-and-switching)
8. [`skill: privacy-review`](#skill-privacy-review)
9. [`skill: legal-pages-integration`](#skill-legal-pages-integration)
10. [`skill: deployment-and-verification`](#skill-deployment-and-verification)
11. [`skill: accessibility-and-a11y-suite`](#skill-accessibility-and-a11y-suite)

---

## Skill: static-site-development

**Use When**: Creating or updating page templates, layouts, Nunjucks macros, or Eleventy configuration.

**Key Files**:
- `eleventy.config.mjs`
- `src/_includes/layouts/`
- `src/_includes/components/`
- `src/content/`

**Procedure**:
1. Check `AGENTS.md` §1.1 (Pure Static Output Lock).
2. Author semantic, minimal HTML without unnecessary wrapper divs.
3. Use Nunjucks filters (`filterBySurface`, `resolveUrl`, `storyblokEditable`) where appropriate.
4. Ensure all dynamic URLs pass through `resolveUrl` to prevent unsafe protocols (`javascript:`, `data:`).
5. Verify build output in `_site/` contains zero client-side framework scripts.

---

## Skill: dropdown-card-and-times

**Use When**: Modifying service times, campus schedules, or collapsible disclosure cards.

**Key Files**:
- `src/_includes/components/DropdownCard.njk`
- `src/styles/components/_dropdown-card.scss`
- `storyblok/components.json` (`dropdown_card`, `dropdown_time_item`)
- `content.schema.json`

**Procedure**:
1. **Pure CSS Interactivity**: Interactivity must use standard HTML5 `<details>` and `<summary>`. No JavaScript is permitted.
2. **Responsive Grid**: Use the 3-column auto-fit grid (`repeat(auto-fit, minmax(200px, 1fr))`) that stacks gracefully on mobile.
3. **Echo Kids Indicator**: Render the Echo Kids badge with inline child SVG when `hasKids` / `has_kids` is true. Ensure the wordmark follows the typography rule (*echo* in Semibold 600, *kids* in Regular 400).
4. **Editable Mini Cards**: Ensure all sub-fields (`title`, `time`, `location`, `details`, `url`, `actionLabel`, `kidsLabel`) are supported and render cleanly even if optional details are omitted.
5. Run `npm test` to verify dropdown markup and open/closed interactive states.

---

## Skill: dual-tier-curation

**Use When**: Managing visibility rules between the main homepage (`/`) and dedicated campus/channel routes (`/gf`, `/wob`, `/he`, `/ig`).

**Key Files**:
- `eleventy.config.mjs` (`filterBySurface` filter)
- `src/_data/storyblok.js`
- `content.schema.json`

**Procedure**:
1. **Tier 1 (`display_in_default` / `displayInDefault`)**:
   - `true` (or omitted): Component renders on `/`.
   - `false`: Component is hidden on `/`, reserving it exclusively for dedicated location routes.
2. **Tier 2 (`show_on` / `hide_on`)**:
   - `show_on`: Array of specific target surfaces (`gifhorn`, `wolfsburg`, `helmstedt`, `instagram`).
   - `hide_on`: Array of surfaces where the item is excluded.
   - **Datasource Rule**: Both fields link to the `surfaces` datasource (`"source": "internal", "datasource_slug": "surfaces"`).
   - **Value Standard**: The technical value MUST be `gifhorn` (NOT `gf`), with display name `Gifhorn (gf)`. Aliases (`gf`, `wob`, `he`, `ig`) are automatically normalized by `filterBySurface`.
3. Test with both local data (`src/_data/site.json`) and Storyblok preview payloads to ensure surface filtering functions correctly.

---

## Skill: content-schema-management

**Use When**: Adding, updating, or validating content models, fields, or sample data.

**Key Files**:
- `content.schema.json`
- `src/_data/site.json`
- `scripts/validate-content.mjs`
- `docs/CONTENT-MODEL.md`

**Procedure**:
1. Update JSON Schema draft-2020-12 in `content.schema.json`.
2. Ensure strict types, regex patterns, and `additionalProperties: false` where appropriate.
3. Update `src/_data/site.json` and `examples/content.json` to reflect new valid configurations.
4. Run `npm run validate` to test validation with Ajv.
5. Update [`docs/CONTENT-MODEL.md`](./docs/CONTENT-MODEL.md) to document the schema changes.

---

## Skill: storyblok-component-sync

**Use When**: Adding, updating, or synchronizing Storyblok CMS blok component schemas.

**Key Files**:
- `storyblok/components.json`
- `src/_data/storyblok.js`
- `eleventy.config.mjs` (`blokToComponent` filter)
- `docs/STORYBLOK.md`

**Procedure**:
1. Define or update the component schema in `storyblok/components.json`.
2. Add the snake_case to Nunjucks component mapping in `eleventy.config.mjs`.
3. Update `src/_data/storyblok.js` to map CMS payload fields to template contracts with fallback values.
4. Support the Storyblok Visual Editor `_editable` attribute using the `storyblokEditable` filter.
5. Update [`docs/STORYBLOK.md`](./docs/STORYBLOK.md) in English and German.
6. Push schemas using `npx storyblok push-components storyblok/components.json --space <SPACE_ID>`.

---

## Skill: sass-design-system

**Use When**: Modifying colors, spacing, typography scales, or component styles.

**Key Files**:
- `src/styles/tokens/_primitives.scss`
- `src/styles/tokens/_semantic.scss`
- `src/styles/components/`
- `src/styles/main.scss`
- `docs/STYLEGUIDE.md`

**Procedure**:
1. Check `AGENTS.md` §1.4 (Brand Color Constancy Invariant). Never alter brand colors across surfaces.
2. If introducing or updating visual variables, modify `_primitives.scss` and `_semantic.scss` first.
3. Consume semantic variables (`var(--color-action-bg)`, `var(--color-text)`, etc.) in component SCSS. Never use raw hex codes in component files.
4. Follow strict BEM naming (`.block__element--modifier`).
5. Avoid selector nesting deeper than 3 levels; avoid `!important`; avoid ID selectors.
6. Run `npm run build:sass` and verify `_site/css/main.css` compiles without warnings.

---

## Skill: surface-routing-and-switching

**Use When**: Creating or modifying location routes, canonical shortcuts, or preview test toolbars.

**Key Files**:
- `src/_data/surfaces.js`
- `src/content/surfaces.njk`
- `src/content/test.njk`
- `src/assets/js/surface-switcher.js`
- `netlify.toml` (redirects)

**Procedure**:
1. Dedicated static routes must generate at build time:
   - `/gf/` and `/gifhorn/` → `gifhorn`
   - `/wob/` and `/wolfsburg/` → `wolfsburg`
   - `/he/` and `/helmstedt/` → `helmstedt`
   - `/ig/` and `/instagram/` → `instagram`
   - `/test/` → `all` (preview switcher only; redirected to `/` in production via Netlify config).
2. Ensure canonical 301 redirects are maintained in `netlify.toml`.
3. Verify that the interactive switcher toolbar (`.surface-switcher`) is rendered ONLY on `/test`.
4. Run `npm test` to verify all route and filter tests pass.

---

## Skill: privacy-review

**Use When**: Adding media embeds, scripts, external links, or assets.

**Key Files**:
- `docs/PRIVACY-DEPENDENCIES.md`
- `docs/LEGAL-PRIVACY-DE.md`
- `scripts/verify-build.mjs`
- `netlify.toml` (CSP and Permissions-Policy headers)

**Procedure**:
1. **Initial Load Zero-Origin Check**: The production page must make zero third-party connections on initial visit.
2. **2-Click YouTube Facade**: YouTube embeds must use `video-embed.js` (< 1.5 KB) and load `https://www.youtube-nocookie.com` only after an explicit click.
3. If an external origin is legitimately required:
   - Verify compliance with [`docs/LEGAL-PRIVACY-DE.md`](./docs/LEGAL-PRIVACY-DE.md).
   - Document origin, purpose, data sent, and consent mechanism in [`docs/PRIVACY-DEPENDENCIES.md`](./docs/PRIVACY-DEPENDENCIES.md).
   - Update CSP in `netlify.toml` and `_headers`.
4. Run `node scripts/verify-build.mjs` to ensure the privacy scan passes.

---

## Skill: legal-links-integration

**Use When**: Updating legal notices, operator details, or footer links to Impressum and Datenschutz.

**Key Files**:
- `src/_data/operator.json`
- `src/_includes/components/FooterLegal.njk`
- `docs/LEGAL-PRIVACY-DE.md`

**Procedure**:
1. Maintain church operator legal identity and canonical URLs in `src/_data/operator.json`. Never manufacture fictional legal values in production.
2. Link Impressum and Datenschutz externally to canonical church URLs (`https://kirche-echo.de/impressum/` and `https://kirche-echo.de/datenschutz/`) with `target="_blank"` and `rel="noopener noreferrer"`.
3. Do NOT serve local `/impressum` or `/datenschutz` static pages on this domain; they are external links.
4. Run `npm test` to verify external legal links render properly.

---

## Skill: deployment-and-verification

**Use When**: Preparing releases, testing builds, or configuring hosting platforms (Netlify, Cloudflare).

**Key Files**:
- `netlify.toml`
- `_headers`
- `scripts/verify-build.mjs`
- `package.json`

**Procedure**:
1. Run full verification sequence:
   ```bash
   npm run validate
   npm run build
   npm test
   ```
2. Verify all 55+ test assertions pass with 0 errors.
3. Confirm `_site/` output has no unexpected JS files and that permitted JS bundles stay under budget (< 10 KB for production scripts, < 16 KB for preview bridge).
4. Verify security headers in `netlify.toml` and `_headers` are consistent.

---

## Skill: accessibility-and-a11y-suite

**Use When**: Creating, modifying, or testing accessibility features, skip links, user preferences popups, font scaling, or high-contrast display modes.

**Key Files**:
- `src/_includes/components/A11yButton.njk`
- `src/_includes/layouts/base.njk`
- `src/styles/components/_a11y-button.scss`
- `src/styles/tokens/_semantic.scss`
- `src/styles/base/_typography.scss`
- `src/assets/js/surface-switcher.js`
- `src/content/test.njk`
- `docs/STYLEGUIDE.md`

**Procedure**:
1. **Skip-to-Content Link**: Ensure `<a href="#content" class="a11y-button a11y-button--skip">` is pre-rendered at the top of `<body>` and hidden offscreen until keyboard-focused.
2. **Floating Access Trigger**: Keep `.a11y-button--floating` positioned at the bottom-right of the viewport with appropriate `aria-haspopup="dialog"` and `aria-controls="a11y-modal"`.
3. **Modal Dialog Centering & Mobile Resilience**: Ensure `.a11y-modal` enforces viewport-fixed positioning (`position: fixed; inset: 0; z-index: 99999; inline-size: 100vw; block-size: 100vh;`) so dialog fallback rendering never breaks below the page footer on mobile.
4. **Scroll Bleed Prevention**: Lock background body scrolling (`document.body.style.overflow = 'hidden'`) while modal is open, and restore upon close/cancel.
5. **Token Pairing & 21:1 Contrast**: All a11y buttons must pair background and foreground tokens. High-contrast modes (`black-on-white`, `white-on-black`) must achieve 21:1 WCAG AAA contrast and restore brand theme tokens cleanly on Standard reset.
6. **Test Page Verification**: Maintain functional test controls on `/test` (`#a11y-test-skip`, `#a11y-test-contrast-toggle`, `#a11y-test-modal-trigger`) and live status badges (`#active-contrast-badge`, `#active-font-size-badge`).
7. Run `npm test` to verify markup, styles, and behavioral contracts.
