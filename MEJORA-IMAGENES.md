# Mejora de imágenes con ChatGPT

07/10/2026. Herramienta integrada de generación y edición de imágenes de ChatGPT; edición con referencias locales.

Las versiones anteriores siguen en assets y en el historial de Git. Las nuevas versiones `*-hd.webp` se usan en el sitio. Los PNG maestros se guardan en outputs/imagenes-mejoradas dentro del espacio de trabajo. La generación reconstruye microdetalles: no recupera de forma exacta datos ausentes del original. Se pidió conservar composición y contenido. En las fotografías de collages se extrajo la toma utilizada por el sitio.

## Archivos publicados

| Archivo | Resolución | Peso WebP |
| --- | --- | --- |
| assets/hero-hd.webp | 1998 × 787 | 204 KiB |
| assets/rolls-casa-hd.webp | 1870 × 841 | 229 KiB |
| assets/compartir-hd.webp | 1448 × 1086 | 131 KiB |
| assets/ambiente-hd.webp | 1086 × 1448 | 134 KiB |
| assets/hot-sushi-burger-hd.webp | 1448 × 1086 | 293 KiB |

## Prompts finales

### hero

Use case: precise-object-edit. Edit target: the supplied Ryori Sushi restaurant hero photograph. Perform a conservative high-resolution restoration/upscale, target about 2560x1008 pixels, same wide aspect and composition. Keep every sushi piece in exactly the same position, scale and appearance, the same ingredients and mango-yellow covering, salmon, cream cheese, green center, plate, red tomato and flowers, background, depth of field, lighting and colors. Only improve resolution, mild blur and compression artifacts and natural edge definition. Retain the real photographic appearance and original imperfections. Do not embellish, replace food, add extra objects, invent ingredients, alter arrangement, crop, add text, logos or watermark. Return just the improved wide photo.

### rolls-casa

Use case: precise-object-edit. Edit target: ONLY the UPPER photograph in the supplied two-photo collage: a long white rectangular plate with sauced sushi rolls on a dark restaurant table, jar drink upper right. Extract that exact upper photograph (from top down to just above the thin white dividing line, about upper 44 percent). The lower photo and cartoon are not part of the target and must not appear. Produce a high-resolution restored photograph about 1920x864, preserving the complete original upper photograph framing and proportions, same sushi pieces/count/arrangement, food ingredients, sauces, sesame, plate, glass jar with pale lime beverage, background objects, table, lighting and natural colors. Only improve sharpness and compression noise; no styling, added foods, brand text, extra objects, new people or watermark. Faithful natural restaurant photograph, not a new product reinterpretation.

### compartir

Use case: precise-object-edit. Edit target: ONLY the UPPER LEFT photo in the supplied 4-part collage: white rectangular plate of pale sushi rolls with green garnish in the center, on a wooden restaurant table; blurred hand, second plate and mug in background. Extract that exact upper-left photograph, up to the white vertical and horizontal dividing lines. No other quadrants, dividing lines, or cartoon stickers. Restore/upscale this photograph to approximately 1920x1440. Preserve exact camera perspective, plate, sushi piece number and placement, toppings, white/pink speckles, green garnish, hands, background plate, mug, wooden table, lighting, natural warm color, original framing. Only improve mild blur, noise and compression; don't add foods, change ingredients, redesign plate or hands, invent text/logos/watermark. Keep faithfully photographic and realistic.

### ambiente

Use case: precise-object-edit. Edit target: ONLY the UPPER LEFT photograph of the supplied four-photo collage: low table view into the restaurant, sushi plate in foreground, orange cocktail at left, light wall with mirror/window, dark ceiling and hanging lights, seated people in background. Extract that exact upper-left photo, excluding white dividing lines and other quadrants. Conservative high-resolution restoration to about 1248x1664 pixels, same portrait aspect. Preserve restaurant architecture, seating, every table and object, drink, food plate, camera perspective, framing, lighting and subdued real colors. Preserve people as distant softly blurred original figures, do not invent faces or new patrons. Only reduce compression artifacts/noise and improve natural clarity where present; keep foreground/background depth of field. No new decor, exaggerated beautification, changed interior, text, watermark or logos. Return just faithful enhanced photo.

### hot-sushi-burger

Use case: precise-object-edit. Edit target: supplied previously AI-generated Hot Sushi Burger reference image. Restore/upscale to about 2208x1664 pixels, same 4:3 framing. Preserve exactly the single burger, grilled rice buns shape and position, chicken, cheese, avocado slices, chopped scallion, dark ceramic plate, wood table, blurred cloth, warm side lighting and color. Enhance crisp high-resolution texture and remove compression softness while keeping composition and ingredients unchanged. No additional ingredients or objects, no text/logo/watermark, no new styling. Output only the enhanced faithful photographic reference image.
