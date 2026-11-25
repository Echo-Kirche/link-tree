import fs from 'node:fs';
import path from 'node:path';
import footers from './footers.js';
import { normalizeStoryblokLinks } from '../utils/storyblok-url.js';

function mapImageCardItem(item, component, defaultWidth, defaultHeight, displayInDef) {
  const isStrImage = typeof item.image === 'string';
  return {
    _uid: item.id,
    component,
    label: item.label || '',
    url: item.url,
    display_in_default: displayInDef,
    image: isStrImage
      ? {
          filename: item.image,
          alt: item.label || '',
          width: defaultWidth,
          height: defaultHeight,
        }
      : {
          filename: item.image?.src || item.image?.filename || '',
          alt: item.image?.alt || item.label || '',
          width: item.image?.width || defaultWidth,
          height: item.image?.height || defaultHeight,
        },
    image_url: item.imageUrl || item.image_url || '',
    show_on: item.showOn || [],
    hide_on: item.hideOn || [],
  };
}

function youtubeVideoId(value = '') {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^[A-Za-z0-9_-]+$/.test(raw) && !raw.includes('/')) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (url.hostname.endsWith('youtube.com')) {
      if (url.searchParams.get('v')) return url.searchParams.get('v') || '';
      const parts = url.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const liveIndex = parts.indexOf('live');
      if (liveIndex >= 0 && parts[liveIndex + 1]) return parts[liveIndex + 1];
    }
  } catch { }
  return '';
}

/**
 * Storyblok data provider for Eleventy.
 * Fetches content from Storyblok Content Delivery API when STORYBLOK_TOKEN is provided.
 * Falls back to local site.json / operator.json when offline or token is unset.
 */
export default async function () {
  const token = process.env.STORYBLOK_TOKEN;
  const version = process.env.STORYBLOK_VERSION || 'published';
  const slug = process.env.STORYBLOK_SLUG || 'home';

  if (token) {
    try {
      // 1. Initial fetch attempt for the slug
      let url = `https://api.storyblok.com/v2/cdn/stories/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}&version=${encodeURIComponent(version)}`;
      let res = await fetch(url, { headers: { Accept: 'application/json' } });

      // 2. If 404 and version was published, retry with draft (story might be in draft mode)
      if (res.status === 404 && version === 'published') {
        url = `https://api.storyblok.com/v2/cdn/stories/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}&version=draft`;
        res = await fetch(url, { headers: { Accept: 'application/json' } });
      }

      // 3. If still 404, list stories in space to find startpage or default story
      if (res.status === 404) {
        const listUrl = `https://api.storyblok.com/v2/cdn/stories?token=${encodeURIComponent(token)}&version=draft&per_page=5`;
        const listRes = await fetch(listUrl, { headers: { Accept: 'application/json' } });
        if (listRes.ok) {
          const listJson = await listRes.json();
          if (listJson && Array.isArray(listJson.stories) && listJson.stories.length > 0) {
            const foundStory = listJson.stories.find((s) => s.is_startpage) || listJson.stories[0];
            return {
              source: 'storyblok-api',
              version: version,
              slug: slug,
              story: foundStory,
              content: normalizeStoryblokLinks(foundStory.content),
            };
          }
        }
      }

      if (res.ok) {
        const json = await res.json();
        if (json && json.story) {
          return {
            source: 'storyblok-api',
            version: version,
            slug: slug,
            story: json.story,
            content: normalizeStoryblokLinks(json.story.content),
          };
        }
      }
      console.warn(`Storyblok API returned status ${res.status}. Falling back to local data.`);
    } catch (err) {
      console.warn(`Failed to fetch from Storyblok API (${err.message}). Falling back to local data.`);

    }
  }

  // Local fallback: map site.json and operator.json into Storyblok schema
  const sitePath = path.resolve('src/_data/site.json');
  const operatorPath = path.resolve('src/_data/operator.json');

  const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
  const operator = JSON.parse(fs.readFileSync(operatorPath, 'utf8'));

  const bodyBloks = (site.links || []).map((item) => {
    const displayInDef = item.displayInDefault ?? item.display_in_default ?? true;
    if (item.type === 'link') {
      return {
        _uid: item.id,
        component: 'link_button',
        label: item.label,
        url: item.url,
        icon: item.icon || '',
        display_in_default: displayInDef,
        show_on: item.showOn || [],
        hide_on: item.hideOn || [],
      };
    }
    if (item.type === 'image-horizontal') {
      return mapImageCardItem(item, 'image_card_horizontal', 1200, 630, displayInDef);
    }
    if (item.type === 'image-vertical') {
      return mapImageCardItem(item, 'image_card_vertical', 900, 1200, displayInDef);
    }
    if (item.type === 'video-link') {
      const isStrImage = typeof item.image === 'string';
      return {
        _uid: item.id,
        component: 'video_link_card',
        label: item.label,
        url: item.provider === 'youtube' ? '' : item.url,
        provider: item.provider || 'youtube',
        youtube_video_id: item.provider === 'youtube' ? youtubeVideoId(item.youtube_video_id || item.url) : '',
        youtube_content_type: item.youtube_content_type || 'video',
        display_in_default: displayInDef,
        image: isStrImage
          ? {
              filename: item.image,
              alt: item.label || '',
              width: 1280,
              height: 720,
            }
          : {
              filename: item.image?.src || item.image?.filename || '',
              alt: item.image?.alt || '',
              width: item.image?.width || 1280,
              height: item.image?.height || 720,
            },
        show_on: item.showOn || [],
        hide_on: item.hideOn || [],
      };
    }
    if (item.type === 'dropdown-card') {
      const timesList = (item.columns || item.times || []).map((t, idx) => ({
        _uid: `${item.id}-item-${idx}`,
        component: 'dropdown_time_item',
        title: t.title,
        time: t.time,
        location: t.location || '',
        details: t.details || '',
        display_in_default: t.displayInDefault ?? t.display_in_default ?? true,
        has_kids: t.hasKids ?? t.has_kids ?? false,
        kids_label: (t.kidsLabel && t.kidsLabel !== 'Kinderkirche angeboten' && t.kidsLabel !== 'Echo Kids' && t.kidsLabel !== 'Echo Kids verfügbar')
          ? t.kidsLabel
          : (t.kids_label && t.kids_label !== 'Kinderkirche angeboten' && t.kids_label !== 'Echo Kids' && t.kids_label !== 'Echo Kids verfügbar')
            ? t.kids_label
            : (t.time && t.time.includes('10:00') ? 'Echo Kids Check-in: 9:30 Uhr' : (t.time && t.time.includes('12:00') ? 'Echo Kids Check-in: 11:30 Uhr' : (t.time && t.time.includes('11:00') ? 'Echo Kids Check-in: 10:30 Uhr' : 'Echo Kids Check-in'))),
        url: t.url || '',
        action_label: t.actionLabel || t.action_label || 'Standort & Infos →',
        show_on: t.showOn || t.show_on || [],
      }));

      return {
        _uid: item.id,
        component: 'dropdown_card',
        label: item.label,
        url: item.url || '',
        action_label: item.actionLabel || item.action_label || '',
        icon: item.icon || '',
        description: item.description || '',
        display_in_default: displayInDef,
        layout: item.layout || 'columns',
        locations: item.locations || ['gifhorn', 'wolfsburg', 'helmstedt'],
        times: timesList,
        columns: timesList,
        show_on: item.showOn || [],
        hide_on: item.hideOn || [],
      };
    }
    if (item.type === 'donation-card' || item.type === 'donation-dropdown' || item.type === 'donation_card') {
      return {
        _uid: item.id,
        component: 'donation_card',
        label: item.label,
        icon: item.icon || 'heart',
        description: item.description || '',
        display_in_default: displayInDef,
        paypal_label: item.paypalLabel || item.paypal_label || 'Mit PayPal spenden',
        paypal_url: item.paypalUrl || item.paypal_url || 'https://paypal.me/echokirche',
        iban_link_label: item.ibanLinkLabel || item.iban_link_label || 'Online-Banking öffnen',
        iban_link_url: item.ibanLinkUrl || item.iban_link_url || 'https://kirche-echo.de/spenden',
        button_1_label: item.button_1_label || item.button1Label || item.btn1_label || '',
        button_1_url: item.button_1_url || item.button1Url || item.btn1_url || '',
        button_1_icon: item.button_1_icon || item.button1Icon || item.btn1_icon || '',
        button_2_label: item.button_2_label || item.button2Label || item.btn2_label || '',
        button_2_url: item.button_2_url || item.button2Url || item.btn2_url || '',
        button_2_icon: item.button_2_icon || item.button2Icon || item.btn2_icon || '',
        card_title: item.card_title || item.cardTitle || item.details_title || item.detailsTitle || '',
        card_icon: item.card_icon || item.cardIcon || item.details_icon || '',
        copy_value: item.copy_value || item.copyValue || item.copy_text || item.copyText || '',
        details: item.details || item.custom_fields || [],
        buttons: item.buttons || item.actions || [],
        iban_title: item.ibanTitle || item.iban_title || 'Per Banküberweisung (IBAN)',
        account_name: item.accountName || item.account_name || 'Echo Kirche e.V.',
        iban: item.iban || '',
        bic: item.bic || '',
        bank_name: item.bankName || item.bank_name || '',
        reference: item.reference || '',
        copy_label: item.copyLabel || item.copy_label || 'IBAN kopieren',
        rows: item.rows || [],
        show_on: item.showOn || item.show_on || [],
        hide_on: item.hideOn || item.hide_on || [],
      };
    }
    if (item.type === 'accordion-buttons' || item.type === 'accordion-card' || item.type === 'accordion-dropdown' || item.type === 'accordion_buttons' || item.type === 'dropdown-accordion' || item.type === 'dropdown_accordion') {
      return {
        _uid: item.id,
        component: 'accordion_buttons',
        label: item.label,
        icon: item.icon || 'layer-group',
        description: item.description || '',
        display_in_default: displayInDef,
        rows: item.rows || [],
        buttons: item.buttons || [],
        show_on: item.showOn || item.show_on || [],
        hide_on: item.hideOn || item.hide_on || [],
      };
    }
    return {
      _uid: item.id,
      component: 'section_heading',
      title: item.title || item.label || '',
      display_in_default: displayInDef,
    };
  });

  const story = {
    name: site.profile?.name || 'Echo Kirche',
    content: {
      _uid: 'root-page',
      component: 'link_page',
      title: site.profile?.name || 'Echo Kirche',
      theme: process.env.LINKTREE_THEME || site.theme || 'light',
      surface: 'default',
      profile: [
        {
          _uid: 'profile-header',
          component: 'profile_header',
          name: site.profile?.name || 'Echo Kirche',
          bio: site.profile?.bio || '',
          avatar: site.profile?.avatar
            ? {
              filename: site.profile.avatar,
              alt: site.profile.name || 'Logo',
            }
            : null,
        },
      ],
      body: bodyBloks,
      footer: footers.map((f, idx) => ({
        _uid: `footer-legal-${f.id || idx}`,
        component: 'footer_legal',
        organization_name: f.organization_name,
        street: f.street,
        city: f.city,
        email: f.email,
        mailto: f.mailto,
        impressum_url: f.impressum_url,
        datenschutz_url: f.datenschutz_url,
        copyright_year: f.copyright_year,
        show_on: f.showOn,
        display_in_default: f.displayInDefault,
        socials: (f.socials || []).map((s, sIdx) => ({
          _uid: `social-${f.id || idx}-${sIdx}`,
          component: 'social_item',
          platform: s.platform,
          url: s.url,
          label: s.label || s.platform,
        })),
      })),
    },
  };

  return {
    source: 'local-fallback',
    version: version,
    slug: slug,
    story,
    content: story.content,
  };
}
