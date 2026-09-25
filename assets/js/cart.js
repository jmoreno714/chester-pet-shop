// Chester Pet Shop — carrito. Guarda lo elegido en el navegador del
// visitante y al final arma el pedido como mensaje de WhatsApp: no hay
// pagos online, el local coordina pago y entrega por chat.
// Se carga en todas las páginas e inserta el botón del header y el panel.

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
  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };

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

  // --- panel ---
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
      <label class="cart-field">
        <span>Tu nombre <em>(opcional)</em></span>
        <input type="text" class="cart-nombre" autocomplete="name">
      </label>
      <label class="cart-field">
        <span>Barrio o dirección de entrega <em>(opcional)</em></span>
        <input type="text" class="cart-direccion" autocomplete="street-address">
      </label>
      <a class="btn btn-primary cart-send" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
        Enviar pedido por WhatsApp
      </a>
      <p class="cart-fine">No se cobra nada acá: el pago y la entrega los coordinamos por WhatsApp.</p>
    </div>`;
  document.body.append(overlay, panel);

  const body = panel.querySelector('.cart-body');
  const foot = panel.querySelector('.cart-foot');
  const totalEl = panel.querySelector('.cart-total-num');
  const noteEl = panel.querySelector('.cart-total-note');
  const nombreEl = panel.querySelector('.cart-nombre');
  const direccionEl = panel.querySelector('.cart-direccion');
  const sendEl = panel.querySelector('.cart-send');

  function cantidadTotal() {
    return items.reduce((n, it) => n + it.cantidad, 0);
  }

  function mensaje() {
    const lineas = items.map((it) => {
      const nombre = it.peso ? `${it.nombre} ${it.peso}` : it.nombre;
      const sub = typeof it.precio === 'number' ? precio(it.precio * it.cantidad) : 'precio a confirmar';
      return `- ${it.cantidad} x ${nombre} (${sub})`;
    });
    const conPrecio = items.filter((it) => typeof it.precio === 'number');
    const total = conPrecio.reduce((n, it) => n + it.precio * it.cantidad, 0);
    let txt = '¡Hola Chester! Quiero hacer este pedido:\n\n' + lineas.join('\n');
    txt += `\n\nTotal: ${precio(total)}`;
    if (conPrecio.length < items.length) txt += ' + productos a confirmar';
    const nombre = nombreEl.value.trim();
    const dir = direccionEl.value.trim();
    if (nombre) txt += `\nNombre: ${nombre}`;
    if (dir) txt += `\nEntrega: ${dir}`;
    return txt;
  }

  function actualizarEnvio() {
    const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : 'https://wa.me/';
    sendEl.href = `${base}?text=${encodeURIComponent(mensaje())}`;
  }

  function render() {
    const n = cantidadTotal();
    countEl.textContent = n;
    toggle.classList.toggle('has-items', n > 0);
    toggle.setAttribute('aria-label', n ? `Abrir tu pedido (${n} productos)` : 'Abrir tu pedido');

    if (!items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <img src="assets/img/perro-cabeza.png" alt="" width="72" height="72">
          <p><strong>Tu pedido está vacío.</strong><br>Pasate por el catálogo y elegí lo que necesita tu mascota.</p>
          <a class="btn btn-ghost btn-sm" href="productos.html">Ver el catálogo</a>
        </div>`;
      foot.hidden = true;
      return;
    }

    foot.hidden = false;
    body.innerHTML = '<ul class="cart-list">' + items.map((it, i) => `
      <li class="cart-item">
        <div class="cart-item-info">
          <a class="cart-item-name" href="producto.html?slug=${encodeURIComponent(it.slug)}">${esc(it.nombre)}</a>
          <span class="cart-item-meta">${it.peso ? esc(it.peso) + ' · ' : ''}${typeof it.precio === 'number' ? precio(it.precio) + ' c/u' : 'precio a confirmar'}</span>
        </div>
        <div class="cart-item-qty">
          <button type="button" data-act="menos" data-i="${i}" aria-label="Restar uno">−</button>
          <span>${it.cantidad}</span>
          <button type="button" data-act="mas" data-i="${i}" aria-label="Sumar uno">+</button>
        </div>
        <button type="button" class="cart-item-remove" data-act="quitar" data-i="${i}">Quitar</button>
      </li>`).join('') + '</ul>';

    const conPrecio = items.filter((it) => typeof it.precio === 'number');
    totalEl.textContent = precio(conPrecio.reduce((s, it) => s + it.precio * it.cantidad, 0));
    noteEl.hidden = conPrecio.length === items.length;
    actualizarEnvio();
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

  body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const it = items[i];
    if (!it) return;
    if (btn.dataset.act === 'mas') it.cantidad += 1;
    if (btn.dataset.act === 'menos') it.cantidad = Math.max(1, it.cantidad - 1);
    if (btn.dataset.act === 'quitar') items.splice(i, 1);
    guardar();
    render();
  });

  nombreEl.addEventListener('input', actualizarEnvio);
  direccionEl.addEventListener('input', actualizarEnvio);

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
  };

  render();
})();
