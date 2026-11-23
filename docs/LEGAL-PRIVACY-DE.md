# Germany / EU Legal & Privacy Implementation Notes

This document provides technical engineering guidance for complying with German and EU digital regulations (DDG, DSGVO, TTDSG/TDDDG). This is engineering documentation, not legal counsel.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](../AGENTS.md) is the authoritative Single Source of Truth for architectural rules and coding standards.

---

## 1. Required Legal Links

German law mandates easily identifiable, directly accessible, and permanently available links to:
1. **Impressum** (Site Notice / Provider Identification under § 5 DDG, formerly TMG)
2. **Datenschutzerklärung** (Privacy Policy under Art. 13 DSGVO)

To ensure canonical legal authority and prevent duplicate maintenance, the link-in-bio site links directly to the official church website's legal pages:
- **Impressum**: `https://kirche-echo.de/impressum/`
- **Datenschutz**: `https://kirche-echo.de/datenschutz/`

These links are rendered in `FooterLegal.njk` with `target="_blank"` and `rel="noopener noreferrer"`. Local `/impressum` and `/datenschutz` routes are deliberately **not served** on this domain. Any direct request to these paths redirects to the home page or root.

---

## 2. Operator Configuration

Provider and contact data is managed in `src/_data/operator.json`:
- **Legal Entity Name**: e.g., `"Echo Kirche"`
- **Address & Contact**: Physical address, contact email (`info@kirche-echo.de`), phone
- **External URLs**: `urls.impressum` and `urls.datenschutz` pointing to canonical pages on `kirche-echo.de`

> **Important**: Never manufacture fictitious legal operator data in production. Maintain genuine church entity details in `src/_data/operator.json`.

---

## 3. Privacy-First Baseline (Zero-Cookie Architecture)

The site is engineered to eliminate technologies that require prior user consent under § 25 TDDDG and Art. 6 DSGVO:

- **Zero Tracking Cookies**: No session tracking, analytics, or retargeting cookies.
- **No Cookie Consent Banner Needed**: Because no non-essential data is stored on the user's terminal equipment, no intrusive cookie banner is required on initial visit.
- **Self-Hosted Fonts**: Fonts (`Clash Display`, `Inter`) are stored locally in `src/assets/fonts/` and served directly from the same origin. External requests to Google Fonts or Adobe Fonts are strictly prohibited.
- **No External CDNs**: All scripts, icons, and stylesheets are compiled and served from the primary domain.

---

## 4. YouTube 2-Click Consent Facade

To allow church video content without violating GDPR data transfer rules, the site implements a **2-click consent facade** (`VideoLinkCard.njk` + `src/assets/js/video-embed.js`):

1. **Initial Page Visit**:
   - Zero connections to Google or YouTube servers.
   - The video thumbnail is rendered locally or statically.
   - An accessible play button is rendered with an informational data privacy notice.
2. **User Click Action**:
   - When the user explicitly clicks the play button, the client-side helper mounts an `<iframe>` pointing strictly to:
     `https://www.youtube-nocookie.com/embed/<VIDEO_ID>?autoplay=1`
   - Data transfer to YouTube occurs **only after** the affirmative, user-initiated action.

---

## 5. Third-Party Dependency Ledger

Every external network origin contacted by the production site must be cataloged in [`docs/PRIVACY-DEPENDENCIES.md`](./PRIVACY-DEPENDENCIES.md).
- Initial Page Load: **Zero third-party origins**.
- Post-Consent / User-Action: `https://www.youtube-nocookie.com` (video playback only).
