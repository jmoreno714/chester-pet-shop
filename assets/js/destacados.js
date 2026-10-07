// Chester Pet Shop — "Productos destacados" del home con productos reales:
// uno por categoría, el más caro que tenga foto (sale de assets/data/productos.json,
// así los precios siempre coinciden con el catálogo). Entran en cascada al verse.

(function () {
  const grid = document.getElementById('destacados-grid');
  if (!grid) return;

  // 8 categorías = dos filas de 4
  const CATEGORIAS = [
    ['royal-canin', 'Royal Canin'],
    ['eukanuba', 'Eukanuba'],
    ['vitalcan-perros', 'Vitalcan Perros'],
    ['vitalcan-gatos', 'Vitalcan Gatos'],
    ['sieger-agility', 'Sieger / Agility'],
    ['estampa', 'Estampa'],
    ['humedos', 'Húmedos'],
    ['farmacos', 'Fármacos'],
  ];

  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };
  const precios = (p) => p.variantes.map((v) => v.precio).filter((n) => typeof n === 'number');
  const precioAR = (n) => '$' + n.toLocaleString('es-AR');
  function precioDesde(p) {
    const ps = precios(p);
    if (!ps.length) return '$·····';
    const min = Math.min(...ps);
    return p.variantes.length > 1 ? `Desde ${precioAR(min)}` : precioAR(min);
  }

  fetch('assets/data/productos.json')
    .then((res) => res.json())
    .then((productos) => {
      const elegidos = CATEGORIAS.map(([cat, label]) => {
        const p = productos
          .filter((x) => x.categoria === cat && x.foto && precios(x).length)
          .sort((a, b) => Math.max(...precios(b)) - Math.max(...precios(a)))[0];
        return p && { p, label };
      }).filter(Boolean);
      if (!elegidos.length) return;

      grid.innerHTML = elegidos.map(({ p, label }, i) => `
        <a class="product-card is-waiting" style="--i:${i}" href="producto.html?slug=${encodeURIComponent(p.slug)}">
          <span class="price-tag">${precioDesde(p)}</span>
          <div class="thumb has-foto"><img src="${p.foto}-400.webp" srcset="${p.foto}-400.webp 400w, ${p.foto}.webp 800w" sizes="(max-width: 600px) 45vw, 240px" alt="" loading="lazy" decoding="async"></div>
          <h3>${esc(p.titulo)}</h3>
          <p class="tag-line">${esc(p.marca === label ? p.marca : `${p.marca} · ${label}`)}</p>
        </a>`).join('');

      const cards = grid.querySelectorAll('.product-card');
      const entrar = () => cards.forEach((c) => { c.classList.remove('is-waiting'); c.classList.add('is-entering'); });
      if (!('IntersectionObserver' in window)) { entrar(); return; }
      const io = new IntersectionObserver((entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        entrar();
        io.disconnect();
      }, { rootMargin: '0px 0px -80px 0px' });
      io.observe(grid);
    })
    .catch(() => {}); // si falla, quedan las tarjetas de muestra del HTML
})();
