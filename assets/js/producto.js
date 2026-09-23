// Chester Pet Shop — ficha de producto individual
// Lee assets/data/productos.json y busca el producto por ?slug= en la URL.
// Si el producto tiene variantes de peso, arma el selector y actualiza el
// precio (y el código, para cuando conectemos el carrito) según la elegida.

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

  const slug = new URLSearchParams(location.search).get('slug');

  fetch('assets/data/productos.json')
    .then((res) => res.json())
    .then((productos) => productos.find((item) => item.slug === slug))
    .then((p) => {
      if (!p) {
        root.innerHTML = '<p class="catalog-empty">No encontramos ese producto. <a href="productos.html">Volver al catálogo</a>.</p>';
        return;
      }

      document.title = p.titulo + ' — Chester Pet Shop';
      const catLabel = CATEGORY_LABELS[p.categoria] || '';
      const catLink = document.getElementById('pd-breadcrumb-cat');
      catLink.textContent = catLabel;
      catLink.href = 'productos.html#' + p.categoria;
      document.getElementById('pd-breadcrumb-nombre').textContent = p.titulo;
      document.getElementById('pd-marca').textContent = p.marca;
      document.getElementById('pd-titulo').textContent = p.titulo;

      const precioEl = document.getElementById('pd-precio');
      let seleccionada = p.variantes[0];

      const variantsEl = document.getElementById('pd-variants');
      if (p.variantes.length > 1) {
        const label = document.createElement('p');
        label.className = 'product-variant-label';
        label.textContent = 'Peso';
        const options = document.createElement('div');
        options.className = 'variant-options';
        p.variantes.forEach((v, i) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'variant-btn' + (i === 0 ? ' is-active' : '');
          btn.textContent = v.peso;
          btn.addEventListener('click', () => {
            seleccionada = v;
            options.querySelectorAll('.variant-btn').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            precioEl.textContent = formatPrecio(v.precio);
          });
          options.appendChild(btn);
        });
        variantsEl.append(label, options);
      }

      precioEl.textContent = formatPrecio(seleccionada.precio);

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
