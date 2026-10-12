# Fase 1 — Correcciones críticas y canales de compra

Fecha: 12-10-2026 · Medición completa: [medicion.json](medicion.json) (versión local, `node scripts/medir.mjs http://localhost:4173 …`).

## Qué cambió

- **Buscador:** busca en toda la carta, sin importar la categoría abierta, las tildes ni las mayúsculas. Agrupa los resultados por categoría. Si no hay resultados, lo dice y ofrece seis búsquedas sugeridas.
- **Tres canales** con un solo nombre en todo el sitio: «Retirar en el local ↗» (Fudo), «Delivery ↗» (Uber Eats) y «WhatsApp ↗». Están en la cabecera, en la portada y en la barra fija del teléfono. ↗ marca solo enlaces externos.
- **Botón redondo de WhatsApp** (#128C7E, ícono blanco, etiqueta «Escribir a Ryori por WhatsApp»): flota abajo a la derecha en escritorio y va dentro de la barra fija en el teléfono, en portada y carta.
- **Portada** ajustada a su contenido. Se eliminaron la franja naranja, la barra «SUSHI · BAR · BURGERS» y el pie «Buena comida… / Descubre Ryori».
- **Textos internos** reescritos como afirmaciones del local. La palabra «Fudo» ya no aparece en textos para el cliente.
- **Enlaces de la portada** a `/carta/#sushi`, `/carta/#tablas` y `/carta/#burgers`, que abren esa categoría.
- **«Cómo llegar»** usa las coordenadas del local en vez de una búsqueda por nombre.
- **Bonus de accesibilidad:** filtros como botones con `aria-pressed`, conteo con `aria-live`, textos de 12 px como mínimo, contraste de 4,5:1 y áreas táctiles de 44 px.

## Comprobado

| Criterio | Resultado |
| --- | --- |
| «burger» desde Sushi, Barra, Bebidas y Todos | 17 productos de Burgers en los cuatro casos |
| «salmon», «salmón», «SALMÓN» | 27 en los tres casos |
| Tres canales en la primera pantalla del teléfono (390×844) | Sí: en la portada y en la barra fija |
| WhatsApp en todas las páginas de cliente | Portada y carta: flotante en escritorio, en la barra en el teléfono |
| Botón principal visible en 1536×639 | Sí: «Retirar en el local» termina en el píxel 543 de 639 |
| Textos < 12 px · contraste < 4,5:1 · áreas táctiles < 44 px | 0 · 0 · 0 en portada y carta, teléfono y escritorio |
| Errores en la consola | 0 |

## Pendiente o anotado

- La revisión de textos con «ux-copy» (plugin Design) no se hizo porque el plugin no estaba activo.
- `/presentacion/` no lleva el botón de WhatsApp: es material de venta y se rehace en la fase 6.
- Siguen para las fases 2 y 3 el título de una pantalla de la carta, los eslóganes («El antojo tiene nombre», «Uno más. Y otro más.») y la línea vertical junto al logo.
