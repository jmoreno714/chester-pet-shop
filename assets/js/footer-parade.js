// Chester Pet Shop — "trencito" del footer: el gato corre adelante con su pescado
// y el salchicha lo sigue, cruzando el footer de derecha a izquierda sobre la línea
// del pie. Van dejando huellitas que se desvanecen.
// Decorativo: aria-hidden, detrás del contenido, se pausa cuando el footer no se ve
// y con "reducir movimiento" quedan quietos en una esquina.

(function () {
  const footer = document.querySelector('.site-footer');
  const line = footer && footer.querySelector('.fine-print');
  if (!footer || !line) return;

  const lane = document.createElement('div');
  lane.className = 'footer-parade';
  lane.setAttribute('aria-hidden', 'true');
  lane.innerHTML = `
    <div class="parade-trail"></div>
    <div class="parade-pet parade-cat"><div class="parade-bob"><img src="assets/img/gato-promesas.png" alt=""></div></div>
    <div class="parade-pet parade-dog"><div class="parade-bob">
      <img class="parade-dog-cola" src="assets/img/perro-cta-cola.png" alt="">
      <img src="assets/img/perro-cta-cuerpo.png" alt="">
    </div></div>`;
  line.parentNode.insertBefore(lane, line);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) { lane.classList.add('is-still'); return; }

  const trail = lane.querySelector('.parade-trail');
  const cat = lane.querySelector('.parade-cat');
  const dog = lane.querySelector('.parade-dog');
  const SPEED = 62;          // px por segundo: un paseo tranquilo
  const GAP = 46;            // separación entre el gato y el perro
  const STEP = 34;           // cada cuántos px el perro deja una huellita
  let x = 0, last = 0, running = false, lastPrint = 0, side = 1, raf = 0;

  const size = () => ({ W: lane.clientWidth, cw: cat.offsetWidth, dw: dog.offsetWidth });
  const place = () => { const { cw } = size(); cat.style.transform = `translateX(${x}px)`; dog.style.transform = `translateX(${x + cw + GAP}px)`; };
  const restart = () => { x = size().W + 20; lastPrint = x; place(); };

  function print(px) {
    const p = document.createElement('span');
    p.className = 'parade-paw';
    p.style.left = `${px}px`;
    p.style.bottom = side > 0 ? '3px' : '9px';
    side = -side;
    trail.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }

  function frame(t) {
    if (!running) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    const { cw, dw } = size();
    x -= SPEED * dt;
    place(); // el gato va adelante (a la izquierda), el perro atrás
    // huellitas bajo las patas delanteras del perro
    const dogFront = x + cw + GAP + dw * 0.18;
    if (lastPrint - dogFront >= STEP) { print(dogFront); lastPrint = dogFront; }
    if (x + cw + GAP + dw < -20) restart(); // salieron por la izquierda: vuelven a entrar por la derecha
    raf = requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; last = 0; lane.classList.add('is-walking'); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); lane.classList.remove('is-walking'); }

  restart();
  // solo camina mientras el footer está en pantalla (y la pestaña visible)
  let inView = false;
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; inView ? start() : stop(); }, { rootMargin: '80px' }).observe(lane);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (inView) start(); });
  reduce.addEventListener('change', (e) => { if (e.matches) { stop(); lane.classList.add('is-still'); } });
})();
