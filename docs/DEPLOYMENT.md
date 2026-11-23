# Deployment & Hosting Architecture

This document details the production build pipeline, deployment contracts, hosting configurations (Netlify and Cloudflare Pages), security headers, and webhook automation for `link-tree`.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](../AGENTS.md) is the authoritative Single Source of Truth for architectural rules and coding standards.

---

## 1. Production Build Contract

The project builds into pure, static artifacts with **zero runtime server dependencies**:

```bash
# Production Build Pipeline
npm run build
```

This command runs the four-stage build sequence:
1. `npm run validate`: Validates content against `content.schema.json` using Ajv.
2. `npm run build:sass`: Compiles and minifies `src/styles/main.scss` to `_site/css/main.css`.
3. `npm run build:eleventy`: Compiles static HTML for all surfaces into `_site/`.
4. `node scripts/verify-build.mjs`: Strictly checks bundle sizes, zero-JS budgets, and absence of forbidden tags.

Output Directory: `_site/`

---

## 2. Multi-Surface Single-Build Architecture

All canonical campus and channel pages are generated within a **single build execution**:

| Output File in `_site/` | Canonical Route | Target Surface |
| :--- | :--- | :--- |
| `index.html` | `/` | `default` (Curated universal homepage) |
| `gf/index.html` & `gifhorn/index.html` | `/gf/`, `/gifhorn/` | `gifhorn` (Gifhorn campus services & announcements) |
| `wob/index.html` & `wolfsburg/index.html` | `/wob/`, `/wolfsburg/` | `wolfsburg` (Wolfsburg campus services) |
| `he/index.html` & `helmstedt/index.html` | `/he/`, `/helmstedt/` | `helmstedt` (Helmstedt campus services) |
| `ig/index.html` & `instagram/index.html` | `/ig/`, `/instagram/` | `instagram` (Instagram bio traffic) |
| `test/index.html` | `/test/` | `all` (Preview toolbar; redirected to `/` in production) |
| `404.html` | `/*` | Branded 404 page redirecting to `/` |

*(Note: Impressum and Datenschutz are linked externally to `https://kirche-echo.de/...` and not generated as local static files.)*

---

## 3. Netlify Configuration

Netlify is the primary hosting platform, configured via [`netlify.toml`](../netlify.toml) and [`_headers`](../_headers).

### 3.1 Content Rebuilds via Storyblok Webhooks
Content editors do **not** need to redeploy code to update content. Automatic rebuilding is configured via webhooks:
1. **Netlify Build Hook**: In Netlify (`Site configuration` → `Build & deploy` → `Build hooks`), generate a build hook URL.
2. **Storyblok Webhook**: In Storyblok (`Settings` → `Webhooks`), add a webhook targeting the Netlify URL on `story.published` and `story.unpublished` events.
3. When an editor publishes a story in Storyblok, Netlify automatically executes `npm run build` and updates the static HTML across all routes in ~30 seconds.

### 3.2 Context-Specific Overrides
- **Production (`context.production`)**: Fetches published stories (`STORYBLOK_VERSION = "published"`).
- **Deploy Preview (`context.deploy-preview`)**: Fetches draft stories (`STORYBLOK_VERSION = "draft"`) for PR previews.
- **Branch Deploy (`context.branch-deploy`)**: Fetches draft stories (`STORYBLOK_VERSION = "draft"`).

### 3.3 Security & Privacy Headers
Configured in `netlify.toml` and mirrored in `_headers`:
- **Content-Security-Policy (CSP)**:
  `default-src 'self'; img-src 'self' data: https://a.storyblok.com https://*.storyblok.com; style-src 'self' 'unsafe-inline'; script-src 'self' https://app.storyblok.com https://*.storyblok.com; connect-src 'self' https://api.storyblok.com https://gapi.storyblok.com https://app.storyblok.com https://*.storyblok.com wss://*.storyblok.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'self' https://app.storyblok.com https://storyblok.com https://*.storyblok.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
- **Permissions-Policy**: Strictly disables camera, microphone, geolocation, payment, and FLoC/browsing-topics tracking.
- **HSTS**: `max-age=31536000; includeSubDomains; preload`.

### 3.4 Caching Policy
- **HTML Pages**: `public, max-age=0, must-revalidate` (ensures visitors receive fresh content immediately upon publish).
- **CSS Stylesheets (`/css/*`)**: `public, max-age=31536000, immutable`.
- **Static Assets & Images (`/assets/*`)**: `public, max-age=31536000, immutable`.
- **Favicon**: `public, max-age=604800, must-revalidate`.

---

## 4. Cloudflare Pages Compatibility

The static output in `_site/` is 100% compatible with Cloudflare Pages:
- **Build command**: `npm run build`
- **Build output directory**: `_site`
- **Environment variables**: `NODE_VERSION = 20`, `STORYBLOK_TOKEN = <token>`.
- **Headers & Redirects**: Handled via `_headers` and `_redirects` in `_site/`.
- No Cloudflare Workers or serverless functions required.
