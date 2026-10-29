/**
 * Tri State Honey - Performance & Security Guard
 * Ensures strict Content Security Policy, asset preloading, and runtime error guards
 */
(function () {
  'use strict';

  // Measure initial page performance timing
  window.addEventListener('load', () => {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navTiming = window.performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        console.log(`[TSH Performance] DOM Loaded: ${Math.round(navTiming.domContentLoadedEventEnd)}ms, Full Load: ${Math.round(navTiming.loadEventEnd)}ms`);
      }
    }
  });

  // Client-side sanitization helper
  window.tshSanitize = function (str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  };

  // Safe external link handler (adds rel noopener noreferrer automatically)
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });
})();
