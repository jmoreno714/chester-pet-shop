// Chester Pet Shop — los círculos de "Por qué te conviene" se corren unos
// pocos píxeles hacia el cursor cuando pasa cerca. Sin física de resorte:
// solo distancia al centro + una transición CSS, para que sea liviano y
// no tenga forma de "explotar" numéricamente.

(function () {
  const badges = Array.from(document.querySelectorAll('.promise-badge-wrap'));
  if (!badges.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const REACH = 90; // px desde el centro del círculo donde el lean llega al máximo
  const MAX = 6; // px que se desplaza como mucho

  let raf = 0;
  document.addEventListener(
    'pointermove',
    (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        badges.forEach((el) => {
          const b = el.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2);
          const dy = e.clientY - (b.top + b.height / 2);
          const d = Math.hypot(dx, dy);
          const pull = Math.max(0, 1 - d / REACH);
          const x = pull ? (dx / d) * pull * MAX : 0;
          const y = pull ? (dy / d) * pull * MAX : 0;
          el.style.setProperty('--lx', x.toFixed(2) + 'px');
          el.style.setProperty('--ly', y.toFixed(2) + 'px');
        });
      });
    },
    { passive: true }
  );
})();
