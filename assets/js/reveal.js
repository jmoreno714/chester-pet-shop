// Chester Pet Shop — las imágenes marcadas con .reveal se "descubren" de
// abajo hacia arriba la primera vez que llegan a pantalla. Las que llegan
// juntas (una fila de categorías) lo hacen escalonadas. Arrancan ocultas
// por la clase .js que pone una línea en el <head> (sin JS se ven normal).
//
// Se revisa la posición en cada scroll en vez de usar IntersectionObserver:
// con la imagen recortada al 100% el navegador la mide como 0% visible, y
// en un salto grande de scroll (un link a un ancla) la llegaba a saltear.

(function () {
  let pendientes = Array.from(document.querySelectorAll('.reveal'));
  if (!pendientes.length) return;

  const ESCALON = 45; // ms entre imágenes que llegan en la misma tanda
  const LINEA = 1; // se descubre apenas su borde de arriba asoma por abajo de la pantalla

  let raf = 0;
  function revisar() {
    raf = 0;
    const limite = window.innerHeight * LINEA;
    let tanda = 0;
    pendientes = pendientes.filter((el) => {
      // también las que ya quedaron arriba (scroll rápido hacia abajo)
      if (el.getBoundingClientRect().top >= limite) return true;
      el.style.setProperty('--reveal-delay', tanda * ESCALON + 'ms');
      el.classList.add('is-revealed');
      tanda += 1;
      return false;
    });
    if (!pendientes.length) {
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    }
  }
  function pedir() {
    if (!raf) raf = requestAnimationFrame(revisar);
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  revisar();
})();
