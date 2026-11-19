(() => {
  const $$ = (s) => document.querySelectorAll(s);
  const M = { ig: 'instagram', wob: 'wolfsburg', gf: 'gifhorn', he: 'helmstedt' };
  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];
  const VALID_SURFACES = ['instagram', 'wolfsburg', 'gifhorn', 'helmstedt', 'default', 'all'];
  const VALID_SLUGS = ['ig', 'instagram', 'wob', 'wolfsburg', 'gf', 'gifhorn', 'he', 'helmstedt', 'default', 'all'];
  const VALID_ROUTES = ['', 'index.html', 'gf', 'gifhorn', 'wob', 'wolfsburg', 'he', 'helmstedt', 'ig', 'instagram', 'test', 'impressum', 'datenschutz', 'assets', 'css'];

  if (typeof location !== 'undefined') {
    const seg = location.pathname.toLowerCase().replace(/^\/|\/$/g, '').split('/')[0];
    const q = new URLSearchParams(location.search);
    const p = q.get('surface') || q.get('switch') || q.get('campus') || q.get('location');

    const isPreview =
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      q.has('_storyblok') ||
      q.has('_storyblok_tk') ||
      q.has('preview') ||
      q.has('_token') ||
      (window.self !== window.top && (document.referrer || '').includes('storyblok.com')) ||
      (document.querySelector('meta[name="storyblok-version"]')?.getAttribute('content') === 'draft');

    const isTestBlocked = Boolean(seg === 'test' && !isPreview);
    const isUnmatchedPath = Boolean(seg && !VALID_ROUTES.includes(seg));
    const isUnmatchedParam = Boolean(p && !VALID_SLUGS.includes(p.toLowerCase().replace(/^\/|\/$/g, '').trim()));
    const isUnmatchedFlag = Boolean(q.has('bs') || q.has('/bs'));

    if (isTestBlocked || isUnmatchedPath || isUnmatchedParam || isUnmatchedFlag) {
      if (typeof location.replace === 'function') location.replace('/');
      else location.href = '/';
      return;
    }
  }

  const getS = () => {
    const q = new URLSearchParams(location.search);
    const p = q.get('surface') || q.get('switch') || q.get('campus') || q.get('location');
    if (p) {
      const norm = p.toLowerCase().replace(/^\/|\/$/g, '').trim();
      return M[norm] || (VALID_SURFACES.includes(norm) ? norm : 'default');
    }
    for (const [k, v] of Object.entries(M)) {
      if (q.has(k) || q.has(v)) return v;
    }
    const seg = location.pathname.toLowerCase().replace(/^\/|\/$/g, '').split('/')[0];
    return M[seg] || (VALID_SURFACES.includes(seg) ? seg : (seg === 'test' ? 'default' : document.documentElement.dataset.surface || 'default'));
  };

  const getTheme = () => {
    const t = new URLSearchParams(location.search).get('theme');
    if (t && VALID_THEMES.includes(t.toLowerCase())) return t.toLowerCase();
    return document.documentElement.dataset.theme || 'light';
  };

  const applySurface = (s, push) => {
    if (s && s !== 'all') document.documentElement.dataset.surface = s;
    $$('[data-show-on],[data-hide-on],[data-display-in-default]').forEach((el) => {
      const show = (el.dataset.showOn || '').split(',').map((x) => x.trim()).filter(Boolean);
      const hide = (el.dataset.hideOn || '').split(',').map((x) => x.trim()).filter(Boolean);
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

    $$('.surface-switcher__btn[data-switch-value]').forEach((btn) => {
      const act = btn.dataset.switchValue === s;
      btn.setAttribute('aria-pressed', act ? 'true' : 'false');
      btn.classList.toggle('is-active', act);
    });

    const b = document.getElementById('active-switch-badge');
    if (b) b.textContent = s;

    if (push && history.pushState) {
      const u = new URL(location.href);
      if (s === 'default') u.searchParams.delete('surface');
      else u.searchParams.set('surface', s);
      history.pushState({ surface: s, theme: document.documentElement.dataset.theme }, '', u);
    }
  };

  const applyTheme = (theme, push) => {
    if (!theme) return;
    const norm = String(theme).toLowerCase();
    document.documentElement.dataset.theme = norm;

    $$('[data-theme-value]').forEach((btn) => {
      const act = btn.dataset.themeValue === norm;
      btn.setAttribute('aria-pressed', act ? 'true' : 'false');
      btn.classList.toggle('is-active', act);
    });

    const b = document.getElementById('active-theme-badge');
    if (b) b.textContent = norm;

    if (push && history.pushState) {
      const u = new URL(location.href);
      if (norm === 'light') u.searchParams.delete('theme');
      else u.searchParams.set('theme', norm);
      history.pushState({ surface: document.documentElement.dataset.surface, theme: norm }, '', u);
    }
  };

  window.applySurface = applySurface;
  window.applyTheme = applyTheme;

  const init = () => {
    $$('.surface-switcher__btn[data-switch-value]').forEach((btn) => {
      btn.onclick = (e) => { e.preventDefault(); applySurface(btn.dataset.switchValue, true); };
    });
    $$('[data-theme-value]').forEach((btn) => {
      btn.onclick = (e) => { e.preventDefault(); applyTheme(btn.dataset.themeValue, true); };
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
