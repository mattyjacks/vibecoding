/**
 * Tri State Honey — $100k UX Architecture, Micro-Interactions & Scroll Animations
 */
(function () {
  'use strict';

  // Mobile Navigation Toggle
  function initNavToggle() {
    const toggleBtn = document.querySelector('.tsh-mobile-toggle');
    const navMenu = document.querySelector('.tsh-nav-menu');

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.innerHTML = isOpen ? '&times;' : '&#9776;';
      });

      // Close menu on nav item click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.innerHTML = '&#9776;';
        });
      });
    }
  }

  // Header Scroll Elevation
  function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 30) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  // Floating Back to Top Button
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 450) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Smooth Anchored Navigation
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            const headerOffset = 90;
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

  // Dynamic Scroll-Triggered Reveal Animations
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.tsh-reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.tsh-reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // Live Metric Number Counters
  function initCounters() {
    const statCards = document.querySelectorAll('.tsh-trust-stat');
    if (!statCards.length) return;

    let hasAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateStatCounters();
        }
      });
    }, { threshold: 0.3 });

    const trustBar = document.querySelector('.tsh-trust-bar');
    if (trustBar) {
      counterObserver.observe(trustBar);
    }

    function animateStatCounters() {
      statCards.forEach((card, index) => {
        const numEl = card.querySelector('.tsh-trust-stat-num');
        if (!numEl) return;

        // Custom config for each counter index
        if (index === 0) {
          // 17+
          animateValue(numEl, 0, 17, 1400, '<span>+</span>');
        } else if (index === 1) {
          // 100%
          animateValue(numEl, 0, 100, 1600, '<span>%</span>');
        } else if (index === 2) {
          // 4-Tier
          animateValue(numEl, 1, 4, 1000, '<span>-Tier</span>');
        } else if (index === 3) {
          // 3,000lb
          animateValue(numEl, 0, 3000, 1800, '<span>lb</span>', true);
        }
      });
    }

    function animateValue(element, start, end, duration, suffix = '', useComma = false) {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);

        const formatted = useComma ? current.toLocaleString() : current;
        element.innerHTML = `${formatted}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          const finalFormatted = useComma ? end.toLocaleString() : end;
          element.innerHTML = `${finalFormatted}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    }
  }

  // Interactive Live Catalog Search Filter
  function initCatalogSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    const catalogCards = document.querySelectorAll('.tsh-catalog-card');

    if (!searchInput || !catalogCards.length) return;

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      catalogCards.forEach(card => {
        const keywords = card.getAttribute('data-keywords') || '';
        const name = card.querySelector('.tsh-catalog-name')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.tsh-catalog-desc')?.textContent.toLowerCase() || '';

        const isMatch = !query || keywords.includes(query) || name.includes(query) || desc.includes(query);

        if (isMatch) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initHeaderScroll();
    initBackToTop();
    initSmoothScroll();
    initScrollReveal();
    initCounters();
    initCatalogSearch();
  });
})();
