// Chester Pet Shop — el gato de "Por qué te conviene" persigue al cursor por
// toda la sección (título, íconos y textos, de borde a borde), en X y en Y.
// Afuera de la sección vuelve a su lugar de descanso.
//
// Se mueve con un resorte (no con una transición CSS): una transición se
// reinicia en cada pointermove y el gato frena y arranca; el resorte guarda
// la velocidad y lo sigue con un poco de retraso, como un gato de verdad.
// Además mira hacia donde corre (se da vuelta) y se inclina según la
// velocidad. Solo con mouse: en touch y con "reducir movimiento" queda quieto.

(function () {
  const grid = document.querySelector('.promise-grid');
  const cat = document.querySelector('.promise-cat');
  if (!grid || !cat) return;
  const area = grid.closest('section') || grid;

  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  if (mq('(prefers-reduced-motion: reduce)') || !mq('(hover: hover) and (pointer: fine)')) return;

  const TILT = -8; // inclinación de reposo, la misma del diseño
  const STIFF = 120; // rigidez del resorte
  const DAMP = 2 * Math.sqrt(STIFF) * 0.82; // un pelito por debajo de crítico: casi sin rebote

  // posición actual (p), velocidad (v) y objetivo (t), en px relativos al
  // lugar de descanso del gato (top/left que le da el CSS dentro de la grilla)
  let px = 0, py = 0, vx = 0, vy = 0, tx = 0, ty = 0;
  let face = 1, faceTarget = 1; // 1 = mira a la derecha (como la imagen), -1 = izquierda
  let raf = 0, last = 0;

  const render = () => {
    const tilt = Math.max(-12, Math.min(12, vy * 0.02)) * face + TILT;
    cat.style.transform =
      `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scaleX(${face.toFixed(3)})`;
  };

  const tick = (now) => {
    const dt = Math.min(0.032, (now - (last || now)) / 1000 || 0.016);
    last = now;

    vx += (STIFF * (tx - px) - DAMP * vx) * dt;
    vy += (STIFF * (ty - py) - DAMP * vy) * dt;
    px += vx * dt;
    py += vy * dt;

    // se da vuelta solo si corre con ganas, así no tiembla con movimientos chicos
    if (vx > 60) faceTarget = 1;
    else if (vx < -60) faceTarget = -1;
    // ya de vuelta en casa y casi frenado: se acomoda mirando a la derecha, como en el diseño
    if (!tx && !ty && Math.abs(vx) < 30 && Math.abs(px) < 4) faceTarget = 1;
    face += (faceTarget - face) * Math.min(1, dt * 14);

    render();

    const quieto =
      Math.abs(tx - px) < 0.3 && Math.abs(ty - py) < 0.3 &&
      Math.abs(vx) < 2 && Math.abs(vy) < 2 && Math.abs(faceTarget - face) < 0.01;
    if (quieto) {
      px = tx; py = ty; vx = vy = 0; face = faceTarget;
      render();
      raf = 0; last = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const a = area.getBoundingClientRect();
      const inside =
        e.clientX >= a.left && e.clientX <= a.right &&
        e.clientY >= a.top && e.clientY <= a.bottom;

      if (!inside) {
        if (tx || ty) { tx = 0; ty = 0; faceTarget = 1; wake(); }
        return;
      }

      // el lugar de descanso del gato en pantalla, sin el transform actual
      const g = grid.getBoundingClientRect();
      const homeX = g.left + cat.offsetLeft;
      const homeY = g.top + cat.offsetTop;
      const w = cat.offsetWidth, h = cat.offsetHeight;

      // centro del gato sobre el cursor, sin salirse de la sección: de alto
      // toda la sección, de ancho la columna de contenido (.wrap), no la pantalla
      const c = (grid.parentElement || grid).getBoundingClientRect();
      const x = Math.max(c.left, Math.min(c.right - w, e.clientX - w / 2));
      const y = Math.max(a.top, Math.min(a.bottom - h, e.clientY - h / 2));
      tx = x - homeX;
      ty = y - homeY;
      wake();
    },
    { passive: true }
  );

  // si la ventana pierde el mouse (sale del navegador), vuelve a casa
  document.documentElement.addEventListener('mouseleave', () => {
    tx = 0; ty = 0; faceTarget = 1; wake();
  });
})();
