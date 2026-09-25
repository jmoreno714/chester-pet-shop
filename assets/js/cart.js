// Chester Pet Shop — carrito. Guarda lo elegido en el navegador del
// visitante y al final arma el pedido como mensaje de WhatsApp: no hay
// pagos online, el local coordina pago y entrega por chat.
// Se carga en todas las páginas: inserta el botón del header y el panel
// lateral (compacto: productos, cantidades y total). En carrito.html
// además arma la vista completa, que es donde se envía el pedido.

(function () {
  // número del local con código de país, sin + ni espacios (ej. 5493811234567).
  // vacío: WhatsApp se abre con el mensaje listo y el cliente elige el contacto
  const WHATSAPP = '';
  const KEY = 'chester-carrito';

  const header = document.querySelector('.site-header .wrap');
  if (!header) return;

  function leer() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }

  let items = leer();

  const precio = (n) => '$' + n.toLocaleString('es-AR');
  const conPrecio = () => items.filter((it) => typeof it.precio === 'number');
  const total = () => conPrecio().reduce((s, it) => s + it.precio * it.cantidad, 0);
  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };

  const vacioHTML = (conBoton) => `
    <div class="cart-empty">
      <img class="perro-bob" src="assets/img/perro-cabeza.png" alt="" width="72" height="72">
      <p><strong>Tu pedido está vacío.</strong><br>Pasate por el catálogo y elegí lo que necesita tu mascota.</p>
      ${conBoton ? '<a class="btn btn-ghost btn-sm" href="productos.html">Ver el catálogo</a>' : ''}
    </div>`;

  const subtotal = (it) => (typeof it.precio === 'number' ? precio(it.precio * it.cantidad) : 'a confirmar');

  // una línea de producto; en la página es más grande y suma el subtotal.
  // la cantidad usa el mismo stepper elástico de la ficha (qty-elastic.js)
  const itemHTML = (it, i, enPagina) => `
    <li class="cart-item">
      <div class="cart-item-info">
        <a class="cart-item-name" href="producto.html?slug=${encodeURIComponent(it.slug)}">${esc(it.nombre)}</a>
        <span class="cart-item-meta">${it.peso ? esc(it.peso) + ' · ' : ''}${typeof it.precio === 'number' ? precio(it.precio) + ' c/u' : 'precio a confirmar'}</span>
      </div>
      <div class="qty-elastic${enPagina ? '' : ' qty-elastic--sm'}" data-i="${i}" data-offset="${enPagina ? 16 : 11}" role="group" aria-label="Cantidad">
        <span class="qty-elastic-sign" data-dir="-1" role="button" tabindex="0" aria-label="Restar uno">−</span>
        <span class="qty-elastic-track"><span class="qty-elastic-knob">${it.cantidad}</span></span>
        <span class="qty-elastic-sign" data-dir="1" role="button" tabindex="0" aria-label="Sumar uno">+</span>
      </div>
      ${enPagina ? `<span class="cart-item-sub" data-i="${i}">${subtotal(it)}</span>` : ''}
      <button type="button" class="cart-item-remove" data-act="quitar" data-i="${i}" aria-label="Quitar ${esc(it.nombre)}">×</button>
    </li>`;

  // --- botón del header ---
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'cart-toggle';
  toggle.setAttribute('aria-label', 'Abrir tu pedido');
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>' +
    '<span class="cart-count" aria-hidden="true">0</span>';
  header.appendChild(toggle);
  const countEl = toggle.querySelector('.cart-count');

  // --- panel lateral ---
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.hidden = true;

  const panel = document.createElement('aside');
  panel.className = 'cart-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'cart-title');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="cart-head">
      <h2 id="cart-title">Tu pedido</h2>
      <button type="button" class="cart-close" aria-label="Cerrar">×</button>
    </div>
    <div class="cart-body"></div>
    <div class="cart-foot">
      <div class="cart-total"><span>Total</span><strong class="cart-total-num"></strong></div>
      <p class="cart-total-note" hidden>+ productos con precio a confirmar</p>
      <a class="btn btn-primary cart-go" href="carrito.html">Ir al carrito</a>
    </div>`;
  document.body.append(overlay, panel);

  const pBody = panel.querySelector('.cart-body');
  const pFoot = panel.querySelector('.cart-foot');

  // --- página del carrito (solo en carrito.html) ---
  const page = document.getElementById('cart-page');
  let pageList, pageSummary;
  if (page) {
    page.innerHTML = `
      <div class="cart-page-list"></div>
      <aside class="cart-summary">
        <div class="cart-total"><span>Total</span><strong class="cart-total-num"></strong></div>
        <p class="cart-total-note" hidden>+ productos con precio a confirmar</p>
        <a class="btn btn-primary cart-go" href="finalizar.html">Continuar con tus datos</a>
        <p class="cart-fine">No se cobra nada acá: el pago y la entrega los coordinamos por WhatsApp.</p>
      </aside>`;
    pageList = page.querySelector('.cart-page-list');
    pageSummary = page.querySelector('.cart-summary');
  }

  // líneas del pedido + total + los datos que haya (en el orden en que vienen)
  function mensaje(datos) {
    const lineas = items.map((it) => {
      const nombre = it.peso ? `${it.nombre} ${it.peso}` : it.nombre;
      const sub = typeof it.precio === 'number' ? precio(it.precio * it.cantidad) : 'precio a confirmar';
      return `- ${it.cantidad} x ${nombre} (${sub})`;
    });
    let txt = '¡Hola Chester! Quiero hacer este pedido:\n\n' + lineas.join('\n');
    txt += `\n\nTotal: ${precio(total())}`;
    if (conPrecio().length < items.length) txt += ' + productos a confirmar';
    const extra = (datos || []).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    if (extra.length) txt += '\n\n' + extra.join('\n');
    return txt;
  }

  const whatsappURL = (texto) =>
    `${WHATSAPP ? `https://wa.me/${WHATSAPP}` : 'https://wa.me/'}?text=${encodeURIComponent(texto)}`;

  function pintarTotal(scope) {
    scope.querySelector('.cart-total-num').textContent = precio(total());
    scope.querySelector('.cart-total-note').hidden = conPrecio().length === items.length;
  }

  // actualiza números sin rearmar las listas: si se rearman mientras alguien
  // mantiene apretado el stepper, se corta la repetición y el rebote
  function refrescarNumeros() {
    const n = items.reduce((s, it) => s + it.cantidad, 0);
    countEl.textContent = n;
    toggle.classList.toggle('has-items', n > 0);
    toggle.setAttribute('aria-label', n ? `Abrir tu pedido (${n} productos)` : 'Abrir tu pedido');
    // finalizar.html redibuja su resumen con esto
    document.dispatchEvent(new CustomEvent('carrito-cambio'));
    if (!items.length) return;

    // en carrito.html el mismo producto está en el panel y en la página
    document.querySelectorAll('.cart-item .qty-elastic[data-i] .qty-elastic-knob').forEach((k) => {
      const it = items[Number(k.closest('.qty-elastic').dataset.i)];
      if (it) k.textContent = it.cantidad;
    });
    pintarTotal(pFoot);
    if (page) {
      page.querySelectorAll('.cart-item-sub').forEach((el) => {
        const it = items[Number(el.dataset.i)];
        if (it) el.textContent = subtotal(it);
      });
      pintarTotal(pageSummary);
    }
  }

  function render() {
    if (!items.length) {
      pBody.innerHTML = vacioHTML(true);
      pFoot.hidden = true;
    } else {
      pBody.innerHTML = '<ul class="cart-list">' + items.map((it, i) => itemHTML(it, i, false)).join('') + '</ul>';
      pFoot.hidden = false;
    }

    if (page) {
      page.classList.toggle('is-empty', !items.length);
      if (!items.length) {
        pageList.innerHTML = vacioHTML(true);
        pageSummary.hidden = true;
      } else {
        pageList.innerHTML = '<ul class="cart-list">' + items.map((it, i) => itemHTML(it, i, true)).join('') + '</ul>';
        pageSummary.hidden = false;
      }
    }
    refrescarNumeros();
  }

  function pop() {
    toggle.classList.remove('is-bump');
    void toggle.offsetWidth; // reinicia la animación si llegan dos seguidas
    toggle.classList.add('is-bump');
  }

  function abrir() {
    overlay.hidden = false;
    panel.hidden = false;
    void panel.offsetWidth; // que arranque desde afuera y se vea el deslizamiento
    overlay.classList.add('is-open');
    panel.classList.add('is-open');
    document.body.classList.add('cart-lock');
    panel.querySelector('.cart-close').focus();
  }

  function cerrar() {
    overlay.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('cart-lock');
    setTimeout(() => {
      if (!panel.classList.contains('is-open')) {
        overlay.hidden = true;
        panel.hidden = true;
      }
    }, 300);
    toggle.focus();
  }

  toggle.addEventListener('click', abrir);
  overlay.addEventListener('click', cerrar);
  panel.querySelector('.cart-close').addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrar();
  });

  // × del panel y de la página
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-item [data-act="quitar"]');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (!items[i]) return;
    items.splice(i, 1);
    guardar();
    render();
  });

  // − / + del stepper elástico dentro del carrito (el de la ficha no tiene data-i)
  document.addEventListener('qty-change', (e) => {
    const root = e.target.closest('.cart-item .qty-elastic[data-i]');
    if (!root) return;
    const it = items[Number(root.dataset.i)];
    if (!it) return;
    it.cantidad = e.detail.value;
    guardar();
    refrescarNumeros();
  });

  // otra pestaña con el sitio abierto cambió el carrito
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { items = leer(); render(); }
  });

  window.ChesterCarrito = {
    agregar(prod) {
      const existente = items.find((it) => it.codigo === prod.codigo);
      if (existente) existente.cantidad += prod.cantidad;
      else items.push(prod);
      guardar();
      render();
      pop();
      abrir();
    },
    // para finalizar.html
    items: () => items.slice(),
    precio,
    subtotal,
    total,
    faltanPrecios: () => conPrecio().length < items.length,
    mensaje,
    whatsappURL,
    vaciar() {
      items = [];
      guardar();
      render();
    },
  };

  render();
})();
