// Chester Pet Shop — interacciones mínimas y con propósito.
// 1) Sella (anima) cada renglón del "libro de reclamos" cuando entra en pantalla.
// 2) Marca el link de nav activo según la página actual.

document.addEventListener('DOMContentLoaded', () => {
  // Nav activo
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === here) a.setAttribute('aria-current', 'page');
  });

  // Menú mobile (hamburguesa)
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
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

  // Mascota (perrito) animada: aparece al entrar en pantalla
  const mascots = document.querySelectorAll('.mascot-dog');
  if (mascots.length && 'IntersectionObserver' in window) {
    const ioDog = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            ioDog.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    mascots.forEach((m) => ioDog.observe(m));
  } else {
    mascots.forEach((m) => m.classList.add('in-view'));
  }
});
