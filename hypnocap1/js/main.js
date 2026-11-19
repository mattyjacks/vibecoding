/**
 * HYPNOCAP - MAGIC SALES ENGINE
 * Interactive Hypnosis Canvas, Cursor Spark Trails, ROI Calculator & Dynamic Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hypnotic Particle Canvas System
  initHypnoCanvas();

  // 2. Magic Wand Cursor Sparks
  initMagicCursor();

  // 3. Navbar Scroll Observer
  initNavbarScroll();

  // 4. Interactive ROI Spell Calculator (if present on page)
  initSpellCalculator();

  // 5. FAQ Accordions (if present)
  initFaqAccordion();

  // 6. Mobile Menu Toggle
  initMobileMenu();

  // 7. Interactive Casting Contact Form
  initContactForm();
});

/* -------------------------------------------------------------
   1. Hypnotic Starfield & Spiral Particle Canvas
   ------------------------------------------------------------- */
function initHypnoCanvas() {
  const canvas = document.getElementById('hypno-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width < 768 ? 45 : 95, 120);

  const colors = [
    'rgba(168, 85, 247, 0.7)',  // purple
    'rgba(236, 72, 153, 0.7)',  // pink
    'rgba(251, 191, 36, 0.7)',  // gold
    'rgba(6, 182, 212, 0.6)'    // cyan
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      distCenter: Math.random() * (width / 2)
    });
  }

  let step = 0;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    step += 0.005;

    const centerX = width / 2;
    const centerY = height / 2;

    particles.forEach((p, idx) => {
      // Swirling gravitational pull towards center with gentle drift
      p.angle += p.angularSpeed;
      p.x += p.vx + Math.cos(p.angle) * 0.3;
      p.y += p.vy + Math.sin(p.angle) * 0.3;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();

      // Connect nearby particles with subtle spell threads
      for (let j = idx + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 85) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.18 * (1 - dist / 85)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* -------------------------------------------------------------
   2. Magic Wand Cursor Sparks Trail
   ------------------------------------------------------------- */
function initMagicCursor() {
  let lastX = 0;
  let lastY = 0;
  let throttle = 0;

  window.addEventListener('mousemove', (e) => {
    throttle++;
    if (throttle % 3 !== 0) return; // limit creation rate

    const spark = document.createElement('div');
    spark.className = 'magic-spark';
    spark.style.left = `${e.clientX}px`;
    spark.style.top = `${e.clientY}px`;

    // random sparkle hue
    const palette = ['#fbbf24', '#ec4899', '#c084fc', '#38bdf8'];
    const chosen = palette[Math.floor(Math.random() * palette.length)];
    spark.style.backgroundColor = chosen;
    spark.style.boxShadow = `0 0 10px ${chosen}, 0 0 18px #9333ea`;

    document.body.appendChild(spark);

    setTimeout(() => {
      spark.remove();
    }, 700);
  });
}

/* -------------------------------------------------------------
   3. Navbar Scroll Observer
   ------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* -------------------------------------------------------------
   4. Interactive ROI Spell Calculator
   ------------------------------------------------------------- */
function initSpellCalculator() {
  const agentSlider = document.getElementById('agent-slider');
  const agentCountLabel = document.getElementById('agent-count-val');
  const savingsDisplay = document.getElementById('annual-savings-val');
  const domesticCostDisplay = document.getElementById('domestic-cost-val');
  const hypnoCostDisplay = document.getElementById('hypno-cost-val');

  if (!agentSlider || !savingsDisplay) return;

  function recalculate() {
    const agents = parseInt(agentSlider.value, 10);
    agentCountLabel.textContent = `${agents} Spellcasters`;

    // US/UK average SDR/call center rep cost ~ $58,000/yr loaded
    // HypnoCap Philippines high-tier managed rep ~ $19,500/yr loaded
    const domesticTotal = agents * 58000;
    const hypnoTotal = agents * 19500;
    const savings = domesticTotal - hypnoTotal;

    domesticCostDisplay.textContent = `$${domesticTotal.toLocaleString()} /yr`;
    hypnoCostDisplay.textContent = `$${hypnoTotal.toLocaleString()} /yr`;
    savingsDisplay.textContent = `$${savings.toLocaleString()}`;
  }

  agentSlider.addEventListener('input', recalculate);
  recalculate();
}

/* -------------------------------------------------------------
   5. FAQ Accordion Logic
   ------------------------------------------------------------- */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');
  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const isOpen = parent.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
      });

      if (!isOpen) {
        parent.classList.add('open');
      }
    });
  });
}

/* -------------------------------------------------------------
   6. Mobile Menu Toggle
   ------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex';
    if (isVisible) {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '80px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'rgba(7, 3, 18, 0.98)';
      navLinks.style.padding = '30px 24px';
      navLinks.style.borderBottom = '1px solid rgba(168, 85, 247, 0.3)';
    }
  });
}

/* -------------------------------------------------------------
   7. Contact Form Pre-Processor
   ------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('spell-summon-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value;
    const company = document.getElementById('cf-company').value;
    const phone = document.getElementById('cf-phone').value;
    const notes = document.getElementById('cf-notes').value;

    const notification = document.getElementById('form-status-msg');
    if (notification) {
      notification.innerHTML = `
        <div style="padding: 16px; background: rgba(37, 211, 102, 0.15); border: 1px solid #25d366; border-radius: 12px; color: #86efac; margin-top: 20px;">
          <i class="fa-solid fa-sparkles"></i> <strong>Spell Transmitted!</strong> Your invocation has been channeled to Matt (CTO). Scott Livingston (CEO) has also been pinged via VIP telepathy.
        </div>
      `;
    }

    // Optional direct trigger to email client via mailto fallback
    window.location.href = `mailto:Matt@MattyJacks.com?subject=HypnoCap%20Inquiry%20from%20${encodeURIComponent(name)}%20at%20${encodeURIComponent(company)}&body=Name:%20${encodeURIComponent(name)}%0ACompany:%20${encodeURIComponent(company)}%0APhone:%20${encodeURIComponent(phone)}%0A%0ADetails:%0A${encodeURIComponent(notes)}`;
  });
}
