# Content Model Specification

This document specifies the authoritative production content model for the `link-tree` static site, detailing both the **Storyblok CMS Blok Schemas** (`storyblok/components.json`) and the **Local Fallback JSON Schema** (`content.schema.json`).

> **RULE OF PRECEDENCE**: [`AGENTS.md`](../AGENTS.md) is the authoritative Single Source of Truth for architectural rules and coding standards.

---

## 1. Dual-Model Architecture

The application operates on a unified dual-model:

```mermaid
flowchart LR
  subgraph CMSModel["1. Storyblok Headless CMS"]
    Bloks["storyblok/components.json<br/>(12 Blok Schemas)"]
  end

  subgraph LocalModel["2. Local Offline Fallback"]
    LocalJSON["src/_data/site.json & operator.json"]
    Schema["content.schema.json (Ajv Draft 2020-12)"]
  end

  subgraph Transformation["3. Eleventy Data Pipeline"]
    Adapter["src/_data/storyblok.js<br/>(Normalizes CMS or Local JSON into Storyblok Schema)"]
    Filters["eleventy.config.mjs<br/>(filterBySurface, resolveUrl, blokToComponent)"]
  end

  subgraph Templates["4. Nunjucks Components"]
    NJK["src/_includes/components/*.njk"]
  end

  Bloks --> Adapter
  LocalJSON --> Schema
  Schema --> Adapter
  Adapter --> Filters
  Filters --> NJK
```

When building with `STORYBLOK_TOKEN`, the Eleventy data loader (`src/_data/storyblok.js`) fetches stories directly from the Storyblok Content Delivery API v2. When offline or without a token, the local files `src/_data/site.json` and `src/_data/operator.json` are validated against `content.schema.json` and transformed into the exact same Storyblok blok schema shape.

---

## 2. Component Hierarchy & Schemas

### 2.1 Root Content Type: `link_page`

The root document containing the entire page tree:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `title` | Text | Yes | Page title (e.g., `"Echo Kirche"`). |
| `theme` | Options | No | Theme mode: `light` (default), `pale`, `warm`, `soft`, `dark`, `teal`, `lavender`. |
| `surface` | Options | No | Default surface context (default: `"default"`). |
| `profile` | Blocks | Yes | Exactly 1 `profile_header` blok. |
| `body` | Blocks | Yes | Ordered array of content bloks (`link_button`, `dropdown_card`, `donation_card`, `accordion_buttons`, `image_card_horizontal`, `image_card_vertical`, `video_link_card`, `group_block`, `section_heading`). |
| `footer` | Blocks | Yes | Exactly 1 `footer_legal` blok. |

---

### 2.2 Header Component: `profile_header`

Renders the church/organization logo avatar, title, and bio:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `name` | Text | Yes | Church or organization name (max 120 chars). |
| `bio` | Textarea | No | Optional tagline or introduction (max 500 chars). |
| `avatar` | Asset | No | Image asset (WebP format preferred, max 400 KB). |

---

### 2.3 Action Button: `link_button`

Prominent full-width button for primary calls-to-action:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | Yes | Button label (max 160 chars). |
| `url` | Text / Multilink | Yes | Safe destination URL (validated via `resolveUrl`). |
| `icon` | Text | No | Optional icon: Any Font Awesome icon (e.g., `church`, `calendar`, `video`, `heart`, `users`, `location`, `music`, `newsletter`, `podcast`, `envelope`, `globe`, `logo`, `link`, `fa-cross`, `fa-star`, `fa-phone`, `ticket`, `mug-hot`, `bible`, or any `fa-*` icon), raw SVG string, or `<i>` class tag. |
| `display_in_default` | Boolean | No | Tier 1 curation: `true` to render on `/`, `false` to hide from `/`. Default: `true`. |
| `show_on` | Multi-select | No | Tier 2 target surfaces (`gifhorn`, `wolfsburg`, `helmstedt`, `instagram`). |
| `hide_on` | Multi-select | No | Tier 2 excluded surfaces. |

---

### 2.4 Service Times & Locations: `dropdown_card`

Collapsible accordion disclosure powered by pure CSS `<details>` and `<summary>`:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | Yes | Summary header text (e.g., `"Gottesdienste & Zeiten"`). |
| `icon` | Text | No | Icon displayed next to label: `church` (default), or any Font Awesome `fa-*` icon, raw SVG, or `<i>` class tag. |
| `description` | Text | No | Intro text revealed when expanded (max 300 chars). |
| `layout` | Options | No | Layout mode: `"columns"` (responsive 3-column grid) or `"list"`. Default: `"columns"`. |
| `locations` | Multi-select | No | Active location tags (`["gifhorn", "wolfsburg", "helmstedt"]`). |
| `times` / `columns` | Blocks | No | Array of `dropdown_time_item` bloks. |
| `url` | Text / Multilink | No | Optional link for bottom action button. |
| `action_label` | Text | No | Label for action link (default: `"Standort & Infos →"`). |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.5 Service Mini Card: `dropdown_time_item`

Individual service schedule card nested inside `dropdown_card`:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `title` | Text | Yes | Location/service title (e.g., `"Gifhorn"`). |
| `time` | Text | Yes | Service time badge (e.g., `"10:00 & 12:00 Uhr"`). |
| `location` | Text | No | Venue or address (e.g., `"BSK-Saal"`). |
| `details` | Text | No | Additional notes (e.g., `"Inklusive Kaffee & Snacks"`). |
| `has_kids` | Boolean | No | Echo Kids indicator switch. Default: `false`. |
| `kids_label` | Text | No | Kids badge text (default: `"Echo Kids verfügbar"`). |
| `url` | Text / Multilink | No | Target URL for campus details. |
| `action_label` | Text | No | Link label (default: `"Standort & Infos →"`). |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` | Multi-select | No | Target surface (e.g., `["gifhorn"]`). |

---

### 2.6 Interactive Expandable Action Card: `donation_card`

Collapsible interactive drawer powered by pure CSS `<details>` and `<summary>`. Designed for donations and bank transfers, but fully generalized to display **any custom data, credentials, vouchers, or action flows** with the exact same visual styling and structure:
- **Row 1 (Action Buttons)**: Can render either a **single whole (full-width) button** or **two side-by-side action buttons** with custom labels, URLs, Font Awesome icons, and styling variants (`primary`, `secondary`, `paypal`, `iban`).
- **Row 2 (Information & Copy Card)**: Structured details card with a custom title, icon, arbitrary key-value details, and an accessible one-click copy button (`data-copy-text`) with instant visual feedback, or standard bank transfer details (`data-copy-iban`).

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | Yes | Summary header text for the expandable dropdown button (e.g., `"Spenden & Unterstützen"` or `"WLAN & Zugangsdaten"`). |
| `icon` | Text | No | Icon next to label: `heart` (default), or any Font Awesome icon (e.g., `church`, `calendar`, `ticket`, `wifi`, `key`, `fa-*`, raw SVG, or `<i>` class tag). |
| `description` | Text | No | Intro text revealed when expanded (max 300 chars). |
| `button_1_label` | Text | No | Label for the primary button in Row 1 (e.g., `"Tickets buchen"`, `"Mit PayPal spenden"`). If only Button 1 is provided, it renders as a single full-width button. |
| `button_1_url` | Text / Multilink | No | Target URL for primary button. |
| `button_1_icon` | Text | No | Font Awesome icon name (e.g. `ticket`, `paypal`, `star`), raw SVG, or `<i>` tag for primary button. |
| `button_1_variant` | Single Option | No | Button style: `primary` (default), `secondary`, `paypal`, or `iban`. |
| `button_2_label` | Text | No | Label for optional secondary button in Row 1. When present, Row 1 automatically renders as 2 side-by-side buttons. |
| `button_2_url` | Text / Multilink | No | Target URL for secondary button. |
| `button_2_icon` | Text | No | Font Awesome icon, raw SVG, or `<i>` tag for secondary button. |
| `button_2_variant` | Single Option | No | Button style: `secondary` (default), `primary`, `paypal`, or `iban`. |
| `paypal_label` | Text | No | Legacy/preset label for PayPal button (default: `"Mit PayPal spenden"`). |
| `paypal_url` | Text / Multilink | No | Legacy/preset PayPal destination URL. |
| `iban_link_label` | Text | No | Legacy/preset label for banking button (default: `"Online-Banking öffnen"`). |
| `iban_link_url` | Text / Multilink | No | Legacy/preset online banking or external giving URL. |
| `card_title` / `iban_title` | Text | No | Header of the information card in Row 2 (default: `"Per Banküberweisung (IBAN)"`). |
| `card_icon` | Text | No | Optional leading icon for the Row 2 card header (e.g., `building-columns`, `wifi`, `key`, `info-circle`). |
| `details` | Array of Objects | No | Array of arbitrary key-value details in Row 2: `[ { "label": "...", "value": "...", "isCode": true|false } ]`. |
| `copy_value` | Text | No | Arbitrary text string copied to clipboard when the user clicks the copy button in Row 2 (wired to `clipboard-copy.js`). |
| `copy_label` / `copy_text`| Text | No | Label for the copy button (default: `"IBAN kopieren"` or `"Kopieren"`). |
| `account_name` | Text | No | Account holder name for bank transfer preset (e.g., `"Echo Kirche e.V."`). |
| `iban` | Text | No | IBAN string for bank transfer preset (e.g., `"DE12 3456 7890 1234 5678 90"`). Automatically sets `copy_value` if not explicitly given. |
| `bic` | Text | No | BIC / SWIFT code for bank transfer preset (e.g., `"PBNKDEFF"`). |
| `bank_name` | Text | No | Banking institution name for bank transfer preset (e.g., `"Postbank"`). |
| `reference` | Text | No | Recommended payment reference / Verwendungszweck. |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.7 Multi-Row Expandable Drawer: `dropdown_accordion` / `accordion_buttons`

A flexible, pure-CSS collapsible interactive accordion drawer powered by native `<details>` and `<summary>`. Supports **any number of rows** inside the drawer (aliased as `dropdown-accordion`, `dropdown_accordion`, and `accordion_buttons`), where each row can be:
- **1 Full Button** (`layout: "full"`): Stretches across 100% width.
- **2 Half Buttons** (`layout: "half"`): Two side-by-side action buttons (50% width each), responsively adapting on narrow mobile viewports.
- **1 Expanded Button / Panel** (`layout: "expanded"`): Rich details card displaying header title and icon, **up to 5 key-value fields** (with optional monospace code font for credentials or IDs), and an accessible one-click copy-to-clipboard button using the high-contrast `donation-card__copy-btn` style (`data-copy-text` / `data-copy-iban`). Ideal for bank transfer details, event check-in codes, Wi-Fi logins, and promo vouchers.

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | Yes | Summary header text for the expandable dropdown button (e.g., `"Spenden, Aktionen & Details"`). |
| `icon` | Text | No | Visual icon on trigger button (e.g., `layer-group`, `star`, `heart`, `ticket`, or any Font Awesome icon/SVG). |
| `description` | Text | No | Optional introductory guidance text revealed when drawer is opened. |
| `rows` | Blocks / Array | Yes | Array of row items, each configured as `full`, `half`, or `expanded`. |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

#### Row Schema Definition (`accordion_row`)

| Layout Type | Properties | Description |
| :--- | :--- | :--- |
| `full` | `button: { label, url, icon, variant, target }` | 1 single full-width button. |
| `half` | `buttons: [ { label, url, icon, variant }, { label, url, icon, variant } ]` | 2 side-by-side half buttons (50% each). |
| `expanded` | `title`, `icon`, `fields` (max 5 items: `{ label, value, isCode }`), `copyValue`, `copyLabel` | 1 expanded card with up to 5 fields and copy button. |

---

### 2.8 Horizontal Media Card: `image_card_horizontal`

16:9 aspect-ratio visual banner card:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | No | Optional card title (max 160 chars). When omitted, renders as an image-only link banner. |
| `url` | Text / Multilink | Yes | Safe destination URL. |
| `image` | Asset / String Link | No* | Storyblok image asset (WebP, 16:9 ratio, max 1900px, max 400 KB) or local/structured asset. **Takes precedence** over `image_url` / `imageUrl` if both are set. |
| `image_url` / `imageUrl` | Text (URL / Path) | No* | Fallback direct image URL or local asset path (e.g., `https://...` or `/assets/images/...`). Used when `image` is empty. At least one of `image` or `image_url` (`imageUrl`) should be set. |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.7 Vertical Media Card: `image_card_vertical`

3:4 aspect-ratio portrait flyer card:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | No | Optional card title (max 160 chars). When omitted, renders as an image-only link banner. |
| `url` | Text / Multilink | Yes | Safe destination URL. |
| `image` | Asset / String Link | No* | Storyblok image asset (WebP, 3:4 ratio, max 1400px, max 400 KB) or local/structured asset. **Takes precedence** over `image_url` / `imageUrl` if both are set. |
| `image_url` / `imageUrl` | Text (URL / Path) | No* | Fallback direct image URL or local asset path (e.g., `https://...` or `/assets/images/...`). Used when `image` is empty. At least one of `image` or `image_url` (`imageUrl`) should be set. |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.8 Privacy Video Card: `video_link_card`

Privacy 2-click consent YouTube card:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `label` | Text | Yes | Video title (max 160 chars). |
| `provider` | Options | No | Video provider: `"youtube"` (default), `"vimeo"`, `"other"`. |
| `youtube_video_id` | Text | No* | 11-character YouTube video ID (required if provider is YouTube). |
| `youtube_content_type` | Options | No | `"video"` (standard) or `"live"` (livestream). Default: `"video"`. |
| `url` | Text / Multilink | No | Full URL (used as fallback or for non-YouTube providers). |
| `image` | Asset | No | Custom thumbnail image (local WebP). |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.9 Container Box: `group_block`

Groups multiple buttons or cards within a styled container panel:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `title` | Text | No | Optional group header title. |
| `description` | Text | No | Optional group description. |
| `variant` | Options | No | Visual style: `"card"`, `"soft"`, `"outline"`, `"transparent"`. Default: `"card"`. |
| `items` | Blocks | Yes | Nested bloks (`link_button`, `dropdown_card`, `image_card_horizontal`, etc.). |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` / `hide_on` | Multi-select | No | Tier 2 surface filters. |

---

### 2.10 Section Divider: `section_heading`

Visual uppercase divider for categorizing link groups:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `title` | Text | Yes | Category header text (max 80 chars). |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |

---

### 2.11 Legal Footer: `footer_legal`

Contains church legal details, mandatory Impressum/Datenschutz links, and social items:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `organization_name` | Text | Yes | Legal organization name (e.g., `"Echo Kirche e.V."`). |
| `street` | Text | Yes | Street address. |
| `city` | Text | Yes | Postal code and city. |
| `email` | Text | Yes | Contact email address. |
| `impressum_url` | Text | Yes | Link to Impressum (default: `"https://kirche-echo.de/impressum/"`). |
| `datenschutz_url` | Text | Yes | Link to Datenschutz (default: `"https://kirche-echo.de/datenschutz/"`). |
| `copyright_year` | Number | No | Copyright year (default: current year). |
| `socials` | Blocks | No | Array of `social_item` bloks. |
| `display_in_default` | Boolean | No | Tier 1 curation flag. Default: `true`. |
| `show_on` | Multi-select | No | Campus filter for location-specific footers. |

---

### 2.12 Social Item: `social_item`

Circular social media icon button:

| Field Name | Type | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `platform` | Options | Yes | Platform: `instagram`, `youtube`, `whatsapp`, `spotify`, `email`, `website`, `facebook`, `tiktok`, `linkedin`. |
| `url` | Text / Multilink | Yes | Safe profile URL. |
| `label` | Text | No | Accessible ARIA label. |

---

## 3. Graceful Nullability & Fallback Rules

Components MUST NOT crash when optional CMS fields are omitted. The following fallback behaviors are enforced in Nunjucks templates:

1. **Missing `bio`**: `ProfileHeader.njk` skips the bio `<p>` tag entirely.
2. **Missing `avatar`**: Renders the text title without an avatar container.
3. **Missing `icon`**: `LinkButton.njk` renders text-only button without an empty `<span>`.
4. **Missing `image`**: Media cards fallback to a styled neutral placeholder or title-only card.
5. **Storyblok Multilink vs Plain URL**: The `resolveUrl` filter handles both plain string URLs (`"https://kirche-echo.de"`) and Storyblok multilink objects (`{ linktype: "url", url: "https://..." }`), returning a safe string.
6. **Dangerous Protocols**: `resolveUrl` blocks `javascript:` and `data:` protocols, returning empty string `""` to prevent XSS attacks.
7. **Dual Image Fields (Storyblok Asset + Fallback URL) & Optional Labels in Media Cards**: Image cards (`image_card_horizontal`, `image_card_vertical`) support both `image` (Storyblok asset / structured object / string) and `image_url` / `imageUrl` (direct URL or local path). When both are provided, `image` (the Storyblok image) takes precedence. If `label` is omitted, the card renders as a pure image link banner without an empty bottom title bar.

---

## 4. Dual-Tier Curation Logic

Surface filtering is executed by the `filterBySurface` filter in `eleventy.config.mjs`:

```
1. If surface === 'all':
   Show all items (used exclusively for /test preview toolbar).

2. If surface === 'default' (Root landing page /):
   a. Check displayInDefault (or display_in_default):
      - If explicitly false -> HIDE.
      - If true or undefined -> proceed to step b.
   b. Check showOn (or show_on):
      - If showOn is non-empty and does NOT include 'default' -> HIDE.
   c. Check hideOn (or hide_on):
      - If hideOn contains 'default' -> HIDE.
   d. Otherwise -> SHOW.

3. If surface === <campus> (e.g., 'gifhorn', 'wolfsburg', 'helmstedt', 'instagram'):
   a. Check showOn (or show_on):
      - If showOn is non-empty and does NOT include <campus> -> HIDE.
   b. Check hideOn (or hide_on):
      - If hideOn contains <campus> -> HIDE.
   c. Otherwise -> SHOW.
```

### 4.1 Storyblok Datasource Integration (`surfaces`)

All `show_on` and `hide_on` multi-select fields in `storyblok/components.json` are bound directly to the centralized Storyblok datasource:
```json
{
  "type": "options",
  "source": "internal",
  "datasource_slug": "surfaces"
}
```

#### Datasource Value Standard: `gifhorn` vs. `gf`
- **Technical Value**: MUST be **`gifhorn`** (lowercase full city/platform name, NOT `gf`).
- **Editor Display Name**: `Gifhorn (gf)` &mdash; displays the friendly name with short slug in parentheses.
- **Why?**: The data pipeline (`_data/surfaces.js`, `surface-switcher.js`, `content.schema.json`) utilizes canonical city names (`gifhorn`, `wolfsburg`, `helmstedt`, `instagram`). Short abbreviations (`gf`, `wob`, `he`, `ig`) are URL routing shortcuts.
- **Alias Tolerance**: `filterBySurface` in `eleventy.config.mjs` includes an alias map (`SURFACE_ALIASES: { gf: 'gifhorn', wob: 'wolfsburg', he: 'helmstedt', ig: 'instagram' }`) ensuring zero breaking failures if an abbreviation is ever passed in payload data.
