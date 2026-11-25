import { resolveStoryblokUrl } from './src/utils/storyblok-url.js';

// Surface route aliases mapping (e.g. gf -> gifhorn, wob -> wolfsburg)
export const SURFACE_ALIASES = { gf: 'gifhorn', wob: 'wolfsburg', he: 'helmstedt', ig: 'instagram' };
export const normalizeSurface = (s) => (s ? (SURFACE_ALIASES[s.toLowerCase().trim()] || s.toLowerCase().trim()) : 'default');

// Filter items by active surface (supporting both local camelCase and Storyblok snake_case)
export function filterBySurface(items, activeSurface) {
  if (!Array.isArray(items)) return [];
  if (activeSurface === 'all') return items;
  const surface = normalizeSurface(activeSurface);
  const toList = (v) => (Array.isArray(v) ? v : (typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [])).map(normalizeSurface);

  return items.filter(item => {
    const child = (item.buttons && item.buttons.length > 0) ? item.buttons[0] : null;

    let inDefault = item.displayInDefault ?? item.display_in_default;
    if (inDefault === undefined && child) {
      inDefault = child.displayInDefault ?? child.display_in_default;
    }

    let rawShowOn = item.showOn || item.show_on;
    if ((!rawShowOn || (Array.isArray(rawShowOn) && rawShowOn.length === 0)) && child) {
      rawShowOn = child.showOn || child.show_on;
    }
    const showOn = toList(rawShowOn);

    let rawHideOn = item.hideOn || item.hide_on;
    if ((!rawHideOn || (Array.isArray(rawHideOn) && rawHideOn.length === 0)) && child) {
      rawHideOn = child.hideOn || child.hide_on;
    }
    const hideOn = toList(rawHideOn);

    if (surface === 'default') {
      if (inDefault !== undefined) {
        if (inDefault !== true) return false;
      } else {
        if (showOn.length > 0 && !showOn.includes('default')) {
          return false;
        }
      }
    } else {
      if (showOn.length > 0 && !showOn.includes(surface)) {
        return false;
      }
    }
    if (hideOn.length > 0 && hideOn.includes(surface)) {
      return false;
    }
    return true;
  });
}

export default function (eleventyConfig) {
  // Passthrough copy static assets
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ '_headers': '_headers' });

  // Filter items by active surface (supporting both local camelCase and Storyblok snake_case)
  eleventyConfig.addFilter('filterBySurface', filterBySurface);

  // Resolve Storyblok URLs (handles both plain strings and Storyblok multilink/link objects)
  eleventyConfig.addFilter('resolveUrl', resolveStoryblokUrl);

  const VALID_THEMES = ['light', 'white', 'pale', 'warm', 'soft', 'dark', 'teal', 'lavender'];
  const VALID_SURFACES = ['default', 'gifhorn', 'wolfsburg', 'helmstedt', 'instagram', 'all'];

  // Sanitize CSS theme identifiers to prevent CSS/attribute injection
  eleventyConfig.addFilter('sanitizeTheme', (val) => {
    if (!val || typeof val !== 'string') return 'light';
    const norm = val.toLowerCase().trim();
    return VALID_THEMES.includes(norm) ? norm : 'light';
  });

  // Sanitize surface identifiers to prevent attribute injection
  eleventyConfig.addFilter('sanitizeSurface', (val) => {
    if (!val || typeof val !== 'string') return 'default';
    const norm = val.toLowerCase().trim();
    return VALID_SURFACES.includes(norm) ? norm : 'default';
  });

  // Storyblok visual editor editable attribute
  eleventyConfig.addFilter('storyblokEditable', (blok) => {
    if (!blok || !blok._editable) return '';
    try {
      const clean = blok._editable
        .replace(/^<!--#storyblok#?\s*/, '')
        .replace(/-->$/, '')
        .trim();
      const options = JSON.parse(clean);
      if (!options || typeof options !== 'object') return '';
      const cStr = JSON.stringify(options)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const id = String(options.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const uid = String(options.uid || '').replace(/[^a-zA-Z0-9_-]/g, '');
      return `data-blok-c="${cStr}" data-blok-uid="${id}-${uid}"`;
    } catch (e) {
      return '';
    }
  });

  // Convert Storyblok snake_case component names to Nunjucks Component names
  eleventyConfig.addFilter('blokToComponent', (componentName) => {
    const mapping = {
      profile_header: 'ProfileHeader.njk',
      link_button: 'LinkButton.njk',
      image_card_horizontal: 'ImageCardHorizontal.njk',
      image_card_vertical: 'ImageCardVertical.njk',
      video_link_card: 'VideoLinkCard.njk',
      section_heading: 'SectionHeading.njk',
      footer_legal: 'FooterLegal.njk',
      group_block: 'GroupBlock.njk',
      content_block: 'GroupBlock.njk',
      card_block: 'GroupBlock.njk',
      dropdown_card: 'DropdownCard.njk',
      donation_card: 'DonationCard.njk',
      donation_dropdown: 'DonationCard.njk',
      accordion_buttons: 'AccordionButtons.njk',
      accordion_card: 'AccordionButtons.njk',
      accordion_dropdown: 'AccordionButtons.njk',
      dropdown_accordion: 'AccordionButtons.njk',
      'dropdown-accordion': 'AccordionButtons.njk',
      'accordion-buttons': 'AccordionButtons.njk',
    };
    return mapping[componentName] || `${componentName}.njk`;
  });

  // Extract YouTube video ID from URL
  eleventyConfig.addFilter('youtubeId', (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  });

  // Production HTML minification transform (zero runtime bloat, pre-rendered static compression)
  eleventyConfig.addTransform('htmlmin', function (content) {
    const path = this.page?.outputPath || '';
    if (path.endsWith('.html')) {
      return content
        .replace(/<!--(?!\s*(?:#(?:storyblok|\[if)|Created with|Version:))[\s\S]*?-->/g, '')
        .replace(/>\s+<(?!\/pre|\/code|\/textarea)/g, '><')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    }
    return content;
  });

  return {
    dir: {
      input: 'src/content',
      includes: '../_includes',
      data: '../_data',
      output: '_site',
    },
    templateFormats: ['njk', 'html', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
