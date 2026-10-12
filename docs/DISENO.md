# Sistema visual de Ryori

Un solo sistema para portada y carta. Las variables están en [`comun.css`](../comun.css) y lo comparten todas las páginas.

## Idea

«Sushi de Llolleo». La ola del logotipo es el único elemento gráfico:
- separa secciones (`.ola-separador`);
- marca lo destacado: el Nº 1 de lo más pedido y la tarjeta del sugeridor (`.ola`).

Todo lo demás es sobrio: tinta, arroz y un verde nori. El mango se reserva para un solo botón (el sugeridor) y los acentos.

## Color

| Token | Hex | Uso | Contraste |
| --- | --- | --- | --- |
| `--tinta` | #0F1112 | Texto, botones principales | 18,4:1 sobre arroz |
| `--arroz` | #F6F6F2 | Fondo | — |
| `--nori` | #1E3D35 | Tarjeta del sugeridor, subtítulos | 11,3:1 sobre arroz |
| `--mango` | #E8A317 | Botón «Armar mi pedido», ola, foco | tinta sobre mango: 8,7:1 |
| `--wa` | #128C7E | Solo el botón redondo de WhatsApp con ícono blanco | 4,1:1 (gráfico, mínimo 3:1) |
| `--gris` | #4A504E | Texto secundario | 7,6:1 sobre arroz |
| `--negro` | #000000 | Cabecera y pie, para el logo original | — |
| mango oscuro | #8F6206 | Estrellas de valoración | 4,95:1 sobre arroz |

Ningún texto queda bajo 4,5:1. El blanco sobre #128C7E no llega a 4,5:1, por eso el verde nunca lleva texto encima: solo el ícono.

## Tipografía

- **Bricolage Grotesque** (800 y 700): títulos y nombres de platos.
- **Archivo** (400 a 700): texto, botones y precios. Los precios usan `font-variant-numeric: tabular-nums`.
- Sin cursivas decorativas ni etiquetas en mayúsculas. El tamaño mínimo es 12 px.

Por ahora se cargan desde Google Fonts. En la fase 4 se evaluará alojarlas en el propio sitio.

## Logo

| Archivo | Uso |
| --- | --- |
| `assets/marca/logo-original-negro.png` | Cabeceras negras (#000): el logo original sin filtros, recortado para quitar la línea gris del archivo de Fudo. |
| `assets/marca/logo-blanco.png` | Blanco con fondo transparente, para fondos oscuros que no son #000 (pie, nori). |
| `assets/marca/logo-negro.png` | Negro con fondo transparente, para fondos claros. |

Se generan con ffmpeg desde `assets/logo.webp`:

```
ffmpeg -i assets/logo.webp -vf "crop=252:132:47:109,format=rgba,geq=r='255':g='255':b='255':a='r(X,Y)'" assets/marca/logo-blanco.png
```

Para `logo-negro.png`, el mismo comando con `r='0':g='0':b='0'`. Conviene reemplazarlos por el logo vectorial cuando Ryori lo entregue.

## Componentes

- **Canales:**
  - `.canal-retiro`: relleno tinta, o arroz sobre fondo oscuro;
  - `.canal-delivery` y `.canal-whatsapp`: solo contorno;
  - siempre en este orden y con estas etiquetas: «Retirar en el local ↗», «Delivery ↗», «WhatsApp ↗».
- **Barra fija del teléfono** (`.barra-canales`): Retirar, Delivery y el botón redondo de WhatsApp.
- **Botón flotante de WhatsApp** (`.wa-flotante`): solo en escritorio.
- **Cabecera** (`.cabecera`): logo, estado «Abierto · cierra a las…» (calculado por `comun.js` con la hora de Chile y `data/negocio.json`) y dirección.
- **Pedir** (`.pedir`): píldora tinta de 44 px de alto con «↗».
- **Tarjeta del sugeridor** (`.tarjeta-sugeridor`): fondo nori, ola mango y botón mango.
- **Áreas táctiles:** 44 px como mínimo en todo; las opciones de variante y los chips también.

## Movimiento

Solo el que responde a una acción: hover y foco en botones. Respeta `prefers-reduced-motion`.
