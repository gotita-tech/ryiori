// Recorre los trayectos del cliente en teléfono y escritorio y registra errores de consola.
// Uso: node scripts/recorridos.mjs [urlBase=http://localhost:4173] [salida=docs/qa/recorridos.md]
// Solo LEE: abre la página de un producto en Fudo para comprobar el destino, pero no agrega nada al pedido.
// No abre Uber Eats ni WhatsApp: comprueba que el enlace apunte al destino correcto.
import { writeFileSync } from 'node:fs';
import { lanzarChrome, emular, navegar, evaluar, espera, PERFILES } from './lib/cdp.mjs';

const BASE = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const SALIDA = process.argv[3] || 'docs/qa/recorridos.md';
const chrome = await lanzarChrome();
const filas = [];

async function pagina(url, perfil, errores) {
  const tab = await chrome.pestana();
  await emular(tab, PERFILES[perfil]);
  await tab.send('Network.enable'); await tab.send('Runtime.enable'); await tab.send('Log.enable');
  tab.on('Runtime.exceptionThrown', p => errores.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text));
  tab.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errores.push('console.error ' + JSON.stringify(p.args.map(a => a.value))); });
  tab.on('Log.entryAdded', p => { if (p.entry.level === 'error' && (p.entry.url || '').startsWith(BASE)) errores.push(p.entry.text + ' ' + p.entry.url); });
  await navegar(tab, url, { calma: 800 });
  return tab;
}

// Toca un enlace sin salir del sitio: se cancela la navegación y se devuelve a dónde iba.
const tocar = (tab, selector) => evaluar(tab, `(() => {
  const a = document.querySelector(${JSON.stringify(selector)});
  if (!a) return null;
  const r = a.getBoundingClientRect();
  a.addEventListener('click', e => e.preventDefault(), { once: true });
  a.click();
  return { href: a.href, visible: r.width > 0 && r.height > 0, texto: (a.getAttribute('aria-label') || a.textContent).trim().replace(/\\s+/g, ' ') };
})()`);

async function fudoMuestra(url, nombre) {
  const errores = [];
  const tab = await pagina(url, 'telefono', errores);
  await espera(800);
  const t = await evaluar(tab, 'document.body.innerText');
  tab.cerrar();
  return (!nombre || t.includes(nombre)) && /agregar a mi pedido|para retirar|menú|carta/i.test(t);
}

async function trayecto(nombre, perfil, pasos) {
  const errores = [];
  let detalle = '', ok = false;
  try { [ok, detalle] = await pasos(errores); } catch (e) { detalle = 'Falló: ' + e.message; }
  filas.push({ nombre, perfil, ok: ok && !errores.length, detalle, errores });
  console.log(`${ok && !errores.length ? '✓' : '✗'} [${perfil}] ${nombre}: ${detalle}${errores.length ? ' · errores: ' + errores.join(' | ') : ''}`);
}

try {
  for (const perfil of ['telefono', 'escritorio']) {
    const selCanal = c => perfil === 'telefono' ? `.portada .canal-${c}` : `.portada .canal-${c}`;

    await trayecto('Portada → retiro', perfil, async errores => {
      const tab = await pagina(`${BASE}/`, perfil, errores);
      const a = await tocar(tab, selCanal('retiro')); tab.cerrar();
      const fudo = a && new URL(a.href).hostname === 'menu.fu.do' && await fudoMuestra(a.href);
      return [!!(a?.visible && fudo), `«${a?.texto}» → ${a?.href.split('?')[0]} (Fudo abre: ${fudo ? 'sí' : 'no'})`];
    });

    await trayecto('Portada → delivery', perfil, async errores => {
      const tab = await pagina(`${BASE}/`, perfil, errores);
      const a = await tocar(tab, selCanal('delivery')); tab.cerrar();
      const ok = a?.visible && a.href.startsWith('https://www.ubereats.com/') && a.href.includes('pJ2VaHH-VmKoWFzFx3EKbg');
      return [ok, `«${a?.texto}» → ${a?.href.split('?')[0]}`];
    });

    await trayecto('Portada → WhatsApp', perfil, async errores => {
      const tab = await pagina(`${BASE}/`, perfil, errores);
      const sel = perfil === 'telefono' ? '.barra-canales .wa-redondo' : '.wa-flotante';
      const a = await tocar(tab, sel);
      const b = await tocar(tab, selCanal('whatsapp')); tab.cerrar();
      const ok = a?.visible && b?.visible && [a, b].every(x => x.href.startsWith('https://wa.me/56999518653'));
      return [ok, `botón redondo «${a?.texto}» y «${b?.texto}» → wa.me/56999518653`];
    });

    await trayecto('Portada → sugeridor → mensaje de WhatsApp', perfil, async errores => {
      const tab = await pagina(`${BASE}/`, perfil, errores);
      const a = await tocar(tab, '.tarjeta-sugeridor .boton-mango'); tab.cerrar();
      const tab2 = await pagina(a.href, perfil, errores);
      const r = await evaluar(tab2, `(async () => {
        document.querySelector('#mas').click(); document.querySelector('#mas').click();
        document.querySelector('#hambre [data-valor="hambre"]').click();
        await new Promise(r => setTimeout(r, 100));
        document.querySelector('#enviar').click();
        await new Promise(r => setTimeout(r, 200));
        return { abierta: document.querySelector('#demo').open, mensaje: document.querySelector('#demo-mensaje').textContent, href: document.querySelector('#enviar').href };
      })()`);
      tab2.cerrar();
      const ok = r.abierta && r.mensaje.includes('Tabla Playa de Llolleo') && r.mensaje.includes('Somos 4 personas') && decodeURIComponent(r.href).includes('$28.900');
      return [ok, `4 con hambre → «${r.mensaje.split('\n')[2]}»; mensaje en pantalla (modo demo): ${r.abierta ? 'sí' : 'no'}`];
    });

    await trayecto('Carta → buscar → pedir', perfil, async errores => {
      const tab = await pagina(`${BASE}/carta/`, perfil, errores);
      const r = await evaluar(tab, `(async () => {
        const s = document.querySelector('#buscar'); s.value = 'acevichado'; s.dispatchEvent(new Event('input'));
        await new Promise(r => setTimeout(r, 400));
        return { conteo: document.querySelector('#conteo').textContent };
      })()`);
      const a = await tocar(tab, '[data-clave="roll-acevichado"]:not([hidden]) .pedir'); tab.cerrar();
      const fudo = a && await fudoMuestra(a.href, 'Rolls Acevichado');
      return [!!(a?.visible && fudo), `«acevichado»: ${r.conteo} → «${a?.texto}» abre el producto en Fudo: ${fudo ? 'sí' : 'no'}`];
    });

    await trayecto('Propuesta completa', perfil, async errores => {
      const tab = await pagina(`${BASE}/presentacion/`, perfil, errores);
      const r = await evaluar(tab, `(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        await new Promise(r => setTimeout(r, 600));
        const imgs = [...document.images];
        return { secciones: document.querySelectorAll('main h2').length, imagenes: imgs.length, rotas: imgs.filter(i => i.complete && !i.naturalWidth).length };
      })()`);
      tab.cerrar();
      return [r.secciones >= 7 && !r.rotas, `${r.secciones} secciones, ${r.imagenes} imágenes, ${r.rotas} rotas`];
    });
  }
} finally { await chrome.cerrar(); }

const bien = filas.filter(f => f.ok).length;
writeFileSync(SALIDA, [
  '# Recorridos del cliente', '',
  `Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })} · sitio: ${BASE} · ${bien} de ${filas.length} correctos.`,
  'Teléfono 390×844 y escritorio 1440×900. Se registran errores de consola y excepciones de JavaScript del sitio. Uber Eats y WhatsApp no se abren: se comprueba el destino del enlace.', '',
  '| Trayecto | Dispositivo | Resultado | Detalle | Errores de consola |', '| --- | --- | --- | --- | --- |',
  ...filas.map(f => `| ${f.nombre} | ${f.perfil === 'telefono' ? 'Teléfono' : 'Escritorio'} | ${f.ok ? 'Correcto' : 'Revisar'} | ${f.detalle.replace(/\|/g, '/')} | ${f.errores.length || 0} |`), '',
].join('\n'));
console.log(`${bien} de ${filas.length} trayectos correctos. Informe: ${SALIDA}`);
process.exit(bien === filas.length ? 0 : 1);
