// Comprueba que los enlaces «Pedir» de la carta abren el producto correcto en Fudo.
// Solo abre cada página y lee el nombre del producto: no agrega nada al pedido.
// Uso: node scripts/verificar-pedir.mjs [cantidad=15]
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { lanzarChrome, emular, navegar, evaluar, espera, PERFILES } from './lib/cdp.mjs';

const cantidad = Number(process.argv[2] || 15);
const ctx = { window: {} };
vm.runInNewContext(readFileSync('menu-data.js', 'utf8'), ctx);
const fudo = new Map(JSON.parse(readFileSync('data/fudo/products.json', 'utf8')).products.map(p => [p.id, p.name]));
const enlaces = [];
for (const c of ctx.window.RYORI_MENU.categorias) for (const s of c.subgrupos) for (const p of s.productos)
  for (const v of p.variantes || [p]) enlaces.push({ categoria: c.nombre, carta: p.variantes ? `${p.nombre} ${v.valores.join(' ')}` : p.nombre, id: v.id, url: v.url });
// Muestra repartida por toda la carta.
const paso = enlaces.length / cantidad;
const muestra = Array.from({ length: cantidad }, (_, i) => enlaces[Math.floor(i * paso + paso / 2)]);

const normal = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const chrome = await lanzarChrome();
const filas = [];
try {
  for (const m of muestra) {
    const tab = await chrome.pestana();
    await emular(tab, PERFILES.telefono);
    await tab.send('Network.enable');
    await navegar(tab, m.url, { calma: 1500 });
    await espera(800);
    const texto = await evaluar(tab, 'document.body.innerText');
    const esperado = fudo.get(m.id);
    const ok = normal(texto).includes(normal(esperado)) && /agregar a mi pedido/i.test(texto);
    filas.push({ ...m, esperado, ok });
    console.log(ok ? '✓' : '✗', m.categoria, '·', m.carta, '→', esperado);
    tab.cerrar();
  }
} finally { await chrome.cerrar(); }
const bien = filas.filter(f => f.ok).length;
console.log(`${bien} de ${filas.length} enlaces abren el producto correcto.`);
writeFileSync('docs/qa/verificacion-pedir.md', [
  `# Enlaces «Pedir» comprobados en Fudo`, '',
  `Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })} · ${bien} de ${filas.length} correctos.`,
  'Cada enlace se abrió en un teléfono emulado y se comprobó que la página de Fudo muestra el nombre del producto y el botón «Agregar a mi pedido». No se agregó nada al pedido.', '',
  '| Categoría | En la carta | Nombre en Fudo | Resultado |', '| --- | --- | --- | --- |',
  ...filas.map(f => `| ${f.categoria} | ${f.carta} | ${f.esperado} | ${f.ok ? 'Correcto' : 'NO coincide'} |`), '',
].join('\n'));
process.exit(bien === filas.length ? 0 : 1);
