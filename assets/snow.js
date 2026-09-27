(() => {
  if (document.querySelector('.snowfall')) return;
  const snow = document.createElement('div');
  snow.className = 'snowfall';
  snow.setAttribute('aria-hidden', 'true');
  const flakes = document.createDocumentFragment();
  for (let i = 0; i < 34; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    // Deterministic spacing and varied speeds give a gentle, irregular drift.
    const values = {
      '--x': `${(i * 37.7) % 100}%`,
      '--size': `${2 + (i % 4)}px`,
      '--duration': `${24 + (i * 7) % 23}s`,
      '--delay': `${-((i * 11) % 47)}s`,
      '--drift': `${(i % 2 ? 1 : -1) * (18 + (i * 13) % 60)}px`,
      '--opacity': `${0.18 + (i % 4) * 0.06}`
    };
    Object.entries(values).forEach(([key, value]) => flake.style.setProperty(key, value));
    flakes.append(flake);
  }
  snow.append(flakes);
  document.body.prepend(snow);
  function pauseWhenHidden() {
    snow.querySelectorAll('.snowflake').forEach(flake => {
      flake.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  }
  document.addEventListener('visibilitychange', pauseWhenHidden);
  pauseWhenHidden();
})();
