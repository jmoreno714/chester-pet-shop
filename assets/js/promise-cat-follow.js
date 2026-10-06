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

  // se mueve con transform (no con left) para no recalcular el layout en
  // cada cuadro; la inclinación de -8° es parte del mismo transform
  const mover = (x) => { cat.style.transform = `translateX(${x}px) rotate(-8deg)`; };

  // en reposo arranca pegado al borde izquierdo del bloque, antes del primer ícono
  let rect = grid.getBoundingClientRect();
  const restLeft = 0;
  mover(restLeft);

  window.addEventListener('resize', () => {
    rect = grid.getBoundingClientRect();
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
          mover(restLeft);
        }
        return;
      }
      inside = true;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = Math.min(rect.width - CAT_W, Math.max(0, e.clientX - rect.left - CAT_W / 2));
        mover(x);
      });
    },
    { passive: true }
  );
})();
