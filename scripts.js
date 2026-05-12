(function () {

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ─── CUSTOM CURSOR ────────────────────────────────────────── */
  if (!window.matchMedia('(hover: none)').matches) {
    document.body.classList.add('has-cursor');

    const dot  = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    document.addEventListener('mousedown', () => dot.classList.add('cursor-dot--click'));
    document.addEventListener('mouseup',   () => dot.classList.remove('cursor-dot--click'));
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

    function addHover(el) {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--hover'));
    }

    document.querySelectorAll('a, button, [role="button"]').forEach(addHover);

    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches('a, button')) addHover(node);
        node.querySelectorAll && node.querySelectorAll('a, button').forEach(addHover);
      }));
    }).observe(document.body, { childList: true, subtree: true });

    (function animateRing() {
      ringX = lerp(ringX, mouseX, 0.13);
      ringY = lerp(ringY, mouseY, 0.13);
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();
  }

  /* ─── SCROLL REVEAL ────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ─── STAT COUNTER ANIMATION ───────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, target, suffix, duration) {
    duration = duration || 1600;
    const start = performance.now();

    (function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = easeOutCubic(progress);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  const counterEls = document.querySelectorAll('.stat-n[data-count]');

  if (counterEls.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counterEls.forEach((el) => counterObs.observe(el));
  }

  /* ─── HERO AMBIENT ORBS ────────────────────────────────────── */
  const heroSection = document.querySelector('.hero');
  const heroGlows   = document.querySelectorAll('.hero-glow');

  if (heroSection && heroGlows.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const orbConfig = [
      { floatAx: 28, floatAy: 22, floatSpeed: 0.00055, floatPhase: 0,              parallaxX:  50, parallaxY:  38 },
      { floatAx: 20, floatAy: 30, floatSpeed: 0.00042, floatPhase: Math.PI * 0.65, parallaxX: -42, parallaxY: -32 },
      { floatAx: 24, floatAy: 18, floatSpeed: 0.00062, floatPhase: Math.PI * 1.3,  parallaxX:  32, parallaxY:  48 }
    ];

    let targetMx = 0, targetMy = 0, smoothMx = 0, smoothMy = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      targetMx = (e.clientX - r.left)  / r.width  - 0.5;
      targetMy = (e.clientY - r.top)   / r.height - 0.5;
    });

    heroSection.addEventListener('mouseleave', () => { targetMx = 0; targetMy = 0; });

    (function animateGlows(timestamp) {
      smoothMx = lerp(smoothMx, targetMx, 0.032);
      smoothMy = lerp(smoothMy, targetMy, 0.032);

      heroGlows.forEach((orb, i) => {
        const c  = orbConfig[i];
        const fx = Math.sin(timestamp * c.floatSpeed + c.floatPhase) * c.floatAx;
        const fy = Math.cos(timestamp * c.floatSpeed * 0.75 + c.floatPhase) * c.floatAy;
        orb.style.transform = `translate(${fx + smoothMx * c.parallaxX}px, ${fy + smoothMy * c.parallaxY}px)`;
      });

      requestAnimationFrame(animateGlows);
    })(performance.now());
  }

  /* ─── HAMBURGER MENU ──────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('nav')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ─── CARD SHIMMER ─────────────────────────────────────────── */
  document.querySelectorAll('.project-feature').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--card-mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--card-my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

})();
