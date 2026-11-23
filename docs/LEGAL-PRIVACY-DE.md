# Germany / EU Legal & Privacy Implementation Notes

This document provides technical engineering guidance for complying with German and EU digital regulations (DDG, DSGVO, TTDSG/TDDDG). This is engineering documentation, not legal counsel.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](file:///Users/Shared/projeckt/goto/link-tree/AGENTS.md) is the authoritative Single Source of Truth for architectural rules and coding standards.

---

## 1. Required Legal Surfaces

German law mandates easily identifiable, directly accessible, and permanently available links to:
1. **Impressum** (Site Notice / Provider Identification under § 5 DDG, formerly TMG)
2. **Datenschutzerklärung** (Privacy Policy under Art. 13 DSGVO)

These routes are permanently available at:
- `/impressum/` (`src/content/impressum.njk`)
- `/datenschutz/` (`src/content/datenschutz.njk`)

---

## 2. Impressum Implementation (§ 5 DDG)

The Impressum template renders provider data from `src/_data/operator.json`:
- **Legal Entity Name**: e.g., `"Echo Kirche e.V."`
- **Authorized Representatives**: Full name(s) of pastoral lead or board members
- **Physical Address**: Street, postal code, city
- **Electronic Contact**: Email address and phone number
- **Register & Number**: Vereinsregister (VR) number and registering court (Amtsgericht)
- **Editorial Responsibility**: § 18 Abs. 2 MStV responsible person (name and address)

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

Every external network origin contacted by the production site must be cataloged in [`docs/PRIVACY-DEPENDENCIES.md`](file:///Users/Shared/projeckt/goto/link-tree/docs/PRIVACY-DEPENDENCIES.md).
- Initial Page Load: **Zero third-party origins**.
- Post-Consent / User-Action: `https://www.youtube-nocookie.com` (video playback only).
