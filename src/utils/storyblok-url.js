/**
 * Storyblok URL resolver and normalizer.
 * Safely resolves Storyblok link objects (multilink / link) into proper URL strings.
 */

export function resolveStoryblokUrl(val) {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    if (val.linktype === 'email') {
      const email = (val.url || val.cached_url || '').trim();
      if (!email) return '';
      return email.startsWith('mailto:') ? email : `mailto:${email}`;
    }
    if (val.linktype === 'story') {
      const slug = (val.cached_url || val.url || '').trim().replace(/^\/|\/$/g, '');
      if (!slug || slug === 'home') return '/';
      return `/${slug}/`;
    }
    if (val.url && typeof val.url === 'string' && val.url.trim() !== '') {
      return val.url.trim();
    }
    if (val.cached_url && typeof val.cached_url === 'string' && val.cached_url.trim() !== '') {
      const u = val.cached_url.trim();
      if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/') || u.startsWith('#') || u.startsWith('mailto:')) {
        return u;
      }
      return `https://${u}`;
    }
  }
  return '';
}

export function normalizeStoryblokLinks(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeStoryblokLinks);

  const res = { ...obj };
  for (const [key, value] of Object.entries(res)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('linktype' in value || 'cached_url' in value || 'fieldtype' in value) {
        res[key] = resolveStoryblokUrl(value);
      } else {
        res[key] = normalizeStoryblokLinks(value);
      }
    } else if (Array.isArray(value)) {
      res[key] = value.map(normalizeStoryblokLinks);
    }
  }
  return res;
}
