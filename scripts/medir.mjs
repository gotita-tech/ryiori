// Mide portada y carta en un teléfono emulado y en escritorio, y guarda un JSON.
// Uso: node scripts/medir.mjs [urlBase] [salida.json]
//   urlBase por defecto: https://ryiori.vercel.app
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { lanzarChrome, emular, redLenta, sinLimites, navegar, evaluar, espera, PERFILES } from './lib/cdp.mjs';

const BASE = (process.argv[2] || 'https://ryiori.vercel.app').replace(/\/$/, '');
const SALIDA = process.argv[3] || 'docs/qa/medicion.json';

// Se inyecta antes de cargar la página para registrar el LCP.
const OBSERVADOR_LCP = `
  window.__lcp = null;
  new PerformanceObserver(l => { const e = l.getEntries().at(-1); window.__lcp = { t: e.startTime, el: e.element ? (e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '') + (e.url ? ' ' + e.url.split('/').pop() : '')) : e.url }; })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  window.__cls = 0;
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
`;

// Contraste, textos pequeños y áreas táctiles, calculados dentro de la página.
const AUDITORIA_VISUAL = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055) ** 2.4; }); return 0.2126*r + 0.7152*g + 0.0722*b; };
  const rgba = s => { const m = s.match(/[\\d.]+/g); return m ? m.map(Number).concat(m.length === 3 ? [1] : []) : [0,0,0,0]; };
  const mezcla = (a, b) => [0,1,2].map(i => a[i]*a[3] + b[i]*(1-a[3])).concat([1]);
  const fondo = el => {
    const capas = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('gradient')) return null;
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) { capas.push(c); if (c[3] >= 1) break; }
    }
    let r = [255,255,255,1];
    for (const c of capas.reverse()) r = mezcla(c, r);
    return r;
  };
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
  const textos = [...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && visible(el));
  const sobreImagen = el => { const r = el.getBoundingClientRect(); const x = r.left + r.width/2, y = r.top + r.height/2; return document.elementsFromPoint(x, y).some(n => n.tagName === 'IMG' && !el.contains(n)); };
  let bajoContraste = [], pequenos = [];
  for (const el of textos) {
    const cs = getComputedStyle(el);
    const tam = parseFloat(cs.fontSize);
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 40);
    if (tam < 12) pequenos.push({ txt, px: tam });
    const fg = rgba(cs.color), bg = fondo(el);
    if (!bg) continue;
    const f = mezcla(fg, bg);
    const L1 = lum(f), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const grande = tam >= 24 || (tam >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (grande ? 3 : 4.5)) bajoContraste.push({ txt, ratio: +ratio.toFixed(2), color: cs.color, px: tam });
  }
  const tactiles = [...document.querySelectorAll('a[href], button, input, select, textarea, [role=button]')].filter(visible).map(el => {
    const r = el.getBoundingClientRect();
    return { txt: (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim().replace(/\\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) };
  });
  return {
    textosTotal: textos.length,
    textosMenos12: pequenos.length, ejemplosPequenos: pequenos.slice(0, 12),
    contrasteBajo: bajoContraste.length, ejemplosContraste: bajoContraste.slice(0, 12),
    tactilesTotal: tactiles.length,
    tactilesMenos44: tactiles.filter(t => t.h < 44 || t.w < 44).length,
    ejemplosTactiles: tactiles.filter(t => t.h < 44 || t.w < 44).slice(0, 15),
  };
})()`;

async function cargaLenta(chrome, url) {
  const tab = await chrome.pestana();
  await emular(tab, PERFILES.telefono);
  await redLenta(tab);
  await tab.send('Page.enable');
  await tab.send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVADOR_LCP });
  const peticiones = new Map();
  tab.on('Network.responseReceived', p => peticiones.set(p.requestId, { url: p.response.url, tipo: p.type, bytes: 0 }));
  tab.on('Network.loadingFinished', p => { const r = peticiones.get(p.requestId); if (r) r.bytes = p.encodedDataLength; });
  // Los oyentes de navegar() se registran aparte; estos se conservan para contar bytes.
  const t0 = Date.now();
  await navegar(tab, url, { calma: 2000, maximo: 90000 });
  const lcp = await evaluar(tab, 'window.__lcp');
  const cls = await evaluar(tab, 'window.__cls');
  const lista = [...peticiones.values()];
  const total = lista.reduce((s, r) => s + r.bytes, 0);
  const porTipo = {};
  for (const r of lista) porTipo[r.tipo] = (porTipo[r.tipo] || 0) + r.bytes;
  const mayores = lista.sort((a, b) => b.bytes - a.bytes).slice(0, 6).map(r => ({ url: r.url.replace(BASE, ''), kb: Math.round(r.bytes / 1024) }));
  tab.cerrar();
  return {
    url, lcpMs: lcp ? Math.round(lcp.t) : null, lcpElemento: lcp?.el, cls: +cls.toFixed(3),
    pesoKB: Math.round(total / 1024), peticiones: lista.length,
    porTipoKB: Object.fromEntries(Object.entries(porTipo).map(([k, v]) => [k, Math.round(v / 1024)])),
    mayores, duracionMs: Date.now() - t0,
  };
}

async function abrir(chrome, url, perfil) {
  const tab = await chrome.pestana();
  await emular(tab, perfil);
  await tab.send('Network.enable');
  await sinLimites(tab);
  await navegar(tab, url, { calma: 800 });
  await espera(500);
  return tab;
}

// Mide la carta actual (versión de la fase 0: filtros .filter, #search, #menu-grid, #result-count).
// Si la carta nueva existe, usa sus propios selectores (data-categoria) — ver medir-carta en fases siguientes.
async function medirCarta(chrome, perfil) {
  const tab = await abrir(chrome, `${BASE}/carta/`, perfil);
  const r = await evaluar(tab, `(async () => {
    const pausa = ms => new Promise(r => setTimeout(r, ms));
    const out = { categorias: {}, busquedas: {} };
    if (document.querySelector('#secciones')) {
      // Carta nueva (fase 2): una sola página con todas las categorías.
      // Se dibujan todas las secciones para medir su alto real (la carta usa content-visibility).
      document.querySelectorAll('.categoria').forEach(sec => { sec.style.contentVisibility = 'visible'; });
      await pausa(300);
      const primero = document.querySelector('#secciones [data-clave]');
      out.primerProductoPx = Math.round(primero.getBoundingClientRect().top + scrollY);
      out.altoDocumentoPx = document.documentElement.scrollHeight;
      for (const sec of document.querySelectorAll('.categoria')) {
        out.categorias[sec.id] = { altoPx: Math.round(sec.getBoundingClientRect().height), filas: sec.querySelectorAll('[data-clave]').length };
      }
      const sushi = document.querySelector('#sushi');
      scrollTo(0, sushi.getBoundingClientRect().top + scrollY + 1500); await pausa(400);
      const barra = document.querySelector('#categorias').getBoundingClientRect();
      out.filtrosVisiblesAlBajar = barra.top >= 0 && barra.bottom <= innerHeight;
      out.categoriaMarcadaEnSushi = document.querySelector('#categorias [aria-current="true"]')?.dataset.cat;
      scrollTo(0, 0); await pausa(100);
      const s = document.querySelector('#buscar');
      const buscar = async q => {
        s.value = q; s.dispatchEvent(new Event('input')); await pausa(300);
        const filas = [...document.querySelectorAll('#secciones [data-clave]')].filter(f => !f.hidden && !f.closest('[hidden]'));
        const res = { conteo: document.querySelector('#conteo').textContent, filas: filas.length,
          categorias: [...new Set(filas.map(f => f.closest('.categoria').id))].join(', ') };
        s.value = ''; s.dispatchEvent(new Event('input')); await pausa(300);
        return res;
      };
      for (const q of ['burger', 'salmon', 'salmón', 'SALMÓN', 'gyosas', 'pizza']) out.busquedas[q] = await buscar(q);
      return out;
    }
    const tarjeta = document.querySelector('.menu-card, [data-producto]');
    out.primerProductoPx = tarjeta ? Math.round(tarjeta.getBoundingClientRect().top + scrollY) : null;
    out.altoDocumentoPx = document.documentElement.scrollHeight;
    const filtros = [...document.querySelectorAll('#filters .filter')];
    if (filtros.length) {
      out.filasDeFiltros = new Set(filtros.map(b => Math.round(b.getBoundingClientRect().top))).size;
      for (const b of filtros) {
        b.click(); await pausa(250);
        const grid = document.querySelector('#menu-grid');
        out.categorias[b.dataset.group] = { altoPx: Math.round(grid.getBoundingClientRect().height), productos: grid.children.length, documentoPx: document.documentElement.scrollHeight };
      }
      // ¿la barra de filtros acompaña al bajar?
      document.querySelector('[data-group="Sushi"]').click(); await pausa(200);
      scrollTo(0, 5000); await pausa(200);
      const f = document.querySelector('#filters').getBoundingClientRect();
      out.filtrosVisiblesAlBajar = f.bottom > 0 && f.top < innerHeight;
      scrollTo(0, 0);
      const buscar = async (texto, grupo) => {
        document.querySelector('[data-group="' + grupo + '"]').click(); await pausa(150);
        const s = document.querySelector('#search'); s.value = texto; s.dispatchEvent(new Event('input')); await pausa(250);
        const res = { conteo: document.querySelector('#result-count').textContent.trim(), tarjetas: document.querySelectorAll('#menu-grid .menu-card').length };
        s.value = ''; s.dispatchEvent(new Event('input'));
        return res;
      };
      out.busquedas['burger con Sushi activo'] = await buscar('burger', 'Sushi');
      out.busquedas['burger con Todos'] = await buscar('burger', 'Todos');
      out.busquedas['salmon con Sushi activo'] = await buscar('salmon', 'Sushi');
      out.busquedas['salmón con Sushi activo'] = await buscar('salmón', 'Sushi');
      out.busquedas['salmon con Todos'] = await buscar('salmon', 'Todos');
      out.busquedas['salmón con Todos'] = await buscar('salmón', 'Todos');
      out.busquedas['SALMON con Todos'] = await buscar('SALMON', 'Todos');
      document.querySelector('[data-group="Sushi"]').click(); await pausa(200);
    }
    return out;
  })()`);
  r.visual = await evaluar(tab, AUDITORIA_VISUAL);
  tab.cerrar();
  return r;
}

async function medirPortada(chrome, perfil) {
  const tab = await abrir(chrome, `${BASE}/`, perfil);
  const r = await evaluar(tab, `(() => {
    const boton = [...document.querySelectorAll('.portada .canal-retiro, .hero a, .hero button')][0];
    const b = boton?.getBoundingClientRect();
    return {
      altoDocumentoPx: document.documentElement.scrollHeight,
      botonPrincipal: boton ? { texto: boton.textContent.trim().replace(/\\s+/g,' '), arribaPx: Math.round(b.top), abajoPx: Math.round(b.bottom), completoEnPantalla: b.bottom <= innerHeight } : null,
      franjaNaranja: !!document.querySelector('.ribbon'),
      franjaDesborda: (() => { const e = document.querySelector('.ribbon'); return e ? e.scrollWidth > e.clientWidth : false; })(),
      enlacesExternos: [...document.querySelectorAll('a[href^="http"]')].map(a => a.href.split('?')[0]).filter((v, i, x) => x.indexOf(v) === i),
      mencionaFudo: /fudo/i.test(document.body.innerText),
      tieneUberEats: !!document.querySelector('a[href*="ubereats"]'),
    };
  })()`);
  r.visual = await evaluar(tab, AUDITORIA_VISUAL);
  tab.cerrar();
  return r;
}

const chrome = await lanzarChrome();
const resultado = { base: BASE, fecha: new Date().toISOString(), condiciones: 'Teléfono 390×844 (DPR 3), 1,6 Mbps, 150 ms, CPU ×4, caché desactivada' };
try {
  console.log('Carga lenta: portada…');
  resultado.cargaPortada = await cargaLenta(chrome, `${BASE}/`);
  console.log('Carga lenta: carta…');
  resultado.cargaCarta = await cargaLenta(chrome, `${BASE}/carta/`);
  console.log('Portada en teléfono, escritorio y laptop…');
  resultado.portadaTelefono = await medirPortada(chrome, PERFILES.telefono);
  resultado.portadaEscritorio = await medirPortada(chrome, PERFILES.escritorio);
  resultado.portadaLaptop1536x639 = await medirPortada(chrome, PERFILES.laptop);
  console.log('Carta en teléfono y escritorio…');
  resultado.cartaTelefono = await medirCarta(chrome, PERFILES.telefono);
  resultado.cartaEscritorio = await medirCarta(chrome, PERFILES.escritorio);
} finally {
  await chrome.cerrar();
}
mkdirSync(dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, JSON.stringify(resultado, null, 2));
console.log(JSON.stringify(resultado, null, 2));
