// Capturas de pantalla en escritorio (1440×900) y teléfono (390×844).
// Uso:
//   node scripts/capturas.mjs <carpeta> <nombre>=<url>[@<js>] ...
// Cada página genera <nombre>-escritorio.png, <nombre>-telefono.png (primera pantalla)
// y <nombre>-telefono-completa.jpg (página entera en JPG, máximo 12.000 px).
// El texto tras «@» es JavaScript que se ejecuta antes de capturar (por ejemplo, abrir una categoría).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lanzarChrome, emular, navegar, evaluar, captura, espera, PERFILES } from './lib/cdp.mjs';

const [carpeta, ...entradas] = process.argv.slice(2);
if (!carpeta || !entradas.length) {
  console.error('Uso: node scripts/capturas.mjs <carpeta> <nombre>=<url>[@<js>] ...');
  process.exit(1);
}
mkdirSync(carpeta, { recursive: true });

const chrome = await lanzarChrome();
try {
  for (const entrada of entradas) {
    const [nombre, resto] = entrada.split(/=(.*)/s);
    const [url, js] = resto.split(/@(.*)/s);
    for (const [perfil, sufijo, completa] of [['escritorio', 'escritorio', false], ['telefono', 'telefono', false], ['telefono', 'telefono-completa', true]]) {
      const tab = await chrome.pestana();
      // Teléfono a densidad ×2 (no ×3) para que los archivos no pesen de más.
      await emular(tab, { ...PERFILES[perfil], deviceScaleFactor: perfil === 'telefono' ? 2 : 1 });
      await tab.send('Network.enable');
      await navegar(tab, url, { calma: 1500 });
      if (js) { await evaluar(tab, `(async () => { ${js} })()`); await espera(1500); }
      const png = await captura(tab, { completa });
      const archivo = join(carpeta, `${nombre}-${sufijo}.${completa ? 'jpg' : 'png'}`);
      writeFileSync(archivo, png);
      console.log('✓', archivo);
      tab.cerrar();
    }
  }
} finally {
  await chrome.cerrar();
}
