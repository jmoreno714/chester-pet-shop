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

  // precio de lista + precio con el 10% de efectivo/transferencia
  // (todos los productos lo tienen)
  function pintarPrecio(el, precio) {
    if (typeof precio !== 'number') {
      el.textContent = formatPrecio(precio);
      return;
    }
    el.innerHTML =
      '<span class="price-row">' +
      `<span class="price-list"><span class="sr-only">Precio de lista: </span>${formatPrecio(precio)}</span>` +
      `<span class="price-cash"><span class="sr-only">En efectivo o transferencia: </span>${formatPrecio(Math.round(precio * 0.9))}</span>` +
      '<span class="price-badge" aria-hidden="true">-10%</span>' +
      '<span class="price-cash-note" aria-hidden="true">pagando en efectivo o transferencia</span>' +
      '</span>';
  }

  // al cambiar de peso el precio nuevo entra desenfocado y se asienta: el
  // blur funde los dos números en vez de mostrar un salto seco
  const reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animarPrecio(el) {
    if (!el.animate) return;
    el.getAnimations().forEach((a) => a.cancel()); // clicks seguidos: arranca de nuevo
    el.animate(
      reducido
        ? [{ opacity: 0.4 }, { opacity: 1 }]
        : [
            { opacity: 0.35, filter: 'blur(3px)', transform: 'translateY(4px)' },
            { opacity: 1, filter: 'blur(0)', transform: 'none' },
          ],
      { duration: 240, easing: 'cubic-bezier(.23,1,.32,1)' }
    );
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
            if (seleccionada === v) return;
            seleccionada = v;
            options.querySelectorAll('.variant-btn').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            pintarPrecio(precioEl, v.precio);
            animarPrecio(precioEl);
            document.dispatchEvent(new CustomEvent('producto-variante', { detail: { producto: p, variante: v } }));
          });
          options.appendChild(btn);
        });
        variantsEl.append(label, options);
      }

      pintarPrecio(precioEl, seleccionada.precio);
      // ficha.js arma el dibujo, el perro y los relacionados
      const avisar = (nombre, detail) => document.dispatchEvent(new CustomEvent(nombre, { detail }));
      avisar('producto-listo', { producto: p, variante: seleccionada });

      const addBtn = document.getElementById('pd-add-cart');
      const TEXTO = addBtn.textContent.trim();
      addBtn.innerHTML = `<span class="add-cart-label">${TEXTO}</span>`;
      const etiqueta = addBtn.firstElementChild;
      let volver = 0;
      let abrirPanel = 0;

      // el texto sale desenfocado y entra el nuevo: el blur funde los dos
      function cambiarTexto(texto, agregado) {
        addBtn.classList.toggle('is-added', agregado);
        if (reducido || !etiqueta.animate) {
          etiqueta.textContent = texto;
          return;
        }
        etiqueta.getAnimations().forEach((a) => a.cancel());
        etiqueta
          .animate(
            [{ opacity: 1, filter: 'blur(0)', transform: 'none' },
             { opacity: 0, filter: 'blur(3px)', transform: 'translateY(-6px)' }],
            { duration: 110, easing: 'ease-in', fill: 'forwards' }
          )
          .finished.then(() => {
            etiqueta.textContent = texto;
            etiqueta.getAnimations().forEach((a) => a.cancel());
            etiqueta.animate(
              [{ opacity: 0, filter: 'blur(3px)', transform: 'translateY(6px)' },
               { opacity: 1, filter: 'blur(0)', transform: 'none' }],
              { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' }
            );
          })
          .catch(() => {});
      }

      // suma al carrito el peso y la cantidad elegidos
      function agregarSeleccion() {
        const C = window.ChesterCarrito;
        if (!C) return null;
        const cantidad = parseInt(document.getElementById('pd-qty').textContent, 10) || 1;
        C.agregar({
          codigo: seleccionada.codigo,
          slug: p.slug,
          nombre: p.nombre,
          peso: seleccionada.peso,
          precio: seleccionada.precio,
          cantidad,
          // para agrupar el mensaje de WhatsApp como "Categoría (Marca)"
          categoria: catLabel,
          marca: p.marca,
        }, { abrir: false });
        return C;
      }

      // comprar ahora: sin pasar por el panel, directo al formulario con el producto ya en el carrito
      document.getElementById('pd-buy-now').addEventListener('click', () => {
        if (!agregarSeleccion()) return;
        location.href = 'finalizar.html';
      });

      addBtn.addEventListener('click', () => {
        const C = agregarSeleccion();
        if (!C) return;

        avisar('producto-agregado', { producto: p, variante: seleccionada });
        if (!addBtn.classList.contains('is-added')) cambiarTexto('Agregado ✓', true);
        // el panel se abre un poco después, para que se vea el cambio del botón
        clearTimeout(abrirPanel);
        abrirPanel = setTimeout(() => C.abrir(), 550);
        clearTimeout(volver);
        volver = setTimeout(() => cambiarTexto(TEXTO, false), 2000);
      });
    })
    .catch(() => {
      root.innerHTML = '<p class="catalog-empty">No pudimos cargar el producto. Probá recargar la página.</p>';
    });
})();
