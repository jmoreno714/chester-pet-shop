// Chester Pet Shop — stepper elástico de cantidad en la ficha de producto,
// adaptado de "Stepper that gives" (bencho.dev/finds/vishal-elastic-stepper).
// Mantener apretado un lado suma/resta seguido y el número se corre hacia
// ese lado, estirando el punto; al soltar vuelve al centro con un rebote.
// Sin física a mano (ver el lío del selector magnético) — todo el
// movimiento lo hace una transición CSS entre dos estados fijos.

(function () {
  const root = document.getElementById('pd-qty-elastic');
  if (!root) return;

  const knob = document.getElementById('pd-qty');
  const signs = root.querySelectorAll('.qty-elastic-sign');

  const MIN = 1;
  const OFFSET = 16; // px que se corre el número hacia el lado apretado
  const HOLD_DELAY = 380; // ms antes de empezar a repetir
  const HOLD_STEP = 110; // ms entre pasos mientras se mantiene apretado

  let qty = parseInt(knob.textContent, 10) || 1;
  let holdTimeout = 0;
  let holdInterval = 0;

  function step(dir) {
    qty = Math.max(MIN, qty + dir);
    knob.textContent = qty;
  }

  function press(dir) {
    root.style.setProperty('--kx', dir * OFFSET + 'px');
    root.style.setProperty('--ks', '1.18');
    root.classList.add('is-pressed');
    step(dir);
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdTimeout = setTimeout(() => {
      holdInterval = setInterval(() => step(dir), HOLD_STEP);
    }, HOLD_DELAY);
  }

  function release() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
    holdTimeout = 0;
    holdInterval = 0;
    root.classList.remove('is-pressed');
    root.style.setProperty('--kx', '0px');
    root.style.setProperty('--ks', '1');
  }

  signs.forEach((sign) => {
    const dir = parseInt(sign.dataset.dir, 10);
    sign.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      press(dir);
    });
    sign.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        step(dir);
      }
    });
  });

  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
})();
