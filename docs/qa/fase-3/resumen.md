# Fase 3 — Identidad y portada

Fecha: 12-10-2026 · medición: [medicion.json](medicion.json) · sistema visual: [docs/DISENO.md](../../DISENO.md)

## Qué cambió

- **Logo** (D13): versiones con fondo transparente en blanco y negro, generadas con ffmpeg. En las cabeceras negras va el original sobre #000, recortado para quitar la línea gris que traía el archivo. Sin filtros CSS.
- **Un solo sistema visual** para portada y carta:
  - colores: tinta, arroz, nori, mango y verde WhatsApp;
  - tipografías: Bricolage Grotesque y Archivo;
  - la ola como elemento gráfico;
  - variables, cabecera, pie y botones compartidos en `comun.css`;
  - se abandonan Playfair y la cursiva.
- **Portada nueva**, en el orden pedido:
  1. cabecera negra con logo, «Abierto · cierra a las…» calculado desde `negocio.json` y dirección;
  2. foto con recorte propio para el teléfono (D10), «Sushi de Llolleo.», una línea concreta y los tres botones;
  3. tarjeta «¿No sabes cuánto pedir?»;
  4. lo más pedido, con el dato y la fecha de Uber Eats y el precio de Fudo;
  5. promos tomadas de la carta;
  6. 4,4 en Uber Eats y 4,1 en Google, con fecha y enlace, sin citas;
  7. Visítanos.
- **Textos concretos:** «Rolls de 8 cortes, tablas de 40 y 70 piezas», «Retiro: pagas en el local con efectivo o Redcompra. Delivery: lo lleva Uber Eats».

## Comprobado

| Criterio | Resultado |
| --- | --- |
| ¿Está abierto? | Cabecera: «Abierto · cierra a las 21:00» o «Cerrado · abre hoy a las 13:00», con la hora de Chile. |
| ¿Qué pido? | «Sushi de Llolleo» + rolls de 8 cortes, tablas de 40/70 y Hot Sushi Burger en la primera pantalla; lo más pedido justo después del sugeridor. |
| ¿Cómo me llega? | Tres botones en la primera pantalla y en la barra fija, más la línea de pago y delivery. |
| Botón principal en laptop 1536×639 | Termina en el píxel 461 de 639. |
| Portada y carta, un mismo sitio | Misma cabecera, colores, tipografías, botones y barra fija. |
| Textos < 12 px · contraste < 4,5:1 · táctiles < 44 px | 0 · 0 · 0 (portada y carta, teléfono, escritorio y laptop). |
| Carta: primer producto · alto de Sushi | 219 px · 5.884 px (se mantienen las metas de la fase 2). |
| Errores en consola | 0. |

## Pendiente o anotado

- La portada pesa **1.018 KB** y la foto principal aparece a los **2,1 s** en red lenta. Las fotos de lo más pedido se optimizan en la fase 4 (meta: < 300 KB).
- Sin hacer por falta del plugin Design: «design-system» (el documento `docs/DISENO.md` lo escribí sin el plugin), «design-critique» de la vista previa y «ux-copy».
- Sin Figma: no hay librería ni pantallas en Figma.
- La maqueta no estuvo disponible para comparar.
