# Ryori Sushi Bar — landing de demostración y propuesta

Demo de propuesta para **Ryori Sushi Bar & Burgers** (Divina Providencia 375, Llolleo, San Antonio). Publicada en https://ryiori.vercel.app desde `main`, en el proyecto Vercel `ryiori` del equipo Gotech (`gotech2`). El trabajo se hace en la rama `propuesta-v2`, que tiene su propia vista previa en Vercel.

El sitio no reemplaza a Fudo ni a Uber Eats: los **ordena**. Lleva a cada persona a retirar (Fudo), pedir delivery (Uber Eats) o escribir por WhatsApp.

## Páginas

| Ruta | Qué es |
| --- | --- |
| `/` | Portada: estado abierto o cerrado, tres canales, sugeridor, lo más pedido, promos, valoraciones y visita. |
| `/carta/` | Carta completa con buscador, categorías fijas, variantes y «Pedir» directo al producto en Fudo. |
| `/sugeridor/` | «¿Cuánto pedimos?»: arma el pedido según personas y hambre, y lo envía por WhatsApp. |
| `/presentacion/` | Propuesta de venta para el dueño de Ryori (enlace discreto en el pie de la portada). |
| `404.html` | Página «no encontrada» propia. |

## Datos: dónde se cambia cada cosa

| Archivo | Contenido |
| --- | --- |
| `data/negocio.json` | Dirección, horario, teléfonos, canales, valoraciones, lo más pedido; `modoDemo` y `analitica`. |
| `menu-data.js` | Carta generada desde Fudo. **No se edita a mano.** |
| `data/carta-config.json` | Categorías, nombres corregidos, variantes agrupadas y modificadores fuera de la carta. |
| `data/descripciones.json` | Piezas, etiquetas y descripciones que Fudo no trae (fuente: Uber Eats, 12-10-2026). |
| `data/fotos.json` | Fotos de los 26 platos destacados. Para usar fotos reales, cambia `src` y `tipo`. |
| `data/sugeridor.json` | Reglas del sugeridor: piezas por persona, productos y máximos. |

## Scripts (Node, sin paquetes de npm)

```
node scripts/fudo-sync.mjs              # lee la carta pública de Fudo y escribe menu-data.js (solo lectura)
node scripts/imagenes.mjs               # fotos en 320/480/960 px, portada y la imagen para compartir (requiere ffmpeg)
node scripts/servir.mjs 4173            # sirve el sitio en http://localhost:4173, con gzip como Vercel
node scripts/medir.mjs <url> <salida>   # velocidad, carta, buscador, contraste, textos y áreas táctiles
node scripts/recorridos.mjs <url>       # recorre los 6 trayectos del cliente y registra errores
node scripts/verificar-pedir.mjs 15     # comprueba que «Pedir» abre el producto correcto en Fudo
node scripts/capturas.mjs <carpeta> <nombre>=<url> ...   # capturas a 1440×900 y 390×844
```

Los scripts de medición usan Chrome sin interfaz, con el protocolo DevTools. Si Chrome no está en la ruta habitual, define `CHROME_PATH`.

Después de correr `fudo-sync`, revisa `docs/carta-sync.md`: ahí aparecen los precios que cambiaron y los productos nuevos que todavía no tienen categoría.

## Despliegue

- Sin compilación: es HTML, CSS y JS estáticos.
- Cada push a una rama genera una vista previa en Vercel; cada push a `main` publica el sitio.
- `vercel.json`: caché de un año para `/assets` (si cambias una foto, usa un nombre de archivo nuevo) y `noindex` mientras sea demo.
- `.vercelignore`: `docs/`, `scripts/` y los `.md` no se publican.

Para lanzar de verdad (dominio, Google, medición), sigue [docs/LANZAMIENTO.md](docs/LANZAMIENTO.md).

## Documentación

- [docs/DISENO.md](docs/DISENO.md): sistema visual (colores, tipografías, logo, componentes).
- [docs/fudo-datos.md](docs/fudo-datos.md): cómo se lee la carta de Fudo.
- [docs/qa/comparacion.md](docs/qa/comparacion.md): antes y después medidos; detalle de cada fase en `docs/qa/fase-N/`.
- [docs/venta/datos-por-resolver.md](docs/venta/datos-por-resolver.md): dirección, horario y ficha de Google por confirmar con Ryori.
- [CHANGELOG.md](CHANGELOG.md): cambios por fase.
- [FUENTES.md](FUENTES.md): procedencia de datos e imágenes.

## Versión anterior

Las fotos `*-hd.webp`, las imágenes de la carta en `assets/menu/` y sus prompts ([MEJORA-IMAGENES.md](MEJORA-IMAGENES.md), [MEJORA-CARTA.md](MEJORA-CARTA.md), `PORCIONES-IA.json`) se conservan. La versión anterior del sitio está en el historial de Git (commit `c8e4205`).
