(() => {
  const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (document.querySelector('.cursor-glow')) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.prepend(glow);
  let frame = null;
  let x = 0;
  let y = 0;
  function hide() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    glow.classList.remove('is-visible');
  }
  document.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;
      glow.classList.add('is-visible');
      frame = null;
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  enabled.addEventListener('change', hide);
})();
