// Chester Pet Shop — finalizar pedido (paso 2 de 3). Toma el carrito de
// cart.js, pide los datos de entrega y pago, y arma el mensaje de WhatsApp.
// La barra de pasos se va llenando a medida que se completan los campos
// obligatorios: arranca en "Tus datos" (50%) y llega casi a "Enviar
// pedido"; el último tramo lo completa el envío.

(function () {
  const form = document.getElementById('checkout-form');
  const C = window.ChesterCarrito;
  if (!form || !C) return;

  const steps = document.getElementById('checkout-steps');
  const stepItems = steps.querySelectorAll('.checkout-list li');
  const pageEl = document.getElementById('checkout-page');
  const doneEl = document.getElementById('checkout-done');
  const emptyEl = document.getElementById('checkout-empty');
  const itemsEl = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  const noteEl = document.getElementById('checkout-note');
  const errorEl = document.getElementById('checkout-error');
  const envioEl = form.querySelector('.checkout-envio');
  const f = form.elements;

  const esc = (s) => {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enviado = false;

  function setFill(v) {
    steps.style.setProperty('--fill', v);
  }

  function resumen() {
    const items = C.items();
    if (!items.length) {
      if (!enviado) {
        pageEl.hidden = true;
        steps.hidden = true;
        emptyEl.hidden = false;
      }
      return;
    }
    itemsEl.innerHTML = items.map((it) => `
      <li>
        <span>${it.cantidad} × ${esc(it.nombre)}${it.peso ? ' ' + esc(it.peso) : ''}</span>
        <strong>${C.subtotal(it)}</strong>
      </li>`).join('');
    totalEl.textContent = C.precio(C.total());
    noteEl.hidden = !C.faltanPrecios();
  }

  const conEnvio = () => f.entrega.value === 'Envío a domicilio';

  // código de pedido al estilo Pedix (XXXX-XXXX). Sin servidor no hay
  // numeración correlativa: es un código al azar para identificar el chat.
  function codigoPedido() {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I, que se confunden
    const parte = () => Array.from({ length: 4 }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
    return `${parte()}-${parte()}`;
  }

  const dos = (n) => String(n).padStart(2, '0');
  function fechaHora(d) {
    return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)} - ${dos(d.getHours())}:${dos(d.getMinutes())}hs`;
  }

  // el mismo redondeo por unidad que muestra la ficha de producto
  const precioEfectivo = (precio) => Math.round(precio * 0.9);

  // mismo formato que el resumen que mandaba Pedix
  function mensaje() {
    const items = C.items();
    const envio = conEnvio();
    const pago = form.querySelector('input[name="pago"]:checked');
    const conDescuento = 'descuento' in pago.dataset;
    const total = C.precio(C.total());
    const L = [];

    L.push('¡Hola! Te paso el resumen de mi pedido', '');
    L.push(`Pedido: #${codigoPedido()}`);
    L.push('Tienda: Chester Pet Shop');
    L.push(`Fecha: ${fechaHora(new Date())}`);
    L.push(`Nombre: ${f.nombre.value.trim()}`);
    L.push(`Teléfono: ${f.telefono.value.trim()}`, '');

    L.push(`Forma de pago: ${pago.value}`);
    L.push(`Total: ${total}`);
    if (conDescuento) {
      const efectivo = items
        .filter((it) => typeof it.precio === 'number')
        .reduce((s, it) => s + precioEfectivo(it.precio) * it.cantidad, 0);
      L.push(`► Con 10% de descuento en efectivo o transferencia: ${C.precio(efectivo)}`);
    } else {
      L.push('► En caso de pagar con tarjeta de crédito/débito, solicitar link de pago vía WhatsApp');
    }
    L.push('');

    if (envio) {
      const dir = `${f.direccion.value.trim()}, ${f.barrio.value.trim()}`;
      L.push('Entrega: Envío a domicilio (gratis)');
      L.push(`Dirección: ${dir}`);
      if (f.referencias.value.trim()) L.push(`Referencias: ${f.referencias.value.trim()}`);
      L.push(`Ubicación: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir + ', Tucumán, Argentina')}`);
    } else {
      L.push('Entrega: Retiro en el local');
    }
    L.push('');

    const extras = [
      ['¿Cuánto te dura esa bolsa de alimento?', f.duracion.value.trim()],
      ['Nombre de tu(s) mascota(s)', f.mascotas.value.trim()],
      ['Comentarios', f.comentarios.value.trim()],
    ].filter(([, v]) => v);
    if (extras.length) L.push(...extras.map(([k, v]) => `${k}: ${v}`), '');

    // productos agrupados como "Categoría (Marca)", en el orden en que se agregaron
    L.push('Mi pedido es', '');
    const grupos = new Map();
    items.forEach((it) => {
      const titulo = it.categoria
        ? (it.marca ? `${it.categoria} (${it.marca})` : it.categoria)
        : 'Otros productos';
      if (!grupos.has(titulo)) grupos.set(titulo, []);
      grupos.get(titulo).push(it);
    });
    grupos.forEach((lista, titulo) => {
      L.push(titulo);
      lista.forEach((it) => {
        const detalle = it.peso ? ` (${it.nombre} ${it.peso})` : '';
        L.push(`${it.cantidad}x ${it.nombre}${detalle}: ${C.subtotal(it)}`);
      });
      L.push('');
    });

    L.push(`TOTAL: ${total}`);
    if (C.faltanPrecios()) L.push('(+ productos con precio a confirmar)');
    L.push('', 'Espero tu respuesta para confirmar mi pedido');
    return L.join('\n');
  }

  function validarTelefono() {
    const digitos = f.telefono.value.replace(/\D/g, '').length;
    f.telefono.setCustomValidity(f.telefono.value && digitos < 8 ? 'Poné un teléfono con al menos 8 números.' : '');
  }

  function sincronizarEntrega() {
    const envio = conEnvio();
    // se pliega con una transición en vez de desaparecer de golpe (CSS);
    // inert lo saca del tab y de los lectores mientras está cerrado
    envioEl.classList.toggle('is-collapsed', !envio);
    envioEl.inert = !envio;
    f.direccion.required = envio;
    f.barrio.required = envio;
  }

  // cuántos obligatorios están completos -> cuánto se llena la barra
  function progreso() {
    if (enviado) return;
    const req = [f.nombre, f.telefono];
    if (conEnvio()) req.push(f.direccion, f.barrio);
    let ok = req.filter((el) => el.value.trim() && el.checkValidity()).length;
    const total = req.length + 1; // + forma de pago
    if (f.pago.value) ok += 1;
    const ratio = ok / total;
    setFill(0.5 + 0.45 * ratio);
    stepItems[2].classList.toggle('is-ready', ratio === 1);
    if (ratio === 1) errorEl.hidden = true;
  }

  form.addEventListener('input', () => {
    validarTelefono();
    progreso();
  });
  form.addEventListener('change', () => {
    sincronizarEntrega();
    progreso();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validarTelefono();
    sincronizarEntrega();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      errorEl.hidden = false;
      // una sacudida corta para que se note que el aviso es nuevo
      if (!reducirMovimiento.matches) {
        errorEl.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' },
        ], { duration: 320, easing: 'ease-out' });
      }
      // input/textarea: los fieldset que contienen errores también son :invalid
      const primero = form.querySelector('input:invalid, textarea:invalid');
      if (primero) primero.focus();
      return;
    }

    const url = C.whatsappURL(mensaje());
    window.open(url, '_blank', 'noopener');

    enviado = true;
    setFill(1);
    stepItems[1].classList.replace('is-current', 'is-done');
    stepItems[1].removeAttribute('aria-current');
    stepItems[2].classList.remove('is-ready');
    stepItems[2].classList.add('is-done');
    pageEl.hidden = true;
    doneEl.hidden = false;
    doneEl.classList.add('is-in');
    document.getElementById('checkout-retry').href = url;
    doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('checkout-new').addEventListener('click', () => {
    C.vaciar();
    location.href = 'productos.html';
  });

  // si cambian el carrito desde el panel lateral mientras están acá
  document.addEventListener('carrito-cambio', resumen);

  sincronizarEntrega();
  resumen();
  // un frame en 0 para que se vea la barra avanzar hasta "Tus datos"
  requestAnimationFrame(() => requestAnimationFrame(progreso));
})();
