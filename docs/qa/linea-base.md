# Línea base (fase 0) — 12-10-2026

Medición del sitio publicado (https://ryiori.vercel.app, commit `c8e4205`) antes de cualquier cambio. Los datos completos están en [linea-base.json](linea-base.json). Para repetirla:

```
node scripts/medir.mjs https://ryiori.vercel.app docs/qa/linea-base.json
```

**Condiciones:** Chrome sin interfaz controlado por el protocolo DevTools. Teléfono emulado de 390×844 (densidad ×3), red de 1,6 Mbps, 150 ms de latencia, procesador ×4 y caché desactivada. Escritorio a 1440×900 y laptop a 1536×639, sin limitaciones.

## Resumen para el dueño del proyecto

| Qué se midió | Resultado | Meta del proyecto | Defecto |
| --- | --- | --- | --- |
| Tiempo hasta ver la foto principal (teléfono, red lenta) | **3,1 s** | menos de 2,5 s | D16 |
| Peso de la primera carga de la portada | **694 KB** (569 KB son fotos) | menos de 300 KB | D16 |
| Peso de la primera carga de la carta | **371 KB** | menos de 500 KB | — |
| Distancia del primer producto al borde superior (carta, teléfono) | **1.157 px** (más de una pantalla) | menos de 250 px | D5 |
| Alto de la categoría Sushi (teléfono) | **32.750 px** | menos de 6.000 px | D5 |
| La barra de categorías acompaña al bajar | **No** (ocupa 4 filas en el teléfono) | Sí | D5 |
| Buscar «burger» con Sushi abierto | **0 resultados** (hay 17 burgers) | 17 | D1 |
| Buscar «salmon» frente a «salmón» (toda la carta) | **5 frente a 22** | iguales | D2 |
| Botón principal visible en una laptop de 1536×639 | **No**: empieza en el píxel 624 de 639 | visible completo | D9 |
| Textos de menos de 12 px (portada, teléfono) | **30 de 95** | 0 | D15 |
| Textos con contraste bajo 4,5:1 (portada) | **18** | 0 | D15 |
| Áreas táctiles bajo 44 px (portada, teléfono) | **13 de 24** | 0 | D15 |
| Áreas táctiles bajo 44 px (carta, teléfono) | **81 de 83** (cada «Pedir» mide 40×21 px) | 0 | D15 |
| Enlace a delivery (Uber Eats) | **No hay** | Sí | D3 |
| Franja naranja que se corta en el teléfono | **Sí, se desborda** | eliminada | D11 |

Quedan reproducidos los defectos **D1, D2, D5, D9, D15 y D16** de la auditoría.

## Detalle

### Carga en teléfono con red lenta

| Página | Imagen principal (LCP) | Elemento | Peso | Peticiones | Saltos de diseño (CLS) |
| --- | --- | --- | --- | --- | --- |
| Portada | 3.104 ms | foto `hero-hd.webp` (1998 px para una pantalla de 390 px) | 694 KB | 12 | 0 |
| Carta | 932 ms | título H1 | 371 KB | 12 | 0 |

Lo que más pesa en la portada: `rolls-casa-hd.webp` 229 KB, `hero-hd.webp` 204 KB, `compartir-hd.webp` 131 KB y 112 KB en tipografías de Google (Playfair y DM Sans). La auditoría midió 3,9 s y 583 KB con otra herramienta. La diferencia viene del método, no del sitio: los dos superan la meta.

### Carta: alto por categoría

| Categoría | Productos | Teléfono (px) | Escritorio (px) |
| --- | --- | --- | --- |
| Todos | 328 | 153.564 | 56.383 |
| Sushi | 67 | 31.153 (página: 32.750) | 11.699 |
| Cocina japonesa | 27 | 12.580 | 4.564 |
| Para compartir | 8 | 3.955 | 1.599 |
| Burgers | 17 | 8.377 | 3.219 |
| Ceviches | 3 | 1.424 | 488 |
| Ensaladas | 3 | 1.365 | 488 |
| Bebidas | 46 | 21.454 | 8.159 |
| Barra | 120 | 55.906 | 20.417 |
| Acompañamientos | 10 | 4.690 | 2.016 |
| Extras | 27 | 12.463 | 4.564 |

El primer producto empieza a 1.157 px en el teléfono y a 1.104 px en el escritorio.

### Buscador

| Búsqueda | Resultados |
| --- | --- |
| «burger» con Sushi activo | 0 |
| «burger» con Todos | 17 |
| «salmon» con Sushi activo | 4 |
| «salmón» con Sushi activo | 14 |
| «salmon» con Todos | 5 |
| «salmón» con Todos | 22 |
| «SALMON» con Todos | 5 (las mayúsculas sí funcionan; las tildes no) |

### Accesibilidad

- **Textos de menos de 12 px:** 30 de 95 en la portada (teléfono y escritorio) y 139 de 430 en la carta. Los menores miden 8 px («SUSHI · BAR · BURGERS», «BUENA COMIDA. BUENA COMPAÑÍA.»).
- **Contraste bajo 4,5:1:**
  - portada: 18 textos. Los botones naranjos con texto blanco tienen 4,08:1, la franja naranja también 4,08:1, los títulos pequeños naranjos sobre crema 3,33–3,65:1 y el texto gris 4,18:1;
  - carta: 2 textos, con 4,09:1 y 3,87:1.
- **Áreas táctiles bajo 44 px:**
  - portada en el teléfono: 13 de 24, como «Descubrir nuestra carta» (13 px de alto) y los enlaces de texto (29 px);
  - carta: 81 de 83. Los filtros miden 38 px de alto y cada «Pedir», 40×21 px.

## Cómo carga Fudo sus datos

Está documentado en [docs/fudo-datos.md](../fudo-datos.md). Se usará en la fase 2.
