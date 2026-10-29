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
        showStatus(`Thank you, ${name}! Your free sample request for ${product || 'Tri State Honey products'} has been routed to Ashley Dutta & our sales team. We will contact you at ${email} shortly! 🍯`, 'success');
        form.reset();
      }, 700);
    });

    function showStatus(msg, type) {
      if (!statusBox) return;
      statusBox.textContent = msg;
      statusBox.className = `tsh-status-alert ${type}`;
    }
  }

  document.addEventListener('DOMContentLoaded', initForm);
})();
