(() => {
  const $$ = (s) => document.querySelectorAll(s);
  const $id = (id) => document.getElementById(id);
  const M = { ig: 'instagram', wob: 'wolfsburg', gf: 'gifhorn', he: 'helmstedt' };
  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];
  const VALID_SURFACES = ['instagram', 'wolfsburg', 'gifhorn', 'helmstedt', 'default', 'all'];
  const VALID_SLUGS = ['ig', 'gf', 'wob', 'he', ...VALID_SURFACES];
  const VALID_ROUTES = ['', 'index.html', 'home', 'gf', 'gifhorn', 'wob', 'wolfsburg', 'he', 'helmstedt', 'ig', 'instagram', 'test', 'assets', 'css', '404', '404.html'];

  const getP = (q) => q.get('surface') || q.get('switch') || q.get('campus') || q.get('location');
  const clean = (s) => (s || '').toLowerCase().replace(/^\/|\/$/g, '').trim();
  const parseList = (v) => (v || '').split(',').map((x) => x.trim()).filter(Boolean);

  if (typeof location !== 'undefined') {
    const seg = clean(location.pathname).split('/')[0];
    const q = new URLSearchParams(location.search);
    const p = getP(q);

    const isPreview =
      ['localhost', '127.0.0.1'].includes(location.hostname) ||
      ['_storyblok', '_storyblok_tk', 'preview', '_token', '_storyblok_c'].some((k) => q.has(k) || location.search.includes(k)) ||
      (window.self !== window.top && (document.referrer || '').includes('storyblok.com')) ||
      (document.querySelector('meta[name="storyblok-version"]')?.getAttribute('content') === 'draft');

    const is404 = seg === '404' || seg === '404.html' || Boolean(document.querySelector('.not-found-page, meta[http-equiv="refresh"]'));
    const isTestBlocked = Boolean(seg === 'test' && !isPreview);
    const isUnmatchedPath = Boolean(seg && !VALID_ROUTES.includes(seg));
    const isUnmatchedParam = Boolean(p && !VALID_SLUGS.includes(clean(p)));
    const isUnmatchedFlag = Boolean(q.has('bs') || q.has('/bs'));

    if (!isPreview && (is404 || isTestBlocked || isUnmatchedPath || isUnmatchedParam || isUnmatchedFlag)) {
      if (typeof location.replace === 'function') location.replace('/');
      else location.href = '/';
      return;
    }
  }

  const getS = () => {
    const q = new URLSearchParams(location.search);
    const p = getP(q);
    if (p) {
      const n = clean(p);
      return M[n] || (VALID_SURFACES.includes(n) ? n : 'default');
    }
    for (const [k, v] of Object.entries(M)) {
      if (q.has(k) || q.has(v)) return v;
    }
    const s = clean(location.pathname).split('/')[0];
    return M[s] || (VALID_SURFACES.includes(s) ? s : (['test', 'home'].includes(s) ? 'default' : (document.documentElement.dataset.surface || 'default')));
  };

  const getTheme = () => {
    const t = new URLSearchParams(location.search).get('theme');
    return (t && VALID_THEMES.includes(t.toLowerCase())) ? t.toLowerCase() : (document.documentElement.dataset.theme || 'light');
  };

  const setBtns = (sel, k, v) => $$(sel).forEach((b) => {
    const a = b.dataset[k] === v;
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
    b.classList.toggle('is-active', a);
  });

  const pushState = (k, v, def) => {
    if (history.pushState) {
      const u = new URL(location.href);
      v === def ? u.searchParams.delete(k) : u.searchParams.set(k, v);
      const ds = document.documentElement.dataset;
      history.pushState({ surface: ds.surface, theme: ds.theme }, '', u);
    }
  };

  const applySurface = (s, push) => {
    if (s && s !== 'all') document.documentElement.dataset.surface = s;
    $$('[data-show-on],[data-hide-on],[data-display-in-default]').forEach((el) => {
      const show = parseList(el.dataset.showOn);
      const hide = parseList(el.dataset.hideOn);
      const def = el.dataset.displayInDefault;
      let vis = true;
      if (s !== 'all') {
        if (s === 'default') vis = def !== undefined ? def === 'true' : (!show.length || show.includes('default'));
        else if (show.length && !show.includes(s)) vis = false;
        if (hide.includes(s)) vis = false;
      }
      el.style.display = vis ? '' : 'none';
    });

    setBtns('.surface-switcher__btn[data-switch-value]', 'switchValue', s);
    const b = $id('active-switch-badge');
    if (b) b.textContent = s;
    if (push) pushState('surface', s, 'default');
  };

  const TC = { light: '#fff', white: '#fff', pale: '#fefadc', warm: '#fefadc', soft: '#fafafa', dark: '#000', teal: '#08415c', lavender: '#846b8a' };

  const applyTheme = (theme, push) => {
    if (!theme) return;
    const norm = String(theme).toLowerCase();
    document.documentElement.dataset.theme = norm;
    document.documentElement.style.colorScheme = ['dark', 'teal'].includes(norm) ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m && TC[norm]) m.setAttribute('content', TC[norm]);

    setBtns('[data-theme-value]', 'themeValue', norm);
    const b = $id('active-theme-badge');
    if (b) b.textContent = norm;
    if (push) pushState('theme', norm, 'light');
  };

  const applyFontSize = (size) => {
    const s = size && size !== 'normal' ? size : '';
    if (s) document.documentElement.dataset.fontSize = s;
    else delete document.documentElement.dataset.fontSize;
    setBtns('[data-font-size-value]', 'fontSizeValue', s || 'normal');
    const b = $id('active-font-size-badge');
    if (b) b.textContent = s || 'standard';
  };

  const applyContrast = (contrast) => {
    const c = contrast && contrast !== 'normal' ? contrast : '';
    if (c) document.documentElement.dataset.contrast = c;
    else delete document.documentElement.dataset.contrast;
    setBtns('[data-contrast-value]', 'contrastValue', c || 'normal');
    const b = $id('active-contrast-badge');
    if (b) b.textContent = c || 'standard';
  };

  const setupA11yModal = () => {
    const modal = $id('a11y-modal');
    if (!modal) return;
    const open = () => {
      document.body.style.overflow = 'hidden';
      if (typeof modal.showModal === 'function') {
        try { modal.showModal(); } catch (_) { modal.setAttribute('open', ''); }
      } else {
        modal.setAttribute('open', '');
      }
    };
    const close = () => {
      document.body.style.overflow = '';
      if (typeof modal.close === 'function') {
        try { modal.close(); } catch (_) { modal.removeAttribute('open'); }
      } else {
        modal.removeAttribute('open');
      }
    };

    $$('#a11y-trigger, #a11y-test-modal-trigger, [aria-controls="a11y-modal"]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); open(); });
    });

    $id('a11y-modal-close')?.addEventListener('click', (e) => { e.preventDefault(); close(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.addEventListener('close', () => { document.body.style.overflow = ''; });
    modal.addEventListener('cancel', () => { document.body.style.overflow = ''; });

    $$('[data-font-size-value]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); applyFontSize(b.dataset.fontSizeValue); });
    });

    $$('[data-contrast-value]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); applyContrast(b.dataset.contrastValue); });
    });

    $id('a11y-test-skip')?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('.linktree-list');
      if (target) {
        target.tabIndex = -1;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
        target.style.outline = '3px solid var(--color-focus-ring)';
        setTimeout(() => { target.style.outline = ''; }, 1500);
      }
    });

    $id('a11y-test-contrast-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.dataset.contrast || 'normal';
      const order = ['normal', 'black-on-white', 'white-on-black'];
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      applyContrast(order[nextIdx]);
    });
  };

  window.applySurface = applySurface;
  window.applyTheme = applyTheme;
  window.applyFontSize = applyFontSize;
  window.applyContrast = applyContrast;

  const init = () => {
    $id('page-loader')?.classList.add('is-hidden');
    $$('.surface-switcher__btn[data-switch-value], [data-theme-value]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (b.dataset.switchValue) applySurface(b.dataset.switchValue, true);
        if (b.dataset.themeValue) applyTheme(b.dataset.themeValue, true);
      });
    });
    setupA11yModal();
    const q = new URLSearchParams(location.search);
    if (document.querySelector('.surface-switcher') || q.has('surface') || q.has('switch')) applySurface(getS(), false);
    if (q.has('theme') || document.querySelector('[data-theme-value]')) applyTheme(getTheme(), false);
  };

  window.onpopstate = () => {
    applySurface(getS(), false);
    applyTheme(getTheme(), false);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
