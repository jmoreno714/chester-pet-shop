// Chester Pet Shop — "Completá tu pedido" en carrito.html. Sugiere 4
// productos a partir de lo que ya está en el carrito: primero la misma
// línea/marca, después complementos para la misma mascota (húmedos y
// antiparasitarios). Nunca repite algo que ya está en el carrito.

(function () {
  const section = document.getElementById('related');
  const grid = document.getElementById('related-grid');
  const C = window.ChesterCarrito;
  if (!section || !grid || !C) return;

  const CATEGORY_LABELS = {
    'vitalcan-perros': 'Vitalcan Perros',
    'vitalcan-gatos': 'Vitalcan Gatos',
    'sieger-agility': 'Sieger / Agility',
    estampa: 'Estampa',
    eukanuba: 'Eukanuba',
    'royal-canin': 'Royal Canin',
    'otros-alimentos': 'Otros alimentos',
    humedos: 'Húmedos',
    farmacos: 'Fármacos',
    camitas: 'Camitas y accesorios',
  };
  const NO_ALIMENTO = new Set(['humedos', 'farmacos', 'camitas']);
  const MAX = 4;
  const MAX_POR_CATEGORIA = 2; // para que no sean 4 bolsas casi iguales

  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };

  function especie(p) {
    const txt = `${p.categoria} ${p.nombre}`;
    if (/gat(o|os|ito|itos)\b/i.test(txt)) return 'gato';
    if (/perr(o|os)\b|cachorro/i.test(txt)) return 'perro';
    return null;
  }

  let productos = [];
  let porSlug = new Map();
  let pausado = false;

  function sugerencias() {
    const items = C.items();
    const enCarrito = new Set(items.map((it) => it.slug));
    const base = items.map((it) => porSlug.get(it.slug)).filter(Boolean);
    if (!base.length) return [];

    const puntaje = (p) => {
      let mejor = 0;
      const esp = especie(p);
      base.forEach((b) => {
        let s = 0;
        const mismaEspecie = esp && esp === especie(b);
        if (p.categoria === b.categoria) s += 3;
        if (p.marca === b.marca) s += 2;
        if (mismaEspecie) s += 1;
        // complementos de un alimento seco
        if (!NO_ALIMENTO.has(b.categoria) && mismaEspecie) {
          if (p.categoria === 'humedos') s += 2.5;
          if (p.categoria === 'farmacos') s += 1.5;
        }
        mejor = Math.max(mejor, s);
      });
      return mejor;
    };

    const candidatos = productos
      .filter((p) => !enCarrito.has(p.slug) && typeof p.variantes[0].precio === 'number')
      .map((p, orden) => ({ p, s: puntaje(p), orden }))
      .filter((c) => c.s > 0)
      .sort((a, b) => b.s - a.s || a.orden - b.orden);

    const elegidos = [];
    const porCategoria = {};
    for (const { p } of candidatos) {
      if ((porCategoria[p.categoria] || 0) >= MAX_POR_CATEGORIA) continue;
      elegidos.push(p);
      porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
      if (elegidos.length === MAX) break;
    }
    return elegidos;
  }

  function render() {
    if (pausado) return;
    const lista = sugerencias();
    section.hidden = !lista.length;
    grid.innerHTML = lista.map((p, i) => {
      const v = p.variantes[0];
      return `
      <article class="product-card related-card">
        <span class="price-tag">${C.precio(v.precio)}</span>
        <a class="related-link" href="producto.html?slug=${encodeURIComponent(p.slug)}">
          <div class="thumb">foto del producto<br>(a definir)</div>
          <h3>${esc(p.titulo)}</h3>
          <p class="tag-line">${esc(p.marca)} · ${CATEGORY_LABELS[p.categoria] || ''}</p>
        </a>
        <button type="button" class="btn btn-ghost btn-sm related-add" data-i="${i}">
          + Agregar${v.peso ? ' ' + esc(v.peso) : ''}
        </button>
      </article>`;
    }).join('');

    grid.querySelectorAll('.related-add').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = lista[Number(btn.dataset.i)];
        const v = p.variantes[0];
        // la tarjeta queda con "Agregado ✓" en vez de desaparecer al toque
        pausado = true;
        C.agregar({
          codigo: v.codigo,
          slug: p.slug,
          nombre: p.nombre,
          peso: v.peso,
          precio: v.precio,
          cantidad: 1,
          categoria: CATEGORY_LABELS[p.categoria] || '',
          marca: p.marca,
        }, { abrir: false });
        pausado = false;
        btn.textContent = 'Agregado ✓';
        btn.disabled = true;
      });
    });
  }

  // cambios hechos desde el panel o la lista (quitar, otra pestaña) recalculan
  document.addEventListener('carrito-cambio', render);

  fetch('assets/data/productos.json')
    .then((res) => res.json())
    .then((data) => {
      productos = data;
      porSlug = new Map(data.map((p) => [p.slug, p]));
      render();
    })
    .catch(() => { section.hidden = true; });
})();
