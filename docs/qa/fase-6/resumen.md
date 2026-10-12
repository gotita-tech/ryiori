# Fase 6 — Material de venta

Fecha: 12-10-2026 · página: `/presentacion/` (reemplaza la auditoría anterior; queda en el historial de Git) · medición: [medicion.json](medicion.json)

## Qué contiene la propuesta

1. **Dónde está Ryori hoy:**
   - canales: retiro con Fudo, delivery con Uber Eats y WhatsApp;
   - valoraciones: 4,4 en Uber Eats y 4,1 en Google;
   - tres datos que ordenaremos juntos: dirección 375 o 391, apertura 12:30 o 13:00, ficha duplicada en Google.
2. **Antes y ahora en el teléfono:** portada del sitio anterior frente a la nueva, y carta de Fudo frente a la nueva. Imágenes WebP de 360 px en `presentacion/img/`.
3. **Cuatro cifras medidas:**
   - foto principal: 3,1 s → 2,0 s;
   - pedir la Tabla Parque DYR: 3 toques → 1;
   - delivery: sin enlace → 1 toque;
   - alto de Sushi: 32.750 px → 5.884 px.
4. **Qué incluye:** sitio, carta conectada a Fudo, tres canales, sugeridor, medición, fotos reales y ficha de Google.
5. **Lo que necesitamos de Ryori:** logo vectorial, confirmación de datos, decisión sobre WhatsApp, sesión de fotos y acceso a Google.
6. **Etapas y plazos estimados** (semanas 1 a 3 y mes 2), más los extras de segunda etapa: mapa de las tablas, QR en mesas y lista de difusión de WhatsApp.
7. **Inversión: [PRECIO A DEFINIR].**

Enlace discreto «Propuesta para Ryori» en el pie de la portada.

## Comprobado

| Criterio | Resultado |
| --- | --- |
| Se lee completa en el teléfono en menos de 3 minutos | 583 palabras ≈ 2,6 min (a 220 palabras por minuto) |
| Cada cifra con su fuente | Sí: debajo de cada bloque, con fecha (Uber Eats, Google Maps, Fudo, Tripadvisor, Waze y mediciones propias) |
| Carga en red lenta | 187 KB; contenido principal a los 1,5 s |
| Textos < 12 px · contraste < 4,5:1 · táctiles < 44 px | 0 · 0 · 0 (después de agrandar el área del enlace «Probarlo») |
| Errores en consola | 0 |
| `noindex` | Sí |

## Cómo se midieron los toques

- **Antes, pedir la Tabla Parque DYR:** «Ver la carta» → filtro «Para compartir» → «Pedir» = 3 toques.
- **Ahora:** «Pedir» en la tarjeta de Lo más pedido = 1 toque, deslizando una tarjeta.
- **Delivery:** el sitio anterior no tenía ningún enlace a Uber Eats; ahora está en la primera pantalla y en la barra fija.

## Pendiente o anotado

- **Firma de la propuesta:** no tiene nombre ni contacto de quien la presenta, porque no los tengo. Avísame si quieres agregarlos.
- **Sin HarborRank:** no está activo, así que la propuesta no incluye la posición en Google Maps para «sushi Llolleo» ni los competidores.
- **Sin el plugin Design:** quedó sin hacer la revisión de textos con «ux-copy».
