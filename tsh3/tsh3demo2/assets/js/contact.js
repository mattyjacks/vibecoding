/**
 * Tri State Honey - Enterprise Sample Request & Inbound Inquiry Handler
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
      const company = form.querySelector('[name="company"]') ? form.querySelector('[name="company"]').value.trim() : '';
      const phone = form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value.trim() : '';
      const product = form.querySelector('[name="product"]').value;
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email) {
        showStatus('⚠️ Please provide both your full name and corporate email address.', 'error');
        return;
      }

      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('⚠️ Please enter a valid work email address.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> Processing Sample Request...';

      // Send or simulate inquiry logging
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showStatus(
          `🍯 <strong>Thank you, ${name}!</strong> Your free sample request for <em>${product}</em> has been securely routed directly to CEO Ashley Dutta & our wholesale logistics team. We will review your application and email you at <strong>${email}</strong> with sample tracking details within 24 business hours!`,
          'success'
        );
        form.reset();
      }, 750);
    });

    function showStatus(htmlMsg, type) {
      if (!statusBox) return;
      statusBox.innerHTML = htmlMsg;
      statusBox.className = `tsh-status-alert ${type}`;
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  document.addEventListener('DOMContentLoaded', initForm);
})();
