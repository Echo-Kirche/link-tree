import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { resolveStoryblokUrl, normalizeStoryblokLinks } from '../src/utils/storyblok-url.js';

const siteDir = path.resolve('_site');

describe('Component Markup & Accessibility Contracts', () => {
  const indexHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  const testHtml = fs.readFileSync(path.join(siteDir, 'test', 'index.html'), 'utf8');

  test('ProfileHeader component renders avatar and name', () => {
    assert.match(indexHtml, /class="profile-header"/, 'ProfileHeader container must exist');
    assert.match(indexHtml, /class="profile-header__name"/, 'ProfileHeader name must exist');
    assert.match(indexHtml, /Echo Kirche/, 'ProfileHeader must contain name text');
    assert.match(indexHtml, /class="profile-header__avatar"/, 'ProfileHeader avatar must exist');
  });

  test('LinkButton component renders accessible link with states and icon', () => {
    assert.match(indexHtml, /class="link-button/, 'LinkButton must have link-button class');
    assert.match(indexHtml, /href="https?:\/\//, 'LinkButton must have valid href');
    assert.match(indexHtml, /rel="noopener noreferrer"/, 'External links must have safe rel');
    assert.match(indexHtml, /class="link-button__icon"/, 'LinkButton icon wrapper must exist');
    assert.match(indexHtml, /class="link-button__label"/, 'LinkButton label wrapper must exist');
  });

  test('A11yButton component renders accessible markup, states, and icon', () => {
    assert.match(indexHtml, /<a href="#content"[^>]*class="a11y-button a11y-button--skip"/, 'Skip link must exist on default page targeting #content');
    assert.match(indexHtml, /class="a11y-button a11y-button--floating"/, 'Floating a11y button must exist on default page');
    assert.match(indexHtml, /class="a11y-button__icon"[^>]*aria-hidden="true"/, 'A11y button icon must be aria-hidden');
    assert.match(indexHtml, /class="a11y-button__label"/, 'A11y button label wrapper must exist');
    assert.match(indexHtml, /Zum Hauptinhalt springen/, 'Skip link must have accessible label');
    assert.match(testHtml, /class="surface-switcher a11y-test-section"/, 'Test page must render a11y test section');
    assert.match(testHtml, /class="a11y-button a11y-button--secondary"/, 'Test page must render secondary a11y button variant');
    assert.match(testHtml, /class="a11y-button a11y-button--surface"/, 'Test page must render surface a11y button variant');
  });

  test('A11yModal component renders accessible dialog, font size controls, and contrast options', () => {
    assert.match(indexHtml, /<dialog class="a11y-modal" id="a11y-modal"/, 'A11yModal dialog must exist in DOM');
    assert.match(indexHtml, /aria-labelledby="a11y-modal-title"/, 'A11yModal must be labeled by its title');
    assert.match(indexHtml, /class="a11y-modal__close"/, 'A11yModal close button must exist');
    assert.match(indexHtml, /data-font-size-value="normal"/, 'Font size normal option must exist');
    assert.match(indexHtml, /data-font-size-value="large"/, 'Font size large option must exist');
    assert.match(indexHtml, /data-font-size-value="xlarge"/, 'Font size xlarge option must exist');
    assert.match(indexHtml, /data-contrast-value="black-on-white"/, 'High contrast black-on-white option must exist');
    assert.match(indexHtml, /data-contrast-value="white-on-black"/, 'High contrast white-on-black option must exist');
  });

  test('DropdownCard component renders accessible details/summary pattern', () => {
    assert.match(indexHtml, /<details class="dropdown-card"/, 'DropdownCard must use semantic <details>');
    assert.match(indexHtml, /<summary class="dropdown-card__summary link-button/, 'Summary must be styled as link-button');
    assert.match(indexHtml, /class="dropdown-card__chevron"/, 'DropdownCard must have chevron indicator');
    assert.match(indexHtml, /class="dropdown-card__content"/, 'DropdownCard drawer content must exist');
    assert.match(indexHtml, /class="dropdown-card__columns"/, 'DropdownCard column layout container must exist');
    assert.match(indexHtml, /class="dropdown-card__column"/, 'DropdownCard column items must exist');
    assert.match(indexHtml, /class="dropdown-card__column-badge"/, 'DropdownCard column badges must exist');
    assert.match(indexHtml, /class="dropdown-card__kids-badge"/, 'DropdownCard kids badge must exist');
    assert.doesNotMatch(indexHtml, /echo-kids\.png/, 'Echo Kids logo must be removed');
    assert.doesNotMatch(indexHtml, /Kinderkirche angeboten/, 'Kinderkirche angeboten label must be removed');
    assert.match(indexHtml, /Echo Kids Check-in:\s*9:30\s*Uhr/, 'DropdownCard must show Echo Kids check-in for 10:00 service');
    assert.match(indexHtml, /Echo Kids Check-in:\s*11:30\s*Uhr/, 'DropdownCard must show Echo Kids check-in for 12:00 service');
    assert.match(indexHtml, /Echo Kids Check-in:\s*10:30\s*Uhr/, 'DropdownCard must show Echo Kids check-in for 11:00 service');
    assert.match(indexHtml, /BSK-Saal, Schützenplatz 3/, 'DropdownCard must show BSK-Saal venue');
    assert.match(indexHtml, /class="dropdown-card__action-link"/, 'DropdownCard action link must exist');
    assert.match(indexHtml, /Gifhorn \(10:00\)/, 'DropdownCard must include Gifhorn 10:00 card');
    assert.match(indexHtml, /Gifhorn \(12:00\)/, 'DropdownCard must include Gifhorn 12:00 card');
    assert.match(indexHtml, /Wolfsburg/, 'DropdownCard default must include Wolfsburg');
    assert.match(indexHtml, /Helmstedt/, 'DropdownCard default must include Helmstedt');
  });

  test('DonationCard component renders accessible drawer with PayPal and IBAN copy', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || ''));
    env.addFilter('storyblokEditable', () => '');

    const donationItem = {
      id: 'donate-dropdown',
      type: 'donation-card',
      label: 'Spenden & Geben (PayPal & IBAN)',
      icon: 'heart',
      description: 'Deine Spende unterstützt die gemeinnützige Arbeit und Vision von Echo Kirche in Gifhorn, Wolfsburg und Helmstedt.',
      paypalLabel: 'Mit PayPal spenden',
      paypalUrl: 'https://paypal.me/echokirche',
      ibanLinkLabel: 'Online-Banking öffnen',
      ibanLinkUrl: 'https://kirche-echo.de/spenden',
      ibanTitle: 'Per Banküberweisung (IBAN)',
      accountName: 'Echo Kirche e.V.',
      iban: 'DE12 3456 7890 1234 5678 90',
      bic: 'PBNKDEFF',
      bankName: 'Postbank',
      reference: 'Spende Echo Kirche',
      copyLabel: 'IBAN kopieren'
    };

    const rendered = env.render('components/DonationCard.njk', { item: donationItem });
    assert.match(rendered, /<details class="donation-card"/, 'DonationCard must use semantic <details>');
    assert.match(rendered, /class="donation-card__summary link-button/, 'DonationCard summary must be styled as link-button');
    assert.match(rendered, /class="donation-card__chevron"/, 'DonationCard must have chevron indicator');
    assert.match(rendered, /class="donation-card__btn donation-card__btn--paypal"/, 'DonationCard must render PayPal action button');
    assert.match(rendered, /class="donation-card__btn donation-card__btn--iban"/, 'DonationCard must render Pay with IBAN button');
    assert.match(rendered, /class="donation-card__bank-details"/, 'DonationCard must render bank details definition list');
    assert.match(rendered, /class="donation-card__iban-code"/, 'DonationCard must render formatted IBAN code');
    assert.match(rendered, /data-copy-iban="DE12 3456 7890 1234 5678 90"/, 'DonationCard must render copy button with data-copy-iban attribute');
    assert.match(rendered, /class="donation-card__live-region sr-only"/, 'DonationCard must render live region for screen readers');
  });

  test('DonationCard Nunjucks template supports graceful nullability, custom labels, and safe URLs', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || ''));
    env.addFilter('storyblokEditable', () => '');

    // 1. Minimal donation card with only required fields
    const htmlMinimal = env.render('components/DonationCard.njk', {
      item: {
        id: 'donate-min',
        type: 'donation-card',
        label: 'Spenden Minimal'
      }
    });
    assert.match(htmlMinimal, /<details class="donation-card"/);
    assert.match(htmlMinimal, /Spenden Minimal/);
    assert.doesNotMatch(htmlMinimal, /class="donation-card__description"/);
    assert.doesNotMatch(htmlMinimal, /class="donation-card__actions"/);
    assert.doesNotMatch(htmlMinimal, /class="donation-card__bank-card"/);

    // 2. Card with PayPal only
    const htmlPaypalOnly = env.render('components/DonationCard.njk', {
      item: {
        id: 'donate-paypal',
        type: 'donation-card',
        label: 'Spenden PayPal',
        paypalUrl: 'https://paypal.me/test',
        paypalLabel: 'Direkt per PayPal'
      }
    });
    assert.match(htmlPaypalOnly, /class="donation-card__btn donation-card__btn--paypal"/);
    assert.match(htmlPaypalOnly, /href="https:\/\/paypal\.me\/test"/);
    assert.match(htmlPaypalOnly, /Direkt per PayPal/);
    assert.doesNotMatch(htmlPaypalOnly, /class="donation-card__btn--iban"/);

    // 3. Card with IBAN details and copy button
    const htmlIbanOnly = env.render('components/DonationCard.njk', {
      item: {
        id: 'donate-iban',
        type: 'donation-card',
        label: 'Spenden IBAN',
        ibanTitle: 'Banküberweisung',
        accountName: 'Gemeinde Spendenkonto',
        iban: 'DE99 1234 5678 0000 00',
        bic: 'GENODED1',
        bankName: 'Volksbank',
        reference: 'Zweck: Jugend',
        copyLabel: 'Nummer kopieren'
      }
    });
    assert.match(htmlIbanOnly, /Banküberweisung/);
    assert.match(htmlIbanOnly, /Gemeinde Spendenkonto/);
    assert.match(htmlIbanOnly, /DE99 1234 5678 0000 00/);
    assert.match(htmlIbanOnly, /GENODED1/);
    assert.match(htmlIbanOnly, /Volksbank/);
    assert.match(htmlIbanOnly, /Zweck: Jugend/);
    assert.match(htmlIbanOnly, /data-copy-iban="DE99 1234 5678 0000 00"/);
    assert.match(htmlIbanOnly, /Nummer kopieren/);
  });

  test('DonationCard supports generic data: 1 whole button or 2 buttons, custom card details, and copy-to-clipboard button', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || ''));
    env.addFilter('storyblokEditable', () => '');

    // 1. Single whole full-width button in Row 1
    const htmlSingleBtn = env.render('components/DonationCard.njk', {
      item: {
        id: 'single-action-card',
        type: 'donation-card',
        label: 'Anmeldung & Tickets',
        icon: 'ticket',
        description: 'Sichere dir jetzt deinen Platz für die Konferenz.',
        button_1_label: 'Jetzt online anmelden',
        button_1_url: 'https://kirche-echo.de/anmeldung',
        button_1_icon: 'ticket',
        button_1_variant: 'primary'
      }
    });
    assert.match(htmlSingleBtn, /class="donation-card__summary link-button/);
    assert.match(htmlSingleBtn, /Anmeldung (&amp;|&) Tickets/);
    assert.match(htmlSingleBtn, /class="donation-card__actions"/);
    assert.match(htmlSingleBtn, /class="donation-card__btn donation-card__btn--primary"/);
    assert.match(htmlSingleBtn, /Jetzt online anmelden/);
    assert.match(htmlSingleBtn, /href="https:\/\/kirche-echo\.de\/anmeldung"/);
    assert.doesNotMatch(htmlSingleBtn, /donation-card__btn--secondary/);
    assert.doesNotMatch(htmlSingleBtn, /donation-card__btn--iban/);

    // 2. Two buttons in Row 1 (e.g. Download & Stream)
    const htmlTwoBtns = env.render('components/DonationCard.njk', {
      item: {
        id: 'two-actions-card',
        type: 'donation-card',
        label: 'Ressourcen & Predigtnotizen',
        icon: 'book',
        button_1_label: 'PDF Notizen herunterladen',
        button_1_url: 'https://kirche-echo.de/notizen.pdf',
        button_1_icon: 'file-arrow-down',
        button_1_variant: 'primary',
        button_2_label: 'Predigt ansehen',
        button_2_url: 'https://kirche-echo.de/video',
        button_2_icon: 'video',
        button_2_variant: 'secondary'
      }
    });
    assert.match(htmlTwoBtns, /class="donation-card__btn donation-card__btn--primary"/);
    assert.match(htmlTwoBtns, /PDF Notizen herunterladen/);
    assert.match(htmlTwoBtns, /class="donation-card__btn donation-card__btn--secondary"/);
    assert.match(htmlTwoBtns, /Predigt ansehen/);

    // 3. Row 2 with generic card title, custom detail rows, and generic copy button
    const htmlGenericDetailsAndCopy = env.render('components/DonationCard.njk', {
      item: {
        id: 'wifi-card',
        type: 'donation-card',
        label: 'WLAN & Infos vor Ort',
        icon: 'wifi',
        card_title: 'Kostenloses Gäste-WLAN',
        card_icon: 'wifi',
        details: [
          { label: 'Netzwerk (SSID)', value: 'Echo-Guest' },
          { label: 'Verschlüsselung', value: 'WPA3 / WPA2' },
          { label: 'WLAN-Passwort', value: 'EchoKirche2026', isCode: true }
        ],
        copy_value: 'EchoKirche2026',
        copy_label: 'WLAN-Passwort kopieren'
      }
    });
    assert.match(htmlGenericDetailsAndCopy, /class="donation-card__bank-card"/);
    assert.match(htmlGenericDetailsAndCopy, /Kostenloses Gäste-WLAN/);
    assert.match(htmlGenericDetailsAndCopy, /Netzwerk \(SSID\)/);
    assert.match(htmlGenericDetailsAndCopy, /Echo-Guest/);
    assert.match(htmlGenericDetailsAndCopy, /class="donation-card__code-value"/);
    assert.match(htmlGenericDetailsAndCopy, /EchoKirche2026/);
    assert.match(htmlGenericDetailsAndCopy, /data-copy-text="EchoKirche2026"/);
    assert.match(htmlGenericDetailsAndCopy, /WLAN-Passwort kopieren/);

    // 4. Standalone copy button in Row 2 (no key-value details)
    const htmlStandaloneCopy = env.render('components/DonationCard.njk', {
      item: {
        id: 'promo-card',
        type: 'donation-card',
        label: 'Rabattcode für Konferenz',
        card_title: 'Dein Aktionscode',
        copy_value: 'ECHO-SUMMER-2026',
        copy_label: 'Code kopieren'
      }
    });
    assert.match(htmlStandaloneCopy, /Dein Aktionscode/);
    assert.match(htmlStandaloneCopy, /data-copy-text="ECHO-SUMMER-2026"/);
    assert.match(htmlStandaloneCopy, /Code kopieren/);
  });

  test('AccordionButtons component renders accessible drawer with multi-row layout and expanded fields', async () => {
    // 1. Verify indexHtml rendered default demo
    assert.match(indexHtml, /data-uid="dropdown-accordion"/, 'Dropdown accordion demo must be rendered in indexHtml');
    assert.match(indexHtml, /<details class="accordion-buttons"/, 'AccordionButtons must use semantic <details>');
    assert.match(indexHtml, /class="accordion-buttons__summary link-button/, 'AccordionButtons summary must be styled as link-button');
    assert.match(indexHtml, /class="accordion-buttons__chevron"/, 'AccordionButtons must have chevron indicator');
    assert.match(indexHtml, /class="accordion-buttons__row accordion-buttons__row--full"/, 'AccordionButtons must render full button row');
    assert.match(indexHtml, /class="accordion-buttons__row accordion-buttons__row--half"/, 'AccordionButtons must render half button row');
    assert.match(indexHtml, /class="accordion-buttons__row accordion-buttons__row--expanded"/, 'AccordionButtons must render expanded row');
    assert.match(indexHtml, /class="donation-card__copy-btn accordion-buttons__copy-btn"/, 'AccordionButtons must use donation-card copy button style');
    assert.match(indexHtml, /class="donation-card__copy-icon donation-card__copy-icon--copy"/, 'AccordionButtons must render copy icon');
    assert.match(indexHtml, /class="donation-card__copy-icon donation-card__copy-icon--check"/, 'AccordionButtons must render check icon');
    assert.match(indexHtml, /data-copy-iban="DE12 3456 7890 1234 5678 90"/, 'AccordionButtons must render copy IBAN button');
    assert.match(indexHtml, /data-copy-text="ECHO-XMAS-2026"/, 'AccordionButtons must render copy event code button');

    // 2. Unit test: Multi-row with max 5 fields enforcement
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || ''));

    const htmlMultiRow = env.render('components/AccordionButtons.njk', {
      item: {
        id: 'test-accordion',
        label: 'Flexible Aktionen',
        icon: 'layer-group',
        description: 'Beliebige Anzahl an Zeilen und Buttons',
        rows: [
          {
            layout: 'full',
            button: { label: 'Einzelticket buchen', url: 'https://example.com/tickets', icon: 'ticket' }
          },
          {
            layout: 'half',
            buttons: [
              { label: 'Halb-Button 1', url: 'https://example.com/1', icon: 'star' },
              { label: 'Halb-Button 2', url: 'https://example.com/2', icon: 'heart' }
            ]
          },
          {
            layout: 'expanded',
            title: 'Event-Details & Einlass',
            icon: 'calendar',
            copyValue: 'VIP-GIFT-2026',
            copyLabel: 'Gutschein kopieren',
            fields: [
              { label: 'Feld 1', value: 'Wert 1' },
              { label: 'Feld 2', value: 'Wert 2' },
              { label: 'Feld 3', value: 'Wert 3' },
              { label: 'Feld 4', value: 'Wert 4' },
              { label: 'Feld 5', value: 'Wert 5', isCode: true },
              { label: 'Feld 6 (Ignored)', value: 'Über Limit' },
              { label: 'Feld 7 (Ignored)', value: 'Über Limit' }
            ]
          }
        ]
      }
    });

    assert.match(htmlMultiRow, /Einzelticket buchen/);
    assert.match(htmlMultiRow, /Halb-Button 1/);
    assert.match(htmlMultiRow, /Halb-Button 2/);
    assert.match(htmlMultiRow, /Event-Details &amp; Einlass/);
    assert.match(htmlMultiRow, /Feld 1:/);
    assert.match(htmlMultiRow, /Feld 5:/);
    assert.match(htmlMultiRow, /<code class="accordion-buttons__code-value">Wert 5<\/code>/);
    // Enforce max 5 fields: Feld 6 and 7 must NOT be in the output
    assert.doesNotMatch(htmlMultiRow, /Feld 6/);
    assert.doesNotMatch(htmlMultiRow, /Feld 7/);
    assert.match(htmlMultiRow, /data-copy-text="VIP-GIFT-2026"/);
    assert.match(htmlMultiRow, /Gutschein kopieren/);
  });

  test('ImageCardHorizontal & ImageCardVertical render media cards with aspect ratios and arrows', () => {
    assert.match(indexHtml, /class="image-card image-card--horizontal"/, 'ImageCardHorizontal must exist');
    assert.match(indexHtml, /class="image-card__media"/, 'Image media wrapper must exist');
    assert.match(indexHtml, /class="image-card__title"/, 'Image title must exist');
    assert.match(indexHtml, /class="image-card__arrow"/, 'Interactive arrow badge must exist');
    assert.match(indexHtml, /loading="lazy"/, 'Images must use native lazy loading');
  });

  test('ImageCardHorizontal & ImageCardVertical support direct link as image and optional label', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || ''));

    // 1. Direct string link as image with label
    const htmlWithLinkAndLabel = env.render('components/ImageCardHorizontal.njk', {
      item: {
        url: 'https://example.com/event',
        label: 'Event Banner',
        image: '/assets/images/es26-hero-1-1536x864.webp'
      }
    });
    assert.match(htmlWithLinkAndLabel, /class="image-card image-card--horizontal"/);
    assert.match(htmlWithLinkAndLabel, /href="https:\/\/example\.com\/event"/);
    assert.match(htmlWithLinkAndLabel, /<img src="\/assets\/images\/es26-hero-1-1536x864\.webp"/);
    assert.match(htmlWithLinkAndLabel, /alt="Event Banner"/);
    assert.match(htmlWithLinkAndLabel, /class="image-card__title"/);
    assert.match(htmlWithLinkAndLabel, /Event Banner/);

    // 2. Direct string link as image without label (pure image link banner)
    const htmlImageOnly = env.render('components/ImageCardHorizontal.njk', {
      item: {
        url: 'https://example.com/banner',
        image: 'https://example.com/banner.webp'
      }
    });
    assert.match(htmlImageOnly, /href="https:\/\/example\.com\/banner"/);
    assert.match(htmlImageOnly, /<img src="https:\/\/example\.com\/banner\.webp"/);
    assert.doesNotMatch(htmlImageOnly, /class="image-card__content"/, 'Image-only link must not render empty content bar');

    // 3. Vertical image card with string link as image
    const htmlVertical = env.render('components/ImageCardVertical.njk', {
      item: {
        url: 'https://example.com/flyer',
        image: '/assets/images/echo-home-helmstedt-803x1024.webp'
      }
    });
    assert.match(htmlVertical, /class="image-card image-card--vertical"/);
    assert.match(htmlVertical, /<img src="\/assets\/images\/echo-home-helmstedt-803x1024\.webp"/);
    assert.doesNotMatch(htmlVertical, /class="image-card__content"/);

    // 4. Object image format (backward compatibility)
    const htmlObject = env.render('components/ImageCardHorizontal.njk', {
      item: {
        url: 'https://example.com/classic',
        label: 'Classic Item',
        image: {
          src: '/assets/images/echo-home-gifhorn-1024x682.webp',
          alt: 'Custom Alt Text',
          width: 1024,
          height: 682
        }
      }
    });
    assert.match(htmlObject, /<img src="\/assets\/images\/echo-home-gifhorn-1024x682\.webp"/);
    assert.match(htmlObject, /alt="Custom Alt Text"/);
    assert.match(htmlObject, /Classic Item/);
  });

  test('LinkButton and FaIcon support any Font Awesome icons (fa-*, raw SVG, standard names, and fallback)', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure(path.resolve('src/_includes'), { autoescape: true });
    env.addFilter('resolveUrl', (val) => typeof val === 'string' ? val : (val?.url || '#'));

    // 1. Built-in icon
    const htmlChurch = env.render('components/LinkButton.njk', {
      item: { label: 'Church Link', url: 'https://example.com/church', icon: 'church' }
    });
    assert.match(htmlChurch, /class="link-button link-button--with-icon"/);
    assert.match(htmlChurch, /class="fa-svg fa-church"/);
    assert.match(htmlChurch, /Church Link/);

    // 2. Newly supported Font Awesome names & prefixes (fa-cross, fa-solid fa-star, fa-phone, ticket, mug-hot)
    const htmlCross = env.render('components/LinkButton.njk', {
      item: { label: 'Cross Link', url: 'https://example.com/cross', icon: 'fa-cross' }
    });
    assert.match(htmlCross, /class="fa-svg fa-cross"/);

    const htmlStar = env.render('components/LinkButton.njk', {
      item: { label: 'Star Link', url: 'https://example.com/star', icon: 'fa-solid fa-star' }
    });
    assert.match(htmlStar, /class="fa-svg fa-star"/);

    const htmlPhone = env.render('components/LinkButton.njk', {
      item: { label: 'Phone Link', url: 'tel:+4912345678', icon: 'phone' }
    });
    assert.match(htmlPhone, /class="fa-svg fa-phone"/);

    const htmlTicket = env.render('components/LinkButton.njk', {
      item: { label: 'Ticket Link', url: 'https://example.com/ticket', icon: 'fa-ticket' }
    });
    assert.match(htmlTicket, /class="fa-svg fa-ticket"/);

    const htmlCoffee = env.render('components/LinkButton.njk', {
      item: { label: 'Coffee Link', url: 'https://example.com/coffee', icon: 'mug-hot' }
    });
    assert.match(htmlCoffee, /class="fa-svg fa-mug-hot"/);

    // 2b. PayPal, Bank, Building Columns, and Credit Card icons
    const htmlPaypal = env.render('components/LinkButton.njk', {
      item: { label: 'PayPal Link', url: 'https://paypal.me/test', icon: 'paypal' }
    });
    assert.match(htmlPaypal, /class="fa-svg fa-paypal"/);

    const htmlBank = env.render('components/LinkButton.njk', {
      item: { label: 'Bank Link', url: 'https://example.com/bank', icon: 'bank' }
    });
    assert.match(htmlBank, /class="fa-svg fa-building-columns"/);

    const htmlColumns = env.render('components/LinkButton.njk', {
      item: { label: 'Columns Link', url: 'https://example.com/columns', icon: 'building-columns' }
    });
    assert.match(htmlColumns, /class="fa-svg fa-building-columns"/);

    const htmlCard = env.render('components/LinkButton.njk', {
      item: { label: 'Card Link', url: 'https://example.com/card', icon: 'credit-card' }
    });
    assert.match(htmlCard, /class="fa-svg fa-credit-card"/);

    // 3. Raw SVG input
    const rawSvg = '<svg class="custom-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>';
    const htmlRawSvg = env.render('components/LinkButton.njk', {
      item: { label: 'Raw SVG Link', url: 'https://example.com/raw', icon: rawSvg }
    });
    assert.match(htmlRawSvg, /<svg class="custom-icon"/);
    assert.match(htmlRawSvg, /class="link-button__icon"/);

    // 4. Raw <i> tag input
    const rawI = '<i class="fa-solid fa-guitar" aria-hidden="true"></i>';
    const htmlRawI = env.render('components/LinkButton.njk', {
      item: { label: 'Guitar Link', url: 'https://example.com/guitar', icon: rawI }
    });
    assert.match(htmlRawI, /<i class="fa-solid fa-guitar"/);

    // 5. Arbitrary unlisted fa-* icon fallback
    const htmlArbitrary = env.render('components/LinkButton.njk', {
      item: { label: 'Bullhorn Link', url: 'https://example.com/bullhorn', icon: 'fa-bullhorn' }
    });
    assert.match(htmlArbitrary, /class="fa-svg fa-bullhorn"/);

    // 6. Button without icon
    const htmlNoIcon = env.render('components/LinkButton.njk', {
      item: { label: 'No Icon Link', url: 'https://example.com/none', icon: '' }
    });
    assert.doesNotMatch(htmlNoIcon, /link-button--with-icon/);
    assert.doesNotMatch(htmlNoIcon, /class="link-button__icon"/);
    assert.match(htmlNoIcon, /No Icon Link/);
  });

  test('VideoLinkCard renders 2-click consent facade without initial iframe', () => {
    assert.match(indexHtml, /class="video-link-card"/, 'VideoLinkCard container must exist');
    assert.match(indexHtml, /class="video-link-card__play-btn"/, 'Play facade button must exist');
    assert.match(indexHtml, /class="fa-svg fa-play"/, 'Play badge must render Font Awesome fa-play icon');
    assert.match(indexHtml, /class="video-link-card__play-badge"/, 'Play badge must exist');
    assert.match(indexHtml, /data-video-embed="youtube"/, 'Data attribute for facade embed must exist');
    assert.doesNotMatch(indexHtml, /<iframe/i, 'No initial <iframe> allowed on page load');
  });

  test('FooterLegal renders address, external legal links, and social buttons', () => {
    assert.match(indexHtml, /class="footer-legal"/, 'FooterLegal container must exist');
    assert.match(indexHtml, /class="footer-legal__address"/, 'Footer address must exist');
    assert.match(indexHtml, /Echo Kirche KdöR/, 'Footer must contain church name Echo Kirche KdöR');
    assert.match(indexHtml, /Schützenplatz 1/, 'Footer must contain Schützenplatz 1');
    assert.match(indexHtml, /38518 Gifhorn/, 'Footer must contain 38518 Gifhorn');
    assert.match(indexHtml, /&copy;\s*2026\s*Echo Kirche KdöR\./, 'Footer must contain copyright 2026 Echo Kirche KdöR.');
    assert.match(indexHtml, /href="https:\/\/kirche-echo\.de\/impressum\/"[^>]*target="_blank"/, 'Impressum link must point externally with target="_blank"');
    assert.match(indexHtml, /href="https:\/\/kirche-echo\.de\/datenschutz\/"[^>]*target="_blank"/, 'Datenschutz link must point externally with target="_blank"');
    assert.match(indexHtml, /class="[^"]*\bsocial-button\b/, 'Social icon buttons must exist');
    assert.match(indexHtml, /aria-label="/, 'Social buttons must have accessible aria-labels');
  });

  test('SurfaceSwitcher renders only on /test page', () => {
    assert.doesNotMatch(indexHtml, /class="surface-switcher"/, 'Default page must NOT have surface-switcher');
    assert.match(testHtml, /class="surface-switcher"/, 'Test page MUST have surface-switcher');
    assert.match(testHtml, /class="surface-switcher__btn"/, 'Switcher buttons must exist on /test');
    assert.match(testHtml, /data-switch-value="gifhorn"/, 'Gifhorn switcher target must exist');
    assert.match(testHtml, /data-switch-value="wolfsburg"/, 'Wolfsburg switcher target must exist');
    assert.match(testHtml, /data-switch-value="helmstedt"/, 'Helmstedt switcher target must exist');
    assert.match(testHtml, /data-switch-value="instagram"/, 'Instagram switcher target must exist');
    assert.match(testHtml, /role="toolbar"/, 'Toolbar role must exist for switcher buttons');
  });

  test('ThemeSwitcher renders on /test page with all 6 brand themes and active badge', () => {
    assert.match(testHtml, /class="theme-switcher surface-switcher"/, 'ThemeSwitcher container must exist on test page');
    assert.match(testHtml, /data-theme-value="light"/, 'Light theme button must exist');
    assert.match(testHtml, /data-theme-value="pale"/, 'Pale theme button must exist');
    assert.match(testHtml, /data-theme-value="soft"/, 'Soft theme button must exist');
    assert.match(testHtml, /data-theme-value="dark"/, 'Dark theme button must exist');
    assert.match(testHtml, /data-theme-value="teal"/, 'Teal theme button must exist');
    assert.match(testHtml, /data-theme-value="lavender"/, 'Lavender theme button must exist');
    assert.match(testHtml, /id="active-theme-badge"/, 'Active theme badge indicator must exist');
  });

  test('Client-side scripts support reactive theme updates without breaking static builds', () => {
    const switcherJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'surface-switcher.js'), 'utf8');
    assert.match(switcherJs, /applyTheme/, 'surface-switcher.js must export or define applyTheme');
    assert.match(switcherJs, /data-theme-value/, 'surface-switcher.js must handle data-theme-value buttons');
    assert.match(switcherJs, /active-theme-badge/, 'surface-switcher.js must update active-theme-badge');

    const bridgeJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'storyblok-bridge.js'), 'utf8');
    assert.match(bridgeJs, /content\.theme/, 'storyblok-bridge.js must read content.theme');
    assert.doesNotMatch(bridgeJs, /sb\.on\('input'[^}]*reload\(\)/, 'storyblok-bridge.js must NOT reload on input');
  });

  test('Storyblok link objects resolve cleanly and never render [object Object]', async () => {
    // 1. Verify that no generated HTML file contains [object Object] in href
    assert.doesNotMatch(indexHtml, /href="\[object Object\]"/, 'index.html must not contain [object Object] href');
    assert.doesNotMatch(testHtml, /href="\[object Object\]"/, 'test.html must not contain [object Object] href');

    // 2. Test resolveStoryblokUrl with Storyblok multilink objects
    const { resolveStoryblokUrl, normalizeStoryblokLinks } = await import('../src/utils/storyblok-url.js');

    // External URL multilink
    const externalLink = { id: '', url: 'https://apple.com', linktype: 'url', fieldtype: 'multilink', cached_url: 'https://apple.com' };
    assert.equal(resolveStoryblokUrl(externalLink), 'https://apple.com', 'Should resolve external link object');

    // Internal Story multilink
    const storyLink = { id: '123', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: 'gifhorn' };
    assert.equal(resolveStoryblokUrl(storyLink), '/gifhorn/', 'Should resolve internal story link object');

    // Home Story multilink
    const homeStoryLink = { id: '123', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: 'home' };
    assert.equal(resolveStoryblokUrl(homeStoryLink), '/', 'Should resolve home story link to /');

    // Email multilink
    const emailLink = { id: '', url: 'info@kirche-echo.de', linktype: 'email', fieldtype: 'multilink', cached_url: 'info@kirche-echo.de' };
    assert.equal(resolveStoryblokUrl(emailLink), 'mailto:info@kirche-echo.de', 'Should resolve email link to mailto:');

    // Plain string URL
    assert.equal(resolveStoryblokUrl('https://example.com'), 'https://example.com', 'Should preserve plain string URL');

    // Recursive tree normalization
    const mockBlokTree = {
      body: [
        {
          component: 'link_button',
          label: 'Apple',
          url: externalLink,
        },
      ],
      footer: [
        {
          component: 'footer_legal',
          impressum_url: { linktype: 'url', url: 'https://kirche-echo.de/impressum/' },
        },
      ],
    };

    const normalized = normalizeStoryblokLinks(mockBlokTree);
    assert.equal(normalized.body[0].url, 'https://apple.com', 'normalizeStoryblokLinks must resolve nested link_button url');
    assert.equal(normalized.footer[0].impressum_url, 'https://kirche-echo.de/impressum/', 'normalizeStoryblokLinks must resolve nested footer impressum_url');
  });

  test('Pages render favicon.webp in head and do not render lazy-loader overlay', () => {
    assert.match(indexHtml, /<link\s+rel="icon"\s+type="image\/webp"\s+href="\/assets\/images\/favicon\.webp">/, 'HTML must render favicon.webp in head');
    assert.doesNotMatch(indexHtml, /id="page-loader"/, 'Regular pages must not render page loader overlay');
    assert.doesNotMatch(indexHtml, /class="lazy-loader"/, 'Regular pages must not contain lazy-loader markup');
  });

  test('Social share Open Graph, Twitter Cards, and canonical meta tags render with German fallbacks and Echo logo', () => {
    // 1. Root / index.html
    assert.match(indexHtml, /<meta\s+property="og:type"\s+content="website">/, 'Must have og:type website');
    assert.match(indexHtml, /<meta\s+property="og:locale"\s+content="de_DE">/, 'Must specify German locale de_DE');
    assert.match(indexHtml, /<meta\s+property="og:site_name"\s+content="Echo Kirche">/, 'Must have og:site_name');
    assert.match(indexHtml, /<meta\s+property="og:title"\s+content="Echo Kirche – Quick-Links">/, 'Must have og:title with Quick-Links');
    assert.match(indexHtml, /<meta\s+property="og:url"\s+content="https:\/\/kirche-echo\.de\/">/, 'Must have canonical og:url');
    assert.match(indexHtml, /<meta\s+property="og:image"\s+content="https:\/\/kirche-echo\.de\/assets\/images\/logo-circle\.png">/, 'Must use Echo logo circle for og:image');
    assert.match(indexHtml, /<meta\s+property="og:image:alt"\s+content="Echo Kirche Logo">/, 'Must have og:image:alt');
    assert.match(indexHtml, /<meta\s+property="og:image:type"\s+content="image\/png">/, 'Must have og:image:type image/png');
    assert.match(indexHtml, /<meta\s+property="og:image:width"\s+content="512">/, 'Must have og:image:width');
    assert.match(indexHtml, /<meta\s+property="og:image:height"\s+content="512">/, 'Must have og:image:height');
    assert.match(indexHtml, /<meta\s+name="twitter:card"\s+content="summary">/, 'Must have twitter:card summary');
    assert.match(indexHtml, /<meta\s+name="twitter:title"\s+content="Echo Kirche – Quick-Links">/, 'Must have twitter:title');
    assert.match(indexHtml, /<meta\s+name="twitter:image"\s+content="https:\/\/kirche-echo\.de\/assets\/images\/logo-circle\.png">/, 'Must have twitter:image');
    assert.match(indexHtml, /<link\s+rel="canonical"\s+href="https:\/\/kirche-echo\.de\/">/, 'Must have canonical link');
    assert.match(indexHtml, /<meta\s+name="description"\s+content="[^"]*Echo Kirche[^"]*"/, 'Must have German meta description');

    // 2. Campus routes (e.g. Gifhorn, Wolfsburg, Helmstedt)
    const gfHtml = fs.readFileSync(path.join(siteDir, 'gifhorn', 'index.html'), 'utf8');
    assert.match(gfHtml, /<meta\s+property="og:title"\s+content="Echo Kirche Gifhorn – Quick-Links">/);
    assert.match(gfHtml, /<meta\s+property="og:url"\s+content="https:\/\/kirche-echo\.de\/gifhorn\/">/);
    assert.match(gfHtml, /<meta\s+property="og:image"\s+content="https:\/\/kirche-echo\.de\/assets\/images\/logo-circle\.png">/);

    const wobHtml = fs.readFileSync(path.join(siteDir, 'wolfsburg', 'index.html'), 'utf8');
    assert.match(wobHtml, /<meta\s+property="og:title"\s+content="Echo Kirche Wolfsburg – Quick-Links">/);
    assert.match(wobHtml, /<meta\s+property="og:url"\s+content="https:\/\/kirche-echo\.de\/wolfsburg\/">/);

    const heHtml = fs.readFileSync(path.join(siteDir, 'helmstedt', 'index.html'), 'utf8');
    assert.match(heHtml, /<meta\s+property="og:title"\s+content="Echo Kirche Helmstedt – Quick-Links">/);
    assert.match(heHtml, /<meta\s+property="og:url"\s+content="https:\/\/kirche-echo\.de\/helmstedt\/">/);

    // 3. 404 page
    const notFoundHtml = fs.readFileSync(path.join(siteDir, '404.html'), 'utf8');
    assert.match(notFoundHtml, /<meta\s+property="og:title"\s+content="Seite nicht gefunden – Echo Kirche">/);
    assert.match(notFoundHtml, /<meta\s+property="og:url"\s+content="https:\/\/kirche-echo\.de\/404\.html">/);
    assert.match(notFoundHtml, /<meta\s+property="og:image"\s+content="https:\/\/kirche-echo\.de\/assets\/images\/logo-circle\.png">/);
  });

  test('Storyblok token is never embedded in HTML meta tags or attributes', () => {
    assert.doesNotMatch(indexHtml, /name=["']storyblok-token["']/i, 'HTML must never contain storyblok-token meta tag');
    assert.doesNotMatch(testHtml, /name=["']storyblok-token["']/i, 'Test HTML must never contain storyblok-token meta tag');
  });

  test('resolveStoryblokUrl blocks dangerous javascript: and data: protocols', () => {
    assert.equal(resolveStoryblokUrl('javascript:alert(1)'), '#', 'javascript: protocol must be blocked');
    assert.equal(resolveStoryblokUrl('data:text/html;base64,PHNjcmlwdD4='), '#', 'data: protocol must be blocked');
    assert.equal(resolveStoryblokUrl('vbscript:msgbox(1)'), '#', 'vbscript: protocol must be blocked');
    assert.equal(resolveStoryblokUrl({ url: 'javascript:void(0)' }), '#', 'Object with javascript url must be blocked');
  });

  test('Storyblok bridge supports real-time Visual Editor reconciliation: adding, removing, and reordering link_button using stable _uid', () => {
    const bridgeJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'storyblok-bridge.js'), 'utf8');

    class MockElement {
      constructor(tag) {
        this.tagName = tag.toUpperCase();
        this.children = [];
        this.dataset = {};
        this._classList = new Set();
        this.innerHTML = '';
        this.textContent = '';
        this.href = '';
        this.src = '';
      }
      get classList() {
        const self = this;
        return {
          add(c) { self._classList.add(c); },
          contains(c) { return self._classList.has(c); },
          remove(c) { self._classList.delete(c); }
        };
      }
      set className(cn) {
        this._classList = new Set(cn.split(/\s+/).filter(Boolean));
      }
      get className() {
        return Array.from(this._classList).join(' ');
      }
      appendChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        this.children.push(child);
        child.parentElement = this;
        return child;
      }
      remove() {
        if (this.parentElement) {
          const idx = this.parentElement.children.indexOf(this);
          if (idx !== -1) this.parentElement.children.splice(idx, 1);
          this.parentElement = null;
        }
      }
      querySelector(sel) {
        return null;
      }
    }

    const list = new MockElement('ul');
    list.className = 'linktree-list';
    const initialItem = new MockElement('li');
    initialItem.className = 'linktree-item';
    initialItem.dataset.uid = 'uid-initial-1';
    list.appendChild(initialItem);

    const doc = {
      title: '',
      documentElement: new MockElement('html'),
      querySelector(sel) {
        if (sel === '.linktree-list') return list;
        return null;
      },
      createElement(tag) {
        return new MockElement(tag);
      },
      body: new MockElement('body')
    };

    const sandbox = {
      window: {},
      document: doc,
      location: { search: '?_storyblok=1' },
      URLSearchParams,
      Set, Map, Array, String, Boolean, console
    };
    sandbox.window = sandbox;

    runInNewContext(bridgeJs, sandbox);
    assert.equal(typeof sandbox.storyblokApplyContent, 'function', 'storyblokApplyContent must be exposed for bridge updates');

    // 1. Add a new link_button
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' },
        {
          _uid: 'uid-new-link',
          component: 'link_button',
          label: 'Test Link Button',
          url: 'https://example.com/test-button',
          show_on: ['instagram', 'default']
        }
      ]
    });

    assert.equal(list.children.length, 2, 'New item must be dynamically appended to linktree-list');
    const addedItem = list.children[1];
    assert.equal(addedItem.dataset.uid, 'uid-new-link', 'Added item must have matching data-uid');
    assert.match(addedItem.innerHTML, /class="link-button/, 'Added item must have link-button class');
    assert.match(addedItem.innerHTML, /Test Link Button/, 'Added item must render label');
    assert.match(addedItem.innerHTML, /href="https:\/\/example\.com\/test-button"/, 'Added item must have resolved URL');
    assert.match(addedItem.innerHTML, /class="link-button__icon"/, 'Added item must have icon wrapper');
    assert.equal(addedItem.dataset.showOn, 'instagram,default', 'Surface filtering show_on attributes must be preserved');

    // 2. Reorder items (place new button before initial button)
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-new-link', component: 'link_button', label: 'Test Link Button' },
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' }
      ]
    });
    assert.equal(list.children[0].dataset.uid, 'uid-new-link', 'First item in DOM must be uid-new-link after reorder');
    assert.equal(list.children[1].dataset.uid, 'uid-initial-1', 'Second item in DOM must be uid-initial-1 after reorder');

    // 3. Remove the link_button
    sandbox.storyblokApplyContent({
      body: [
        { _uid: 'uid-initial-1', component: 'link_button', label: 'Existing Button' }
      ]
    });
    assert.equal(list.children.length, 1, 'Removed item must be pruned from DOM');
    assert.equal(list.children[0].dataset.uid, 'uid-initial-1', 'Only remaining item must be uid-initial-1');
  });

  test('Mobile Android Chrome theme support, viewport meta tags, and touch optimizations', () => {
    // 1. Meta tags in HTML head
    assert.match(indexHtml, /<meta\s+name="color-scheme"\s+content="light dark">/, 'HTML head must specify color-scheme: light dark');
    assert.match(indexHtml, /<meta\s+name="theme-color"\s+content="[^"]+">/, 'HTML head must specify theme-color meta tag');
    assert.match(testHtml, /<meta\s+name="color-scheme"\s+content="light dark">/, 'Test HTML head must specify color-scheme: light dark');
    assert.match(testHtml, /<meta\s+name="theme-color"\s+content="[^"]+">/, 'Test HTML head must specify theme-color meta tag');

    // 2. CSS color-scheme rules preventing Android Chrome Auto-Dark inversion
    const css = fs.readFileSync(path.join(siteDir, 'css', 'main.css'), 'utf8');
    assert.match(css, /\[data-theme=["']?dark["']?\]\s*\{[^}]*color-scheme:\s*dark/i, 'CSS dark theme must declare color-scheme: dark');
    assert.match(css, /\[data-theme=["']?teal["']?\]\s*\{[^}]*color-scheme:\s*dark/i, 'CSS teal theme must declare color-scheme: dark');
    assert.match(css, /\[data-theme=["']?warm["']?\]\s*\{[^}]*color-scheme:\s*light/i, 'CSS warm/pale theme must declare color-scheme: light');

    // 3. Root html background to prevent viewport canvas flashing
    assert.match(css, /html\s*\{[^}]*background-color:\s*var\(--color-page-bg\)/i, 'html root element must define background-color to avoid viewport flashing');

    // 4. Touch action manipulation for instant mobile response
    assert.match(css, /\.surface-switcher__btn\s*\{[^}]*touch-action:\s*manipulation/i, 'Switcher buttons must use touch-action: manipulation to eliminate mobile 300ms delay');
  });

  test('Theme query param (?theme=dark, ?theme=teal) and applyTheme update document theme, colorScheme and meta theme-color', () => {
    const switcherJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'surface-switcher.js'), 'utf8');

    class MockMeta {
      constructor(name, content) {
        this.name = name;
        this.content = content;
      }
      setAttribute(k, v) {
        if (k === 'content') this.content = v;
      }
      getAttribute(k) {
        return k === 'content' ? this.content : null;
      }
    }

    class MockEl {
      constructor(tag) {
        this.tagName = tag.toUpperCase();
        this.dataset = {};
        this.style = {};
        this.attributes = {};
      }
      setAttribute(k, v) { this.attributes[k] = v; }
      getAttribute(k) { return this.attributes[k]; }
      classList = {
        toggle: () => {},
        add: () => {},
        remove: () => {}
      };
    }

    const themeMeta = new MockMeta('theme-color', '#ffffff');
    const htmlEl = new MockEl('html');

    const sandbox = {
      window: {},
      document: {
        documentElement: htmlEl,
        querySelector(sel) {
          if (sel === 'meta[name="theme-color"]') return themeMeta;
          return null;
        },
        querySelectorAll() { return []; },
        getElementById() { return null; },
        readyState: 'complete',
        addEventListener() {}
      },
      location: {
        pathname: '/test/',
        search: '?preview=true&theme=dark',
        hostname: 'example.com'
      },
      URLSearchParams,
      URL,
      history: { pushState() {} }
    };
    sandbox.window = sandbox;

    runInNewContext(switcherJs, sandbox);
    assert.equal(typeof sandbox.applyTheme, 'function', 'applyTheme must be exposed');

    // 1. Initial dark theme from query param
    assert.equal(htmlEl.dataset.theme, 'dark', 'Dataset theme must be set to dark');
    assert.equal(htmlEl.style.colorScheme, 'dark', 'colorScheme style must be dark for dark theme');
    assert.equal(themeMeta.content, '#000', 'theme-color meta content must be updated to #000 for dark theme');

    // 2. Switch to teal theme
    sandbox.applyTheme('teal', false);
    assert.equal(htmlEl.dataset.theme, 'teal', 'Dataset theme must be set to teal');
    assert.equal(htmlEl.style.colorScheme, 'dark', 'colorScheme style must be dark for teal theme');
    assert.equal(themeMeta.content, '#08415c', 'theme-color meta content must be updated to #08415c for teal theme');

    // 3. Switch to pale theme
    sandbox.applyTheme('pale', false);
    assert.equal(htmlEl.dataset.theme, 'pale', 'Dataset theme must be set to pale');
    assert.equal(htmlEl.style.colorScheme, 'light', 'colorScheme style must be light for pale theme');
    assert.equal(themeMeta.content, '#fefadc', 'theme-color meta content must be updated to #fefadc for pale theme');
  });

  test('Storyblok bridge does not block mobile clicks when opened standalone (preventClicks disabled outside iframe)', () => {
    const bridgeJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'storyblok-bridge.js'), 'utf8');

    // Verify bridge guards preventClicks with isFramed / window.self !== window.top
    assert.match(bridgeJs, /preventClicks:\s*isFramed/, 'Bridge must set preventClicks: isFramed so standalone mobile tabs do not have clicks blocked');
    assert.match(bridgeJs, /isFramed\s*=\s*(typeof window !== 'undefined' &&\s*)?window\.self\s*!==\s*window\.top/, 'Bridge must detect whether running framed in Visual Editor');
  });

  test('Security & Secrets Audit: no tokens, secrets, or env credentials in final build or git tracking', () => {
    // 1. Scan all files in _site for secret patterns
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
          scanDir(full);
        } else if (f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.json')) {
          const content = fs.readFileSync(full, 'utf8');
          // Disallow draft tokens, secret tokens, private keys, or passwords
          assert.doesNotMatch(content, /storyblok-token/i, `Secret leak in ${full}: contains storyblok-token`);
          assert.doesNotMatch(content, /STORYBLOK_TOKEN\s*=\s*['"][a-zA-Z0-9_-]+['"]/i, `Secret leak in ${full}: contains token assignment`);
          assert.doesNotMatch(content, /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, `Secret leak in ${full}: contains private key`);
        }
      }
    }
    scanDir(siteDir);

    // 2. Check .gitignore excludes .env files
    const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
    assert.match(gitignore, /\.env/, '.gitignore must ignore .env files');
  });

  test('Accessibility (a11y) Button Test controls on /test operate properly across Mobile, DOM, and Desktop', () => {
    // 1. Static HTML assertions on /test/index.html
    assert.match(testHtml, /id="a11y-test-skip"/, 'Test page must render skip button with id="a11y-test-skip"');
    assert.match(testHtml, /id="a11y-test-contrast-toggle"/, 'Test page must render contrast toggle button with id="a11y-test-contrast-toggle"');
    assert.match(testHtml, /id="a11y-test-modal-trigger"/, 'Test page must render modal trigger with id="a11y-test-modal-trigger"');
    assert.match(testHtml, /id="active-contrast-badge"/, 'Test page must render active-contrast-badge');
    assert.match(testHtml, /id="active-font-size-badge"/, 'Test page must render active-font-size-badge');

    // 2. Client-side behavioral simulation in DOM/VM sandbox
    const switcherJs = fs.readFileSync(path.join(siteDir, 'assets', 'js', 'surface-switcher.js'), 'utf8');

    const htmlEl = { dataset: { surface: 'default', theme: 'light' }, style: {} };
    const bodyEl = { style: {} };
    const listeners = {};
    const elementsById = {};

    function createElement(id, tagName = 'div', dataset = {}) {
      const el = {
        id,
        tagName,
        dataset: { ...dataset },
        style: {},
        tabIndex: 0,
        focusCount: 0,
        scrollCount: 0,
        _listeners: {},
        addEventListener(event, fn) {
          if (!this._listeners[event]) this._listeners[event] = [];
          this._listeners[event].push(fn);
        },
        dispatchEvent(event) {
          (this._listeners[event.type || event] || []).forEach(fn => fn(event));
        },
        focus(opts) { this.focusCount++; },
        scrollIntoView(opts) { this.scrollCount++; },
        setAttribute(k, v) { this[k] = v; },
        removeAttribute(k) { delete this[k]; },
        classList: { toggle() {}, add() {}, remove() {} },
        textContent: ''
      };
      if (id) elementsById[id] = el;
      return el;
    }

    const testSkipBtn = createElement('a11y-test-skip', 'button');
    const testContrastBtn = createElement('a11y-test-contrast-toggle', 'button');
    const testModalTrigger = createElement('a11y-test-modal-trigger', 'button');
    const contrastBadge = createElement('active-contrast-badge');
    const fontBadge = createElement('active-font-size-badge');
    const linktreeList = createElement('linktree-list');
    linktreeList.classList = {
      contains(cls) { return cls === 'linktree-list'; },
      toggle() {}, add() {}, remove() {}
    };

    let modalOpened = false;
    const modalEl = createElement('a11y-modal', 'dialog');
    modalEl.showModal = () => { modalOpened = true; modalEl.open = true; };
    modalEl.close = () => { modalOpened = false; modalEl.open = false; modalEl.dispatchEvent({ type: 'close' }); };
    const modalCloseBtn = createElement('a11y-modal-close', 'button');

    const sandbox = {
      document: {
        documentElement: htmlEl,
        body: bodyEl,
        getElementById: (id) => elementsById[id] || null,
        querySelector: (sel) => {
          if (sel === '.linktree-list') return linktreeList;
          if (sel === '#a11y-modal') return modalEl;
          return null;
        },
        querySelectorAll: (sel) => {
          if (sel.includes('#a11y-trigger') || sel.includes('#a11y-test-modal-trigger')) {
            return [testModalTrigger];
          }
          return [];
        },
        addEventListener(evt, fn) {
          if (!listeners[evt]) listeners[evt] = [];
          listeners[evt].push(fn);
        },
        readyState: 'complete'
      },
      location: { pathname: '/test/index.html', search: '', hostname: 'localhost' },
      URLSearchParams,
      URL,
      history: { pushState() {} },
      setTimeout: (fn) => fn()
    };
    sandbox.window = sandbox;

    runInNewContext(switcherJs, sandbox);

    // Test A: Skip Button click focuses and scrolls main link list
    testSkipBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(linktreeList.focusCount, 1, 'Clicking skip button must focus .linktree-list');
    assert.equal(linktreeList.scrollCount, 1, 'Clicking skip button must smoothly scroll .linktree-list into view');

    // Test B: Contrast Toggle cycles normal -> black-on-white -> white-on-black -> normal
    assert.equal(htmlEl.dataset.contrast, undefined, 'Initial contrast should be default');
    testContrastBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(htmlEl.dataset.contrast, 'black-on-white', 'First click toggles to black-on-white');
    assert.equal(contrastBadge.textContent, 'black-on-white', 'Contrast badge updates to black-on-white');

    testContrastBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(htmlEl.dataset.contrast, 'white-on-black', 'Second click toggles to white-on-black');
    assert.equal(contrastBadge.textContent, 'white-on-black', 'Contrast badge updates to white-on-black');

    testContrastBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(htmlEl.dataset.contrast, undefined, 'Third click resets contrast to standard');
    assert.equal(contrastBadge.textContent, 'standard', 'Contrast badge resets to standard');

    // Test C: Modal trigger opens modal and locks mobile/desktop body scrolling
    assert.equal(modalOpened, false, 'Modal initially closed');
    testModalTrigger.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(modalOpened, true, 'Clicking modal trigger opens modal');
    assert.equal(bodyEl.style.overflow, 'hidden', 'Opening modal locks body scroll');

    // Test D: Close button unlocks body scrolling
    modalCloseBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    assert.equal(modalOpened, false, 'Clicking close button closes modal');
    assert.equal(bodyEl.style.overflow, '', 'Closing modal restores body scroll');
  });
});




