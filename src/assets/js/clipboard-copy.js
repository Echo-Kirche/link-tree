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
    const btn = event.target.closest('[data-copy-text], [data-copy-iban], [data-copy]');
    if (!btn) return;
    event.preventDefault();

    const isIban = btn.hasAttribute('data-copy-iban') && !btn.hasAttribute('data-copy-text');
    const rawValue = btn.getAttribute('data-copy-text') || btn.getAttribute('data-copy-iban') || btn.getAttribute('data-copy') || '';
    const textToCopy = isIban ? rawValue.replace(/\s+/g, '').trim() : rawValue.trim();
    if (!textToCopy) return;

    const labelSpan = btn.querySelector('.donation-card__copy-text');
    const originalText = labelSpan ? labelSpan.textContent : '';
    const feedbackText = btn.getAttribute('data-copied-text') || 'Kopiert!';

    const liveRegion = btn.closest('.donation-card')?.querySelector('.donation-card__live-region');
    const liveSuccessMessage = btn.getAttribute('data-copied-live') || (isIban ? 'IBAN in die Zwischenablage kopiert' : 'In die Zwischenablage kopiert');

    copyTextToClipboard(textToCopy, () => {
      btn.classList.add('is-copied');
      btn.setAttribute('aria-label', feedbackText);
      if (labelSpan) labelSpan.textContent = feedbackText;
      if (liveRegion) liveRegion.textContent = liveSuccessMessage;

      setTimeout(() => {
        btn.classList.remove('is-copied');
        const defaultLabel = btn.getAttribute('data-default-label') || originalText || (isIban ? 'IBAN kopieren' : 'Kopieren');
        btn.setAttribute('aria-label', defaultLabel);
        if (labelSpan) labelSpan.textContent = defaultLabel;
        if (liveRegion) liveRegion.textContent = '';
      }, 2000);
    });
  });
})();
