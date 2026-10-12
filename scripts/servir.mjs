// Servidor estático mínimo para probar el sitio en local: node scripts/servir.mjs [puerto]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const RAIZ = process.cwd();
const PUERTO = Number(process.argv[2] || 4173);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '');
  let archivo = join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(archivo)).isDirectory()) archivo = join(archivo, 'index.html');
    const cuerpo = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(cuerpo);
  } catch {
    try { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(join(RAIZ, '404.html'))); }
    catch { res.writeHead(404).end('No encontrado'); }
  }
}).listen(PUERTO, () => console.log(`Sirviendo ${RAIZ} en http://localhost:${PUERTO}`));
