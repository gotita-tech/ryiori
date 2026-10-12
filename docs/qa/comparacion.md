# Comparación: antes (fase 0) y después (fase 7)

- **Antes:** sitio publicado el 12-10-2026, commit `c8e4205` ([linea-base.json](linea-base.json)).
- **Después:** rama `propuesta-v2` ([medicion-final.json](medicion-final.json)).

Mismo script (`scripts/medir.mjs`) y mismas condiciones: teléfono emulado de 390×844 (densidad ×3), red de 1,6 Mbps, 150 ms de latencia, procesador ×4 y caché desactivada.

La línea base se midió en Vercel. La medición final, en un servidor local que comprime los textos con gzip como Vercel, porque la vista previa de la rama pide iniciar sesión.

**Ojo con la conexión real.** El sitio publicado, con la versión de la fase 4, se midió dos veces el 12-10-2026:
- portada: foto principal a los **2,57 s y 2,47 s**, con 263 KB;
- carta: 1,82 s y 197 KB.

La misma portada en local daba 1,96 s: la conexión segura y la latencia real agregan alrededor de 0,5–0,6 s. Por eso, en la fase 7 se aligeró la carga de la portada (−0,2 s en local):
- las tipografías ya no compiten con la foto;
- los datos de lo más pedido se cargan después;
- el logo pasó a WebP.

**Confirmado al publicar** (12-10-2026, [medicion-publicada.json](medicion-publicada.json)):
- foto principal de la portada a los **2,39 s** y 253 KB;
- carta: 2,10 s y 186 KB;
- sugeridor: 1,40 s y 109 KB;
- propuesta: 1,63 s y 176 KB;
- 0 problemas de accesibilidad;
- **12 de 12 recorridos correctos** en el sitio publicado ([recorridos-publicado.md](recorridos-publicado.md)).

La cifra varía unos ±0,1 s entre mediciones.

## Velocidad y peso

| Qué | Antes | Después | Meta |
| --- | --- | --- | --- |
| Foto principal de la portada (LCP) | 3,10 s | **2,39 s** en el sitio publicado (1,76 s en local) | < 2,5 s ✔ |
| Peso de la portada, primera carga | 694 KB | **252 KB** | < 300 KB ✔ |
| Peso de la carta, primera carga | 371 KB | **185 KB** | < 500 KB ✔ |
| Contenido grande de la carta (LCP) | 0,93 s, pero solo un título | **2,12 s** en local, ya con productos (1,82 s en Vercel con la versión de la fase 4) | — |
| Sugeridor (nuevo) | — | 108 KB · 1,39 s | — |
| Propuesta | — | 176 KB · 1,62 s | — |

El LCP de la carta «antes» era el título de una pantalla: los productos aparecían recién después de bajar 1.157 px. Ahora el contenido grande ya es un producto.

## Carta

| Qué | Antes | Después | Meta |
| --- | --- | --- | --- |
| Primer producto desde el borde superior (teléfono) | 1.157 px | **219 px** | < 250 px ✔ |
| Alto de Sushi (teléfono) | 32.750 px | **5.884 px** | < 6.000 px ✔ |
| Alto de la carta completa (teléfono) | 155.161 px («Todos») | **19.619 px** (todas las categorías en una página) | — |
| La barra de categorías acompaña al bajar | No | **Sí**, y marca la sección visible | ✔ |
| «Pedir» abre el producto correcto en Fudo | — | **15 de 15** ([verificacion-pedir.md](verificacion-pedir.md)) | ✔ |
| Precios escritos a mano | 328 copiados el 07-10 | **0**: se leen de Fudo con `scripts/fudo-sync.mjs` | ✔ |

## Buscador

| Búsqueda | Antes | Después |
| --- | --- | --- |
| «burger» con Sushi abierto | 0 | Todas las burgers, desde cualquier lugar: 6 filas, porque normal y doble van juntas, y 13 productos de Fudo |
| «salmon» / «salmón» / «SALMÓN» | 5 / 22 / 5 | **21 / 21 / 21** |
| Sin resultados («pizza») | «Prueba con otro ingrediente» | Mensaje con 6 búsquedas sugeridas |

## Primera pantalla y canales

| Qué | Antes | Después |
| --- | --- | --- |
| Botón principal en laptop 1536×639 | Cortado (píxel 624 de 639) | **Completo** (termina en el 461) |
| Delivery (Uber Eats) | Sin enlace | **En la cabecera, la portada y la barra fija** |
| WhatsApp | Un enlace de texto al final | **Botón redondo en todas las páginas** y en la barra fija |
| «¿Está abierto?» | No se respondía | «Abierto · cierra a las…», con la hora de Chile |

## Accesibilidad

| Qué | Antes (portada / carta, teléfono) | Después (todas las páginas, teléfono y escritorio) |
| --- | --- | --- |
| Textos de menos de 12 px | 30 de 95 / 139 de 430 | **0** |
| Contraste bajo 4,5:1 | 18 / 2 | **0** |
| Áreas táctiles bajo 44 px | 13 de 24 / 81 de 83 | **0** |
| Filtros y conteo | Pestañas sin teclado; conteo mudo | Botones con `aria-pressed`, navegación con `aria-current` y conteo con `aria-live` |

## Recorridos

Los 6 trayectos, en teléfono y escritorio: **12 de 12 correctos, 0 errores de consola**. Detalle en [recorridos.md](recorridos.md).

## Sin hacer

- **Plugin Design** (no estaba activo): no se hizo la auditoría WCAG con «accessibility-review», ni «design-critique», «ux-copy» o «design-handoff». Las comprobaciones automáticas de arriba sí se hicieron con el script propio.
- **Lighthouse:** no se usó. Las cifras vienen de las mediciones del propio navegador, igual que en la línea base.
