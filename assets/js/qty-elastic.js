// Chester Pet Shop — stepper elástico de cantidad, adaptado de "Stepper
// that gives" (bencho.dev/finds/vishal-elastic-stepper). Mantener apretado
// un lado suma/resta seguido y el número se corre hacia ese lado,
// estirando el punto; al soltar vuelve al centro con un rebote.
// Sin física a mano (ver el lío del selector magnético): el movimiento es
// una transición CSS entre dos estados fijos.
//
// Sirve para cualquier .qty-elastic de la página, incluso los que se
// crean después (los del carrito): escucha por delegación. Cada paso
// cambia el número del .qty-elastic-knob (mínimo 1) y avisa con un evento
// 'qty-change' (detail.value) que burbujea desde el .qty-elastic.

(function () {
  const MIN = 1;
  const HOLD_DELAY = 380; // ms antes de empezar a repetir
  const HOLD_STEP = 110; // ms entre pasos mientras se mantiene apretado

  let active = null;
  let holdTimeout = 0;
  let holdInterval = 0;

  function step(root, dir) {
    const knob = root.querySelector('.qty-elastic-knob');
    const next = Math.max(MIN, (parseInt(knob.textContent, 10) || MIN) + dir);
    if (String(next) === knob.textContent) return;
    knob.textContent = next;
    root.dispatchEvent(new CustomEvent('qty-change', { bubbles: true, detail: { value: next } }));
  }

  function press(root, dir) {
    release();
    active = root;
    // px que se corre el número hacia el lado apretado
    const offset = Number(root.dataset.offset) || 16;
    root.style.setProperty('--kx', dir * offset + 'px');
    root.style.setProperty('--ks', '1.18');
    root.classList.add('is-pressed');
    step(root, dir);
    holdTimeout = setTimeout(() => {
      holdInterval = setInterval(() => step(root, dir), HOLD_STEP);
    }, HOLD_DELAY);
  }

  function release() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdTimeout = 0;
    holdInterval = 0;
    if (!active) return;
    active.classList.remove('is-pressed');
    active.style.setProperty('--kx', '0px');
    active.style.setProperty('--ks', '1');
    active = null;
  }

  document.addEventListener('pointerdown', (e) => {
    const sign = e.target.closest('.qty-elastic-sign');
    if (!sign) return;
    e.preventDefault();
    press(sign.closest('.qty-elastic'), Number(sign.dataset.dir));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const sign = e.target.closest && e.target.closest('.qty-elastic-sign');
    if (!sign) return;
    e.preventDefault();
    step(sign.closest('.qty-elastic'), Number(sign.dataset.dir));
  });

  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
})();
