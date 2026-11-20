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

  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];
  const VALID_SURFACES = ['instagram', 'wolfsburg', 'gifhorn', 'helmstedt', 'default', 'all'];

  const q = new URLSearchParams(location.search);
  const token = q.get('_token') || q.get('_storyblok_tk[token]') || '';
  const slug = q.get('_slug') || 'home';

  function resolveUrl(u) {
    if (!u) return '#';
    let url = '#';
    if (typeof u === 'string') url = u.trim();
    else if (typeof u === 'object') {
      if (u.linktype === 'email') {
        const mail = (u.url || u.cached_url || '').trim();
        url = mail ? (mail.startsWith('mailto:') ? mail : `mailto:${mail}`) : '#';
      } else if (u.linktype === 'story') {
        const s = (u.cached_url || u.url || '').replace(/^\/|\/$/g, '').trim();
        url = (!s || s === 'home') ? '/' : `/${s}/`;
      } else {
        url = (u.url || u.cached_url || '#').trim();
      }
    }
    const low = url.toLowerCase();
    if (low.startsWith('javascript:') || low.startsWith('data:') || low.startsWith('vbscript:')) {
      return '#';
    }
    return url;
  }

  function applyContent(content) {
    if (!content) return;

    // 1. Theme update (strictly validated against allowed CSS themes)
    if (content.theme !== undefined) {
      const t = typeof content.theme === 'object' && content.theme ? content.theme.value : content.theme;
      if (t) {
        const norm = String(t).toLowerCase().trim();
        if (VALID_THEMES.includes(norm)) {
          document.documentElement.dataset.theme = norm;
          if (typeof window.applyTheme === 'function') window.applyTheme(norm, false);
        }
      }
    }

    // 2. Surface update (strictly validated)
    if (content.surface !== undefined) {
      const s = typeof content.surface === 'object' && content.surface ? content.surface.value : content.surface;
      if (s) {
        const normS = String(s).toLowerCase().trim();
        if (VALID_SURFACES.includes(normS)) {
          if (typeof window.applySurface === 'function') window.applySurface(normS, false);
          else document.documentElement.dataset.surface = normS;
        }
      }
    }

    // 3. Page title
    if (content.title) document.title = content.title;

    // 4. Profile Header (Name, Bio, Avatar)
    if (content.profile && Array.isArray(content.profile) && content.profile[0]) {
      const prof = content.profile[0];
      const nameEl = document.querySelector('.profile-header__name-text');
      if (nameEl && prof.name) nameEl.textContent = prof.name;
      const bioEl = document.querySelector('.profile-header__bio');
      if (bioEl && prof.bio !== undefined) bioEl.textContent = prof.bio;
      const avatarEl = document.querySelector('.profile-header__avatar');
      if (avatarEl && prof.avatar) {
        const src = typeof prof.avatar === 'object' && prof.avatar ? prof.avatar.filename : prof.avatar;
        if (src) avatarEl.src = src;
      }
    }

    // 5. Body items (in-place live DOM patching)
    if (content.body && Array.isArray(content.body)) {
      const items = document.querySelectorAll('.linktree-item');
      content.body.forEach((blok, i) => {
        const li = items[i];
        if (!li) return;

        const labelEl = li.querySelector('.link-button__label, .image-card-horizontal__title, .image-card-vertical__title, .video-link-card__title, .section-heading__text');
        if (labelEl && (blok.label || blok.title)) {
          labelEl.textContent = blok.label || blok.title;
        }

        const linkEl = li.querySelector('a.link-button, a.image-card-horizontal, a.image-card-vertical, .dropdown-card__action-link');
        if (linkEl && blok.url) {
          linkEl.href = resolveUrl(blok.url);
        }

        const imgEl = li.querySelector('img');
        const src = blok.image?.filename || blok.image?.src;
        if (imgEl && src) {
          imgEl.src = src;
        }
      });
    }

    if (typeof window.applySurface === 'function') {
      window.applySurface(document.documentElement.dataset.surface || 'default', false);
    }
  }

  async function fetchDraft(s, t) {
    if (!t) return null;
    try {
      const res = await fetch(`https://api.storyblok.com/v2/cdn/stories/${encodeURIComponent(s)}?token=${encodeURIComponent(t)}&version=draft&cv=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        return data?.story?.content;
      }
    } catch (e) {
      console.warn('Could not fetch Storyblok draft preview:', e);
    }
    return null;
  }

  const bridge = document.createElement('script');
  bridge.src = 'https://app.storyblok.com/f/storyblok-v2-latest.js';
  bridge.async = true;
  bridge.onload = () => {
    if (!window.StoryblokBridge) return;
    const sb = new window.StoryblokBridge({ preventClicks: true, resolveLinks: 'url' });

    sb.on('published', () => window.location.reload());

    sb.on('input', (event) => {
      if (event?.story?.content) {
        applyContent(event.story.content);
      }
    });

    sb.on('change', async (event) => {
      if (event?.story?.content) {
        applyContent(event.story.content);
      } else if (token) {
        const draft = await fetchDraft(slug, token);
        if (draft) applyContent(draft);
      }
    });

    if (token) {
      fetchDraft(slug, token).then((draft) => {
        if (draft) applyContent(draft);
      });
    }
  };
  document.body.appendChild(bridge);
})();
