// Chester Pet Shop — extras de la ficha de producto (producto.html).
// Escucha los avisos de producto.js y arma:
// - el dibujo de la categoría (assets/js/ilustraciones.js) chico en la esquina
//   de la foto, que entra con un saltito y vuelve a saltar al agregar al carrito;
// - "Consultar por WhatsApp" con el producto (y el peso elegido) ya escrito;
// - el perro sentado al lado del botón (mismo Lottie que el estante del
//   catálogo, Lottie Simple License), que salta al agregar;
// - "También te puede servir": 4 productos de la misma marca/categoría y
//   complementos para la misma mascota, entrando en cascada al verlos.

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const C = () => window.ChesterCarrito;

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
  const ILUS = window.ChesterIlustraciones || {};

  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };
  // vuelve a disparar una animación CSS de clase aunque ya esté puesta
  function replay(el, clase) {
    if (!el || reduce.matches) return;
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
  }

  /* --- dibujo de la categoría, chico en la esquina de la foto --- */
  const galeria = document.getElementById('pd-galeria');
  function pintarDibujo(p) {
    if (!galeria || !ILUS[p.categoria]) return;
    galeria.classList.add('has-ilus');
    galeria.insertAdjacentHTML('beforeend', `<div class="pd-ilus">${ILUS[p.categoria]}</div>`);
  }

  /* --- consultar por WhatsApp --- */
  const consulta = document.getElementById('pd-consult');
  function pintarConsulta(p, v) {
    if (!consulta || !C()) return;
    const nombre = v && v.peso ? `${p.nombre} (${v.peso})` : p.nombre;
    consulta.href = C().whatsappURL(`Hola! Quería consultar por *${nombre}*.`);
  }

  /* --- perro al lado del botón --- */
  const dogBox = document.querySelector('.pd-dog');
  let dog = null;
  let rapido = 0;
  if (dogBox && window.lottie) {
    dog = window.lottie.loadAnimation({
      container: dogBox,
      renderer: 'svg',
      loop: true,
      autoplay: !reduce.matches,
      path: 'assets/data/perro-estante.json',
      rendererSettings: { preserveAspectRatio: 'xMidYMax meet' },
    });
    // fuera de pantalla no gasta
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (reduce.matches) return;
          if (e.isIntersecting) dog.play(); else dog.pause();
        });
      }).observe(dogBox);
    }
  }
  function festejar() {
    replay(dogBox, 'is-happy');
    replay(galeria && galeria.querySelector('.pd-ilus'), 'is-hop');
    if (dog && !reduce.matches) {
      dog.setSpeed(2.4);
      clearTimeout(rapido);
      rapido = setTimeout(() => dog.setSpeed(1), 1200);
    }
  }

  /* --- relacionados --- */
  const relSection = document.getElementById('pd-related');
  const relGrid = document.getElementById('pd-related-grid');
  const MAX = 4;
  const MAX_POR_CATEGORIA = 3;
  const NO_ALIMENTO = new Set(['humedos', 'farmacos', 'camitas']);

  function especie(p) {
    const txt = `${p.categoria} ${p.nombre}`;
    if (/gat(o|os|ito|itos)\b/i.test(txt)) return 'gato';
    if (/perr(o|os)\b|cachorro/i.test(txt)) return 'perro';
    return null;
  }
  const precioAR = (n) => '$' + n.toLocaleString('es-AR');
  function precioDesde(p) {
    const precios = p.variantes.map((v) => v.precio).filter((n) => typeof n === 'number');
    if (!precios.length) return '$·····';
    const min = Math.min(...precios);
    return p.variantes.length > 1 ? `Desde ${precioAR(min)}` : precioAR(min);
  }

  function sugerir(base, productos) {
    const esp = especie(base);
    const puntaje = (p) => {
      let s = 0;
      const mismaEspecie = esp && esp === especie(p);
      if (p.categoria === base.categoria) s += 3;
      if (p.marca === base.marca) s += 2;
      if (mismaEspecie) s += 1;
      // complementos de un alimento seco para la misma mascota
      if (!NO_ALIMENTO.has(base.categoria) && mismaEspecie) {
        if (p.categoria === 'humedos') s += 2.5;
        if (p.categoria === 'farmacos') s += 1.5;
      }
      // a un alimento de otra especie no le suma la marca
      if (esp && especie(p) && !mismaEspecie) s -= 3;
      return s;
    };
    const candidatos = productos
      .filter((p) => p.slug !== base.slug && p.variantes.some((v) => typeof v.precio === 'number'))
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
    // si el tope por categoría dejó lugares vacíos, se completan igual
    for (const { p } of candidatos) {
      if (elegidos.length === MAX) break;
      if (!elegidos.includes(p)) elegidos.push(p);
    }
    return elegidos;
  }

  function pintarRelacionados(base) {
    if (!relSection || !relGrid) return;
    fetch('assets/data/productos.json')
      .then((res) => res.json())
      .then((productos) => {
        const lista = sugerir(base, productos);
        if (!lista.length) return;
        relGrid.innerHTML = lista.map((p, i) => `
          <a class="product-card" style="--i:${i}" href="producto.html?slug=${encodeURIComponent(p.slug)}">
            <span class="price-tag">${precioDesde(p)}</span>
            <div class="thumb">foto del producto<br>(a definir)${ILUS[p.categoria] ? `<span class="thumb-ilus">${ILUS[p.categoria]}</span>` : ''}</div>
            <h3>${esc(p.titulo)}</h3>
            <p class="tag-line">${esc(p.marca === CATEGORY_LABELS[p.categoria] ? p.marca : `${p.marca} · ${CATEGORY_LABELS[p.categoria] || ''}`)}</p>
          </a>`).join('');
        relSection.hidden = false;
        // entran en cascada recién cuando se ven
        const cards = relGrid.querySelectorAll('.product-card');
        if (!('IntersectionObserver' in window)) return;
        cards.forEach((c) => c.classList.add('is-waiting'));
        const io = new IntersectionObserver((entradas) => {
          if (!entradas.some((e) => e.isIntersecting)) return;
          cards.forEach((c) => { c.classList.remove('is-waiting'); c.classList.add('is-entering'); });
          io.disconnect();
        }, { rootMargin: '0px 0px -80px 0px' });
        io.observe(relGrid);
      })
      .catch(() => {});
  }

  document.addEventListener('producto-listo', (e) => {
    const { producto, variante } = e.detail;
    pintarDibujo(producto);
    pintarConsulta(producto, variante);
    pintarRelacionados(producto);
  });
  document.addEventListener('producto-variante', (e) => pintarConsulta(e.detail.producto, e.detail.variante));
  document.addEventListener('producto-agregado', festejar);
})();
