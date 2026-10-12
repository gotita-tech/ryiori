# Fase 7 — Control de calidad y entrega

Fecha: 12-10-2026

## Comprobado

- **Mediciones repetidas:** [comparacion.md](../comparacion.md).
  - portada: 694 KB → 252 KB, foto principal 3,1 s → 1,76 s en local;
  - carta: el primer producto pasa de 1.157 px a 219 px y Sushi de 32.750 px a 5.884 px;
  - accesibilidad: 0 problemas en todas las páginas.
- **Recorridos:** [recorridos.md](../recorridos.md). Los 6 trayectos, en teléfono y escritorio: **12 de 12 correctos, 0 errores de consola**.
- **Ajuste final de velocidad en la portada.** El sitio publicado (versión de la fase 4) dio 2,47–2,57 s, en el límite de la meta de 2,5 s. Ahora:
  - las tipografías no compiten con la foto;
  - los datos de lo más pedido se cargan después;
  - el logo pasó a WebP.
  En local, la foto aparece 0,2 s antes. Se confirma al publicar.
- **Uber Eats:** los enlaces apuntan a la tienda en español (`/cl/`).
- **Documentación:** README, FUENTES.md y CHANGELOG.md actualizados.

## Nombre del proyecto en Vercel (recomendación; no se cambió)

«ryiori» tiene un error de ortografía y un enlace mal escrito no se recomienda de boca en boca. Antes de enviar el enlace a Ryori, conviene renombrar el proyecto en Vercel (Settings → General → Project Name). Opciones, en orden de preferencia:

1. **ryori-llolleo** → `ryori-llolleo.vercel.app`: dice qué es y dónde.
2. **ryori-sushi** → `ryori-sushi.vercel.app`: corto y fácil de dictar.
3. **ryori-sushi-llolleo** → `ryori-sushi-llolleo.vercel.app`: el más descriptivo.

El 12-10-2026 las tres direcciones respondían «no encontrado», lo que sugiere que están libres; Vercel lo confirma al guardar. Después de renombrar, hay que actualizar `ryiori.vercel.app` en `index.html` (og:image y datos estructurados) y en `sitemap.xml`. Lo ideal para el lanzamiento sigue siendo un dominio propio (ver docs/LANZAMIENTO.md).

## Sin hacer

- **Plugin Design** (no estaba activo): no se hizo la auditoría WCAG con «accessibility-review» ni la entrega con «design-handoff». La entrega técnica está en README, DISENO.md y LANZAMIENTO.md.
- **Figma y HarborRank:** no estaban activos.
