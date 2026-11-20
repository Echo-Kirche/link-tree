import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { resolveStoryblokUrl, normalizeStoryblokLinks } from '../src/utils/storyblok-url.js';

const siteDir = path.resolve('_site');

describe('Component Markup & Accessibility Contracts', () => {
  const indexHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  const testHtml = fs.readFileSync(path.join(siteDir, 'test', 'index.html'), 'utf8');

  test('ProfileHeader component renders avatar and name', () => {
    assert.match(indexHtml, /class="profile-header"/, 'ProfileHeader container must exist');
    assert.match(indexHtml, /class="profile-header__name"/, 'ProfileHeader name must exist');
    assert.match(indexHtml, /Echo Kirche/, 'ProfileHeader must contain name text');
    assert.match(indexHtml, /class="profile-header__avatar"/, 'ProfileHeader avatar must exist');
  });

  test('LinkButton component renders accessible link with states and icon', () => {
    assert.match(indexHtml, /class="link-button/, 'LinkButton must have link-button class');
    assert.match(indexHtml, /href="https?:\/\//, 'LinkButton must have valid href');
    assert.match(indexHtml, /rel="noopener noreferrer"/, 'External links must have safe rel');
    assert.match(indexHtml, /class="link-button__icon"/, 'LinkButton icon wrapper must exist');
    assert.match(indexHtml, /class="link-button__label"/, 'LinkButton label wrapper must exist');
  });

  test('DropdownCard component renders accessible details/summary pattern', () => {
    assert.match(indexHtml, /<details class="dropdown-card"/, 'DropdownCard must use semantic <details>');
    assert.match(indexHtml, /<summary class="dropdown-card__summary link-button/, 'Summary must be styled as link-button');
    assert.match(indexHtml, /class="dropdown-card__chevron"/, 'DropdownCard must have chevron indicator');
    assert.match(indexHtml, /class="dropdown-card__content"/, 'DropdownCard drawer content must exist');
    assert.match(indexHtml, /class="dropdown-card__columns"/, 'DropdownCard column layout container must exist');
    assert.match(indexHtml, /class="dropdown-card__column"/, 'DropdownCard column items must exist');
    assert.match(indexHtml, /class="dropdown-card__column-badge"/, 'DropdownCard column badges must exist');
    assert.match(indexHtml, /class="dropdown-card__kids-badge"/, 'DropdownCard kids badge must exist');
    assert.match(indexHtml, /fa-child/, 'DropdownCard must render tiny child icon');
    assert.match(indexHtml, /Echo Kids verfügbar/, 'DropdownCard must show Echo Kids available label');
    assert.match(indexHtml, /BSK-Saal, Schützenplatz 3/, 'DropdownCard must show BSK-Saal venue');
    assert.match(indexHtml, /class="dropdown-card__action-link"/, 'DropdownCard action link must exist');
    assert.match(indexHtml, /Gifhorn \(10:00\)/, 'DropdownCard must include Gifhorn 10:00 card');
    assert.match(indexHtml, /Gifhorn \(12:00\)/, 'DropdownCard must include Gifhorn 12:00 card');
    assert.match(indexHtml, /Wolfsburg/, 'DropdownCard default must include Wolfsburg');
    assert.match(indexHtml, /Helmstedt/, 'DropdownCard default must include Helmstedt');
  });

  test('ImageCardHorizontal & ImageCardVertical render media cards with aspect ratios and arrows', () => {
    assert.match(indexHtml, /class="image-card image-card--horizontal"/, 'ImageCardHorizontal must exist');
    assert.match(indexHtml, /class="image-card__media"/, 'Image media wrapper must exist');
    assert.match(indexHtml, /class="image-card__title"/, 'Image title must exist');
    assert.match(indexHtml, /class="image-card__arrow"/, 'Interactive arrow badge must exist');
    assert.match(indexHtml, /loading="lazy"/, 'Images must use native lazy loading');
  });

  test('VideoLinkCard renders 2-click consent facade without initial iframe', () => {
    assert.match(indexHtml, /class="video-link-card"/, 'VideoLinkCard container must exist');
    assert.match(indexHtml, /class="video-link-card__play-btn"/, 'Play facade button must exist');
    assert.match(indexHtml, /class="video-link-card__play-badge"/, 'Play badge must exist');
    assert.match(indexHtml, /data-video-embed="youtube"/, 'Data attribute for facade embed must exist');
    assert.doesNotMatch(indexHtml, /<iframe/i, 'No initial <iframe> allowed on page load');
  });

  test('FooterLegal renders address, legal links, and social buttons', () => {
    assert.match(indexHtml, /class="footer-legal"/, 'FooterLegal container must exist');
    assert.match(indexHtml, /class="footer-legal__address"/, 'Footer address must exist');
    assert.match(indexHtml, /href="[^"]*\/impressum\/"/, 'Impressum link must exist');
    assert.match(indexHtml, /href="[^"]*\/datenschutz\/"/, 'Datenschutz link must exist');
    assert.match(indexHtml, /class="[^"]*\bsocial-button\b/, 'Social icon buttons must exist');
    assert.match(indexHtml, /aria-label="/, 'Social buttons must have accessible aria-labels');
  });

  test('SurfaceSwitcher renders only on /test page', () => {
    assert.doesNotMatch(indexHtml, /class="surface-switcher"/, 'Default page must NOT have surface-switcher');
    assert.match(testHtml, /class="surface-switcher"/, 'Test page MUST have surface-switcher');
    assert.match(testHtml, /class="surface-switcher__btn"/, 'Switcher buttons must exist on /test');
    assert.match(testHtml, /data-switch-value="gifhorn"/, 'Gifhorn switcher target must exist');
    assert.match(testHtml, /data-switch-value="wolfsburg"/, 'Wolfsburg switcher target must exist');
    assert.match(testHtml, /data-switch-value="helmstedt"/, 'Helmstedt switcher target must exist');
    assert.match(testHtml, /data-switch-value="instagram"/, 'Instagram switcher target must exist');
    assert.match(testHtml, /role="toolbar"/, 'Toolbar role must exist for switcher buttons');
  });

  test('ThemeSwitcher renders on /test page with all 6 brand themes and active badge', () => {
    assert.match(testHtml, /class="theme-switcher surface-switcher"/, 'ThemeSwitcher container must exist on test page');
    assert.match(testHtml, /data-theme-value="light"/, 'Light theme button must exist');
    assert.match(testHtml, /data-theme-value="pale"/, 'Pale theme button must exist');
    assert.match(testHtml, /data-theme-value="soft"/, 'Soft theme button must exist');
    assert.match(testHtml, /data-theme-value="dark"/, 'Dark theme button must exist');
    assert.match(testHtml, /data-theme-value="teal"/, 'Teal theme button must exist');
    assert.match(testHtml, /data-theme-value="lavender"/, 'Lavender theme button must exist');
    assert.match(testHtml, /id="active-theme-badge"/, 'Active theme badge indicator must exist');
  });

  test('Client-side scripts support reactive theme updates without breaking static builds', () => {
    const switcherJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'surface-switcher.js'), 'utf8');
    assert.match(switcherJs, /applyTheme/, 'surface-switcher.js must export or define applyTheme');
    assert.match(switcherJs, /data-theme-value/, 'surface-switcher.js must handle data-theme-value buttons');
    assert.match(switcherJs, /active-theme-badge/, 'surface-switcher.js must update active-theme-badge');

    const bridgeJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'storyblok-bridge.js'), 'utf8');
    assert.match(bridgeJs, /content\.theme/, 'storyblok-bridge.js must read content.theme');
    assert.doesNotMatch(bridgeJs, /sb\.on\('input'[^}]*reload\(\)/, 'storyblok-bridge.js must NOT reload on input');
  });

  test('Storyblok link objects resolve cleanly and never render [object Object]', async () => {
    // 1. Verify that no generated HTML file contains [object Object] in href
    assert.doesNotMatch(indexHtml, /href="\[object Object\]"/, 'index.html must not contain [object Object] href');
    assert.doesNotMatch(testHtml, /href="\[object Object\]"/, 'test.html must not contain [object Object] href');

    // 2. Test resolveStoryblokUrl with Storyblok multilink objects
    const { resolveStoryblokUrl, normalizeStoryblokLinks } = await import('../src/utils/storyblok-url.js');

    // External URL multilink
    const externalLink = { id: '', url: 'https://apple.com', linktype: 'url', fieldtype: 'multilink', cached_url: 'https://apple.com' };
    assert.equal(resolveStoryblokUrl(externalLink), 'https://apple.com', 'Should resolve external link object');

    // Internal Story multilink
    const storyLink = { id: '123', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: 'gifhorn' };
    assert.equal(resolveStoryblokUrl(storyLink), '/gifhorn/', 'Should resolve internal story link object');

    // Home Story multilink
    const homeStoryLink = { id: '123', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: 'home' };
    assert.equal(resolveStoryblokUrl(homeStoryLink), '/', 'Should resolve home story link to /');

    // Email multilink
    const emailLink = { id: '', url: 'info@kirche-echo.de', linktype: 'email', fieldtype: 'multilink', cached_url: 'info@kirche-echo.de' };
    assert.equal(resolveStoryblokUrl(emailLink), 'mailto:info@kirche-echo.de', 'Should resolve email link to mailto:');

    // Plain string URL
    assert.equal(resolveStoryblokUrl('https://example.com'), 'https://example.com', 'Should preserve plain string URL');

    // Recursive tree normalization
    const mockBlokTree = {
      body: [
        {
          component: 'link_button',
          label: 'Apple',
          url: externalLink,
        },
      ],
      footer: [
        {
          component: 'footer_legal',
          impressum_url: { linktype: 'url', url: 'https://kirche-echo.de/impressum/' },
        },
      ],
    };

    const normalized = normalizeStoryblokLinks(mockBlokTree);
    assert.equal(normalized.body[0].url, 'https://apple.com', 'normalizeStoryblokLinks must resolve nested link_button url');
    assert.equal(normalized.footer[0].impressum_url, 'https://kirche-echo.de/impressum/', 'normalizeStoryblokLinks must resolve nested footer impressum_url');
  });

  test('Regular pages do not render lazy-loader overlay (404-only)', () => {
    assert.doesNotMatch(indexHtml, /id="page-loader"/, 'Regular pages must not render page loader overlay');
    assert.doesNotMatch(indexHtml, /class="lazy-loader"/, 'Regular pages must not contain lazy-loader markup');
  });

  test('Storyblok token is never embedded in HTML meta tags or attributes', () => {
    assert.doesNotMatch(indexHtml, /name=["']storyblok-token["']/i, 'HTML must never contain storyblok-token meta tag');
    assert.doesNotMatch(testHtml, /name=["']storyblok-token["']/i, 'Test HTML must never contain storyblok-token meta tag');
  });

  test('resolveStoryblokUrl blocks dangerous javascript: and data: protocols', () => {
    assert.equal(resolveStoryblokUrl('javascript:alert(1)'), '#', 'javascript: protocol must be blocked');
    assert.equal(resolveStoryblokUrl('data:text/html;base64,PHNjcmlwdD4='), '#', 'data: protocol must be blocked');
    assert.equal(resolveStoryblokUrl('vbscript:msgbox(1)'), '#', 'vbscript: protocol must be blocked');
    assert.equal(resolveStoryblokUrl({ url: 'javascript:void(0)' }), '#', 'Object with javascript url must be blocked');
  });

  test('Storyblok bridge supports real-time Visual Editor reconciliation: adding, removing, and reordering link_button using stable _uid', () => {
    const bridgeJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'storyblok-bridge.js'), 'utf8');

    class MockElement {
      constructor(tag) {
        this.tagName = tag.toUpperCase();
        this.children = [];
        this.dataset = {};
        this._classList = new Set();
        this.innerHTML = '';
        this.textContent = '';
        this.href = '';
        this.src = '';
      }
      get classList() {
        const self = this;
        return {
          add(c) { self._classList.add(c); },
          contains(c) { return self._classList.has(c); },
          remove(c) { self._classList.delete(c); }
        };
      }
      set className(cn) {
        this._classList = new Set(cn.split(/\s+/).filter(Boolean));
      }
      get className() {
        return Array.from(this._classList).join(' ');
      }
      appendChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        this.children.push(child);
        child.parentElement = this;
        return child;
      }
      remove() {
        if (this.parentElement) {
          const idx = this.parentElement.children.indexOf(this);
          if (idx !== -1) this.parentElement.children.splice(idx, 1);
          this.parentElement = null;
        }
      }
      querySelector(sel) {
        return null;
      }
    }

    const list = new MockElement('ul');
    list.className = 'linktree-list';
    const initialItem = new MockElement('li');
    initialItem.className = 'linktree-item';
    initialItem.dataset.uid = 'uid-initial-1';
    list.appendChild(initialItem);

    const doc = {
      title: '',
      documentElement: new MockElement('html'),
      querySelector(sel) {
        if (sel === '.linktree-list') return list;
        return null;
      },
      createElement(tag) {
        return new MockElement(tag);
      },
      body: new MockElement('body')
    };

    const sandbox = {
      window: {},
      document: doc,
      location: { search: '?_storyblok=1' },
      URLSearchParams,
      Set, Map, Array, String, Boolean, console
    };
    sandbox.window = sandbox;

    runInNewContext(bridgeJs, sandbox);
    assert.equal(typeof sandbox.storyblokApplyContent, 'function', 'storyblokApplyContent must be exposed for bridge updates');

    // 1. Add a new link_button
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' },
        {
          _uid: 'uid-new-link',
          component: 'link_button',
          label: 'Test Link Button',
          url: 'https://example.com/test-button',
          show_on: ['instagram', 'default']
        }
      ]
    });

    assert.equal(list.children.length, 2, 'New item must be dynamically appended to linktree-list');
    const addedItem = list.children[1];
    assert.equal(addedItem.dataset.uid, 'uid-new-link', 'Added item must have matching data-uid');
    assert.match(addedItem.innerHTML, /class="link-button/, 'Added item must have link-button class');
    assert.match(addedItem.innerHTML, /Test Link Button/, 'Added item must render label');
    assert.match(addedItem.innerHTML, /href="https:\/\/example\.com\/test-button"/, 'Added item must have resolved URL');
    assert.match(addedItem.innerHTML, /class="link-button__icon"/, 'Added item must have icon wrapper');
    assert.equal(addedItem.dataset.showOn, 'instagram,default', 'Surface filtering show_on attributes must be preserved');

    // 2. Reorder items (place new button before initial button)
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-new-link', component: 'link_button', label: 'Test Link Button' },
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' }
      ]
    });
    assert.equal(list.children[0].dataset.uid, 'uid-new-link', 'First item in DOM must be uid-new-link after reorder');
    assert.equal(list.children[1].dataset.uid, 'uid-initial-1', 'Second item in DOM must be uid-initial-1 after reorder');

    // 3. Remove the link_button
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' }
      ]
    });
    assert.equal(list.children.length, 1, 'Removed item must be pruned from DOM');
    assert.equal(list.children[0].dataset.uid, 'uid-initial-1', 'Only remaining item must be uid-initial-1');
  });
});


