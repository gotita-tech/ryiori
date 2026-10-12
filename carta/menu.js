(() => {
  const data = window.RYORI_MENU || { products: [] };
  const zona = document.querySelector('#menu-grid');
  const filters = document.querySelector('#filters');
  const search = document.querySelector('#search');
  const count = document.querySelector('#result-count');

  // Categorías en orden, con el ancla que usan los enlaces (/carta/#tablas).
  const categorias = [
    ['Todos', 'todo'], ['Sushi', 'sushi'], ['Cocina japonesa', 'cocina-japonesa'], ['Para compartir', 'tablas'],
    ['Burgers', 'burgers'], ['Ceviches', 'ceviches'], ['Ensaladas', 'ensaladas'], ['Bebidas', 'bebidas'],
    ['Barra', 'barra'], ['Acompañamientos', 'acompanamientos'], ['Extras', 'extras'],
  ];
  const porAncla = Object.fromEntries(categorias.map(([g, a]) => [a, g]));
  const anclaDe = Object.fromEntries(categorias);
  const sugerencias = ['salmón', 'pollo', 'tabla', 'vegetariano', 'tempura', 'burger'];

  let active = porAncla[location.hash.slice(1)] || 'Sushi';

  const esc = v => String(v || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  // Sin tildes ni mayúsculas: «Salmón» y «salmon» se comparan igual.
  const normal = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const textoBusqueda = new Map(data.products.map(p => [p, normal(`${p.name} ${p.description} ${p.category} ${p.group}`)]));

  function renderFilters() {
    filters.innerHTML = categorias.map(([g]) =>
      `<button type="button" class="filter${g === active ? ' active' : ''}" aria-pressed="${g === active}" data-group="${esc(g)}">${esc(g)}</button>`).join('');
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('.filter');
    if (!b) return;
    active = b.dataset.group;
    if (search.value) search.value = '';
    history.replaceState(null, '', '#' + anclaDe[active]);
    renderFilters();
    render();
  });

  const conFotoPrimero = (a, b) => Number(b.image?.includes('assets/menu/')) - Number(a.image?.includes('assets/menu/'));

  function tarjeta(p) {
    return `<article class="menu-card"><div class="card-image ${p.image ? '' : 'no-photo'}">${p.image ? `<img src="../${esc(p.image)}" alt="${esc(p.name)} · ${esc(p.photoReference || 'foto referencial IA')}" loading="lazy"><span class="photo-tag">${esc(p.photoReference || 'Foto referencial · IA')}</span>` : ''}</div><div class="card-body"><span class="card-kicker">${esc(p.group)} · ${esc(p.category.replace(/^\.?\d+(\.\d+)?\s*\.?/, '').toLowerCase())}</span><h3 class="card-title">${esc(p.name)}</h3><p class="card-description">${esc(p.description || 'Consulta los detalles y acompañamientos disponibles al pedir.')}</p><div class="card-bottom"><span class="price">${esc(p.price || 'Consultar')}</span><a class="buy" href="${esc(p.url || data.source)}" target="_blank" rel="noopener">Pedir <span aria-hidden="true">↗</span></a></div></div></article>`;
  }

  function render() {
    const q = normal(search.value);
    if (q) {
      // La búsqueda recorre toda la carta, sin importar la categoría abierta.
      const palabras = q.split(' ');
      const lista = data.products.filter(p => palabras.every(w => textoBusqueda.get(p).includes(w)));
      filters.querySelectorAll('.filter').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      if (!lista.length) {
        count.textContent = `Sin resultados para «${search.value.trim()}»`;
        zona.innerHTML = `<div class="sin-resultados"><p>No encontramos «${esc(search.value.trim())}» en la carta. Revisa cómo está escrito o prueba con:</p><div class="sugerencias">${sugerencias.map(s => `<button type="button" data-sugerencia="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
        return;
      }
      const grupos = categorias.map(([g]) => g).filter(g => g !== 'Todos')
        .map(g => [g, lista.filter(p => p.group === g)]).filter(([, l]) => l.length);
      count.textContent = `${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'} para «${search.value.trim()}» en ${grupos.length} ${grupos.length === 1 ? 'categoría' : 'categorías'}`;
      zona.innerHTML = grupos.map(([g, l]) =>
        `<section class="grupo-resultados" aria-label="${esc(g)}"><h3 class="grupo-titulo">${esc(g)} <span>${l.length}</span></h3><div class="menu-grid">${l.map(tarjeta).join('')}</div></section>`).join('');
      return;
    }
    renderFilters();
    const lista = data.products.filter(p => active === 'Todos' || p.group === active).sort(conFotoPrimero);
    count.textContent = `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'} en ${active === 'Todos' ? 'toda la carta' : active}`;
    zona.innerHTML = `<div class="menu-grid">${lista.map(tarjeta).join('')}</div>`;
  }

  zona.addEventListener('click', e => {
    const s = e.target.closest('[data-sugerencia]');
    if (!s) return;
    search.value = s.dataset.sugerencia;
    render();
    search.focus();
  });
  search.addEventListener('input', render);
  window.addEventListener('hashchange', () => {
    const g = porAncla[location.hash.slice(1)];
    if (g) { active = g; search.value = ''; render(); }
  });

  renderFilters();
  render();
  // Si se llega con un ancla (/carta/#burgers), se baja directo a la categoría.
  if (porAncla[location.hash.slice(1)]) document.querySelector('.menu-browser').scrollIntoView();
})();
