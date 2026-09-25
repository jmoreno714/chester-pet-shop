// Chester Pet Shop — el gato de "Por qué te conviene" sigue al cursor en
// horizontal, libre entre los tres íconos, con la misma transición suave
// que usan los círculos (promise-lean.js). El límite es el bloque entero
// de las 3 razones (debajo del título): adentro sigue al mouse en X,
// afuera vuelve a su lugar de descanso.

(function () {
  const grid = document.querySelector('.promise-grid');
  const cat = document.querySelector('.promise-cat');
  if (!grid || !cat) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CAT_W = cat.offsetWidth || 56;

  let rect = grid.getBoundingClientRect();
  let restLeft = Math.max(0, rect.width / 3 - CAT_W / 2 - 10);
  cat.style.left = restLeft + 'px';

  window.addEventListener('resize', () => {
    rect = grid.getBoundingClientRect();
    restLeft = Math.max(0, rect.width / 3 - CAT_W / 2 - 10);
  });

  if (reduced) return;

  let raf = 0;
  let inside = false;

  document.addEventListener(
    'pointermove',
    (e) => {
      rect = grid.getBoundingClientRect();
      const within =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!within) {
        if (inside) {
          inside = false;
          cat.style.left = restLeft + 'px';
        }
        return;
      }
      inside = true;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = Math.min(rect.width - CAT_W, Math.max(0, e.clientX - rect.left - CAT_W / 2));
        cat.style.left = x + 'px';
      });
    },
    { passive: true }
  );
})();
