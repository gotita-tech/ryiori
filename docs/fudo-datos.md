# Cómo carga Fudo la carta de Ryori

Revisado el 12-10-2026 con las peticiones de red de Chrome al abrir https://menu.fu.do/ryori. **Solo lectura**: no se inicia sesión, no se agrega nada al pedido y no se envía nada a Fudo.

La página de Fudo es una aplicación Angular. Al abrirse, pide tres archivos JSON públicos:

| Dirección | Qué trae |
| --- | --- |
| `GET https://integrations.fu.do/fudo/account/?a=ryori` | Datos del local: nombre, dirección y coordenadas, WhatsApp, teléfono, correo, redes, texto del horario, medios de pago, si hay retiro (`pickup: true`) o despacho (`delivery: false`). |
| `GET https://integrations.fu.do/fudo/product-categories/?a=ryori` | Categorías con `id`, `name` (por ejemplo «.1 HOSOMAKIS») y `position`. |
| `GET https://integrations.fu.do/fudo/products/?a=ryori` | Productos con `id`, `name`, `description`, `price`, `pricePickup`, `priceDelivery`, `productCategoryId`, `position`, `isAvailable`, `sellAlone`, `image` y `productGroups` (modificadores). |

Fudo exige dos encabezados públicos, los mismos que envía cualquier visitante desde el navegador. No hay clave, token ni cookie:

```
fudo-app: online-menu
fudo-account-id: cnlvcmk=      (es «ryori» en base64)
```

Sin esos encabezados responde `401 Unauthorized`.

## Enlace a cada producto

Fudo abre un producto con la dirección `https://menu.fu.do/ryori/<categoría>/<producto>-<id>`, por ejemplo `https://menu.fu.do/ryori/burgers/hot-sushi-burger-pollo-565`. La parte de texto se forma con el nombre de la categoría y del producto en minúsculas, sin tildes y con guiones, y termina en el `id` del producto. En la fase 2 se comprueba con 15 productos de muestra que los enlaces generados abren el producto correcto. Ese enlace abre la ficha del producto con el botón «Agregar a mi pedido». La landing solo lleva hasta ahí: el cliente decide si agrega.

## Riesgos

- Es una interfaz interna de Fudo, sin documentación pública. Puede cambiar sin aviso. Por eso el script de sincronización (fase 2) se detiene si la respuesta no tiene la forma esperada y no sobrescribe la carta.
- Conviene confirmar con Fudo o con el dueño que leer la carta pública de esta forma está bien. Es lo mismo que hace el navegador de cualquier cliente.

## Sincronización: `scripts/fudo-sync.mjs`

```
node scripts/fudo-sync.mjs            # descarga de Fudo y actualiza menu-data.js
node scripts/fudo-sync.mjs --revisar  # solo muestra qué cambiaría
node scripts/fudo-sync.mjs --desde data/fudo   # repite con la última descarga guardada
```

El script hace esto, en orden:

1. Lee los tres archivos públicos de Fudo y guarda una copia en `data/fudo/`. Si la respuesta no tiene la forma esperada, se detiene sin tocar nada.
2. Limpia los nombres: quita la numeración («/ 17.»), los dobles espacios y el «+» inicial, corrige «CHESSE» y «Camaròn», y pasa los nombres en mayúsculas a mayúscula inicial. Los cambios puntuales están en `renombres` de `data/carta-config.json`.
3. Saca de la carta los modificadores: extras, «Cambio de…», salsas, palitos y agregados (36 productos). Se eligen al pedir en Fudo.
4. Ordena la carta en 10 categorías propias, entre ellas Promos y Postres.
5. Agrupa las variantes en un solo producto con opciones: Gyosas (5 rellenos × 3, 6 o 10 u.), Sashimi, Niguiris, burgers normal o doble, etc. 292 productos de Fudo quedan en 233 filas.
6. Agrega piezas, etiquetas y descripciones faltantes desde `data/descripciones.json` (fuente: Uber Eats, 12-10-2026), y fotos desde `data/fotos.json`.
7. Escribe `menu-data.js` con la fecha e informa en consola y en `docs/carta-sync.md`:
   - los precios que cambiaron;
   - los productos nuevos o retirados;
   - los productos nuevos que todavía no tienen categoría.

Los precios **nunca** se escriben a mano: siempre salen del campo `pricePickup` (retiro) de Fudo.
