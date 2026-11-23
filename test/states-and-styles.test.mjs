import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve('_site/css/main.css');

describe('Component State Changes & CSS Verification', () => {
  const css = fs.readFileSync(cssPath, 'utf8');

  test('LinkButton interactive state changes (:hover, :active, :focus-visible)', () => {
    assert.match(css, /\.link-button:hover/, 'LinkButton must define :hover state');
    assert.match(css, /\.link-button:active/, 'LinkButton must define :active state');
    assert.match(css, /\.link-button:focus-visible/, 'LinkButton must define :focus-visible state');
    assert.match(css, /translateY\(-1px\)/, 'LinkButton :hover must have translateY micro-interaction');
  });

  test('DropdownCard open and interactive state changes', () => {
    assert.match(css, /\.dropdown-card\[open\]/, 'DropdownCard must define [open] state');
    assert.match(css, /rotate\(180deg\)/, 'DropdownCard open state must rotate chevron 180deg');
    assert.match(css, /\.dropdown-card__summary:focus-visible/, 'DropdownCard summary must define :focus-visible');
    assert.match(css, /\.dropdown-card__chevron\{position:absolute;/, 'DropdownCard chevron must be absolutely positioned to keep label centered');
    assert.match(css, /\.dropdown-card__summary\{[^}]*text-align:center/, 'DropdownCard summary must be centered');
    assert.match(css, /\.dropdown-card__action-link:hover/, 'DropdownCard action link must define :hover');
    assert.match(css, /\.dropdown-card__action-link:focus-visible/, 'DropdownCard action link must define :focus-visible');
  });

  test('ImageCard interactive states (:hover, :active, :focus-visible, arrow slide)', () => {
    assert.match(css, /\.image-card:hover/, 'ImageCard must define :hover state');
    assert.match(css, /\.image-card:active/, 'ImageCard must define :active state');
    assert.match(css, /\.image-card:focus-visible/, 'ImageCard must define :focus-visible state');
    assert.match(css, /\.image-card:hover\s+\.image-card__arrow/, 'ImageCard :hover must animate arrow indicator');
    assert.match(css, /translateX\(2px\)/, 'Arrow icon must slide right on card hover');
  });

  test('VideoLinkCard interactive and playback states', () => {
    assert.match(css, /\.video-link-card:not\(\.video-link-card--playing\):hover/, 'VideoLinkCard must style hover when not playing');
    assert.match(css, /\.video-link-card:not\(\.video-link-card--playing\):active/, 'VideoLinkCard must style active when not playing');
    assert.match(css, /\.video-link-card__play-btn:focus-visible/, 'Play button must define :focus-visible');
    assert.match(css, /\.video-link-card:focus-within/, 'VideoLinkCard must style :focus-within');
  });

  test('SocialButton interactive states (:hover, :active, :focus-visible)', () => {
    assert.match(css, /\.social-button:hover/, 'SocialButton must define :hover state');
    assert.match(css, /\.social-button:active/, 'SocialButton must define :active state');
    assert.match(css, /\.social-button:focus-visible/, 'SocialButton must define :focus-visible state');
  });

  test('SurfaceSwitcher interactive states (:hover, .is-active, [aria-pressed="true"], :focus-visible)', () => {
    assert.match(css, /\.surface-switcher__btn:hover/, 'SurfaceSwitcher button must define :hover');
    assert.match(css, /\.surface-switcher__btn\.is-active|\.surface-switcher__btn\[aria-pressed="true"\]/, 'SurfaceSwitcher must define active chip state');
    assert.match(css, /\.surface-switcher__btn:focus-visible/, 'SurfaceSwitcher button must define :focus-visible');
  });

  test('Accessible Focus Rings across components', () => {
    assert.match(css, /outline-offset:\s*(2px|3px)/, 'Focus rings must have appropriate outline-offset for WCAG visibility');
    assert.match(css, /outline:\s*3px solid var\(--color-focus-ring\)/, 'Primary controls must use strong 3px focus ring');
  });

  test('Accessibility prefers-reduced-motion reset', () => {
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'CSS must support prefers-reduced-motion');
    assert.match(css, /transition-duration:\s*0?\.01ms\s*!important/, 'Reduced motion must collapse transition durations');
  });

  test('All 6 brand themes are defined in CSS with semantic variables', () => {
    assert.match(css, /\[data-theme=["']?light["']?\],\s*\[data-theme=["']?white["']?\]/, 'CSS must define light/white theme');
    assert.match(css, /\[data-theme=["']?pale["']?\],\s*\[data-theme=["']?warm["']?\]/, 'CSS must define pale/warm theme');
    assert.match(css, /\[data-theme=["']?soft["']?\]/, 'CSS must define soft theme');
    assert.match(css, /\[data-theme=["']?dark["']?\]/, 'CSS must define dark theme');
    assert.match(css, /\[data-theme=["']?teal["']?\]/, 'CSS must define teal theme');
    assert.match(css, /\[data-theme=["']?lavender["']?\]/, 'CSS must define lavender theme');
  });

  test('Dark, teal, and lavender themes invert avatar logo for high contrast', () => {
    assert.match(css, /\[data-theme=["']?dark["']?\]\s+\.profile-header__avatar/, 'Dark theme must invert avatar');
    assert.match(css, /\[data-theme=["']?teal["']?\]\s+\.profile-header__avatar/, 'Teal theme must invert avatar');
    assert.match(css, /\[data-theme=["']?lavender["']?\]\s+\.profile-header__avatar/, 'Lavender theme must invert avatar');
    assert.match(css, /brightness\(0\)\s*invert\(1\)/, 'Avatar inversion filter must be applied');
  });

  test('Echo Kirche Styleguide: Logo Clear Space (Schutzzone)', () => {
    assert.match(css, /\.profile-header__avatar-wrapper\{[^}]*padding:\s*1rem/, 'Profile header avatar must have 1rem Schutzzone padding');
  });

  test('Echo Kirche Styleguide: Type Scale, Line-Heights and Wordmark', () => {
    assert.match(css, /\.link-button\{[^}]*font-size:\s*1\.25rem/, 'LinkButton must use H5 (1.25rem / 20px)');
    assert.match(css, /line-height:\s*1\.2/, 'Headings must use 1.1-1.2 line height');
    assert.match(css, /line-height:\s*1\.5/, 'Body must use 1.4-1.5 line height');
    assert.match(css, /\.sub-brand-wordmark|\.echo-kids-wordmark/, 'Sub-brand wordmark classes must exist');
    assert.match(css, /\.wordmark-echo\{font-weight:\s*600/, 'Sub-brand wordmark echo must be Semibold 600');
    assert.match(css, /\.wordmark-kids\{font-weight:\s*400/, 'Sub-brand wordmark kids must be Regular 400');
  });

  test('Echo Kirche Styleguide: Colors and Hover States', () => {
    assert.match(css, /--color-action-bg-hover:\s*var\(--ek-mauve,\s*#846B8A\)|--color-action-bg-hover:\s*#846B8A/, 'Action hover must be Muted Lavender (#846B8A)');
    assert.match(css, /--color-page-bg:\s*var\(--ek-warm,\s*#FEFADC\)|--color-page-bg:\s*#FEFADC/, 'Default page background must be Light Pastel Yellow (#FEFADC)');
  });

  // --- Styleguide Rule: Color Contrast, Token Pairing & Automated CSS Testing ---

  function sRgbToLinear(c) {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
  }

  function getWcagContrast(hex1, hex2) {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function parseDeclarations(cssBlock) {
    const tokens = {};
    const decls = cssBlock.split(';');
    for (const decl of decls) {
      const colon = decl.indexOf(':');
      if (colon === -1) continue;
      const prop = decl.slice(0, colon).trim();
      const val = decl.slice(colon + 1).trim();
      if (prop.startsWith('--')) {
        tokens[prop] = val;
      }
    }
    return tokens;
  }

  const rootTokens = parseDeclarations(css.match(/:root\{([^}]+)\}/)?.[1] || '');

  function resolveColor(val, themeTokens) {
    if (!val) return null;
    const hexMatch = val.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) return hexMatch[0];
    const varMatch = val.match(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/);
    if (varMatch) {
      const targetVar = varMatch[1];
      const fallback = varMatch[2];
      if (themeTokens && themeTokens[targetVar]) {
        return resolveColor(themeTokens[targetVar], themeTokens);
      }
      if (rootTokens[targetVar]) {
        return resolveColor(rootTokens[targetVar], rootTokens);
      }
      if (fallback) {
        return resolveColor(fallback, themeTokens);
      }
    }
    return null;
  }

  function getDefinedThemes() {
    const themeBlockRegex = /\[data-theme=["']?([\w-]+)["']?\](?:,\s*\[data-theme=["']?([\w-]+)["']?\])*\{([^}]+)\}/g;
    const themes = [{ name: 'root (default)', tokens: rootTokens }];
    let match;
    while ((match = themeBlockRegex.exec(css)) !== null) {
      const themeName = match[1];
      const blockTokens = parseDeclarations(match[3]);
      themes.push({
        name: themeName,
        tokens: { ...rootTokens, ...blockTokens }
      });
    }
    return themes;
  }

  test('Rule 2.1: Strict Paired Tokens across components (no orphan backgrounds)', () => {
    assert.match(css, /\.link-button\{[^}]*background-color:[^;]+;[^}]*color:/, 'LinkButton must declare paired background and color');
    assert.match(css, /\.dropdown-card\{[^}]*background-color:[^;]+;[^}]*color:/, 'DropdownCard must declare paired background and color');
    assert.match(css, /\.image-card\{[^}]*background-color:[^;]+;[^}]*color:/, 'ImageCard must declare paired background and color');
    assert.match(css, /\.video-link-card\{[^}]*background-color:[^;]+;[^}]*color:/, 'VideoLinkCard must declare paired background and color');
    assert.match(css, /\.social-button\{[^}]*background-color:[^;]+;[^}]*color:/, 'SocialButton must declare paired background and color');
    assert.match(css, /\.surface-switcher\{[^}]*background-color:[^;]+;[^}]*color:/, 'SurfaceSwitcher container must declare paired background and color');
    assert.match(css, /\.group-block--card\{[^}]*background-color:[^;]+;[^}]*color:/, 'GroupBlock card must declare paired background and color');
    assert.match(css, /\.group-block--soft\{[^}]*background-color:[^;]+;[^}]*color:/, 'GroupBlock soft must declare paired background and color');
  });

  test('Rule 2.2: Semantic Naming Structure declares mandatory on-[surface] tokens across themes', () => {
    const mandatoryPairs = [
      ['--color-surface', '--color-on-surface'],
      ['--color-primary', '--color-on-primary'],
      ['--color-secondary', '--color-on-secondary'],
      ['--color-muted', '--color-on-muted'],
      ['--color-accent', '--color-on-accent']
    ];

    const themes = getDefinedThemes();
    assert.ok(themes.length >= 6, 'Must define at least 6 theme configurations');

    themes.forEach((theme) => {
      mandatoryPairs.forEach(([bgToken, fgToken]) => {
        assert.ok(theme.tokens[bgToken], `Theme [${theme.name}] must define background token ${bgToken}`);
        assert.ok(theme.tokens[fgToken], `Theme [${theme.name}] must define mandatory paired foreground token ${fgToken}`);
      });
    });
  });

  test('Rule 3 & 4.1: Automated Token Matrix Testing verifies WCAG 2.1 AA text contrast across all themes', () => {
    const themes = getDefinedThemes();
    const contrastPairs = [
      { name: 'Surface / Card', bg: '--color-surface', fg: '--color-on-surface', minRatio: 4.5 },
      { name: 'Primary Action / Button', bg: '--color-primary', fg: '--color-on-primary', minRatio: 4.5 },
      { name: 'Secondary Action / Button', bg: '--color-secondary', fg: '--color-on-secondary', minRatio: 4.5 },
      { name: 'Muted Container', bg: '--color-muted', fg: '--color-on-muted', minRatio: 4.5 },
      { name: 'Accent / Badge', bg: '--color-accent', fg: '--color-on-accent', minRatio: 4.5 },
      { name: 'Time Badge (10:00 Uhr)', bg: '--color-badge-bg', fg: '--color-badge-text-on-bg', minRatio: 4.5 },
      { name: 'Kids Badge (Kinderkirche)', bg: '--color-kids-badge-bg', fg: '--color-kids-badge-text', minRatio: 4.5 },
    ];

    themes.forEach((theme) => {
      contrastPairs.forEach((pair) => {
        const bgVal = theme.tokens[pair.bg];
        const fgVal = theme.tokens[pair.fg];
        const bgHex = resolveColor(bgVal, theme.tokens);
        const fgHex = resolveColor(fgVal, theme.tokens);

        assert.ok(bgHex, `Theme [${theme.name}] ${pair.name}: failed to resolve background color for ${pair.bg}`);
        assert.ok(fgHex, `Theme [${theme.name}] ${pair.name}: failed to resolve foreground color for ${pair.fg}`);

        const ratio = getWcagContrast(bgHex, fgHex);
        assert.ok(
          ratio >= pair.minRatio,
          `Theme [${theme.name}] ${pair.name} contrast (${bgHex} vs ${fgHex}) is ${ratio.toFixed(2)}:1, expected >= ${pair.minRatio}:1 (WCAG AA)`
        );
      });
    });
  });

  test('DropdownCard badges maintain high contrast without yellow-on-yellow in lavender & teal themes', () => {
    const themes = getDefinedThemes();
    const lavender = themes.find((t) => t.name === 'lavender');
    const teal = themes.find((t) => t.name === 'teal');

    assert.ok(lavender, 'Lavender theme must exist');
    assert.ok(teal, 'Teal theme must exist');

    const lavBg = resolveColor(lavender.tokens['--color-badge-bg'], lavender.tokens);
    const lavFg = resolveColor(lavender.tokens['--color-badge-text-on-bg'], lavender.tokens);
    assert.notEqual(lavBg.toLowerCase(), lavFg.toLowerCase(), 'Lavender badge must never use identical color for text and background (no yellow-on-yellow)');
    const lavRatio = getWcagContrast(lavBg, lavFg);
    assert.ok(lavRatio >= 4.5, `Lavender badge contrast (${lavBg} vs ${lavFg}) must be >= 4.5:1, got ${lavRatio.toFixed(2)}:1`);

    const tealBg = resolveColor(teal.tokens['--color-badge-bg'], teal.tokens);
    const tealFg = resolveColor(teal.tokens['--color-badge-text-on-bg'], teal.tokens);
    assert.notEqual(tealBg.toLowerCase(), tealFg.toLowerCase(), 'Teal badge must never use identical color for text and background');
    const tealRatio = getWcagContrast(tealBg, tealFg);
    assert.ok(tealRatio >= 4.5, `Teal badge contrast (${tealBg} vs ${tealFg}) must be >= 4.5:1, got ${tealRatio.toFixed(2)}:1`);

    assert.match(css, /\.dropdown-card__column-badge\{[^}]*--color-badge-text-on-bg/, 'Column badge must use paired --color-badge-text-on-bg');
    assert.match(css, /\.dropdown-card__kids-badge\{[^}]*--color-kids-badge-text/, 'Kids badge must use paired --color-kids-badge-text');
  });

  test('Checklist: UI icons explicitly declare currentColor fill or stroke', () => {
    assert.match(css, /\.link-button__icon\s+(?:svg|\.fa-svg)\{[^}]*fill:\s*currentColor/, 'LinkButton icon must use fill: currentColor');
    assert.match(css, /\.dropdown-card__chevron\s+svg\{[^}]*fill:\s*currentColor/, 'DropdownCard chevron icon must use fill: currentColor');
    assert.match(css, /\.social-button\s+(?:svg|\.fa-svg)\{[^}]*fill:\s*currentColor/, 'SocialButton icon must use fill: currentColor');
    assert.match(css, /\.image-card__arrow\s+(?:svg|\.fa-svg)\{[^}]*fill:\s*currentColor/, 'ImageCard arrow icon must use fill: currentColor');
    assert.match(css, /\.profile-header__name-logo\s+(?:svg|\.fa-svg)\{[^}]*fill:\s*currentColor/, 'Profile header logo must use fill: currentColor');
  });
});

