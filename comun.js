// Compartido por todas las páginas: estado «Abierto · cierra a las…» calculado desde data/negocio.json.
// Expone window.RYORI_NEGOCIO (promesa con los datos del local) para que otras páginas los usen.
(() => {
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const aMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  const hora = h => (h === '24:00' ? 'medianoche' : `las ${h}`);

  // Día y minuto actuales en la hora de Chile, sin importar dónde esté el teléfono.
  function ahoraEn(zona) {
    const partes = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: zona, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
    return { dia, minuto: Number(partes.hour) * 60 + Number(partes.minute) };
  }

  function estado(horario, zona) {
    const { dia, minuto } = ahoraEn(zona);
    const tramos = d => horario.dias[String((d + 7) % 7)] || [];
    for (const [abre, cierra] of tramos(dia)) {
      if (minuto >= aMin(abre) && minuto < aMin(cierra)) return { abierto: true, texto: `Abierto · cierra a ${hora(cierra)}` };
    }
    const luego = tramos(dia).find(([abre]) => aMin(abre) > minuto);
    if (luego) return { abierto: false, texto: `Cerrado · abre hoy a ${hora(luego[0])}` };
    for (let i = 1; i <= 7; i++) {
      const t = tramos(dia + i)[0];
      if (t) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? 'mañana' : `el ${DIAS[(dia + i) % 7]}`} a ${hora(t[0])}` };
    }
    return null;
  }

  const raiz = document.documentElement.dataset.raiz || '/';
  window.RYORI_NEGOCIO = fetch(`${raiz}data/negocio.json`).then(r => r.json());
  window.RYORI_NEGOCIO.then(n => {
    const pintar = () => {
      const e = estado(n.horario, n.zonaHoraria);
      if (!e) return;
      document.querySelectorAll('[data-estado]').forEach(el => {
        el.textContent = e.texto;
        el.dataset.abierto = e.abierto ? 'si' : 'no';
      });
    };
    pintar();
    setInterval(pintar, 60000);
  }).catch(() => { /* sin datos no se muestra el estado; el resto de la página funciona igual */ });
})();

// ---------- Medición: UTM en cada salida y eventos de clic ----------
// Las salidas a Fudo, Uber Eats, WhatsApp y Google Maps llevan utm_* con la ubicación del enlace,
// y cada clic se registra como evento para Vercel Web Analytics (window.va).
(() => {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  // Disponible para otras páginas (el sugeridor la usa): ryoriEvento('nombre', { dato: 'valor' })
  window.ryoriEvento = (name, data) => { try { window.va('event', { name, data }); } catch { /* sin analítica */ } };

  const UTM = { utm_source: 'sitio-ryori', utm_medium: 'web', utm_campaign: 'pedidos' };
  const canalDe = url => {
    if (url.hostname === 'menu.fu.do') return url.pathname.split('/').filter(Boolean).length > 1 ? 'pedir' : 'retiro';
    if (url.hostname.endsWith('ubereats.com')) return 'delivery';
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') return 'whatsapp';
    if (url.hostname.endsWith('google.com') && url.pathname.startsWith('/maps')) return 'mapa';
    return null;
  };
  const ubicacionDe = a => {
    const z = a.closest('[data-ubicacion], .cabecera, .barra-canales, .wa-flotante, .portada, .tarjeta-sugeridor, [data-clave], section[id], .pie, main');
    if (!z) return 'pagina';
    return z.dataset.ubicacion || (z.classList.contains('wa-flotante') ? 'boton-flotante' : z.classList.contains('barra-canales') ? 'barra-fija'
      : z.classList.contains('cabecera') ? 'cabecera' : z.classList.contains('portada') ? 'portada' : z.dataset.clave ? 'carta' : z.id || z.className.split(' ')[0] || 'pagina');
  };
  function marcar(a) {
    let url;
    try { url = new URL(a.href); } catch { return null; }
    const canal = canalDe(url);
    if (!canal) return null;
    const ubicacion = ubicacionDe(a);
    for (const [k, v] of Object.entries(UTM)) url.searchParams.set(k, v);
    url.searchParams.set('utm_content', ubicacion);
    if (a.href !== url.href) a.href = url.href;
    return { canal, ubicacion, producto: a.closest('[data-clave]')?.dataset.clave };
  }
  const marcarTodo = (raiz = document) => raiz.querySelectorAll('a[href^="http"]').forEach(marcar);
  window.ryoriMarcarEnlaces = marcarTodo;
  document.addEventListener('DOMContentLoaded', () => marcarTodo());
  // Los enlaces que se pintan después (carta, lo más pedido) se marcan al tocarlos.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="http"]');
    if (!a) return;
    const info = marcar(a);
    if (info) window.ryoriEvento(`clic_${info.canal}`, { ubicacion: info.ubicacion, ...(info.producto ? { producto: info.producto } : {}) });
  }, true);

  // El script de Vercel Web Analytics solo se carga si está activado en data/negocio.json.
  window.RYORI_NEGOCIO?.then(n => {
    if (!n.analitica) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
  }).catch(() => {});
})();
