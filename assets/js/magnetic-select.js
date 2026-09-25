// Chester Pet Shop — "Magnetic select", adaptado del bloque de bencho.dev
// (MIT, bencho.dev/licence) para un sitio sin build step.
//
// El original es React + Framer Motion; acá no hay npm ni bundler, así que
// la física se reescribió a mano con requestAnimationFrame en vez de
// instalar React. Se conserva la idea central: el chip elegido crece y
// TOMA la tinta, y empuja a los demás en línea recta desde su propio
// centro — el empuje no decae con la distancia (así ningún par se achica,
// solo se abren huecos) y sí decae el "aura" que maneja el escalonado y
// la inclinación, para que el campo se sienta viajando hacia afuera en
// vez de moverse todo junto como una placa.
//
// Con 3 chips (triángulo) no hay un centro real — el elegido por defecto
// es el de arriba. Los 3 íconos son los mismos SVG que ya usa la sección
// (no hay fotos de producto todavía, así que no hay "marks" para pedir).

(function () {
  const root = document.getElementById('mag-promises');
  if (!root) return;

  const chips = Array.from(root.querySelectorAll('.mag-chip'));
  const skins = chips.map((c) => c.querySelector('.mag-skin'));
  if (!chips.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // posiciones del triángulo (mismo pitch ~45px que el original)
  const PTS = [[0, -26], [22.5, 13], [-22.5, 13]];
  const CHIP = 44;
  const PITCH = 45;
  const SPREAD = 2.8; // qué tan rápido cae el aura del empuje entre vecinos
  const FADE = 44; // px más allá del borde del cluster donde el "lean" se apaga

  const pull = 0.55, bounceTune = 55, give = 50;
  const grow = 1.16 + 0.22 * pull;
  const room = (CHIP * (grow - 1)) / 2;
  const aura = 3 + 9 * pull;
  const tilt = 5 * pull;
  const cower = 0.04 + 0.09 * pull;
  const zeta = 0.9 - 0.48 * (bounceTune / 100);

  function swing(k, mass) {
    return { k, damping: 2 * Math.sqrt(k * mass) * zeta, mass };
  }

  // resorte simple por canal (posición actual / velocidad / objetivo)
  const chan = () => ({ cur: 0, vel: 0, target: 0, cfg: null });
  const state = chips.map(() => ({
    x: chan(), y: chan(), sx: { ...chan(), cur: 1, target: 1 }, sy: { ...chan(), cur: 1, target: 1 }, r: chan(),
    delay: 0,
  }));

  function stepChannel(ch, dt) {
    const force = -ch.cfg.k * (ch.cur - ch.target) - ch.cfg.damping * ch.vel;
    ch.vel += (force / ch.cfg.mass) * dt;
    ch.cur += ch.vel * dt;
    return Math.abs(ch.cur - ch.target) > 0.02 || Math.abs(ch.vel) > 0.02;
  }

  let selected = 0;
  let raf = 0;
  let prevT = 0;

  function applyField(instant) {
    chips.forEach((chipEl, i) => {
      const on = i === selected;
      const [px, py] = PTS[i];
      const [ax, ay] = PTS[selected];
      const dx = px - ax, dy = py - ay;
      const gap = Math.hypot(dx, dy);
      const far = gap / PITCH;
      const fall = on ? 0 : Math.exp(-(far - 1) / SPREAD);
      const push = on ? 0 : room + aura;
      const ux = gap ? dx / gap : 0;
      const uy = gap ? dy / gap : 0;
      const k = 300 + 280 * (1 - Math.min(far, 3) / 4);

      const s = state[i];
      s.x.target = ux * push;
      s.y.target = uy * push;
      s.sx.target = on ? grow : 1 - cower * fall;
      s.sy.target = on ? grow : 1 - cower * fall;
      s.r.target = ux * tilt * fall;
      s.x.cfg = swing(k, 0.9);
      s.y.cfg = swing(k, 0.9);
      s.sx.cfg = swing(k * 1.24, 0.8);
      s.sy.cfg = swing(k * 0.86, 0.95);
      s.r.cfg = swing(k * 0.8, 1);
      s.delay = reduced ? 0 : far * 22;

      chipEl.setAttribute('data-on', on ? 'true' : 'false');
      chipEl.setAttribute('aria-checked', on ? 'true' : 'false');

      if (instant || reduced) {
        s.x.cur = s.x.target; s.y.cur = s.y.target;
        s.sx.cur = s.sx.target; s.sy.cur = s.sy.target; s.r.cur = s.r.target;
        paint(chipEl, s);
      }
    });
    if (!instant && !reduced && !raf) raf = requestAnimationFrame(tick);
  }

  function paint(chipEl, s) {
    chipEl.style.transform =
      'translate(' + s.x.cur.toFixed(2) + 'px,' + s.y.cur.toFixed(2) + 'px) ' +
      'scale(' + s.sx.cur.toFixed(3) + ',' + s.sy.cur.toFixed(3) + ') ' +
      'rotate(' + s.r.cur.toFixed(2) + 'deg)';
  }

  function tick(t) {
    const dt = prevT ? Math.min(2.5, Math.max(0, (t - prevT) / 16.67)) : 1;
    prevT = t;
    let live = false;
    state.forEach((s, i) => {
      if (s.delay > 0) {
        s.delay -= dt * 16.67;
        live = true;
      } else {
        live = stepChannel(s.x, dt) || live;
        live = stepChannel(s.y, dt) || live;
        live = stepChannel(s.sx, dt) || live;
        live = stepChannel(s.sy, dt) || live;
        live = stepChannel(s.r, dt) || live;
      }
      paint(chips[i], s);
    });
    if (live) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      prevT = 0;
    }
  }

  chips.forEach((chip, i) => {
    chip.addEventListener('click', () => {
      if (i === selected) return;
      selected = i;
      applyField(false);
      const card = document.querySelectorAll('.promise-card')[i];
      if (card) {
        card.classList.add('is-highlighted');
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('is-highlighted'), 900);
      }
    });
  });

  // el cluster entero se inclina un poco hacia el cursor, medido desde su
  // propio centro (no chip por chip) para que no "tiemble" al cruzar de
  // la zona de influencia de un chip a la del vecino
  if (!reduced && give) {
    const hub = { r: 90 };
    let leanRaf = 0;
    let nextLean = { x: 0, y: 0 };
    const publish = () => {
      leanRaf = 0;
      skins.forEach((skin) => {
        skin.style.setProperty('--lx', nextLean.x.toFixed(2) + 'px');
        skin.style.setProperty('--ly', nextLean.y.toFixed(2) + 'px');
      });
    };
    const onMove = (e) => {
      const b = root.getBoundingClientRect();
      const mx = e.clientX - b.left - b.width / 2;
      const my = e.clientY - b.top - b.height / 2;
      const d = Math.hypot(mx, my);
      const rise = Math.min(1, d / hub.r);
      const away = d <= hub.r ? 1 : Math.max(0, 1 - (d - hub.r) / FADE);
      const drawn = rise * away * (2 + (give / 100) * 5);
      nextLean = drawn > 0 ? { x: (mx / (d || 1)) * drawn, y: (my / (d || 1)) * drawn } : { x: 0, y: 0 };
      if (!leanRaf) leanRaf = requestAnimationFrame(publish);
    };
    const onLeave = () => {
      nextLean = { x: 0, y: 0 };
      if (!leanRaf) leanRaf = requestAnimationFrame(publish);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
  }

  applyField(true);
})();
