// Lee la carta pública de Ryori en Fudo y escribe menu-data.js. Solo LEE: no escribe nada en Fudo.
// Uso:
//   node scripts/fudo-sync.mjs            descarga de Fudo y actualiza menu-data.js
//   node scripts/fudo-sync.mjs --revisar  descarga y compara, pero no escribe nada
//   node scripts/fudo-sync.mjs --desde <carpeta>  usa account.json, product-categories.json y products.json guardados
// Reglas: data/carta-config.json · descripciones: data/descripciones.json · fotos: data/fotos.json
// Detalles de la fuente: docs/fudo-datos.md
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUENTA = 'ryori';
const API = 'https://integrations.fu.do/fudo';
const CABECERAS = {
  'fudo-app': 'online-menu',
  'fudo-account-id': Buffer.from(CUENTA).toString('base64'),
  Accept: 'application/json',
  Origin: 'https://menu.fu.do',
  Referer: 'https://menu.fu.do/',
};

const args = process.argv.slice(2);
const soloRevisar = args.includes('--revisar');
const desde = args.includes('--desde') ? args[args.indexOf('--desde') + 1] : null;

const leerJSON = ruta => JSON.parse(readFileSync(join(RAIZ, ruta), 'utf8'));
const config = leerJSON('data/carta-config.json');
const descripciones = existsSync(join(RAIZ, 'data/descripciones.json')) ? leerJSON('data/descripciones.json').productos : {};
const fotos = existsSync(join(RAIZ, 'data/fotos.json')) ? leerJSON('data/fotos.json').fotos : {};

async function descargar(recurso) {
  if (desde) return JSON.parse(readFileSync(join(desde, `${recurso}.json`), 'utf8'));
  const r = await fetch(`${API}/${recurso}/?a=${CUENTA}`, { headers: CABECERAS });
  if (!r.ok) throw new Error(`Fudo respondió ${r.status} al pedir ${recurso}`);
  return r.json();
}

// ---------- Limpieza de textos ----------
const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const slug = s => sinTildes(String(s)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ARREGLOS = [
  [/CHESSE/gi, 'Cheese'], [/Camar[òo]n/g, 'Camarón'], [/\bSalmon\b/g, 'Salmón'], [/[`´’]/g, "'"],
  [/\bAlcochol\b/gi, 'alcohol'], [/\bYelow\b/g, 'Yellow'], [/\bJegibre\b/g, 'Jengibre'], [/\bAlbahca\b/g, 'Albahaca'],
];
function limpiarNombre(nombre) {
  let n = String(nombre).replace(/^\s*\/\s*\d+\s*\.?\s*/, '').replace(/^\s*\+\s*/, '').replace(/\s+/g, ' ').trim();
  for (const [re, por] of ARREGLOS) n = n.replace(re, por);
  // Nombres escritos enteros en mayúsculas pasan a mayúscula inicial.
  if (n === n.toUpperCase() && /[A-Z]{3}/.test(n)) n = n.charAt(0) + n.slice(1).toLowerCase();
  return n;
}
const limpiarTexto = t => String(t || '').replace(/\s+/g, ' ').trim();

// ---------- Etiquetas de dieta y alérgenos ----------
// Se deducen de los ingredientes publicados; data/descripciones.json puede fijarlas a mano.
function etiquetasDe(texto, fijas) {
  if (fijas) return fijas;
  const t = sinTildes(texto).toLowerCase();
  const e = [];
  if (/\bvegan[oa]s?\b/.test(t)) e.push('Vegano');
  else if (/\bvegetarian[oa]s?\b/.test(t)) e.push('Vegetariano');
  if (/picante|spicy|aji verde|merken caliente/.test(t)) e.push('Picante');
  if (/camaron|pulpo|kanikama|\bebi\b|\btako\b|acevichado de camaron/.test(t)) e.push('Mariscos');
  if (/salmon|\bsake\b|sashimi de salmon/.test(t)) e.push('Pescado');
  return e;
}

// ---------- Programa ----------
const [cuenta, categoriasRes, productosRes] = await Promise.all([descargar('account'), descargar('product-categories'), descargar('products')]);
const categoriasFudo = categoriasRes?.productCategories;
const productosFudo = productosRes?.products;
if (!Array.isArray(categoriasFudo) || !Array.isArray(productosFudo) || productosFudo.length < 50
    || !productosFudo.every(p => Number.isInteger(p.id) && typeof p.name === 'string' && Number.isFinite(p.price))) {
  console.error('La respuesta de Fudo no tiene la forma esperada. No se modifica menu-data.js.');
  process.exit(1);
}
if (!desde && !soloRevisar) {
  // Copia de lo descargado, para poder repetir el proceso sin volver a pedirle a Fudo.
  const dir = join(RAIZ, 'data/fudo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'account.json'), JSON.stringify(cuenta, null, 1));
  writeFileSync(join(dir, 'product-categories.json'), JSON.stringify(categoriasRes, null, 1));
  writeFileSync(join(dir, 'products.json'), JSON.stringify(productosRes, null, 1));
}

const catPorId = new Map(categoriasFudo.map(c => [c.id, c]));
const prodPorId = new Map(productosFudo.map(p => [p.id, p]));
const urlDe = p => `https://menu.fu.do/${CUENTA}/${slug(catPorId.get(p.productCategoryId)?.name || 'producto')}/${slug(p.name)}-${p.id}`;
const precioDe = p => Number.isFinite(p.pricePickup) ? p.pricePickup : p.price;
const nombreDe = p => config.renombres[p.id] || limpiarNombre(p.name);

const modCats = new Set(config.modificadores.categoriasFudo);
const modProds = new Set(config.modificadores.productos);
const familiaDe = new Map();
for (const f of config.familias) for (const [id] of f.miembros) familiaDe.set(id, f);

// Los productos nombrados explícitamente en un subgrupo mandan sobre la categoría de Fudo.
const ubicacionExplicita = new Map();
config.categorias.forEach(c => c.subgrupos.forEach(s => (s.productos || []).forEach(id => ubicacionExplicita.set(id, s))));

const usados = new Set();
const avisos = [];
const claves = new Set();

function armarSimple(p) {
  const nombre = nombreDe(p);
  const clave = slug(nombre);
  const extra = descripciones[clave] || {};
  const descripcion = limpiarTexto(p.description) || extra.descripcion || '';
  return {
    clave, id: p.id, nombre, descripcion,
    piezas: extra.piezas || null,
    etiquetas: etiquetasDe(`${nombre} ${descripcion} ${extra.ingredientes || ''}`, extra.etiquetas),
    precio: precioDe(p), url: urlDe(p), disponible: p.isAvailable !== false,
    ...(fotos[clave] ? { foto: fotos[clave] } : {}),
  };
}

function armarFamilia(f) {
  const variantes = f.miembros
    .map(([id, ...valores]) => ({ p: prodPorId.get(id), valores }))
    .filter(v => {
      if (!v.p) avisos.push(`La familia «${f.nombre}» nombra el producto ${v.valores.join(' ')} que ya no está en Fudo.`);
      return v.p;
    });
  if (!variantes.length) return null;
  variantes.forEach(v => usados.add(v.p.id));
  const extra = descripciones[f.clave] || {};
  // La descripción de una familia no se toma de una variante (diría «camarón» para todas).
  const descripcion = extra.descripcion || (f.descripcionDe ? limpiarTexto(prodPorId.get(f.descripcionDe)?.description) : '');
  const ejes = f.ejes.map((nombre, i) => ({ nombre, valores: [...new Set(variantes.map(v => v.valores[i]))] }));
  const precios = variantes.map(v => precioDe(v.p));
  const porDefecto = f.porDefecto && variantes.find(v => v.valores.join('|') === f.porDefecto.join('|')) || variantes[0];
  const lista = variantes.map(v => ({
    valores: v.valores, id: v.p.id, precio: precioDe(v.p), url: urlDe(v.p), disponible: v.p.isAvailable !== false,
    etiquetas: etiquetasDe(`${f.nombre} ${v.valores.join(' ')}`, null),
  }));
  return {
    clave: f.clave, nombre: f.nombre, descripcion,
    piezas: extra.piezas || null,
    // Etiquetas comunes a todas las variantes; las propias de cada variante van en la variante.
    etiquetas: extra.etiquetas || lista.map(v => v.etiquetas).reduce((a, b) => a.filter(x => b.includes(x))),
    precioDesde: Math.min(...precios), precioHasta: Math.max(...precios),
    ejes, porDefecto: porDefecto.valores,
    variantes: lista,
    ...(fotos[f.clave] ? { foto: fotos[f.clave] } : {}),
  };
}

function armar(p) {
  if (usados.has(p.id)) return null;
  const f = familiaDe.get(p.id);
  const item = f ? armarFamilia(f) : (usados.add(p.id), armarSimple(p));
  if (item) {
    if (claves.has(item.clave)) avisos.push(`Clave repetida «${item.clave}»: revisa renombres.`);
    claves.add(item.clave);
  }
  return item;
}

const categorias = config.categorias.map(c => ({
  id: c.id, nombre: c.nombre, tipo: c.tipo, ...(c.sugeridor ? { sugeridor: true } : {}),
  subgrupos: c.subgrupos.map(s => {
    const lista = [];
    for (const id of s.productos || []) { const p = prodPorId.get(id); if (p) lista.push(p); else avisos.push(`El producto ${id} de «${c.nombre}» ya no está en Fudo.`); }
    for (const cid of s.categoriasFudo || []) {
      productosFudo.filter(p => p.productCategoryId === cid && !modProds.has(p.id) && !ubicacionExplicita.has(p.id))
        .sort((a, b) => a.position - b.position).forEach(p => lista.push(p));
    }
    return { nombre: s.nombre, productos: lista.map(armar).filter(Boolean) };
  }).filter(s => s.productos.length),
})).filter(c => c.subgrupos.length);

// Productos de Fudo que no quedaron en ninguna parte: se avisan para decidir dónde van.
const sinUbicar = productosFudo.filter(p => !usados.has(p.id) && !modProds.has(p.id) && !modCats.has(p.productCategoryId));
for (const p of sinUbicar) avisos.push(`Producto nuevo sin categoría en la carta: ${p.id} «${p.name}» (categoría Fudo ${catPorId.get(p.productCategoryId)?.name}). Agrégalo en data/carta-config.json.`);
// Fotos: el archivo debe existir, la clave debe estar en la carta y ninguna foto se repite.
const srcVistos = new Map();
for (const [clave, f] of Object.entries(fotos)) {
  if (!claves.has(clave)) avisos.push(`data/fotos.json tiene «${clave}», que no está en la carta.`);
  if (!existsSync(join(RAIZ, f.src))) avisos.push(`Falta el archivo de foto ${f.src} («${clave}»).`);
  if (srcVistos.has(f.src)) avisos.push(`La foto ${f.src} se repite en «${srcVistos.get(f.src)}» y «${clave}».`);
  srcVistos.set(f.src, clave);
}
for (const clave of Object.keys(descripciones)) if (!claves.has(clave)) avisos.push(`data/descripciones.json tiene «${clave}», que no está en la carta.`);
const modificadores = productosFudo.filter(p => !usados.has(p.id) && (modProds.has(p.id) || modCats.has(p.productCategoryId)));

// ---------- Comparación de precios con la versión anterior ----------
function preciosAnteriores() {
  const ruta = join(RAIZ, 'menu-data.js');
  if (!existsSync(ruta)) return new Map();
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(ruta, 'utf8'), ctx);
  const d = ctx.window.RYORI_MENU || {};
  const m = new Map();
  if (Array.isArray(d.products)) { // formato antiguo (copia del 07-10-2026)
    for (const p of d.products) { const id = Number(String(p.url).match(/-(\d+)$/)?.[1]); if (id) m.set(id, { nombre: p.name, precio: Number(String(p.price).replace(/\D/g, '')) }); }
  }
  for (const c of d.categorias || []) for (const s of c.subgrupos) for (const p of s.productos) {
    if (p.variantes) p.variantes.forEach(v => m.set(v.id, { nombre: `${p.nombre} ${v.valores.join(' ')}`, precio: v.precio }));
    else m.set(p.id, { nombre: p.nombre, precio: p.precio });
  }
  return m;
}
const antes = preciosAnteriores();
const cambios = [];
for (const p of productosFudo) {
  const a = antes.get(p.id);
  if (a && a.precio !== precioDe(p)) cambios.push(`${nombreDe(p)}: $${a.precio.toLocaleString('es-CL')} → $${precioDe(p).toLocaleString('es-CL')}`);
}
const nuevos = antes.size ? productosFudo.filter(p => usados.has(p.id) && !antes.has(p.id)).map(p => nombreDe(p)) : [];
const retirados = [...antes.keys()].filter(id => !prodPorId.has(id)).map(id => antes.get(id).nombre);

// ---------- Salida ----------
const ahora = new Date();
const datos = {
  actualizado: ahora.toISOString(),
  fuente: `https://menu.fu.do/${CUENTA}`,
  categorias,
};
const totalPlatos = categorias.reduce((s, c) => s + c.subgrupos.reduce((t, g) => t + g.productos.length, 0), 0);
const totalFudo = categorias.reduce((s, c) => s + c.subgrupos.reduce((t, g) => t + g.productos.reduce((u, p) => u + (p.variantes ? p.variantes.length : 1), 0), 0), 0);

console.log(`Fudo: ${productosFudo.length} productos en ${categoriasFudo.length} categorías.`);
console.log(`Carta: ${totalPlatos} filas (${totalFudo} productos de Fudo), ${modificadores.length} modificadores fuera de la carta.`);
console.log(cambios.length ? `Precios que cambiaron (${cambios.length}):\n  ${cambios.join('\n  ')}` : 'Ningún precio cambió.');
if (nuevos.length) console.log(`Productos nuevos en Fudo (${nuevos.length}): ${nuevos.join(', ')}`);
if (retirados.length) console.log(`Productos que ya no están en Fudo (${retirados.length}): ${retirados.join(', ')}`);
if (avisos.length) console.log(`Avisos:\n  ${avisos.join('\n  ')}`);

if (soloRevisar) {
  console.log('Modo revisión: no se escribió nada.');
} else {
  const cabecera = `// Generado por scripts/fudo-sync.mjs el ${ahora.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}.\n// No editar a mano: los precios salen de ${datos.fuente}. Reglas en data/carta-config.json.\n`;
  writeFileSync(join(RAIZ, 'menu-data.js'), `${cabecera}window.RYORI_MENU = ${JSON.stringify(datos)};\n`);
  writeFileSync(join(RAIZ, 'docs/carta-sync.md'), [
    `# Última sincronización con Fudo`, '',
    `- Fecha: ${ahora.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`,
    `- Fudo: ${productosFudo.length} productos · carta: ${totalPlatos} filas (${totalFudo} productos) · ${modificadores.length} modificadores fuera de la carta`, '',
    `## Precios que cambiaron`, '', ...(cambios.length ? cambios.map(c => `- ${c}`) : ['Ninguno.']), '',
    ...(nuevos.length ? ['## Productos nuevos', '', ...nuevos.map(n => `- ${n}`), ''] : []),
    ...(retirados.length ? ['## Productos retirados', '', ...retirados.map(n => `- ${n}`), ''] : []),
    ...(avisos.length ? ['## Avisos', '', ...avisos.map(a => `- ${a}`), ''] : []),
    `## Modificadores fuera de la carta`, '', modificadores.map(p => `${limpiarNombre(p.name)} ($${precioDe(p).toLocaleString('es-CL')})`).join(' · '), '',
  ].join('\n'));
  console.log('Escrito menu-data.js y docs/carta-sync.md.');
}
