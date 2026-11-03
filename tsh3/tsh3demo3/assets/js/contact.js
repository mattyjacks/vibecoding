/**
 * Tri State Honey - Sample Request & Inbound Inquiry Handler
 * Provides safe client-side validation and simulated dispatch
 */
(function () {
  'use strict';

  function initForm() {
    const form = document.getElementById('tshSampleForm');
    const statusBox = document.getElementById('tshFormStatus');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="fullName"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const company = form.querySelector('[name="company"]').value.trim();
      const product = form.querySelector('[name="product"]').value;
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email) {
        showStatus('Please provide both your name and business email.', 'error');
        return;
      }

      // Simulate instantaneous enterprise inquiry logging
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showStatus(`Thank you, ${name}! Your inquiry for ${product || 'Tri State Honey products'} has been routed to Ashley Dutta & our sales team. We will contact you at ${email} shortly.`, 'success');
        form.reset();
      }, 700);
    });

    function showStatus(msg, type) {
      if (!statusBox) return;
      statusBox.textContent = msg;
      statusBox.className = `tsh-status-alert ${type}`;
    }
  }

  /**
   * Executive CEO Memo Re-triggerable Text Reveal
   * Re-animates with a luminous golden typewriter stream every time it enters the viewport
   */
  function initCeoQuoteReveal() {
    const memo = document.getElementById('tshCeoMemoCard');
    const quoteEl = document.getElementById('tshCeoQuoteText');
    const signEl = document.getElementById('tshCeoSignText');
    const signLine = document.getElementById('tshCeoSignLine');
    if (!memo || !quoteEl) return;

    const rawQuote = '“Call my personal line anytime at (856) 86 HONEY and press 0. I take honey purity and your wholesale savings personally.”';
    
    let timer = null;
    let isRevealing = false;
    let hasFinished = false;

    function resetAnimation() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      isRevealing = false;
      hasFinished = false;
      quoteEl.innerHTML = '<span class="tsh-ceo-cursor" id="tshCeoCursor"></span>';
      if (signEl) signEl.classList.remove('is-visible');
      if (signLine) signLine.classList.remove('is-drawn');
    }

    function runAnimation() {
      if (isRevealing || hasFinished) return;
      isRevealing = true;
      quoteEl.innerHTML = '<span class="tsh-ceo-cursor" id="tshCeoCursor"></span>';
      if (signEl) signEl.classList.remove('is-visible');
      if (signLine) signLine.classList.remove('is-drawn');

      const chars = Array.from(rawQuote);
      let idx = 0;

      function typeChar() {
        if (!isRevealing) return;

        if (idx < chars.length) {
          const char = chars[idx];
          const span = document.createElement('span');
          span.className = 'tsh-char-reveal';
          span.textContent = char;

          const cursor = document.getElementById('tshCeoCursor');
          if (cursor) {
            quoteEl.insertBefore(span, cursor);
          } else {
            quoteEl.appendChild(span);
          }

          idx++;

          // Natural cadence with slight micro-pauses at punctuation
          let delay = 22;
          if (char === '.' || char === '!' || char === '?') {
            delay = 240;
          } else if (char === ',' || char === ';') {
            delay = 120;
          } else if (char === ' ') {
            delay = 28;
          }

          timer = setTimeout(typeChar, delay);
        } else {
          isRevealing = false;
          hasFinished = true;

          const cursor = document.getElementById('tshCeoCursor');
          if (cursor) {
            setTimeout(() => {
              cursor.classList.add('is-hidden');
            }, 500);
          }

          // Flourish signature after quote typing is complete
          setTimeout(() => {
            if (signEl) signEl.classList.add('is-visible');
            if (signLine) signLine.classList.add('is-drawn');
          }, 220);
        }
      }

      // Brief delay upon entering view before typing begins
      timer = setTimeout(typeChar, 200);
    }

    // Initialize with cursor
    resetAnimation();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runAnimation();
          } else {
            // When user scrolls away from this element, reset so it replays upon next scroll!
            resetAnimation();
          }
        });
      }, {
        threshold: 0.25,
        rootMargin: '0px 0px -40px 0px'
      });

      observer.observe(memo);
    } else {
      quoteEl.textContent = rawQuote;
      if (signEl) signEl.classList.add('is-visible');
      if (signLine) signLine.classList.add('is-drawn');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initForm();
    initCeoQuoteReveal();
  });
})();
