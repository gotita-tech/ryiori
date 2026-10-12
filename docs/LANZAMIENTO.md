# Lanzamiento: lo que está listo y cómo activarlo

Hoy el sitio es una **demo**: no aparece en Google (`noindex`) y no mide visitas. Todo lo necesario para el lanzamiento ya está hecho; solo hay que activarlo cuando Ryori diga «sí».

## Ya está en el sitio

| Pieza | Dónde | Estado |
| --- | --- | --- |
| Datos estructurados `Restaurant` (dirección, coordenadas, horario, teléfono, carta y redes) | `<head>` de `index.html`, generados desde `data/negocio.json` | Listos. Google los lee recién cuando se quite `noindex`. |
| `sitemap.xml` | raíz | Listo. Falta cambiar el dominio. |
| `robots.txt` | raíz | Hoy bloquea todo. La versión de lanzamiento está en `docs/lanzamiento/robots.txt`. |
| Página 404 propia | `404.html` | Activa. |
| Favicon de la ola | `favicon.svg`, `favicon.ico`, `assets/marca/icono-*.png` | Activo. |
| Imagen para compartir (JPG 1200×630) | `assets/compartir-1200x630.jpg` | Activa (WhatsApp, Facebook, etc.). |
| Idioma `es-CL` | todas las páginas | Activo. |
| UTM en cada salida a Fudo, Uber Eats, WhatsApp y Maps | `comun.js` (`utm_source=sitio-ryori`, `utm_medium=web`, `utm_campaign=pedidos`, `utm_content=` lugar del botón) | Activo. |
| Eventos de clic: `clic_retiro`, `clic_pedir`, `clic_delivery`, `clic_whatsapp`, `clic_mapa` (con ubicación y producto) | `comun.js` | Listos. Se envían cuando se active la analítica. |
| Caché larga para `/assets` (1 año) | `vercel.json` | Activa. Si cambias una foto, usa un archivo con nombre nuevo. |

## Pasos para lanzar

1. **Dominio:**
   - conectar el dominio definitivo en Vercel (proyecto → Settings → Domains);
   - reemplazar `ryiori.vercel.app` en `sitemap.xml`, en `og:image` y en los datos estructurados de `index.html`.
2. **Abrir a Google:**
   - quitar `<meta name="robots" content="noindex,nofollow">` de las páginas de cliente;
   - quitar el encabezado `X-Robots-Tag` de `vercel.json`;
   - copiar `docs/lanzamiento/robots.txt` sobre `robots.txt`, con el dominio.
3. **Medición (lo activa el dueño del proyecto en Vercel):**
   - en el panel de Vercel: proyecto `ryiori` → **Analytics** → **Enable**;
   - en `data/negocio.json`, cambiar `"analitica": false` a `true`. Así se carga el script de Vercel en todas las páginas;
   - Vercel Web Analytics no usa cookies. Los eventos personalizados (clics) dependen del plan de Vercel: revisa en el panel si tu plan los incluye. Las visitas por página funcionan en todos los planes.
4. **Google Search Console:** verificar el dominio y enviar `sitemap.xml`.
5. **Modo demo:** en `data/negocio.json`, `"modoDemo": false` para que el sugeridor abra WhatsApp de verdad (fase 5).
