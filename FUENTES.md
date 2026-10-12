# Fuentes y recursos visuales

Revisión para esta versión: 07/10/2026. Las fotografías originales se conservan como WebP. El sitio usa nuevas versiones de mayor resolución reconstruidas con IA mediante la herramienta de imágenes de ChatGPT; detalles y prompts en MEJORA-IMAGENES.md.

## Material publicado del negocio

Fuente principal: https://menu.fu.do/ryori — identifica a Ryori Sushi Bar & Burgers, Divina Providencia 375, Llolleo. Contactos y horarios tomados del encabezado descriptivo (no del horario técnico de pedidos 00:00–23:59).

- Logo (`assets/logo.webp`): https://fudo-apps-storage.s3.sa-east-1.amazonaws.com/production/54254/online-menu/logo
- Portada (`assets/hero.webp`): https://fudo-apps-storage.s3.sa-east-1.amazonaws.com/production/54254/online-menu/background-image
- Instagram: https://www.instagram.com/ryorisushi_llolleo/
- Facebook: https://www.facebook.com/RyoriSushiOficial
- WhatsApp publicado: https://api.whatsapp.com/send?phone=56999518653
- Teléfono: +56 35 228 1065

## Fotografías del restaurante publicadas en directorio

Página de origen: https://es.restaurantguru.com/amp/Ryori-Sushi-Bar-San-Antonio-Valparaiso-Region

- Rolls de la casa (`assets/rolls-casa.webp`): https://img02.restaurantguru.com/cf09-Ryori-Sushi-Bar-San-Antonio-dishes.jpg
- Sushi para compartir (`assets/compartir.webp`): https://img02.restaurantguru.com/c2e7-Ryori-Sushi-Bar-sushi.jpg
- Mesa e interior (`assets/ambiente.webp`): https://img02.restaurantguru.com/cc12-Ryori-Sushi-Bar-San-Antonio-sushi.jpg

Estas fotos aparecen asociadas al local en el directorio. No se afirma que muestren exactamente una tabla o variante específica, ni que su publicación transfiera derechos de autor. Confirmar su uso con el negocio para una campaña comercial definitiva.

## Imagen referencial de IA

`assets/hot-sushi-burger.webp`: generada con la herramienta integrada de generación de imágenes. No es una fotografía del producto real. Está identificada en la página con “Imagen referencial · IA”.

Prompt: fotografía gastronómica editorial de una Hot Sushi Burger, una unidad en plato cerámico oscuro, panes de arroz crujiente, pollo cocido, queso gouda, palta y cebollín; toma cercana a 45 grados, mesa de madera oscura, luz cálida lateral, sin logos, texto, personas ni marcas de agua.

## Información mostrada

La descripción de Hot Sushi Burger y las tablas de 40/70 piezas se contrastaron con la carta de Fudo. No se fijan precios ni se inventan testimonios, calificaciones o servicios. La búsqueda de Maps usa el nombre del local porque directorios secundarios muestran un número de calle distinto; el sitio sigue la dirección publicada en Fudo.

## Versiones mejoradas con ChatGPT

La portada, los rolls, la foto de sushi para compartir, el ambiente y la burger usan archivos `*-hd.webp`. En las tres fotos provenientes de collages se extrae la toma mostrada en el sitio. Se pidió preservar el contenido y la composición; la IA puede reconstruir detalles distintos del original. La burger continúa identificada como imagen referencial. Ver [MEJORA-IMAGENES.md](MEJORA-IMAGENES.md) para resoluciones y prompts.

---

# Versión propuesta-v2 (12-10-2026)

Todo dato de terceros que muestra el sitio lleva su fuente y su fecha en la página o en `data/`.

## Datos del local

- **Fudo** (https://menu.fu.do/ryori), leído el 12-10-2026 a través de sus datos públicos (ver `docs/fudo-datos.md`):
  - nombre, dirección y coordenadas, horario de atención, WhatsApp, teléfono, correo, redes;
  - medios de pago en el local (efectivo y Redcompra);
  - carta y **todos los precios**.
  Copia en `data/fudo/` y datos en `data/negocio.json`.
- Las diferencias con otras fuentes (dirección 391 en Tripadvisor y Waze; apertura 12:30 en Google y Uber Eats; ficha duplicada en Google) **no** se muestran en el sitio: están en `docs/venta/datos-por-resolver.md`.

## Uber Eats

https://www.ubereats.com/cl/store/ryori-sushi/pJ2VaHH-VmKoWFzFx3EKbg, revisado el 12-10-2026:
- nota 4,4 con más de 500 valoraciones;
- lo más pedido: Hot Sushi Burger Pollo (nº 1, 83 % de 48), Tabla Parque DYR (84 % de 38), Roll Acevichado (80 % de 25), Handroll pollo y queso crema (94 % de 53), Gohan de pollo (96 % de 25);
- piezas («8 cortes»), alérgenos (mariscos y pescado), picante y descripciones de productos que Fudo no describe. Están resumidas en `data/descripciones.json` con su fuente.

Los precios de Uber Eats **no** se usan: son distintos de los de Fudo.

## Google Maps

Ficha «Ryori Sushi en Llolleo», 4,1 con 432 reseñas (12-10-2026). No se citan reseñas.

## Imágenes

- **Fotos de platos de la carta y de lo más pedido:** las imágenes de IA existentes en `assets/menu/` y `assets/hot-sushi-burger-hd.webp` (ver arriba y `MEJORA-CARTA.md`), rotuladas «Foto de muestra». Las versiones de 320/480/960 px en `assets/opt/` se generaron con `scripts/imagenes.mjs`.
- **Portada:** recortes de `assets/hero-hd.webp` (foto de la portada de Fudo mejorada con IA, ver arriba) en `assets/portada/`.
- **Logo:** `assets/marca/` se genera desde `assets/logo.webp` (Fudo), recortado y con fondo transparente. Ver `docs/DISENO.md`.
- **Favicon de la ola** (`favicon.svg`, `assets/marca/icono-*.png`): dibujo propio inspirado en la ola del logo.
- **Imagen para compartir** (`assets/compartir-1200x630.jpg`): composición del logo y la foto de portada.
- **Capturas de Fudo y del sitio anterior** en la propuesta (`presentacion/img/`): capturas propias del 12-10-2026.

## Tipografías

Archivo y Bricolage Grotesque, licencia SIL OFL 1.1, alojadas en `assets/fuentes/` (ver `assets/fuentes/LICENCIA.md`).
