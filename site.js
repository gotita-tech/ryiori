// Portada: «Lo más pedido» y «Promos». Los precios y enlaces salen de menu-data.js (Fudo);
// el ranking y las valoraciones, de data/negocio.json (Uber Eats, con fecha).
// Las tarjetas usan como máximo la versión de 480 px: se ven nítidas y la portada pesa menos de 300 KB.
(() => {
  const carta = window.RYORI_MENU;
  if (!carta) return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const precio = n => '$' + Number(n).toLocaleString('es-CL');
  const productos = new Map();
  carta.categorias.forEach(c => c.subgrupos.forEach(s => s.productos.forEach(p => productos.set(p.clave, { ...p, categoria: c.id }))));
  const elegir = (p, valores) => (p.variantes ? p.variantes.find(v => v.valores.join('|') === (valores || p.porDefecto).join('|')) : p);

  // Promos: todos los productos de la categoría «Promos» de la carta.
  const promos = carta.categorias.find(c => c.id === 'promos');
  const lista = document.querySelector('#lista-promos');
  if (promos && lista) {
    lista.innerHTML = promos.subgrupos.flatMap(s => s.productos).map(p => `
      <li>
        <span class="promo-nombre">${esc(p.nombre)}</span>
        <span class="precio">${precio(p.precio)}</span>
        <a class="pedir" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Pedir ${esc(p.nombre)} para retirar">Pedir <span aria-hidden="true">↗</span></a>
      </li>`).join('');
    window.ryoriMarcarEnlaces?.(lista);
  }

  // Lo más pedido, según Uber Eats.
  window.RYORI_NEGOCIO?.then(n => {
    const ol = document.querySelector('#mas-pedido');
    if (!ol) return;
    ol.innerHTML = n.masPedido.productos.map(m => {
      const p = productos.get(m.clave);
      if (!p) return '';
      const v = elegir(p, m.variante);
      const nombre = p.variantes ? `${p.nombre} ${v.valores.join(' ').toLowerCase()}` : p.nombre;
      return `<li class="${m.posicion === 1 ? 'destacado' : ''}">
        <figure>
          ${p.foto ? `<img src="${esc(p.foto.anchos?.[480] || p.foto.src)}"${p.foto.anchos ? ` srcset="${Object.entries(p.foto.anchos).filter(([w]) => w <= 480).map(([w, u]) => `${esc(u)} ${w}w`).join(', ')}" sizes="(min-width: 1100px) 220px, (min-width: 760px) 30vw, 78vw"` : ''} alt="" width="400" height="300" loading="lazy" decoding="async">${p.foto.tipo === 'muestra' ? '<figcaption>Foto de muestra</figcaption>' : ''}` : ''}
        </figure>
        <div class="mp-texto">
          ${m.posicion ? `<p class="mp-puesto">${m.posicion === 1 ? '<svg class="ola" viewBox="0 0 120 12" aria-hidden="true"><use href="#ola"/></svg>' : ''}Nº ${m.posicion} en Uber Eats</p>` : ''}
          <h3>${esc(nombre)}</h3>
          <p class="mp-dato">Le gusta al ${m.positivas} % · ${m.valoraciones} valoraciones</p>
          <div class="mp-pie">
            <span class="precio">${precio(v.precio)}</span>
            <a class="pedir" href="${esc(v.url)}" target="_blank" rel="noopener" aria-label="Pedir ${esc(nombre)} para retirar">Pedir <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </li>`;
    }).join('');
    window.ryoriMarcarEnlaces?.(ol);
  });
})();
