// Sugeridor «¿Cuánto pedimos?». Reglas en data/sugeridor.json; precios desde menu-data.js (Fudo).
(() => {
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const precio = n => '$' + Number(n).toLocaleString('es-CL');

  // Productos de la carta por id de Fudo (los que tienen variantes se buscan dentro de ellas).
  const carta = new Map();
  for (const c of window.RYORI_MENU.categorias) for (const s of c.subgrupos) for (const p of s.productos) {
    for (const v of p.variantes || [p]) carta.set(v.id, {
      nombre: p.variantes ? `${p.nombre} ${v.valores.join(' ')}` : p.nombre,
      precio: v.precio, url: v.url, piezasTexto: p.piezas,
    });
  }

  // Combinación más barata que cubre las piezas; si empatan en precio, la de menos productos.
  function calcular(productos, piezasNecesarias) {
    let mejor = null;
    const cant = new Array(productos.length).fill(0);
    (function probar(i, piezas, costo, unidades) {
      if (piezas >= piezasNecesarias) {
        const conPrincipal = productos.some((p, k) => cant[k] > 0 && !p.acompanamiento);
        if (conPrincipal && (!mejor || costo < mejor.costo || (costo === mejor.costo && unidades < mejor.unidades))) {
          mejor = { costo, unidades, piezas, cantidades: [...cant] };
        }
        return; // agregar más solo encarece
      }
      if (i === productos.length) return;
      if (mejor && costo >= mejor.costo && unidades >= mejor.unidades) return;
      const p = productos[i];
      for (let n = 0; n <= p.max; n++) {
        cant[i] = n;
        probar(i + 1, piezas + n * p.piezas, costo + n * p.precio, unidades + n);
      }
      cant[i] = 0;
    })(0, 0, 0, 0);
    return mejor;
  }

  const estado = { personas: 2, hambre: null, preferencia: null, bebida: false };
  let reglas, negocio, ultimo = null, mensaje = '';

  function opciones(contenedor, lista, clave, detalle) {
    contenedor.innerHTML = lista.map(o => `<button type="button" class="eleccion" data-valor="${esc(o.id)}" aria-pressed="${o.id === estado[clave]}">
      <strong>${esc(o.nombre)}</strong><span>${esc(detalle(o))}</span></button>`).join('');
    contenedor.onclick = e => {
      const b = e.target.closest('.eleccion');
      if (!b) return;
      estado[clave] = b.dataset.valor;
      contenedor.querySelectorAll('.eleccion').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      actualizar();
    };
  }

  function actualizar() {
    const { min, max } = reglas.personas;
    $('#personas-n').textContent = estado.personas;
    $('#personas-txt').textContent = estado.personas === 1 ? 'persona' : 'personas';
    $('#menos').disabled = estado.personas <= min;
    $('#mas').disabled = estado.personas >= max;

    const hambre = reglas.hambre.find(h => h.id === estado.hambre);
    const pref = reglas.preferencias.find(p => p.id === estado.preferencia);
    const productos = pref.productos.map(r => ({ ...r, ...carta.get(r.id), nombre: r.nombre || carta.get(r.id)?.nombre })).filter(p => p.precio);
    const necesarias = estado.personas * hambre.piezas;
    const r = calcular(productos, necesarias);
    if (!r) { $('#lineas').innerHTML = '<li>No encontramos una combinación con estos productos. Elige en la carta.</li>'; return; }

    const lineas = productos.map((p, i) => ({ p, n: r.cantidades[i] })).filter(l => l.n).map(({ p, n }) => {
      const alternativas = (p.alternativas || []).map(id => carta.get(id)).filter(Boolean);
      const detalle = [`${p.piezas} piezas c/u`, p.nota, alternativas.length ? `o ${alternativas.map(a => `${a.nombre} (${precio(a.precio)})`).join(' o ')}` : '']
        .filter(Boolean).join(' · ');
      const eleccion = alternativas.length ? [carta.get(p.id).nombre, ...alternativas.map(a => a.nombre)] : null;
      return { cantidad: n, nombre: p.nombre, detalle, subtotal: n * p.precio, base: eleccion ? eleccion[0] : null,
        eleccion: eleccion ? `${eleccion.slice(0, -1).join(', ')} o ${eleccion.at(-1)}` : null };
    });
    if (estado.bebida) {
      const b = carta.get(reglas.bebida.id);
      if (b) lineas.push({ cantidad: estado.personas, nombre: reglas.bebida.nombre, detalle: 'una por persona', subtotal: estado.personas * b.precio });
    }
    const total = lineas.reduce((s, l) => s + l.subtotal, 0);
    const porPersona = Math.round((r.piezas / estado.personas) * 10) / 10;

    $('#lineas').innerHTML = lineas.map(l => `<li>
      <span class="cant">${l.cantidad} ×</span>
      <span class="prod"><strong>${esc(l.nombre)}</strong>${l.base ? `<small>Precio de ${esc(l.base)}</small>` : ''}<small>${esc(l.detalle)}</small></span>
      <span class="precio">${precio(l.subtotal)}</span></li>`).join('');
    $('#piezas-total').textContent = `${r.piezas} piezas en total · ${String(porPersona).replace('.', ',')} por persona (pediste ${hambre.piezas} c/u)`;
    $('#total').textContent = precio(total);
    const fecha = new Date(window.RYORI_MENU.actualizado).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
    $('#aviso').textContent = `Precios de la carta al ${fecha}. El local confirma el total y la disponibilidad.`;

    mensaje = [
      'Hola Ryori, quiero hacer este pedido:', '',
      ...lineas.map(l => `• ${l.cantidad} × ${l.nombre}${l.eleccion ? ` (${l.eleccion})` : ''}: ${precio(l.subtotal)}`), '',
      `Total estimado: ${precio(total)} (precios de la carta al ${fecha})`,
      `Somos ${estado.personas} ${estado.personas === 1 ? 'persona' : 'personas'}.`, '',
      '¿Está todo disponible? ¿A qué hora lo podría retirar?',
    ].join('\n');
    $('#enviar').href = `https://wa.me/${negocio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;

    // Medición: una vez por combinación, cuando la persona deja de mover los controles.
    clearTimeout(actualizar.t);
    actualizar.t = setTimeout(() => {
      const clave = `${estado.personas}|${estado.hambre}|${estado.preferencia}`;
      if (clave !== ultimo) { ultimo = clave; window.ryoriEvento?.('sugeridor_usado', { personas: estado.personas, hambre: estado.hambre, preferencia: estado.preferencia }); }
    }, 1500);
  }

  $('#enviar').addEventListener('click', e => {
    window.ryoriEvento?.('sugeridor_whatsapp', { personas: estado.personas, hambre: estado.hambre, preferencia: estado.preferencia, bebida: estado.bebida });
    if (negocio.modoDemo) {
      // En la demo no se escribe al local: se muestra el mensaje en pantalla.
      e.preventDefault();
      e.stopImmediatePropagation();
      $('#demo-mensaje').textContent = mensaje;
      $('#demo').showModal();
    }
  }, true);

  Promise.all([fetch('/data/sugeridor.json').then(r => r.json()), window.RYORI_NEGOCIO]).then(([s, n]) => {
    reglas = s; negocio = n;
    estado.personas = s.personas.inicial;
    estado.hambre = s.hambre.find(h => h.inicial).id;
    estado.preferencia = s.preferencias.find(p => p.inicial).id;
    estado.bebida = !!s.bebida.inicial;
    opciones($('#hambre'), s.hambre, 'hambre', h => `${h.piezas} piezas por persona`);
    opciones($('#preferencia'), s.preferencias, 'preferencia', p => p.detalle || (p.id === 'todo' ? 'Tablas, rolls y gyosas' : 'Rolls vegetarianos y gyosas de verduras'));
    $('#bebida').checked = estado.bebida;
    $('#bebida').onchange = e => { estado.bebida = e.target.checked; actualizar(); };
    $('#menos').onclick = () => { estado.personas = Math.max(s.personas.min, estado.personas - 1); actualizar(); };
    $('#mas').onclick = () => { estado.personas = Math.min(s.personas.max, estado.personas + 1); actualizar(); };
    actualizar();
  });

  // Para las pruebas automáticas.
  window.RYORI_SUGERIDOR = { calcular, estado, actualizar: () => actualizar(), mensaje: () => mensaje };
})();
