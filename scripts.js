(function () {

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

    function lerp(a, b, t) { return a + (b - a) * t; }

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
    // Fallback: show immediately if IntersectionObserver unavailable
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

})();
