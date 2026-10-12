# Registro de cambios

## propuesta-v2 · 12-10-2026

### Fase 7 — Control de calidad y entrega
- Mediciones repetidas y comparación con la línea base: `docs/qa/comparacion.md`.
- `scripts/recorridos.mjs`: 6 trayectos en teléfono y escritorio, 12 de 12 correctos y 0 errores de consola.
- La portada carga primero la foto: las tipografías no compiten con ella, los datos de lo más pedido se cargan después y el logo pasó a WebP.
- Enlaces de Uber Eats a la versión en español (`/cl/`).
- README, FUENTES.md y este registro actualizados.

### Fase 6 — Propuesta de venta
- `/presentacion/` reemplaza la auditoría anterior por una propuesta para leer en el teléfono en menos de 3 minutos, con cifras y fuentes, y `[PRECIO A DEFINIR]`.
- Enlace discreto en el pie de la portada.

### Fase 5 — Sugeridor «¿Cuánto pedimos?»
- `/sugeridor/`: personas, hambre, preferencia y bebida. Busca la combinación más barata que cubre las piezas y arma el mensaje de WhatsApp.
- Reglas en `data/sugeridor.json`. `modoDemo` muestra el mensaje en pantalla en vez de abrir WhatsApp.

### Fase 4 — Rendimiento, accesibilidad y base técnica
- Fotos en 320/480/960 px con `srcset`; portada con recorte propio para teléfono y escritorio.
- Tipografías alojadas en el sitio.
- La carta dibuja cada categoría al acercarse a la pantalla.
- `vercel.json` con caché larga. Página 404, favicon de la ola, JSON-LD `Restaurant`, `sitemap.xml`, `robots.txt` e imagen para compartir.
- UTM en todas las salidas y eventos de clic para Vercel Web Analytics (desactivados hasta habilitarlos).
- **Publicado en `main` el 12-10-2026**, a pedido del propietario.

### Fase 3 — Identidad y portada
- Logo con fondo transparente, sin la línea gris del archivo original.
- Paleta tinta, arroz, nori y mango; Bricolage Grotesque y Archivo; la ola como elemento gráfico.
- Portada nueva: estado «Abierto · cierra a las…», «Sushi de Llolleo.», tres canales, sugeridor, lo más pedido, promos, valoraciones y visita.

### Fase 2 — Carta nueva
- `scripts/fudo-sync.mjs`: lee la carta pública de Fudo, limpia nombres, saca modificadores, agrupa variantes y avisa cambios de precio.
- Carta compacta: buscador arriba, barra de categorías fija, filas con piezas, etiquetas, variantes y «Pedir»; bebidas y barra en lista tipográfica; 26 fotos de muestra.

### Fase 1 — Correcciones críticas
- Buscador en toda la carta, sin tildes ni mayúsculas.
- Retirar, Delivery y WhatsApp en cabecera, portada y barra fija; botón redondo de WhatsApp.
- Se quitan la franja naranja, la barra superior y las notas internas.

### Fase 0 — Línea base
- Mediciones del sitio original, capturas del «antes» (sitio y Fudo) y `data/negocio.json`.
