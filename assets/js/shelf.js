// Chester Pet Shop — estante ilustrado del catálogo. Cuando cambia el filtro activo,
// el producto de esa categoría da un saltito, el resto se atenúa y el salchicha
// mueve la cola y parpadea. Tocar un producto del estante aplica ese filtro.

(function () {
  const shelf = document.querySelector('.catalog-shelf');
  const filters = document.querySelector('.catalog-filters');
  if (!shelf || !filters) return;
  const items = [...shelf.querySelectorAll('.shelf-item')];
  const dog = shelf.querySelector('.shelf-dog');

  // reinicia una animación CSS aunque ya esté aplicada
  const replay = (el, cls) => { el.classList.remove(cls); void el.getBBox(); el.classList.add(cls); };

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
    if (!first && dog) replay(dog, 'is-happy'); // mueve la cola y parpadea
  }

  // el catálogo marca el botón activo (también al abrir con ?cat=); seguimos ese estado
  new MutationObserver(sync).observe(filters, { attributes: true, subtree: true, attributeFilter: ['class'] });
  sync();

  // el estante también filtra: tocar un producto equivale a tocar su botón
  items.forEach((it) => it.addEventListener('click', () => {
    const btn = filters.querySelector(`.filter-btn[data-cat="${it.dataset.cat}"]`);
    if (btn) btn.click();
  }));
})();
