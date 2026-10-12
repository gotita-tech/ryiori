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
