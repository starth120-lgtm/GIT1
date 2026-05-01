/* ═══════════════════════════════════════════════
   NEXORA AI SYSTEMS — script.js
   Vanilla JavaScript — no frameworks
   Handles: scroll reveal, navbar, hamburger,
   theme toggle, counters, cursor glow, ripple
═══════════════════════════════════════════════ */

'use strict';

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings within the same parent
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 80}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();


/* ─── NAVBAR: add .scrolled class on scroll ─── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run on load in case page is already scrolled
})();


/* ─── HAMBURGER / MOBILE MENU ─── */
(function initMobileMenu() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ─── DARK / LIGHT MODE TOGGLE ─── */
(function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const root = document.documentElement;

  if (!btn) return;

  // Restore saved preference
  const saved = localStorage.getItem('nexora-theme');
  if (saved) root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('nexora-theme', next);
  });
})();


/* ─── ANIMATED COUNTERS ─── */
(function initCounters() {
  // Covers both the hero dashboard mock stats and the metrics section
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuart(progress) * target);

      // Format large numbers with commas
      el.textContent = value >= 1000
        ? value.toLocaleString('en-US')
        : String(value);

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Trigger each counter only once when it enters the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach((el) => observer.observe(el));
})();


/* ─── CURSOR GLOW (desktop only) ─── */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = -1000;
  let mouseY = -1000;
  let currentX = -1000;
  let currentY = -1000;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Smooth lerp instead of CSS transition for more fluid movement
  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    currentX = lerp(currentX, mouseX, 0.1);
    currentY = lerp(currentY, mouseY, 0.1);
    glow.style.left = `${currentX}px`;
    glow.style.top  = `${currentY}px`;
    rafId = requestAnimationFrame(loop);
  }

  loop();

  // Clean up if needed
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
})();


/* ─── SMOOTH SCROLL for anchor links ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id  = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ─── RIPPLE EFFECT on .ripple buttons/links ─── */
(function initRipple() {
  document.querySelectorAll('.ripple').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Remove any old ripple span
      el.querySelectorAll('.ripple-circle').forEach((r) => r.remove());

      const rect   = el.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.5;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const circle = document.createElement('span');
      circle.classList.add('ripple-circle');
      Object.assign(circle.style, {
        position  : 'absolute',
        width     : `${size}px`,
        height    : `${size}px`,
        top       : `${y}px`,
        left      : `${x}px`,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        transform : 'scale(0)',
        animation : 'rippleAnim 0.55s ease-out forwards',
        pointerEvents: 'none',
      });

      el.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Inject keyframe if not already present
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ─── ACTIVE NAV LINK on scroll (highlight section in view) ─── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((s) => observer.observe(s));

  // Inject active link style
  if (!document.getElementById('active-nav-style')) {
    const style = document.createElement('style');
    style.id = 'active-nav-style';
    style.textContent = `.nav-links a.active { color: var(--text-primary) !important; background: var(--surface) !important; }`;
    document.head.appendChild(style);
  }
})();


/* ─── MARQUEE: pause on hover ─── */
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
    track.querySelectorAll('.marquee-inner').forEach((el) => {
      el.style.animationPlayState = 'paused';
    });
  });

  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
    track.querySelectorAll('.marquee-inner').forEach((el) => {
      el.style.animationPlayState = 'running';
    });
  });
})();


/* ─── PRICING CARD hover depth effect ─── */
(function initPricingTilt() {
  const cards = document.querySelectorAll('.pricing-card, .service-card, .testi-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -4; // degrees
      const tiltY = dx *  4;

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();