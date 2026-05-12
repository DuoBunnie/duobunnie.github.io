(function () {
  // Only activate on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.body.classList.add('has-cursor');

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  document.addEventListener('mousedown', () => dot.classList.add('cursor-dot--click'));
  document.addEventListener('mouseup',   () => dot.classList.remove('cursor-dot--click'));

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Hover expand on interactive elements
  function addHover(el) {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--hover'));
  }

  document.querySelectorAll('a, button, [role="button"]').forEach(addHover);

  // Observe future DOM additions (e.g. dynamically added links)
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches('a, button, [role="button"]')) addHover(node);
        node.querySelectorAll && node.querySelectorAll('a, button, [role="button"]').forEach(addHover);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  // Smooth ring follow with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animate);
  }

  animate();
})();
