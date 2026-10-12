# Fase 5 — Sugeridor «¿Cuánto pedimos?» + WhatsApp

Fecha: 12-10-2026 · página: `/sugeridor/` · reglas: [data/sugeridor.json](../../../data/sugeridor.json) · medición: [medicion.json](medicion.json)

## Cómo funciona

1. **El cliente elige:**
   - cuántos son: de 1 a 12, con botones − y + de 52 px;
   - cuánta hambre tienen: para picar, normal o con hambre (8, 12 o 16 piezas por persona);
   - qué les gusta: de todo, solo cocido o vegetariano;
   - si suman una bebida lata de 350 ml por persona.
2. **El cálculo:** busca la combinación más barata que cubre las piezas necesarias; si dos empatan en precio, elige la de menos productos. Las gyosas cuentan como piezas y solo se sugieren junto a otro producto. Los precios se leen de `menu-data.js` (Fudo): ninguno está escrito a mano.
3. **La boleta muestra:**
   - cada línea con cantidad, producto, detalle y subtotal;
   - las piezas totales y por persona;
   - el total estimado y el aviso «Precios de la carta al [fecha]. El local confirma el total y la disponibilidad».
4. **«Enviar pedido por WhatsApp»:** arma un enlace `https://wa.me/56999518653?text=…` con el saludo, el pedido, el total, cuántas personas son y la pregunta por disponibilidad y hora de retiro.
   - Con `"modoDemo": true` (lo que hay hoy en `data/negocio.json`), muestra el mensaje en pantalla en vez de abrir WhatsApp, para que nadie le escriba al local durante la reunión.
   - El botón secundario «Prefiero elegir en la carta» lleva a la carta.
5. **Medición:**
   - `sugeridor_usado` (personas, hambre y preferencia), una vez por combinación;
   - `sugeridor_whatsapp` al enviar.

Se llega desde la tarjeta de la portada («Armar mi pedido») y desde la carta («¿Son varios?»).

## Comprobado

| Criterio | Resultado |
| --- | --- |
| 1 persona, normal | 1 × Roll Acevichado + 1 × Gyosas Mixtas 6 u. = $13.300 (14 piezas) ✔ |
| 2 personas, normal | 1 × Tabla Parque DYR = $19.900 (40 piezas) ✔ |
| 4 personas, con hambre | 1 × Tabla Playa de Llolleo = $28.900 (70 piezas) ✔ |
| Otros casos | 1 normal cocido: Tempura Tori Teriyaki + Gyosas Pollo 6 u. ($11.500) · 3 para picar vegetariano: 3 rolls vegetarianos ($18.600) · 12 con hambre de todo: 3 × Tabla Playa de Llolleo ($86.700) |
| Mensaje de WhatsApp | Bien escrito; precios y total iguales a la boleta (también con bebidas) |
| Con el dedo (teléfono emulado) | Controles de 52 px; 0 áreas táctiles bajo 44 px |
| Con el teclado | Tab recorre en orden; Enter y Espacio cambian las opciones; Enter abre el mensaje y Escape lo cierra |
| JS nuevo | `sugeridor.js` = 7,8 KB (< 15 KB) |
| Carga en red lenta | 119 KB; contenido principal a los 1,3 s |
| Textos < 12 px · contraste < 4,5:1 · táctiles < 44 px | 0 · 0 · 0 |
| Errores en consola | 0 |

## Pendiente o anotado

- **Rolls vegetarianos:** «8 cortes» viene del encargo; Uber Eats no lo indica. Confirmar con el local.
- **Rolls a elección:** el sugeridor usa el precio del California Vegetariano ($6.200) y avisa que Avocado o Cheese vegetariano cuestan $6.300.
- **Mapa ilustrado «Las tablas de Llolleo»:** queda para una segunda etapa y se anota como extra en la propuesta (fase 6).
- **Sin hacer por falta del plugin Design:** la revisión de textos con «ux-copy».
