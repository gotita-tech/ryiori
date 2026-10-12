(() => {
  const datos = window.RYORI_MENU;
  const $ = s => document.querySelector(s);
  const zona = $('#secciones');
  const barra = $('#categorias');
  const buscar = $('#buscar');
  const conteo = $('#conteo');
  const vacio = $('#sin-resultados');
  const SUGERENCIAS = ['salmón', 'pollo', 'tabla', 'vegetariano', 'tempura', 'burger'];

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const normal = v => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const precio = n => '$' + Number(n).toLocaleString('es-CL');

  // Índice de productos: clave → producto, y estado de la variante elegida.
  const productos = new Map();
  const elegido = new Map();
  datos.categorias.forEach(c => c.subgrupos.forEach(s => s.productos.forEach(p => {
    productos.set(p.clave, p);
    if (p.variantes) elegido.set(p.clave, [...p.porDefecto]);
  })));
  const varianteDe = p => p.variantes.find(v => v.valores.join('|') === elegido.get(p.clave).join('|'));

  const etiquetasHTML = lista => lista.length
    ? `<ul class="etiquetas" aria-label="Etiquetas">${lista.map(e => `<li class="et-${normal(e)}">${esc(e)}</li>`).join('')}</ul>` : '';

  function opcionesHTML(p) {
    return p.ejes.map((eje, i) => `<div class="opciones" role="group" aria-label="${esc(eje.nombre)}">${eje.valores.map(val => {
      const activo = elegido.get(p.clave)[i] === val;
      return `<button type="button" class="opcion" data-eje="${i}" data-valor="${esc(val)}" aria-pressed="${activo}">${esc(val)}</button>`;
    }).join('')}</div>`).join('');
  }

  function filaPlato(p) {
    const v = p.variantes ? varianteDe(p) : p;
    const etiquetas = p.variantes ? [...new Set([...p.etiquetas, ...v.etiquetas])] : p.etiquetas;
    const nombreCompleto = p.variantes ? `${p.nombre} ${v.valores.join(' ')}` : p.nombre;
    const foto = p.foto ? `<figure class="foto"><img src="../${esc(p.foto.anchos?.[320] || p.foto.src)}"${p.foto.anchos ? ` srcset="${Object.entries(p.foto.anchos).map(([w, u]) => `../${esc(u)} ${w}w`).join(', ')}" sizes="88px"` : ''} alt="" width="88" height="88" loading="lazy" decoding="async">${p.foto.tipo === 'muestra' ? '<figcaption>Foto de muestra</figcaption>' : ''}</figure>` : '';
    const simple = !p.foto && !p.descripcion && !p.variantes && !p.piezas && !etiquetas.length;
    return `<article class="plato${p.foto ? ' con-foto' : ''}${simple ? ' simple' : ''}" data-clave="${esc(p.clave)}">
      ${foto}
      <div class="plato-texto">
        <h4 class="plato-nombre">${esc(p.nombre)}</h4>
        ${p.descripcion ? `<p class="plato-desc">${esc(p.descripcion)}</p>` : ''}
      </div>
      ${p.variantes ? `<div class="plato-opciones">${opcionesHTML(p)}</div>` : ''}
      <div class="plato-pie">
        <div class="plato-meta">${p.piezas ? `<span class="piezas">${esc(p.piezas)}</span>` : ''}${etiquetasHTML(etiquetas)}</div>
        <span class="precio">${precio(v.precio)}</span>
        <a class="pedir" href="${esc(v.url)}" target="_blank" rel="noopener" aria-label="Pedir ${esc(nombreCompleto)} para retirar">Pedir <span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
  }

  function filaLista(p) {
    const v = p.variantes ? varianteDe(p) : p;
    const nombreCompleto = p.variantes ? `${p.nombre} ${v.valores.join(' ')}` : p.nombre;
    return `<div class="trago" data-clave="${esc(p.clave)}">
      <a class="trago-enlace" href="${esc(v.url)}" target="_blank" rel="noopener" aria-label="Pedir ${esc(nombreCompleto)}, ${precio(v.precio)}">
        <span class="trago-nombre">${esc(p.nombre)}</span><span class="trago-relleno" aria-hidden="true"></span><span class="precio">${precio(v.precio)}</span>
      </a>
      ${p.variantes ? opcionesHTML(p) : ''}
    </div>`;
  }

  const SUGERIDOR = `<aside class="tarjeta-sugeridor" aria-labelledby="sugeridor-titulo">
      <svg class="ola" viewBox="0 0 120 12" aria-hidden="true"><use href="#ola"/></svg>
      <h3 id="sugeridor-titulo">¿Son varios? Te sugerimos cuánto pedir</h3>
      <p>Dinos cuántos son y cuánta hambre tienen, y te armamos un pedido con tablas y rolls.</p>
      <a class="boton-mango" href="../sugeridor/">Armar mi pedido</a>
    </aside>`;

  function render() {
    zona.innerHTML = datos.categorias.map(c => `
      <section class="categoria tipo-${c.tipo}" id="${esc(c.id)}" aria-labelledby="t-${esc(c.id)}">
        <h2 class="categoria-titulo" id="t-${esc(c.id)}">${esc(c.nombre)}</h2>
        ${c.subgrupos.map(s => `
          <div class="subgrupo">
            ${s.nombre ? `<h3 class="subgrupo-titulo">${esc(s.nombre)}</h3>` : ''}
            <div class="${c.tipo === 'lista' ? 'lista-tragos' : 'lista-platos'}">${s.productos.map(c.tipo === 'lista' ? filaLista : filaPlato).join('')}</div>
          </div>`).join('')}
        ${c.sugeridor ? SUGERIDOR : ''}
      </section>`).join('');
    barra.innerHTML = datos.categorias.map(c => `<a href="#${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.nombre)}</a>`).join('');
    const fecha = new Date(datos.actualizado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' });
    $('#nota-precios').textContent = `Precios de la carta al ${fecha}. El local confirma el total y la disponibilidad al pedir.`;
  }

  // Cambiar de variante actualiza solo esa fila.
  zona.addEventListener('click', e => {
    const b = e.target.closest('.opcion');
    if (!b) return;
    const fila = b.closest('[data-clave]');
    const p = productos.get(fila.dataset.clave);
    const sel = elegido.get(p.clave);
    sel[Number(b.dataset.eje)] = b.dataset.valor;
    // Si la combinación no existe (ej.: niguiris de camarón solo en 6 u.), se toma la más cercana que sí existe.
    if (!varianteDe(p)) {
      const alterna = p.variantes.find(v => v.valores[Number(b.dataset.eje)] === b.dataset.valor);
      elegido.set(p.clave, [...alterna.valores]);
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = fila.classList.contains('trago') ? filaLista(p) : filaPlato(p);
    const nueva = tmp.firstElementChild;
    fila.replaceWith(nueva);
    marcarDisponibles(nueva, p);
    window.ryoriMarcarEnlaces?.(nueva);
    nueva.querySelector(`.opcion[data-eje="${b.dataset.eje}"][data-valor="${CSS.escape(b.dataset.valor)}"]`)?.focus();
  });

  // Desactiva los valores que no existen con la elección actual del otro eje.
  function marcarDisponibles(fila, p) {
    if (!p.variantes || p.ejes.length < 2) return;
    const sel = elegido.get(p.clave);
    fila.querySelectorAll('.opcion').forEach(b => {
      const i = Number(b.dataset.eje);
      const prueba = [...sel]; prueba[i] = b.dataset.valor;
      const existe = p.variantes.some(v => v.valores.join('|') === prueba.join('|'));
      b.classList.toggle('no-existe', !existe);
      if (!existe) b.setAttribute('aria-label', `${b.dataset.valor} (no disponible con ${sel.filter((_, j) => j !== i).join(' ')})`);
      else b.removeAttribute('aria-label');
    });
  }

  // ---------- Búsqueda en toda la carta ----------
  const textoDe = new Map([...productos.values()].map(p => [p.clave, normal([
    p.nombre, p.descripcion, p.piezas, p.etiquetas.join(' '),
    ...(p.variantes ? p.variantes.flatMap(v => v.valores) : []),
  ].join(' '))]));
  const nombreCategoria = new Map();
  datos.categorias.forEach(c => c.subgrupos.forEach(s => s.productos.forEach(p => nombreCategoria.set(p.clave, normal(`${c.nombre} ${s.nombre || ''}`)))));

  function filtrar() {
    const q = normal(buscar.value);
    const palabras = q ? q.split(' ') : [];
    let total = 0;
    const categoriasCon = new Set();
    zona.querySelectorAll('.categoria').forEach(sec => {
      let enSeccion = 0;
      sec.querySelectorAll('.subgrupo').forEach(sub => {
        let enSub = 0;
        sub.querySelectorAll('[data-clave]').forEach(fila => {
          const k = fila.dataset.clave;
          const ok = !palabras.length || palabras.every(w => textoDe.get(k).includes(w) || nombreCategoria.get(k).includes(w));
          fila.hidden = !ok;
          if (ok) enSub++;
        });
        sub.hidden = !enSub;
        enSeccion += enSub;
      });
      sec.hidden = !enSeccion;
      sec.querySelector('.tarjeta-sugeridor')?.toggleAttribute('hidden', !!palabras.length);
      if (enSeccion) categoriasCon.add(sec.id);
      total += enSeccion;
    });
    barra.querySelectorAll('a').forEach(a => { a.hidden = !categoriasCon.has(a.dataset.cat); });
    if (!palabras.length) {
      conteo.textContent = '';
      vacio.hidden = true;
    } else if (!total) {
      conteo.textContent = `Sin resultados para «${buscar.value.trim()}».`;
      vacio.hidden = false;
      vacio.innerHTML = `<p>No encontramos «${esc(buscar.value.trim())}» en la carta. Revisa cómo está escrito o prueba con:</p>
        <div class="sugerencias">${SUGERENCIAS.map(s => `<button type="button" data-sugerencia="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
    } else {
      conteo.textContent = `${total} ${total === 1 ? 'resultado' : 'resultados'} para «${buscar.value.trim()}» en ${categoriasCon.size} ${categoriasCon.size === 1 ? 'categoría' : 'categorías'}.`;
      vacio.hidden = true;
    }
    marcarActiva();
  }
  let pausa;
  buscar.addEventListener('input', () => {
    clearTimeout(pausa);
    pausa = setTimeout(() => { filtrar(); if (buscar.value) window.scrollTo({ top: 0 }); }, 120);
  });
  vacio.addEventListener('click', e => {
    const s = e.target.closest('[data-sugerencia]');
    if (!s) return;
    buscar.value = s.dataset.sugerencia;
    filtrar();
    buscar.focus();
  });

  // ---------- Barra de categorías que marca la sección visible ----------
  const herramientas = $('.herramientas');
  function marcarActiva() {
    const borde = herramientas.getBoundingClientRect().bottom + 24;
    let actual = null;
    zona.querySelectorAll('.categoria:not([hidden])').forEach(sec => { if (sec.getBoundingClientRect().top <= borde) actual = sec.id; });
    actual ??= zona.querySelector('.categoria:not([hidden])')?.id;
    barra.querySelectorAll('a').forEach(a => {
      const activa = a.dataset.cat === actual;
      if (activa && a.getAttribute('aria-current') !== 'true') {
        // Desliza la barra para que la categoría activa quede a la vista, sin mover la página.
        barra.scrollTo({ left: a.offsetLeft - 16, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      a.toggleAttribute('aria-current', activa);
      if (activa) a.setAttribute('aria-current', 'true');
    });
  }
  let pendiente = false;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; marcarActiva(); });
  }, { passive: true });

  render();
  zona.querySelectorAll('[data-clave]').forEach(f => { const p = productos.get(f.dataset.clave); if (p.variantes) marcarDisponibles(f, p); });
  marcarActiva();
  // Al llegar con un ancla (/carta/#tablas) el navegador baja a la categoría; se repite tras pintar la carta.
  if (location.hash && document.getElementById(location.hash.slice(1))) document.getElementById(location.hash.slice(1)).scrollIntoView();
})();
