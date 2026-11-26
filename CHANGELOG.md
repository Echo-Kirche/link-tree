# Changelog

All notable changes to the **Echo Kirche Link-Tree** project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-11-26

Major release establishing official Echo Kirche vector branding, unified accordion component architecture, robust multi-campus surface routing, DSGVO privacy compliance, and an accessible WCAG 2.1 AA/AAA design system.

### 🚀 Highlights

* **Official Echo Vector Branding (`echo-mark.svg`)**: Replaced separate text headings with the unified vector wordmark and geometric seal (`viewBox="0 0 145 26"`) using adaptive `currentColor` fill across all themes.
* **Minimal Header in Default Mode**: Removed avatar requirement by default in `site.json` and `ProfileHeader.njk`, preventing redundant marks above the primary wordmark while retaining full support for custom avatars.
* **Unified Accordion & Giving System**: Complete Row $\to$ Button architecture (`accordion_row`, `link_button`, `expanded_button`) with per-row and per-button surface filtering (`show_on`, `hide_on`, `display_in_default`) and integrated clipboard feedback for bank details.
* **Strict Privacy & Security (DSGVO)**: Zero initial external requests, self-hosted fonts (`Clash Display`, `Inter`), 2-click consent facade for YouTube video embeds, updated Content Security Policy (CSP), and `noindex, nofollow` headers for static preview builds.
* **Multi-Campus Static Surface Routing**: Zero-JS pre-rendered routing for all campuses (`/gf`, `/wob`, `/he`, `/ig`) with location-specific services, addresses, and social channels.

### 🔄 Changed & Refactored

* **Header Name Structure**: Cleaned up `ProfileHeader.njk` by removing redundant `.profile-header__name-text` DOM node and adding accessible `aria-label` to the `<h1>` heading.
* **Responsive SVG Scaling**: Designed responsive container scaling with `clamp()` and `aspect-ratio: 145 / 26` preventing WebKit/Safari flexbox collapse.
* **Operator Details**: Standardized Echo Kirche KdöR operator credentials, addresses, and email links across footers, legal documentation, and Storyblok schemas.
* **Datasource Invariant**: Enforced centralized `surfaces` datasource in Storyblok schemas with canonical `gifhorn`, `wolfsburg`, `helmstedt`, `instagram`, and `default` options.

### 🛡️ Accessibility & Design System

* **Icon Typography Invariant**: Confined Roboto (`--font-icon`) strictly to icon glyphs, preventing font distortion from display fonts (`Clash Display`).
* **Font Awesome Invariant**: Unified all button and UI icons via self-hosted `FaIcon.njk` with zero CDN requests.
* **Accessibility Suite**: Skip-to-content shortcut, floating circular modal trigger, font scaling (100%, 115%, 130%), and 21:1 WCAG AAA high-contrast modes (`black-on-white`, `white-on-black`).

---

## [1.0.0] - 2026-10-26

* Initial production release of the 100% pre-rendered Eleventy static link-in-bio platform.
* 6 brand theme variants (`light`, `pale`, `soft`, `dark`, `teal`, `lavender`).
* Storyblok CMS visual editor bridge integration with real-time DOM reconciliation.
* 2-click consent facade for external media embeds.
* Baseline automated test suite covering markup, accessibility, themes, and surface routing.
