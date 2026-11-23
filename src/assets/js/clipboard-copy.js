(() => {
  'use strict';

  function copyTextToClipboard(text, onSuccess, onError) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        fallbackCopy(text, onSuccess, onError);
      });
    } else {
      fallbackCopy(text, onSuccess, onError);
    }
  }

  function fallbackCopy(text, onSuccess, onError) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) onSuccess();
      else if (onError) onError();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-copy-iban]');
    if (!btn) return;
    event.preventDefault();

    const rawValue = btn.getAttribute('data-copy-iban') || '';
    // Copy clean IBAN without spaces
    const ibanToCopy = rawValue.replace(/\s+/g, '').trim();
    if (!ibanToCopy) return;

    const labelSpan = btn.querySelector('.donation-card__copy-text');
    const originalText = labelSpan ? labelSpan.textContent : '';
    const feedbackText = btn.getAttribute('data-copied-text') || 'Kopiert!';

    const liveRegion = btn.closest('.donation-card')?.querySelector('.donation-card__live-region');

    copyTextToClipboard(ibanToCopy, () => {
      btn.classList.add('is-copied');
      btn.setAttribute('aria-label', feedbackText);
      if (labelSpan) labelSpan.textContent = feedbackText;
      if (liveRegion) liveRegion.textContent = 'IBAN in die Zwischenablage kopiert';

      setTimeout(() => {
        btn.classList.remove('is-copied');
        const defaultLabel = btn.getAttribute('data-default-label') || originalText || 'IBAN kopieren';
        btn.setAttribute('aria-label', defaultLabel);
        if (labelSpan) labelSpan.textContent = defaultLabel;
        if (liveRegion) liveRegion.textContent = '';
      }, 2000);
    });
  });
})();
