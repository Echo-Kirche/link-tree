/**
 * Storyblok Visual Editor bridge loader - 0 KB third-party requests in production.
 * Only loaded when explicitly in Storyblok editor preview (?_storyblok=...).
 */
(() => {
  const isSB =
    typeof window !== 'undefined' &&
    (location.search.includes('_storyblok') ||
      location.search.includes('_storyblok_tk') ||
      (window.self !== window.top && (document.referrer || '').includes('storyblok.com')));

  if (!isSB) return;

  const bridge = document.createElement('script');
  bridge.src = 'https://app.storyblok.com/f/storyblok-v2-latest.js';
  bridge.async = true;
  bridge.onload = () => {
    if (!window.StoryblokBridge) return;
    const sb = new window.StoryblokBridge({ preventClicks: true });

    sb.on(['published', 'change'], () => window.location.reload());

    sb.on('input', (event) => {
      const content = event?.story?.content;
      if (!content) return;

      if (content.theme !== undefined) {
        const t = typeof content.theme === 'object' && content.theme ? content.theme.value : content.theme;
        if (t) {
          const norm = String(t).toLowerCase();
          document.documentElement.dataset.theme = norm;
          if (typeof window.applyTheme === 'function') window.applyTheme(norm, false);
        }
      }

      if (content.surface !== undefined) {
        const s = typeof content.surface === 'object' && content.surface ? content.surface.value : content.surface;
        if (s) {
          const normS = String(s).toLowerCase();
          if (typeof window.applySurface === 'function') window.applySurface(normS, false);
          else document.documentElement.dataset.surface = normS;
        }
      }

      if (content.title) document.title = content.title;
    });
  };
  document.body.appendChild(bridge);
})();
