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

  function validarTelefono() {
    const digitos = f.telefono.value.replace(/\D/g, '').length;
    f.telefono.setCustomValidity(f.telefono.value && digitos < 8 ? 'Poné un teléfono con al menos 8 números.' : '');
  }

  function sincronizarEntrega() {
    const envio = conEnvio();
    envioEl.hidden = !envio;
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
      // input/textarea: los fieldset que contienen errores también son :invalid
      const primero = form.querySelector('input:invalid, textarea:invalid');
      if (primero) primero.focus();
      return;
    }

    const envio = conEnvio();
    const pago = form.querySelector('input[name="pago"]:checked');
    const datos = [
      ['Nombre', f.nombre.value.trim()],
      ['Teléfono', f.telefono.value.trim()],
      ['Mascota/s', f.mascotas.value.trim()],
      ['Una bolsa le dura', f.duracion.value.trim()],
      ['Entrega', envio ? 'Envío a domicilio (gratis)' : f.entrega.value],
      ['Dirección', envio ? `${f.direccion.value.trim()}, ${f.barrio.value.trim()}` : ''],
      ['Referencias', envio ? f.referencias.value.trim() : ''],
      ['Pago', pago.value + ('descuento' in pago.dataset ? ' (10% de descuento)' : '')],
      ['Comentarios', f.comentarios.value.trim()],
    ];
    const url = C.whatsappURL(C.mensaje(datos));
    window.open(url, '_blank', 'noopener');

    enviado = true;
    setFill(1);
    stepItems[1].classList.replace('is-current', 'is-done');
    stepItems[1].removeAttribute('aria-current');
    stepItems[2].classList.remove('is-ready');
    stepItems[2].classList.add('is-done');
    pageEl.hidden = true;
    doneEl.hidden = false;
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
