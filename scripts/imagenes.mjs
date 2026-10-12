// Genera versiones livianas de las fotos con ffmpeg (sin dependencias de npm).
// Uso: node scripts/imagenes.mjs
// - Fotos de la carta (data/fotos.json): 320, 480 y 960 px de ancho, recortadas en 4:3.
// - Portada: recorte para teléfono (480 y 960) y para escritorio (960 y 1440).
// - Imagen para compartir: assets/compartir-1200x630.jpg
// Escribe data/imagenes.json, que scripts/fudo-sync.mjs usa para armar los srcset de la carta.
// Los originales no se modifican. Si cambias una foto por otra, usa un archivo con nombre nuevo:
// /assets se guarda en caché por un año (vercel.json).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const OPT = 'assets/opt';
mkdirSync(join(RAIZ, OPT), { recursive: true });

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { cwd: RAIZ, stdio: 'inherit' });
}
const kb = ruta => Math.round(statSync(join(RAIZ, ruta)).size / 1024);

const manifiesto = {};
const fotos = JSON.parse(readFileSync(join(RAIZ, 'data/fotos.json'), 'utf8')).fotos;
for (const { src } of Object.values(fotos)) {
  if (manifiesto[src]) continue;
  if (!existsSync(join(RAIZ, src))) { console.warn('Falta', src); continue; }
  const base = basename(src, extname(src));
  manifiesto[src] = {};
  for (const ancho of [320, 480, 960]) {
    const destino = `${OPT}/${base}-${ancho}.webp`;
    // Recorte central 4:3 y escala; calidad 72 es suficiente para fotos de comida en pantalla.
    ffmpeg(['-i', src, '-vf', `crop='min(iw,ih*4/3)':'min(ih,iw*3/4)',scale=${ancho}:-2`, '-c:v', 'libwebp', '-quality', '72', destino]);
    manifiesto[src][ancho] = destino;
  }
  console.log(`✓ ${src} → ${Object.values(manifiesto[src]).map(kb).join(' / ')} KB`);
}

// Portada: el plato debe reconocerse en el teléfono (recorte propio) y en escritorio (4:3).
const HERO = 'assets/hero-hd.webp';
const portada = {
  telefono: { recorte: 'crop=1100:760:720:20', anchos: [480, 960] },
  escritorio: { recorte: 'crop=1049:787:840:0', anchos: [960, 1440] },
};
manifiesto[HERO] = {};
for (const [nombre, { recorte, anchos }] of Object.entries(portada)) {
  for (const ancho of anchos) {
    const destino = `assets/portada/hero-${nombre}-${ancho}.webp`;
    ffmpeg(['-i', HERO, '-vf', `${recorte},scale=${ancho}:-2`, '-c:v', 'libwebp', '-quality', '74', destino]);
    manifiesto[HERO][`${nombre}-${ancho}`] = destino;
    console.log(`✓ ${destino} ${kb(destino)} KB`);
  }
}

// Imagen para compartir en redes (JPG 1200×630): foto a la derecha, logo blanco sobre negro a la izquierda.
ffmpeg([
  '-f', 'lavfi', '-i', 'color=c=black:s=1200x630',
  '-i', HERO, '-i', 'assets/marca/logo-blanco.png',
  '-filter_complex', '[1]crop=1049:787:840:0,scale=-2:630,crop=720:630[foto];[0][foto]overlay=480:0[f];[2]scale=360:-2[l];[f][l]overlay=60:(H-h)/2',
  '-frames:v', '1', '-q:v', '3', 'assets/compartir-1200x630.jpg',
]);
console.log(`✓ assets/compartir-1200x630.jpg ${kb('assets/compartir-1200x630.jpg')} KB`);

writeFileSync(join(RAIZ, 'data/imagenes.json'), JSON.stringify({ _ayuda: 'Generado por scripts/imagenes.mjs. No editar a mano.', imagenes: manifiesto }, null, 2) + '\n');
console.log('Escrito data/imagenes.json');
