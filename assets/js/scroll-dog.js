// Chester Pet Shop — barrita fija abajo con un perro con correa que camina de
// izquierda a derecha a medida que se baja por la página (su posición = cuánto
// bajaste). Mueve las patas solo mientras avanza; si subís, se da vuelta y vuelve.
// Decorativa (aria-hidden), finita y sin capturar clicks.

(function () {
  const bar = document.createElement('div');
  bar.className = 'scroll-dog';
  bar.setAttribute('aria-hidden', 'true');
  // perro de perfil mirando a la derecha; la correa sale hacia arriba y la corta el borde de la barra
  bar.innerHTML = `
    <svg class="scroll-dog-svg" viewBox="0 0 64 40" overflow="visible">
      <path class="sd-leash" d="M45 16 C 40 4, 30 -8, 18 -26" />
      <g class="sd-body">
        <g class="sd-leg sd-far" data-o="22 26"><rect x="19" y="25" width="5" height="14" rx="2.2"/></g>
        <g class="sd-leg sd-far" data-o="41 26"><rect x="38.5" y="25" width="5" height="14" rx="2.2"/></g>
        <path class="sd-tail" d="M16 19 Q 11 14 12 6" />
        <rect x="13" y="15" width="34" height="14" rx="7"/>
        <path d="M38 22 L 42 9 L 50 9 L 49 22 Z"/>
        <ellipse cx="49" cy="10.5" rx="6.6" ry="6"/>
        <ellipse cx="55.5" cy="13" rx="5.8" ry="3.4"/>
        <path d="M44 7 L 46 -1 L 49.5 6 Z"/>
        <path class="sd-collar" d="M42.2 13.4 Q 45.5 17.2 49.8 15.6" />
        <g class="sd-leg" data-o="17 26"><rect x="14.5" y="25" width="5" height="14" rx="2.2"/></g>
        <g class="sd-leg" data-o="44 26"><rect x="41.5" y="25" width="5" height="14" rx="2.2"/></g>
      </g>
    </svg>`;
  document.body.appendChild(bar);
  document.documentElement.classList.add('has-scroll-dog');

  const svg = bar.querySelector('svg');
  const body = bar.querySelector('.sd-body');
  const legs = [...bar.querySelectorAll('.sd-leg')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let x = 0, target = 0, phase = 0, facing = 1, raf = 0;

  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  const track = () => Math.max(0, bar.clientWidth - svg.getBoundingClientRect().width - 16);

  function draw(step) {
    // patas en diagonal: delantera cercana con trasera lejana, y al revés
    const swing = Math.sin(phase) * 24 * step;
    legs.forEach((leg, i) => {
      const [ox, oy] = leg.dataset.o.split(' ');
      const s = i === 1 || i === 2 ? swing : -swing;
      leg.setAttribute('transform', `rotate(${s.toFixed(1)} ${ox} ${oy})`);
    });
    body.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(phase)) * 1.2 * step).toFixed(2)})`);
    svg.style.transform = `translateX(${(8 + x).toFixed(1)}px) scaleX(${facing})`;
  }

  function tick() {
    const dx = target - x;
    if (reduce.matches) { x = target; draw(0); raf = 0; return; }
    x += dx * 0.12;                                  // camina hacia su lugar, no salta
    if (Math.abs(dx) > 0.5) facing = dx > 0 ? 1 : -1;
    phase += Math.min(Math.abs(dx) * 0.12, 6) * 0.22; // las patas avanzan según lo que camina
    const walking = Math.min(1, Math.abs(dx) / 6);
    draw(walking);
    if (Math.abs(dx) > 0.3) raf = requestAnimationFrame(tick);
    else { x = target; draw(0); raf = 0; }
  }

  function update() {
    target = progress() * track();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
  x = target; draw(0);
})();
