(() => {
  const $$ = (s) => document.querySelectorAll(s);
  const M = { ig: 'instagram', wob: 'wolfsburg', gf: 'gifhorn', he: 'helmstedt' };
  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];
  const VALID_SURFACES = ['instagram', 'wolfsburg', 'gifhorn', 'helmstedt', 'default', 'all'];
  const VALID_SLUGS = ['ig', 'instagram', 'wob', 'wolfsburg', 'gf', 'gifhorn', 'he', 'helmstedt', 'default', 'all'];
  const VALID_ROUTES = ['', 'index.html', 'home', 'gf', 'gifhorn', 'wob', 'wolfsburg', 'he', 'helmstedt', 'ig', 'instagram', 'test', 'impressum', 'datenschutz', 'assets', 'css'];

  const getP = (q) => q.get('surface') || q.get('switch') || q.get('campus') || q.get('location');

  const hideLoader = () => {
    const l = document.getElementById('page-loader');
    if (l) l.classList.add('is-hidden');
  };

  if (typeof location !== 'undefined') {
    const seg = location.pathname.toLowerCase().replace(/^\/|\/$/g, '').split('/')[0];
    const q = new URLSearchParams(location.search);
    const p = getP(q);

    const isPreview =
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      ['_storyblok', '_storyblok_tk', 'preview', '_token', '_storyblok_c'].some((k) => q.has(k) || location.search.includes(k)) ||
      (window.self !== window.top && (document.referrer || '').includes('storyblok.com')) ||
      (document.querySelector('meta[name="storyblok-version"]')?.getAttribute('content') === 'draft');

    const is404 = seg === '404' || seg === '404.html' || Boolean(document.querySelector('meta[http-equiv="refresh"]'));
    const isTestBlocked = Boolean(seg === 'test' && !isPreview);
    const isUnmatchedPath = Boolean(seg && !VALID_ROUTES.includes(seg));
    const isUnmatchedParam = Boolean(p && !VALID_SLUGS.includes(p.toLowerCase().replace(/^\/|\/$/g, '').trim()));
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
      const norm = p.toLowerCase().replace(/^\/|\/$/g, '').trim();
      return M[norm] || (VALID_SURFACES.includes(norm) ? norm : 'default');
    }
    for (const [k, v] of Object.entries(M)) {
      if (q.has(k) || q.has(v)) return v;
    }
    const seg = location.pathname.toLowerCase().replace(/^\/|\/$/g, '').split('/')[0];
    return M[seg] || (VALID_SURFACES.includes(seg) ? seg : (seg === 'test' || seg === 'home' ? 'default' : document.documentElement.dataset.surface || 'default'));
  };

  const getTheme = () => {
    const t = new URLSearchParams(location.search).get('theme');
    if (t && VALID_THEMES.includes(t.toLowerCase())) return t.toLowerCase();
    return document.documentElement.dataset.theme || 'light';
  };

  const setBtns = (sel, key, val) => {
    $$(sel).forEach((b) => {
      const act = b.dataset[key] === val;
      b.setAttribute('aria-pressed', act ? 'true' : 'false');
      b.classList.toggle('is-active', act);
    });
  };

  const pushState = (key, val, defVal) => {
    if (history.pushState) {
      const u = new URL(location.href);
      if (val === defVal) u.searchParams.delete(key);
      else u.searchParams.set(key, val);
      history.pushState({ surface: document.documentElement.dataset.surface, theme: document.documentElement.dataset.theme }, '', u);
    }
  };

  const applySurface = (s, push) => {
    if (s && s !== 'all') document.documentElement.dataset.surface = s;
    $$('[data-show-on],[data-hide-on],[data-display-in-default]').forEach((el) => {
      const show = el.dataset.showOn ? el.dataset.showOn.split(',').map((x) => x.trim()) : [];
      const hide = el.dataset.hideOn ? el.dataset.hideOn.split(',').map((x) => x.trim()) : [];
      const def = el.dataset.displayInDefault;
      let vis = true;
      if (s !== 'all') {
        if (s === 'default') {
          if (def !== undefined) vis = (def === 'true');
          else if (show.length) vis = show.includes('default');
        } else if (show.length && !show.includes(s)) vis = false;
        if (hide.includes(s)) vis = false;
      }
      el.style.display = vis ? '' : 'none';
    });

    setBtns('.surface-switcher__btn[data-switch-value]', 'switchValue', s);
    const b = document.getElementById('active-switch-badge');
    if (b) b.textContent = s;
    if (push) pushState('surface', s, 'default');
  };

  const applyTheme = (theme, push) => {
    if (!theme) return;
    const norm = String(theme).toLowerCase();
    document.documentElement.dataset.theme = norm;

    setBtns('[data-theme-value]', 'themeValue', norm);
    const b = document.getElementById('active-theme-badge');
    if (b) b.textContent = norm;
    if (push) pushState('theme', norm, 'light');
  };

  window.applySurface = applySurface;
  window.applyTheme = applyTheme;

  const init = () => {
    hideLoader();
    $$(['.surface-switcher__btn[data-switch-value]', '[data-theme-value]'].join(',')).forEach((b) => {
      b.onclick = (e) => {
        e.preventDefault();
        if (b.dataset.switchValue) applySurface(b.dataset.switchValue, true);
        if (b.dataset.themeValue) applyTheme(b.dataset.themeValue, true);
      };
    });
    if (document.querySelector('.surface-switcher') || new URLSearchParams(location.search).has('surface') || new URLSearchParams(location.search).has('switch')) {
      applySurface(getS(), false);
    }
    if (new URLSearchParams(location.search).has('theme') || document.querySelector('[data-theme-value]')) {
      applyTheme(getTheme(), false);
    }
  };

  window.onpopstate = () => {
    applySurface(getS(), false);
    applyTheme(getTheme(), false);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
