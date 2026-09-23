// Chester Pet Shop — ficha de producto individual
// Lee assets/data/productos.json y busca el producto por ?codigo= en la URL

(function () {
  const root = document.getElementById('product-detail');
  if (!root) return;

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

  function formatPrecio(precio) {
    if (typeof precio !== 'number') return '$·····';
    return '$' + precio.toLocaleString('es-AR');
  }

  const codigo = new URLSearchParams(location.search).get('codigo');

  fetch('assets/data/productos.json')
    .then((res) => res.json())
    .then((productos) => productos.find((item) => item.codigo === codigo))
    .then((p) => {
      if (!p) {
        root.innerHTML = '<p class="catalog-empty">No encontramos ese producto. <a href="productos.html">Volver al catálogo</a>.</p>';
        return;
      }

      document.title = p.nombre + ' — Chester Pet Shop';
      const catLabel = CATEGORY_LABELS[p.categoria] || '';
      const catLink = document.getElementById('pd-breadcrumb-cat');
      catLink.textContent = catLabel;
      catLink.href = 'productos.html#' + p.categoria;
      document.getElementById('pd-breadcrumb-nombre').textContent = p.nombre;
      document.getElementById('pd-marca').textContent = p.marca;
      document.getElementById('pd-titulo').textContent = p.nombre;
      document.getElementById('pd-precio').textContent = formatPrecio(p.precio);

      const qtyInput = document.getElementById('pd-qty');
      document.getElementById('pd-qty-dec').addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value || '1', 10) - 1);
      });
      document.getElementById('pd-qty-inc').addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value || '1', 10) + 1;
      });

      const addBtn = document.getElementById('pd-add-cart');
      addBtn.addEventListener('click', () => {
        const original = addBtn.textContent;
        addBtn.textContent = 'Agregado ✓';
        addBtn.disabled = true;
        setTimeout(() => {
          addBtn.textContent = original;
          addBtn.disabled = false;
        }, 1400);
      });
    })
    .catch(() => {
      root.innerHTML = '<p class="catalog-empty">No pudimos cargar el producto. Probá recargar la página.</p>';
    });
})();
