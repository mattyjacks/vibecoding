/**
 * Tri State Honey - Core Navigation & Interactive Controller
 */
(function () {
  'use strict';

  function initNavToggle() {
    const toggleBtn = document.querySelector('.tsh-mobile-toggle');
    const navMenu = document.querySelector('.tsh-nav-menu');

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
      });

      // Close menu on nav item click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
        });
      });
    }
  }

  function initBackToTop() {
    const btn = document.querySelector('.tsh-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initBackToTop();
    initSmoothScroll();
    console.log("Tri State Honey Core navigation loaded successfully.");
  });
})();
