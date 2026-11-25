/**
 * Storyblok URL resolver and normalizer.
 * Safely resolves Storyblok link objects (multilink / link) into proper URL strings.
 * Enforces strict protocol security to prevent javascript: or data: injection.
 */

export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return true;
}

export function resolveStoryblokUrl(val) {
  if (!val) return '#';
  let url = '';
  if (typeof val === 'string') {
    url = val.trim();
  } else if (typeof val === 'object') {
    if (val.linktype === 'email') {
      const email = (val.url || val.cached_url || '').trim();
      if (email) url = email.startsWith('mailto:') ? email : `mailto:${email}`;
    } else if (val.linktype === 'story') {
      const slug = (val.cached_url || val.url || '').trim().replace(/^\/|\/$/g, '');
      url = (!slug || slug === 'home') ? '/' : `/${slug}/`;
    } else if (val.url && typeof val.url === 'string' && val.url.trim() !== '') {
      url = val.url.trim();
    } else if (val.cached_url && typeof val.cached_url === 'string' && val.cached_url.trim() !== '') {
      const u = val.cached_url.trim();
      if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/') || u.startsWith('#') || u.startsWith('mailto:')) {
        url = u;
      } else {
        url = `https://${u}`;
      }
    }
  }
  if (!url || !isSafeUrl(url)) return '#';
  return url;
}

export function resolveStoryblokImage(item) {
  if (!item || typeof item !== 'object') return '';

  const pickSafe = (raw) => {
    if (!raw) return '';
    let candidate = '';
    if (typeof raw === 'string') {
      candidate = raw.trim();
    } else if (typeof raw === 'object') {
      candidate = String(raw.filename || raw.src || raw.url || raw.cached_url || '').trim();
    }
    if (!candidate || !isSafeUrl(candidate)) return '';
    return candidate;
  };

  return pickSafe(item.image) || pickSafe(item.image_url ?? item.imageUrl);
}

export function normalizeStoryblokLinks(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeStoryblokLinks);

  const res = { ...obj };
  for (const [key, value] of Object.entries(res)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.fieldtype === 'asset') {
        res[key] = {
          ...value,
          filename: typeof value.filename === 'string' && isSafeUrl(value.filename) ? value.filename.trim() : '',
        };
      } else if ('linktype' in value || 'cached_url' in value || value.fieldtype === 'multilink') {
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
