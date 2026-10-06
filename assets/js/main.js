// Chester Pet Shop — interacciones mínimas y con propósito.
// 1) Sella (anima) cada renglón del "libro de reclamos" cuando entra en pantalla.
// 2) Marca el link de nav activo según la página actual.

document.addEventListener('DOMContentLoaded', () => {
  // Nav activo
  const here = location.pathname.split('/').pop() || 'index.html';
  // los botones no: "Hacer pedido" apunta al catálogo y quedaría bordó sobre bordó
  document.querySelectorAll('nav.main-nav a:not(.btn)').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === here) a.setAttribute('aria-current', 'page');
  });

  // Menú mobile (hamburguesa)
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    // al cerrar, el menú sube y se desvanece (150ms, CSS) antes de ocultarse
    let cerrando = 0;
    toggle.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true' && !cerrando;
      clearTimeout(cerrando);
      cerrando = 0;
      nav.removeAttribute('data-closing');
      toggle.setAttribute('aria-expanded', String(!open));
      if (!open) {
        nav.setAttribute('data-open', 'true');
        return;
      }
      nav.setAttribute('data-closing', 'true');
      cerrando = setTimeout(() => {
        cerrando = 0;
        nav.removeAttribute('data-closing');
        nav.setAttribute('data-open', 'false');
      }, 150);
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Animación de sello al hacer scroll (respeta prefers-reduced-motion vía CSS)
  const items = document.querySelectorAll('.promise-card');
  if (items.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // pequeño delay escalonado, como si se sellaran una tras otra
            setTimeout(() => entry.target.classList.add('is-stamped'), i * 90);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    items.forEach((item) => io.observe(item));
  } else {
    items.forEach((item) => item.classList.add('is-stamped'));
  }
});
