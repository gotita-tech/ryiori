# Fase 4 — Rendimiento, accesibilidad y base técnica

Fecha: 12-10-2026 · medición: [medicion.json](medicion.json) (servidor local con compresión gzip, como Vercel) · lanzamiento: [docs/LANZAMIENTO.md](../../LANZAMIENTO.md)

## Qué cambió

- **Imágenes:**
  - `scripts/imagenes.mjs` genera con ffmpeg versiones de 320, 480 y 960 px de cada foto, y la portada recortada para teléfono (480/960) y para escritorio (960/1440);
  - todo se usa con `srcset` y `sizes`, y las miniaturas de la carta bajan de 1.000–1.400 px a 320 px;
  - los originales no se tocaron.
- **Tipografías alojadas en el sitio** (Archivo y Bricolage Grotesque, subconjunto latin, licencia OFL): sin conexión a Google y con precarga.
- **La carta dibuja cada categoría al acercarse a la pantalla** (`content-visibility`): pasa a mostrarse en 1,8 s en lugar de 3,4 s.
- **`vercel.json`:**
  - caché de un año para `/assets`;
  - `X-Robots-Tag: noindex` mientras sea demo;
  - encabezados básicos de seguridad.
- **Accesibilidad:**
  - texto mínimo de 12 px, contraste de 4,5:1 y áreas táctiles de 44 px;
  - opciones de variante como botones con `aria-pressed`;
  - conteo de resultados con `aria-live`;
  - foco visible en mango y `prefers-reduced-motion`.
  La barra de categorías de la carta ya no es un filtro sino navegación entre secciones: usa enlaces con `aria-current`, que es lo correcto para ese caso.
- **Base de lanzamiento** (preparada, sin activar):
  - JSON-LD `Restaurant` generado desde `negocio.json`;
  - `sitemap.xml`, y un `robots.txt` que hoy bloquea todo (la versión de lanzamiento está en `docs/lanzamiento/`);
  - página 404 propia;
  - favicon de la ola (SVG, PNG e ICO);
  - imagen para compartir en JPG de 1200×630;
  - `lang="es-CL"` en todas las páginas.
- **Medición:**
  - UTM en todas las salidas a Fudo, Uber Eats, WhatsApp y Maps, con la ubicación del botón;
  - eventos `clic_retiro`, `clic_pedir`, `clic_delivery`, `clic_whatsapp` y `clic_mapa`, listos para Vercel Web Analytics;
  - el script de Vercel se carga solo con `"analitica": true` en `data/negocio.json`.

## Comprobado (teléfono 390×844, 1,6 Mbps, 150 ms, CPU ×4, sin caché)

| Criterio | Meta | Antes (fase 0) | Ahora |
| --- | --- | --- | --- |
| Imagen principal de la portada (LCP) | < 2,5 s | 3,1 s | **2,04 s** |
| Peso de la portada, primera carga | < 300 KB | 694 KB | **262 KB** |
| Peso de la carta, primera carga | < 500 KB | 371 KB (1,2 MB en la fase 2) | **196 KB** |
| Primer contenido grande de la carta | — | 0,9 s (solo un título) | **1,84 s** (con productos) |
| Contraste < 4,5:1 · táctiles < 44 px · texto < 12 px | 0 | 18 · 13 · 30 | **0 · 0 · 0** |
| Enlaces externos sin UTM | 0 | — | **0** (26 en portada, 240 en carta) |
| Enlace de Fudo con UTM abre el producto | Sí | — | Sí |
| Anclas `#tablas`, `#burgers`, `#barra`, `#postres` | caen en su sección | — | Sí, y la barra la marca |
| Errores en consola (portada y carta) | 0 | — | 0 |

## Para el dueño del proyecto

- **Medición de visitas:** actívala en Vercel (proyecto `ryiori` → Analytics → Enable) y después cambia `"analitica"` a `true` en `data/negocio.json`. Revisa en el panel si tu plan incluye los eventos personalizados.

## Pendiente o anotado

- Sin hacer por falta del plugin Design: la auditoría WCAG con «accessibility-review». Las comprobaciones automáticas de contraste, tamaño de texto y áreas táctiles sí se hicieron con el script propio.
- Si se reemplaza una foto, conviene usar un archivo con nombre nuevo: `/assets` queda en caché por un año.
