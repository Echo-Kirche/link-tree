# Privacy Dependency Ledger

This document catalogs all external network origins permitted in production for the `link-tree` static site.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](../AGENTS.md) is the authoritative Single Source of Truth for architectural rules, privacy guardrails, and coding standards.

---

## 1. Initial Page Load (Strict Profile)

Expected third-party origins contacted on initial page visit: **NONE**.

| Origin | Purpose | Data Sent | Consent Mechanism | Initial Load Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://kirche-echo.de`, `https://*.kirche-echo.de` | First-party Echo Kirche website media assets (`image_url` / Storyblok image cards) | Standard HTTP image request headers | First-party church infrastructure (no third-party trackers) | Permitted via CSP `img-src` (user-approved) |

---

## 2. On-Demand / User-Initiated Connections

The following origin is contacted **ONLY** after an explicit, affirmative user interaction:

| Origin | Purpose | Data Sent | Consent Trigger | Enabled Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.youtube-nocookie.com` | Privacy-enhanced YouTube video playback | IP address, browser headers, video playback telemetry | Explicit user click on the video play button (2-click consent facade) | Active (click-to-play only) |

---

## 3. Strict Ledger Invariant

Any pull request or code change that causes the production client browser to contact a new external origin MUST:
1. Update this ledger table with origin, purpose, data sent, and legal rationale.
2. Comply with the legal guidelines in [`docs/LEGAL-PRIVACY-DE.md`](./LEGAL-PRIVACY-DE.md).
3. Update Content Security Policy (CSP) headers in `netlify.toml` and `_headers`.
4. Receive explicit user/human review before deployment.

*(Note: Outbound anchor link clicks to external websites do not count as page dependencies because navigation leaves the application.)*
