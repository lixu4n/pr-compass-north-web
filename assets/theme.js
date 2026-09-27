(() => {
  'use strict';
  const key = 'compass-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage may be unavailable for local files. */ }
  const carried = new URL(window.location.href).searchParams.get('theme');
  let explicit = valid(carried) ? carried : valid(saved) ? saved : null;
  let theme = explicit || (system.matches ? 'dark' : 'light');

  function syncControls() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
      toggle.querySelector('[data-theme-label]').textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#08172b' : '#f3f8ff';
    // Carry the choice between local HTML files even when file:// storage is isolated.
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!/^(index|team)\.html(?:[?#]|$)/.test(raw)) return;
      const url = new URL(raw, window.location.href);
      url.searchParams.set('theme', theme);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    });
  }
  function apply(value, persist = false) {
    theme = value;
    root.dataset.theme = theme;
    if (persist) {
      explicit = theme;
      try { localStorage.setItem(key, theme); } catch { /* The control still works without storage. */ }
      // Keep a carried preference current when refreshing the second page.
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('theme')) {
          url.searchParams.set('theme', theme);
          window.history.replaceState(null, '', url.href);
        }
      } catch { /* Some local-file browsers restrict history changes. */ }
    }
    syncControls();
  }
  apply(theme, valid(carried));
  document.addEventListener('DOMContentLoaded', () => {
    syncControls();
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      apply(theme === 'dark' ? 'light' : 'dark', true);
    });
  });
  system.addEventListener('change', event => {
    if (!explicit) apply(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    explicit = valid(event.newValue) ? event.newValue : null;
    apply(explicit || (system.matches ? 'dark' : 'light'));
  });
})();
