/**
 * Tri State Honey — $500k Masterpiece Interactive Engine
 * Features:
 * 1. Liquid Honey Viscous Canvas Reactor
 * 2. 3D Packaging Hologram Stage
 * 3. Wholesale Margin & Freight ROI Engine
 * 4. Laboratory Spectral Analysis Terminal
 * 5. Live Metric Rolling Counters & Telemetry HUD
 * 6. Instant Zero-Latency Commodity Filter
 * 7. Audio Feedback Synthesizer (Web Audio API)
 */
(function () {
  'use strict';

  // 1. LIQUID HONEY VISCOUS CANVAS REACTOR
  function initFluidCanvas() {
    const canvas = document.getElementById('tshFluidCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const maxParticles = 45;

    let mouse = { x: width / 2, y: height / 2, moved: false };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;

      // Emit liquid gold particles on move
      if (particles.length < maxParticles) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 + 0.3,
          radius: Math.random() * 35 + 20,
          alpha: 0.35,
          color: Math.random() > 0.5 ? '245, 176, 56' : '212, 168, 83'
        });
      }
    }, { passive: true });

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Ambient radial center glow
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 350);
      grad.addColorStop(0, 'rgba(245, 176, 56, 0.08)');
      grad.addColorStop(0.5, 'rgba(194, 132, 26, 0.03)');
      grad.addColorStop(1, 'rgba(6, 8, 13, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.005;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        pGrad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        pGrad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  // 2. 3D PACKAGING HOLOGRAM STAGE
  const stageData = {
    'tsh-1lb-bear': {
      name: '1 lb Classic Honey Bear',
      subtitle: 'RETAIL HERO // SQUEEZE BEAR WITH FLIP-TOP VALVE',
      image: 'assets/images/tsh-1-lb-bear.png',
      weight: '1.0 lb (16 oz)',
      pallet: '2,400 Units / Pallet',
      fcl: '24,000 Units / 20ft FCL',
      resin: 'BPA-Free Food Grade PET',
      desc: 'Iconic consumer squeeze bear with anti-drip silicone valve. Engineered for retail shelves, corporate gift baskets, and private labeling with custom foil tamper seals.'
    },
    'tsh-2lb-bottle': {
      name: '2 lb Classic Ribbed Bottle',
      subtitle: 'HIGH VOLUME // ERGONOMIC SUPERMARKET & DINER BOTTLE',
      image: 'assets/images/tsh-2-lb-bottle.png',
      weight: '2.0 lbs (32 oz)',
      pallet: '1,200 Units / Pallet',
      fcl: '12,000 Units / 20ft FCL',
      resin: 'Recyclable Ribbed PET',
      desc: 'High-volume ribbed bottle designed for family tables, breakfast diners, bakeries, and wholesale grocery chains. Features easy-pour flip top.'
    },
    'tsh-60lb-bucket': {
      name: '60 lb Commercial Bulk Bucket (Pail)',
      subtitle: 'COMMERCIAL WORKHORSE // STOCK PILED IN NEW JERSEY',
      image: 'assets/images/tsh-60-lb-bucket.png',
      weight: '60.0 lbs (27.2 kg)',
      pallet: '36 Pails / Pallet (2,160 lbs)',
      fcl: '720 Pails / 20ft FCL',
      resin: 'Food Grade HDPE w/ Gasket',
      desc: 'The commercial kitchen workhorse. In stock at Piscataway, NJ for instantaneous nationwide LTL dispatch. Comes with heavy-duty wire bail & tear-strip tamper seal.'
    },
    'tsh-660lb-drum': {
      name: '660 lb Industrial Steel Drum',
      subtitle: 'INDUSTRIAL THROUGHPUT // AUTOMATED UNLOAD BATCHING',
      image: 'assets/images/tsh-660-lb-drum.png',
      weight: '660.0 lbs (300 kg)',
      pallet: '4 Drums / Pallet (2,640 lbs)',
      fcl: '72 Drums / 20ft FCL',
      resin: 'Epoxy-Lined Industrial Steel',
      desc: 'Built for industrial breweries, commercial bakeries, confectionery, and sauce manufacturing. Food-grade inner epoxy lining ensures zero oxidation.'
    },
    'tsh-3000lb-tote': {
      name: '3,000 lb Industrial IBC Pallet Tote',
      subtitle: 'ENTERPRISE SCALE // MAXIMUM LOGISTICAL SAVINGS',
      image: 'assets/images/tsh-3000-lb-tote.png',
      weight: '3,000.0 lbs (1,360 kg)',
      pallet: 'Integrated Steel Pallet Base',
      fcl: '14-16 Totes / 20ft FCL',
      resin: 'Rigid Composite w/ Steel Cage',
      desc: 'Maximum cost efficiency per pound in the international honey trade. Features bottom discharge valve, top filling port, and heavy-duty galvanized structural cage.'
    }
  };

  function initPackagingStage() {
    const tabs = document.querySelectorAll('.tsh-stage-tab');
    const stageImg = document.getElementById('stageMainImg');
    const stageImgWrap = document.getElementById('stageImgWrap');
    const titleEl = document.getElementById('stageTitle');
    const subEl = document.getElementById('stageSubtitle');
    const descEl = document.getElementById('stageDesc');
    const weightEl = document.getElementById('stageWeightVal');
    const palletEl = document.getElementById('stagePalletVal');
    const fclEl = document.getElementById('stageFclVal');
    const resinEl = document.getElementById('stageResinVal');
    const xrayBtn = document.getElementById('stageXrayToggle');

    if (!tabs.length || !stageImg) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const key = this.getAttribute('data-stage-key');
        const data = stageData[key];
        if (!data) return;

        // Animate stage transition
        if (stageImgWrap) {
          stageImgWrap.style.transform = 'scale(0.85) rotateY(15deg)';
          stageImgWrap.style.opacity = '0.5';
        }

        setTimeout(() => {
          stageImg.src = data.image;
          stageImg.alt = data.name;
          if (titleEl) titleEl.textContent = data.name;
          if (subEl) subEl.textContent = data.subtitle;
          if (descEl) descEl.textContent = data.desc;
          if (weightEl) weightEl.textContent = data.weight;
          if (palletEl) palletEl.textContent = data.pallet;
          if (fclEl) fclEl.textContent = data.fcl;
          if (resinEl) resinEl.textContent = data.resin;

          if (stageImgWrap) {
            stageImgWrap.style.transform = 'scale(1) rotateY(0deg)';
            stageImgWrap.style.opacity = '1';
          }
        }, 220);

        playBeep(440, 0.04);
      });
    });

    if (xrayBtn && stageImgWrap) {
      xrayBtn.addEventListener('click', function () {
        const isActive = stageImgWrap.classList.toggle('xray-active');
        this.textContent = isActive ? 'Disable X-Ray View' : 'Enable Holographic X-Ray';
        playBeep(isActive ? 660 : 330, 0.06);
      });
    }

    // 3D Parallax tilt on stage pedestal
    const pedestal = document.querySelector('.tsh-stage-pedestal');
    if (pedestal && stageImgWrap) {
      pedestal.addEventListener('mousemove', (e) => {
        const rect = pedestal.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        stageImgWrap.style.transform = `perspective(1000px) rotateY(${x * 0.05}deg) rotateX(${-y * 0.05}deg) translateY(-4px)`;
      });

      pedestal.addEventListener('mouseleave', () => {
        stageImgWrap.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)';
      });
    }
  }

  // 3. WHOLESALE MARGIN & FREIGHT ROI ENGINE
  function initRoiCalculator() {
    const slider = document.getElementById('roiVolumeSlider');
    const volumeBadge = document.getElementById('roiVolumeBadge');
    const savingsEl = document.getElementById('roiAnnualSavings');
    const priceEl = document.getElementById('roiPricePerLb');
    const fclFillEl = document.getElementById('roiFclProgress');
    const fclPctEl = document.getElementById('roiFclPct');
    const lockBtn = document.getElementById('roiLockQuoteBtn');

    if (!slider) return;

    function updateCalculator() {
      const volume = parseInt(slider.value, 10);
      if (volumeBadge) {
        volumeBadge.textContent = `${volume.toLocaleString()} lbs / mo`;
      }

      // Dynamic price tiering formula
      let pricePerLb = 2.10;
      if (volume >= 40000) pricePerLb = 1.35;
      else if (volume >= 20000) pricePerLb = 1.55;
      else if (volume >= 10000) pricePerLb = 1.75;
      else if (volume >= 5000) pricePerLb = 1.90;

      // Typical domestic distributor price is $3.20/lb
      const distributorCost = volume * 3.20 * 12;
      const tshCost = volume * pricePerLb * 12;
      const annualSavings = Math.round(distributorCost - tshCost);

      if (priceEl) priceEl.textContent = `$${pricePerLb.toFixed(2)}`;
      if (savingsEl) savingsEl.textContent = `$${annualSavings.toLocaleString()}`;

      // FCL capacity (40,000 lbs = 100% full 20ft container load)
      const fclCapacity = Math.min(Math.round((volume / 40000) * 100), 100);
      if (fclFillEl) fclFillEl.style.width = `${fclCapacity}%`;
      if (fclPctEl) fclPctEl.textContent = `${fclCapacity}% FCL Capacity`;
    }

    slider.addEventListener('input', updateCalculator);
    updateCalculator();

    if (lockBtn) {
      lockBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const contactSection = document.getElementById('contact');
        const inquiryMsg = document.getElementById('inquiryMessage');
        const inquiryProduct = document.getElementById('inquiryProduct');

        if (inquiryMsg) {
          inquiryMsg.value = `[ROI Lock Quote] Monthly volume: ${slider.value} lbs. Estimated price: ${priceEl ? priceEl.textContent : ''}/lb. Interested in container logistics.`;
        }
        if (inquiryProduct) {
          inquiryProduct.value = 'Full Container Load (Mixed Products)';
        }

        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        playBeep(520, 0.08);
      });
    }
  }

  // 4. LABORATORY SPECTRAL ANALYSIS TERMINAL
  const spectralData = {
    'c3c4': {
      title: 'C3 / C4 Stable Carbon Isotope Ratio Spectrometry',
      desc: 'Measures delta 13C isotope ratios (VPDB -25.8‰) to mathematically guarantee zero corn syrup, cane sugar, or industrial invert syrups. Adulteration threshold: < -23.5‰.',
      badge: '100% Purity Verified // Zero Added Sugar',
      heights: [85, 90, 75, 95, 80, 88, 92, 78, 85, 90, 95, 82]
    },
    'pollen': {
      title: 'Melissopalynology Microscopic Pollen Origin Spectrum',
      desc: 'High-magnification pollen morphology validation proves genuine multi-floral botanical reserves and confirms exact geographic origin without blending trickery.',
      badge: 'Botanical Origin Authenticated',
      heights: [45, 60, 85, 100, 70, 55, 90, 65, 80, 75, 60, 70]
    },
    'hrms': {
      title: 'High-Resolution Mass Spectrometry (HRMS Screening)',
      desc: 'Mass-to-charge spectrometer analyzes chemical fractions down to parts-per-billion, guaranteeing zero synthetic pesticides, heavy metals, or antibiotics.',
      badge: 'Zero Residues Detected (< 0.01 ppb)',
      heights: [20, 15, 30, 25, 10, 15, 20, 12, 18, 15, 22, 14]
    },
    'nmr': {
      title: 'Nuclear Magnetic Resonance Molecular Profiling (NMR)',
      desc: 'Produces a comprehensive molecular resonance fingerprint of amino acids, organic acids, and sugars, validating pure unadulterated non-crystallizing liquid gold.',
      badge: 'Resonance Fingerprint Match: 99.8%',
      heights: [70, 85, 65, 95, 100, 80, 75, 90, 85, 95, 70, 88]
    }
  };

  function initSpectralTerminal() {
    const tabs = document.querySelectorAll('.tsh-test-tab');
    const titleEl = document.getElementById('spectralTitle');
    const descEl = document.getElementById('spectralDesc');
    const badgeEl = document.getElementById('spectralBadge');
    const graphContainer = document.getElementById('spectralGraph');

    if (!tabs.length || !graphContainer) return;

    // Build 12 spectral bars
    graphContainer.innerHTML = '';
    const bars = [];
    for (let i = 0; i < 12; i++) {
      const bar = document.createElement('div');
      bar.className = 'tsh-spectral-bar';
      bar.style.height = '40%';
      graphContainer.appendChild(bar);
      bars.push(bar);
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const key = this.getAttribute('data-test-key');
        const data = spectralData[key];
        if (!data) return;

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (badgeEl) badgeEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display:inline-block; vertical-align:middle; margin-right:6px;"><path d="M20 6L9 17l-5-5"/></svg>${data.badge}`;

        bars.forEach((bar, idx) => {
          const h = data.heights[idx] || 50;
          bar.style.height = `${h}%`;
        });

        playBeep(580, 0.05);
      });
    });

    // Initial state trigger
    if (tabs[0]) tabs[0].click();
  }

  // 5. LIVE METRIC NUMBER ROLLING COUNTERS
  function initCounters() {
    const statCards = document.querySelectorAll('.tsh-trust-stat');
    if (!statCards.length) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateStatCounters();
        }
      });
    }, { threshold: 0.25 });

    const trustBar = document.querySelector('.tsh-trust-bar');
    if (trustBar) observer.observe(trustBar);

    function animateStatCounters() {
      statCards.forEach((card, index) => {
        const numEl = card.querySelector('.tsh-trust-stat-num');
        if (!numEl) return;

        if (index === 0) animateValue(numEl, 0, 17, 1400, '<span>+</span>');
        else if (index === 1) animateValue(numEl, 0, 100, 1600, '<span>%</span>');
        else if (index === 2) animateValue(numEl, 1, 4, 1000, '<span>-Tier</span>');
        else if (index === 3) animateValue(numEl, 0, 3000, 1800, '<span>lb</span>', true);
      });
    }

    function animateValue(element, start, end, duration, suffix = '', useComma = false) {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        const formatted = useComma ? current.toLocaleString() : current;
        element.innerHTML = `${formatted}${suffix}`;

        if (progress < 1) requestAnimationFrame(update);
        else element.innerHTML = `${useComma ? end.toLocaleString() : end}${suffix}`;
      }

      requestAnimationFrame(update);
    }
  }

  // 6. INSTANT CATALOG COMMODITY SEARCH
  function initCatalogSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    const cards = document.querySelectorAll('.tsh-catalog-card');

    if (!searchInput || !cards.length) return;

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      cards.forEach(card => {
        const keywords = card.getAttribute('data-keywords') || '';
        const name = card.querySelector('.tsh-catalog-name')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.tsh-catalog-desc')?.textContent.toLowerCase() || '';

        const isMatch = !query || keywords.includes(query) || name.includes(query) || desc.includes(query);

        card.style.display = isMatch ? 'flex' : 'none';
        card.style.opacity = isMatch ? '1' : '0';
      });
    });
  }

  // 7. SCROLL REVEAL OBSERVER
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.tsh-reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    document.querySelectorAll('.tsh-reveal').forEach(el => observer.observe(el));
  }

  // 8. HEADER SCROLL & BACK TO TOP
  function initNavAndScroll() {
    const header = document.querySelector('.tsh-header');
    const topBtn = document.getElementById('backToTopBtn');
    const toggleBtn = document.querySelector('.tsh-mobile-toggle');
    const navMenu = document.querySelector('.tsh-nav-menu');

    window.addEventListener('scroll', () => {
      if (header) {
        if (window.scrollY > 30) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
      }
      if (topBtn) {
        if (window.scrollY > 450) topBtn.classList.add('visible');
        else topBtn.classList.remove('visible');
      }
    }, { passive: true });

    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.innerHTML = isOpen ? '&times;' : '&#9776;';
      });

      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.innerHTML = '&#9776;';
        });
      });
    }
  }

  // 9. WEB AUDIO API SOUND GENERATOR (Tactile Click Effects)
  let audioCtx = null;
  let soundEnabled = true;

  function playBeep(freq, duration) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }
  window.playTshBeep = playBeep;

  function initAudioToggle() {
    const toggleBtn = document.getElementById('soundToggleBtn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      this.classList.toggle('is-active', soundEnabled);
      this.innerHTML = soundEnabled 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Audio: ON`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> Audio: MUTED`;

      if (soundEnabled) playBeep(600, 0.05);
    });
  }

  // DOM READY INITIALIZATION
  document.addEventListener('DOMContentLoaded', function () {
    initFluidCanvas();
    initPackagingStage();
    initRoiCalculator();
    initSpectralTerminal();
    initCounters();
    initCatalogSearch();
    initScrollReveal();
    initNavAndScroll();
    initAudioToggle();
  });
})();
