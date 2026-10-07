// Chester Pet Shop — extras de la ficha de producto (producto.html).
// Escucha los avisos de producto.js y arma:
// - la foto del producto (assets/img/productos, sacada de Pedix); si no tiene,
//   el dibujo de la categoría (assets/js/ilustraciones.js) chico en la esquina,
//   que entra con un saltito y vuelve a saltar al agregar al carrito;
// - el perro sentado al lado del botón (mismo Lottie que el estante del
//   catálogo, Lottie Simple License), que salta al agregar;
// - "También te puede servir": 2 productos chicos (estilo "Completá tu pedido"
//   del carrito) de la misma marca/categoría o complementos para la mascota,
//   que se agregan al pedido sin salir de la ficha.

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

  /* --- foto del producto, o el dibujo de la categoría si todavía no hay foto --- */
  const galeria = document.getElementById('pd-galeria');
  function pintarDibujo(p) {
    if (!galeria) return;
    if (p.foto) {
      galeria.classList.add('has-foto');
      galeria.innerHTML = `<img src="${p.foto}.webp" alt="${esc(p.titulo)}" decoding="async">`;
      return;
    }
    if (!ILUS[p.categoria]) return;
    galeria.classList.add('has-ilus');
    galeria.insertAdjacentHTML('beforeend', `<div class="pd-ilus">${ILUS[p.categoria]}</div>`);
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
  const MAX = 2;
  const MAX_POR_CATEGORIA = 1; // dos cosas distintas, no dos bolsas casi iguales
  const NO_ALIMENTO = new Set(['humedos', 'farmacos', 'camitas']);

  function especie(p) {
    const txt = `${p.categoria} ${p.nombre}`;
    if (/gat(o|os|ito|itos)\b/i.test(txt)) return 'gato';
    if (/perr(o|os)\b|cachorro/i.test(txt)) return 'perro';
    return null;
  }
    function precioDesde(p) {
    const precios = p.variantes.map((v) => v.precio).filter((n) => typeof n === 'number');
    if (!precios.length) return '$·····';
    const min = Math.min(...precios);
    const txt = '$' + min.toLocaleString('es-AR');
    return p.variantes.length > 1 ? `Desde ${txt}` : txt;
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
        relGrid.innerHTML = lista.map((p, i) => {
          const url = `producto.html?slug=${encodeURIComponent(p.slug)}`;
          const v = p.variantes[0];
          const nombre = v.peso ? `${p.nombre} ${v.peso}` : p.nombre;
          return `
          <li class="upsell-item pd-upsell-item" style="--i:${i}">
            <a class="pd-upsell-thumb${p.foto ? ' has-foto' : ''}" href="${url}" tabindex="-1" aria-hidden="true">${p.foto ? `<img src="${p.foto}-400.webp" alt="" loading="lazy">` : ILUS[p.categoria] || ''}</a>
            <div class="upsell-info">
              <a class="upsell-name" href="${url}">${esc(p.titulo)}</a>
              <span class="upsell-meta">${precioDesde(p)}</span>
            </div>
            <button type="button" class="upsell-add" data-i="${i}" aria-label="Agregar ${esc(nombre)} al pedido">+ Agregar</button>
          </li>`;
        }).join('');
        relSection.hidden = false;

        relGrid.querySelectorAll('.upsell-add').forEach((btn) => {
          btn.addEventListener('click', () => {
            const p = lista[Number(btn.dataset.i)];
            const v = p.variantes[0];
            if (!C()) return;
            C().agregar({
              codigo: v.codigo,
              slug: p.slug,
              nombre: p.nombre,
              peso: v.peso,
              precio: v.precio,
              cantidad: 1,
              categoria: CATEGORY_LABELS[p.categoria] || '',
              marca: p.marca,
              foto: p.foto || '',
            }, { abrir: false });
            btn.textContent = '✓ Agregado';
            btn.classList.add('is-added');
            btn.disabled = true;
            btn.setAttribute('aria-label', 'Agregado al pedido');
            replay(dogBox, 'is-happy');
          });
        });
      })
      .catch(() => {});
  }

  document.addEventListener('producto-listo', (e) => {
    const { producto } = e.detail;
    pintarDibujo(producto);
    pintarRelacionados(producto);
  });
  document.addEventListener('producto-agregado', festejar);
})();
