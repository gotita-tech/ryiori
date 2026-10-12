# Fase 2 — Carta nueva

Fecha: 12-10-2026. Medición completa: [medicion.json](medicion.json). Enlaces comprobados: [../verificacion-pedir.md](../verificacion-pedir.md).

## Qué cambió

- **La carta se actualiza sola desde Fudo** (`scripts/fudo-sync.mjs`, ver [docs/fudo-datos.md](../../fudo-datos.md)):
  - nombres limpios y 36 modificadores fuera de la carta;
  - categorías Promos y Postres nuevas;
  - variantes agrupadas.
  Los 292 enlaces generados coinciden con los que ya usaba el sitio.
- **Descripciones:** completadas con lo que publica Uber Eats (piezas como «8 cortes», mariscos, pescado y picante) en `data/descripciones.json`, con su fuente.
- **Diseño nuevo de la carta:**
  - empieza directamente en los productos, con el buscador arriba;
  - barra de categorías fija y deslizable que marca la sección visible;
  - filas compactas con nombre, descripción, piezas, etiquetas, precio y «Pedir»;
  - variantes como botones;
  - bebidas y barra en una lista tipográfica de dos columnas;
  - tarjeta «¿Son varios? Te sugerimos cuánto pedir» después de las tablas.
- **Fotos:** 26 productos destacados con imagen y rótulo «Foto de muestra». Ninguna se repite. `data/fotos.json` permite cambiarlas por fotos reales.
- **Identidad anticipada de la fase 3 en la carta:** tinta, arroz, nori y mango; Bricolage Grotesque y Archivo; cabecera negra con el logo.

## Comprobado

| Criterio | Meta | Resultado |
| --- | --- | --- |
| Primer producto desde el borde superior (teléfono) | < 250 px | **215 px** (antes 1.157) |
| Alto de Sushi (teléfono) | < 6.000 px | **5.884 px** (antes 32.750) |
| La barra de categorías acompaña al bajar | Sí | Sí, y marca la categoría visible |
| «Pedir» abre el producto correcto en Fudo | 15 de muestra | **15 de 15** |
| Precios escritos a mano fuera de `menu-data.js` | 0 | **0** |
| «salmon» = «salmón» = «SALMÓN» | iguales | 21 resultados en los tres |
| Textos < 12 px · contraste < 4,5:1 · táctiles < 44 px | 0 | 0 · 0 · 0 |
| Errores en consola | 0 | 0 |

## Pendiente o anotado

- La carta pesa **1,2 MB** en la primera carga: las fotos de muestra miden 1.000–1.400 px y se muestran a 88 px. Se corrige en la fase 4 con versiones pequeñas (meta: < 500 KB).
- «Armar mi pedido» lleva a `/sugeridor/`, que se construye en la fase 5. Hasta entonces da «no encontrado».
- La búsqueda «burger» ahora da 6 filas en vez de 17: las burgers normales y dobles van agrupadas en una sola fila con opciones, y siguen estando los 13 productos de Fudo.
- Conflicto con frontend-design: la guía evita las etiquetas en mayúsculas y los separadores «·»; la carta no los usa.
- Sin hacer por falta de plugins: la crítica de diseño con «design-critique» y la revisión de textos con «ux-copy».
- No se pudo ver la maqueta (pantalla 3): el diseño sigue la descripción del encargo.
