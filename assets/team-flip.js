(() => {
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('[data-persona-card]').forEach(card => {
    const front = card.querySelector('.persona-front');
    const back = card.querySelector('.persona-back');
    const control = card.querySelector('.flip-control');
    const label = control.querySelector('[data-flip-label]');
    let flipped = false;
    let pinned = false;
    let hovering = false;
    function show(person) {
      flipped = person;
      card.classList.toggle('is-flipped', person);
      front.inert = person;
      back.inert = !person;
      front.setAttribute('aria-hidden', String(person));
      back.setAttribute('aria-hidden', String(!person));
      label.textContent = person ? `Back to ${card.dataset.persona}` : 'Meet the person';
      control.setAttribute('aria-label', person ? `Show ${card.dataset.persona}'s persona` : `Meet the person behind ${card.dataset.persona}`);
    }
    card.addEventListener('mouseenter', () => {
      if (!hover.matches) return;
      hovering = true;
      show(true);
    });
    card.addEventListener('mouseleave', () => {
      hovering = false;
      if (!pinned && !back.contains(document.activeElement)) show(false);
    });
    control.addEventListener('click', () => {
      pinned = !flipped;
      show(pinned);
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape' && flipped) {
        control.focus();
        pinned = false;
        show(false);
      }
    });
    card.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!hovering && !pinned && !back.contains(document.activeElement)) show(false);
      });
    });
    show(false);
  });
})();
