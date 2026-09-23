// Chester Pet Shop — catálogo dinámico (filtro por categoría + búsqueda)
// Lee assets/data/productos.json (generado desde la planilla de inventario)
// y arma las tarjetas de producto en vivo.

(function () {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return; // solo corre en productos.html

  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('catalog-search');
  const countEl = document.getElementById('catalog-count');
  const emptyEl = document.getElementById('catalog-empty');

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

  let productos = [];
  let activeCat = 'todos';
  let query = '';

  function formatPrecio(precio) {
    if (typeof precio !== 'number') return '$·····';
    return '$' + precio.toLocaleString('es-AR');
  }

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function render() {
    const q = normalize(query.trim());
    const filtered = productos.filter((p) => {
      const matchesCat = activeCat === 'todos' || p.categoria === activeCat;
      if (!matchesCat) return false;
      if (!q) return true;
      return normalize(p.nombre).includes(q) || normalize(p.marca).includes(q);
    });

    grid.innerHTML = filtered
      .map(
        (p) => `
        <a class="product-card" href="producto.html?codigo=${encodeURIComponent(p.codigo)}">
          <span class="price-tag">${formatPrecio(p.precio)}</span>
          <div class="thumb">foto del producto<br>(a definir)</div>
          <h3>${escapeHtml(p.nombre)}</h3>
          <p class="tag-line">${escapeHtml(p.marca)} · ${CATEGORY_LABELS[p.categoria] || ''}</p>
        </a>`
      )
      .join('');

    countEl.textContent = filtered.length
      ? `${filtered.length} producto${filtered.length === 1 ? '' : 's'}`
      : '';
    emptyEl.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCat = btn.dataset.cat;
      render();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      query = e.target.value;
      render();
    });
  }

  // permite llegar con un ancla (#premium, #humedos, etc.) desde el home
  function applyHashFilter() {
    const map = {
      'vitalcan-perros': 'vitalcan-perros',
      'vitalcan-gatos': 'vitalcan-gatos',
      'sieger-agility': 'sieger-agility',
      estampa: 'estampa',
      eukanuba: 'eukanuba',
      'royal-canin': 'royal-canin',
      'otros-alimentos': 'otros-alimentos',
      humedos: 'humedos',
      farmacos: 'farmacos',
      camitas: 'camitas',
    };
    const hash = location.hash.replace('#', '');
    const cat = map[hash];
    if (!cat) return;
    const btn = document.querySelector(`.filter-btn[data-cat="${cat}"]`);
    if (btn) btn.click();
  }

  fetch('assets/data/productos.json')
    .then((res) => res.json())
    .then((data) => {
      productos = data;
      applyHashFilter();
      render();
    })
    .catch(() => {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      emptyEl.textContent = 'No pudimos cargar el catálogo. Probá recargar la página.';
    });
})();
