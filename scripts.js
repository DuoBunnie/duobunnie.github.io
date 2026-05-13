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
        // Delay on initial load so counter starts after hero fade-in completes (0.52s delay + 0.75s anim)
        const delay = performance.now() < 2000 ? 1350 : 0;
        setTimeout(() => animateCounter(el, target, suffix), delay);
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

  /* ─── GEOMETRIC MOSAIC ────────────────────────────────────────── */
  (function () {
    const grid   = document.getElementById('mosaicGrid');
    if (!grid) return;

    const $count = document.getElementById('mosaicCount');
    const $chaos = document.getElementById('mosaicChaos');

    const PHOTO = 'Assets/Home/Duo Photo.png';

    // Preload photo to get its natural aspect ratio before first build
    let photoAspect = 1;
    const _preload = new Image();
    _preload.onload  = () => { photoAspect = _preload.naturalWidth / _preload.naturalHeight; requestAnimationFrame(build); };
    _preload.onerror = () => requestAnimationFrame(build);
    _preload.src     = PHOTO;

    // Compute background-size and background-position so one photo
    // spans the full N×N grid without distortion (cover-fit, centered).
    // All values are percentages relative to one cell.
    function photoBg(col, row, n, R) {
      let bsW, bsH, bgX, bgY;
      if (R >= 1) {
        // Landscape: fit height to grid, overflow width (center horizontally)
        bsW  = n * R * 100;
        bsH  = n * 100;
        bgX  = (n * R - 1) > 0.001 ? (n * (R - 1) / 2 + col) / (n * R - 1) * 100 : 50;
        bgY  = n > 1 ? row / (n - 1) * 100 : 50;
      } else {
        // Portrait: fit width to grid, overflow height (center vertically)
        const S = 1 / R;
        bsW  = n * 100;
        bsH  = n * S * 100;
        bgX  = n > 1 ? col / (n - 1) * 100 : 50;
        bgY  = (n * S - 1) > 0.001 ? (n * (S - 1) / 2 + row) / (n * S - 1) * 100 : 50;
      }
      return { bsW, bsH, bgX, bgY };
    }

    // Shape border-radius library
    const SHAPES = [
      { br: '50%',           minC: 0    },  // circle
      { br: '__ROUND__',     minC: 0    },  // rounded square (dynamic)
      { br: '50% 50% 0 0',   minC: 0.08 },  // arch top
      { br: '0 0 50% 50%',   minC: 0.08 },  // arch bottom
      { br: '50% 0 0 50%',   minC: 0.08 },  // arch left
      { br: '0 50% 50% 0',   minC: 0.08 },  // arch right
      { br: '100% 0 0 0',    minC: 0.22 },  // quarter TL
      { br: '0 100% 0 0',    minC: 0.22 },  // quarter TR
      { br: '0 0 100% 0',    minC: 0.22 },  // quarter BR
      { br: '0 0 0 100%',    minC: 0.22 },  // quarter BL
      { br: '50% 0 50% 0',   minC: 0.42 },  // leaf diagonal
      { br: '0 50% 0 50%',   minC: 0.42 },  // leaf diagonal alt
      { br: '50% 50% 0 50%', minC: 0.55 },  // pac-man variant
    ];

    function pickShape(r, c) {
      const available = SHAPES.filter(s => c >= s.minC);
      const weights = available.map(s => {
        if (s.br === '50%')       return 0.4 + r * 1.8;
        if (s.br === '__ROUND__') return 0.5 + (1 - r) * 1.2;
        return 0.3 + c * 0.9;
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (let i = 0; i < available.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          const s = available[i];
          return s.br === '__ROUND__' ? `${Math.round(r * 48)}%` : s.br;
        }
      }
      return available[0].br;
    }

    function cellColor(col, row, n) {
      const tx = n > 1 ? col / (n - 1) : 0.5;
      const ty = n > 1 ? row / (n - 1) : 0.5;
      const hue = 348 - (tx + ty) * 0.5 * 26;
      const sat = 44 - ty * 8;
      const lit = 89 - (tx + ty) * 3;
      return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lit.toFixed(1)}%)`;
    }

    function build() {
      const n   = +$count.value;
      const gap = 4;
      const r   = 0.6;
      const c   = +$chaos.value / 100;

      grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
      grid.style.gap = gap + 'px';
      grid.innerHTML = '';

      for (let i = 0; i < n * n; i++) {
        const col  = i % n;
        const row  = Math.floor(i / n);
        const cell = document.createElement('div');
        cell.className = 'mosaic-cell';

        cell.style.borderRadius = pickShape(r, c);
        cell.style.animationDelay = (i * 12) + 'ms';

        if (PHOTO) {
          const { bsW, bsH, bgX, bgY } = photoBg(col, row, n, photoAspect);
          cell.style.backgroundImage    = `url("${PHOTO}")`;
          cell.style.backgroundSize     = `${bsW.toFixed(2)}% ${bsH.toFixed(2)}%`;
          cell.style.backgroundPosition = `${bgX.toFixed(2)}% ${bgY.toFixed(2)}%`;

          // Per-cell pastel overlay hue: low chaos = pink family, high chaos = full spectrum
          const baseHue  = 340;
          const hueRange = 20 + c * 200;
          const tx       = n > 1 ? col / (n - 1) : 0.5;
          const ty       = n > 1 ? row / (n - 1) : 0.5;
          const hue      = baseHue - (tx + ty) * 0.5 * hueRange + (Math.random() - 0.5) * c * 50;
          cell.style.setProperty('--cell-hue', hue.toFixed(0));
        } else {
          cell.style.backgroundColor = cellColor(col, row, n);
        }

        grid.appendChild(cell);
      }

      // Update displayed values
      document.querySelectorAll('.mosaic-val').forEach(el => {
        const inp = document.getElementById(el.dataset.for);
        if (inp) el.textContent = inp.value;
      });
    }

    [$count, $chaos].forEach(el => {
      if (el) el.addEventListener('input', build);
    });

    // Initial build triggered by _preload.onload above
  })();

  /* ─── CARD SHIMMER ─────────────────────────────────────────── */
  document.querySelectorAll('.project-feature').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--card-mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--card-my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

})();
