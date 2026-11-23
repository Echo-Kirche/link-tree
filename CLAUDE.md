# CLAUDE.md — Claude Agent Directives — Echo Link-Tree

This file provides operational guidance for Anthropic's Claude Code and Claude-based development agents working on the Echo Kirche project.

> **RULE OF PRECEDENCE**: [`AGENTS.md`](file:///Users/Shared/projeckt/goto/link-tree/AGENTS.md) is the authoritative Single Source of Truth for all architectural rules, DO/DO NOT constraints, privacy guardrails, and coding conventions.

---

## 1. Coding Standards & Conventions

1. **Strict Patterns**: Adhere strictly to established architectural patterns, folder structures, and conventions in the codebase.
2. **Git Commits**: Follow the Conventional Commits specification (`feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`, `test:`).
3. **CSS / BEM**: Use strict BEM (`Block__Element--Modifier`) naming conventions for all CSS classes. Never use ID selectors for styling.
4. **Minimal HTML**: Keep HTML semantic and minimal. Omit redundant wrapper elements, unused attributes, and boilerplate bloat.
5. **Dependencies & Libraries**:
   - **Don't Reinvent the Wheel**: Do not rewrite functionality already provided by standard JS frameworks or established libraries—import and use them instead.
   - **Vet External Packages**: Only install well-known, actively maintained libraries with strong community adoption (high GitHub stars and weekly downloads).
   - **Avoid Micro-Dependencies**: Never install trivial, one-liner packages (`is-odd`, `left-pad`, whitespace utilities). Write simple utility functions natively.

---

## 2. Core Architectural Invariants

- **Pure Static Output**: 100% pre-rendered static HTML via Eleventy (11ty) v3.x and Dart Sass. Zero client-side framework hydration (no React, Vue, Svelte, Alpine).
- **Zero Token Leaks**: Never embed `STORYBLOK_TOKEN` or private keys in HTML meta tags, data attributes, or client bundles.
- **Privacy (DSGVO)**: Zero initial third-party connections. Self-hosted fonts (`Clash Display`, `Inter`). No cookies on initial visit. 2-click consent facade for YouTube embeds via `youtube-nocookie.com`.
- **Brand Color Constancy**: Brand colors (`#08415C` Dark Teal Blue, `#846B8A` Muted Lavender, `#FEFADC` Light Pastel Yellow) must **never** change based on URL parameters, surfaces, or campus routes.
- **Logo Clear Space**: Minimum clear space equal to the height/width of lowercase `"e"` from the logo on all four sides. Never stretch, compress, rotate, or distort.

---

## 3. Essential Commands

```bash
# Validate local data against JSON Schema
npm run validate

# Compile Sass styles to _site/css/main.css
npm run build:sass

# Build Eleventy static site
npm run build:eleventy

# Complete production build pipeline (validate -> sass -> 11ty -> verify)
npm run build

# Run automated test suites (45+ tests across markup, states, routes)
npm test

# Start local dev server with hot reload
npm run dev
```

---

## 4. Pre-Flight & Post-Flight Checklist

### Pre-Flight:
1. Review [`AGENTS.md`](file:///Users/Shared/projeckt/goto/link-tree/AGENTS.md) and relevant `docs/*.md`.
2. Inspect existing components in `src/_includes/components/` and tokens in `src/styles/tokens/`.

### Post-Flight:
1. Run `npm run validate && npm run build && npm test`.
2. Ensure all 45+ test assertions pass with 0 errors.
3. Update corresponding `docs/*.md` if any schema, token, or dependency was altered.
