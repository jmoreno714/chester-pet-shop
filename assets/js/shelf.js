// Chester Pet Shop — estante ilustrado del catálogo. Cuando cambia el filtro activo,
// el producto de esa categoría da un saltito, el resto se atenúa y el perro del
// estante (animación Lottie) salta contento y mueve la cola más rápido.
// Tocar un producto del estante aplica ese filtro.

(function () {
  const shelf = document.querySelector('.catalog-shelf');
  const filters = document.querySelector('.catalog-filters');
  if (!shelf || !filters) return;
  const items = [...shelf.querySelectorAll('.shelf-item')];
  const dogBox = shelf.querySelector('.shelf-lottie');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // perro: Lottie gratuito de LottieFiles (perro marrón sentado, Lottie Simple License),
  // recoloreado a la paleta de Chester; mueve la cola en loop
  let dog = null, calm = 0;
  if (dogBox && window.lottie) {
    dog = window.lottie.loadAnimation({
      container: dogBox, renderer: 'svg', loop: true, autoplay: !reduce.matches,
      path: 'assets/data/perro-estante.json',
      rendererSettings: { preserveAspectRatio: 'xMidYMax meet' },
    });
    // solo anima mientras el estante está en pantalla
    new IntersectionObserver((e) => {
      if (reduce.matches) return;
      e[0].isIntersecting ? dog.play() : dog.pause();
    }).observe(shelf);
  }

  // reinicia una animación CSS aunque ya esté aplicada
  const replay = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };

  function celebrate() {
    if (!dog || reduce.matches) return;
    replay(dogBox, 'is-happy');      // salto (CSS)
    dog.setSpeed(2.4);               // cola contenta
    clearTimeout(calm);
    calm = setTimeout(() => dog.setSpeed(1), 1200);
  }

  let current = null;
  function sync() {
    const active = filters.querySelector('.filter-btn.is-active');
    const cat = active ? active.dataset.cat : 'todos';
    if (cat === current) return;
    const first = current === null;
    current = cat;
    items.forEach((it) => {
      const match = it.dataset.cat === cat;
      it.classList.toggle('is-dim', cat !== 'todos' && !match);
      if (match && !first) replay(it, 'is-picked');
    });
    if (!first) celebrate();
  }

  // el catálogo marca el botón activo (también al entrar con #categoria); seguimos ese estado
  new MutationObserver(sync).observe(filters, { attributes: true, subtree: true, attributeFilter: ['class'] });
  sync();

  // el estante también filtra: tocar un producto equivale a tocar su botón
  items.forEach((it) => it.addEventListener('click', () => {
    const btn = filters.querySelector(`.filter-btn[data-cat="${it.dataset.cat}"]`);
    if (btn) btn.click();
  }));
})();
