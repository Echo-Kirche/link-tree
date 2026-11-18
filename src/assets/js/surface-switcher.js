(() => {
  const M = { ig: 'instagram', wob: 'wolfsburg', gf: 'gifhorn', he: 'helmstedt' };
  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];

  const getS = () => {
    const q = new URLSearchParams(location.search);
    const p = q.get('surface') || q.get('switch');
    if (p) return p.toLowerCase();
    const seg = location.pathname.toLowerCase().replace(/^\/|\/$/g, '').split('/')[0];
    return M[seg] || (seg === 'test' ? 'default' : seg) || document.documentElement.dataset.surface || 'default';
  };

  const getTheme = () => {
    const t = new URLSearchParams(location.search).get('theme');
    if (t && VALID_THEMES.includes(t.toLowerCase())) return t.toLowerCase();
    return document.documentElement.dataset.theme || 'light';
  };

  const applySurface = (s, push) => {
    if (s && s !== 'all') document.documentElement.dataset.surface = s;
    document.querySelectorAll('[data-show-on],[data-hide-on],[data-display-in-default]').forEach((el) => {
      const show = (el.dataset.showOn || '').split(',').map((x) => x.trim()).filter(Boolean);
      const hide = (el.dataset.hideOn || '').split(',').map((x) => x.trim()).filter(Boolean);
      const def = el.dataset.displayInDefault;
      let vis = true;
      if (s !== 'all') {
        if (s === 'default') {
          if (def !== undefined) { if (def !== 'true') vis = false; }
          else if (show.length && !show.includes('default')) vis = false;
        } else if (show.length && !show.includes(s)) vis = false;
        if (hide.length && hide.includes(s)) vis = false;
      }
      el.style.display = vis ? '' : 'none';
    });

    document.querySelectorAll('.surface-switcher__btn[data-switch-value]').forEach((btn) => {
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

    document.querySelectorAll('[data-theme-value]').forEach((btn) => {
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
    document.querySelectorAll('.surface-switcher__btn[data-switch-value]').forEach((btn) => {
      btn.onclick = (e) => { e.preventDefault(); applySurface(btn.dataset.switchValue, true); };
    });

    document.querySelectorAll('[data-theme-value]').forEach((btn) => {
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
