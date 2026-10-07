# Ryori Sushi Bar — sitio y presentación

Sitio de Ryori Sushi Bar en https://ryiori.vercel.app, publicado desde `main` en el proyecto Vercel existente `ryiori`, equipo Gotech (`gotech2`).

## Separación de contenidos

- `index.html`, `styles.css`, `site.js`: sitio orientado a clientes, con carta, pedidos, local y contacto.
- `presentacion/index.html`: auditoría digital independiente, disponible en `/presentacion/`. No aparece enlazada en la navegación del sitio. Incluye impresión / guardado como PDF y conserva el análisis fechado el 06/10/2026.
- `assets/`: fotografías optimizadas guardadas en el repositorio; no dependen de enlaces externos a imágenes.
- `FUENTES.md`: procedencia de imágenes, enlaces y datos del negocio.

## Uso y despliegue

No requiere dependencias ni compilación. Sirve la carpeta raíz con cualquier servidor estático o abre `index.html`. Cada cambio en `main` activa la integración de GitHub con Vercel.

Los pedidos se realizan en la carta existente de Fudo, no en un carrito creado para esta web. Los enlaces a WhatsApp y redes fueron recuperados de esa carta. Los precios se consultan directamente en Fudo para evitar valores desactualizados.

La etiqueta `noindex,nofollow` se conserva mientras el sitio sea una propuesta. Dirección y horarios siguen lo publicado por el negocio en Fudo; confirmar con el negocio antes del lanzamiento comercial definitivo.


## Fotografías de mayor resolución

El sitio utiliza las cinco versiones `assets/*-hd.webp`, preparadas con la herramienta integrada de imágenes de ChatGPT. Los originales se conservan. [MEJORA-IMAGENES.md](MEJORA-IMAGENES.md) documenta resolución, peso y prompts, y [FUENTES.md](FUENTES.md) conserva la procedencia.
