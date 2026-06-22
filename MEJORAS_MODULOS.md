# Mejoras por módulo — Mercado Digital

Resultado del escaneo completo de todos los módulos del proyecto por rol:
**Usuario/Cliente · Administrador · Empleado**

Cada mejora incluye el archivo afectado, descripción del cambio y prioridad.

---

## Índice

1. [Globales (todos los roles)](#1-globales)
2. [Landing](#2-landing)
3. [Login y Registro](#3-login-y-registro)
4. [Tienda](#4-tienda)
5. [Carrito y Pago](#5-carrito-y-pago)
6. [Mis Pedidos](#6-mis-pedidos)
7. [Perfil](#7-perfil)
8. [Domicilio — Historial y Seguimiento](#8-domicilio)
9. [Admin — Dashboard](#9-admin-dashboard)
10. [Admin — Pedidos](#10-admin-pedidos)
11. [Admin — Productos](#11-admin-productos)
12. [Admin — Inventario](#12-admin-inventario)
13. [Admin — Pagos](#13-admin-pagos)
14. [Admin — Domicilios](#14-admin-domicilios)
15. [Admin — Usuarios](#15-admin-usuarios)
16. [Admin — Reportes](#16-admin-reportes)
17. [Admin — Ventas presenciales](#17-admin-ventas)
18. [Admin — Categorías y Proveedores](#18-admin-categorias-proveedores)
19. [Admin — Métodos de Pago](#19-admin-metodos-pago)
20. [Backend — API general](#20-backend-api)
21. [Resumen de prioridades](#21-resumen)

---

## 1. Globales

Afectan a todos los roles y páginas del proyecto.

### Visual

| # | Mejora | Archivo(s) |
|---|--------|------------|
| G1 | **Skeleton loaders uniformes** — reemplazar el texto "Cargando..." por tarjetas de shimmer grises en todas las páginas con fetch inicial. Evita saltos de layout y da sensación de velocidad. | Todas las páginas |
| G2 | **Toast/notificación unificado** — crear `src/components/Toast.jsx` con variantes `success`, `error`, `warning`, `info` y usar un Context (`ToastContext`) para dispararlo desde cualquier parte. Actualmente cada página maneja su propio error en un `<div>` con estilos distintos. | Todas las páginas |
| G3 | **Botones con estado `loading`** — agregar un spinner dentro del botón mientras una acción está en curso (`procesando`), deshabilitar el elemento y bloquear doble envío. Solo algunas páginas lo hacen hoy. | Formularios de toda la app |
| G4 | **Confirmación de acciones destructivas** — reemplazar el `window.confirm()` nativo por un `<ModalConfirmar>` de diseño propio (estilo del resto de modales del proyecto) en eliminar productos, usuarios, categorías y proveedores. | AdminProductos, AdminUsuarios, AdminCategorias, AdminProveedores |
| G5 | **Favicon y metaetiquetas Open Graph** — el favicon actual es un SVG genérico. Usar el logo del proyecto y agregar `<meta og:title>`, `<meta og:description>`, `<meta og:image>` en `index.html`. | `frontend/index.html` |
| G6 | **Persistencia del tema oscuro** — `ThemeContext` recalcula el tema en cada carga. Guardar la preferencia en `localStorage` para que no parpadee al recargar. | `src/context/ThemeContext.jsx` |

### Backend

| # | Mejora | Archivo(s) |
|---|--------|------------|
<!-- | G7 | **Paginación en todos los listados** — `/pedidos`, `/productos`, `/usuarios`, `/domicilio/todos` devuelven todo sin límite. Agregar `?pagina=1&limite=20` y devolver `{ datos, total, pagina, paginas }`. | Todos los modelos `getAll()` |
| G8 | **Cabeceras de caché** — agregar `Cache-Control: no-store` en rutas privadas y `Cache-Control: max-age=60` en rutas públicas (`/productos`, `/categorias`, `/ofertas`). | `backend/public/index.php` |
| G9 | **Rate limiting básico** — limitar intentos de `/auth/login` a 5 por minuto por IP usando `$_SERVER['REMOTE_ADDR']` + APCu o tabla temporal `rate_limit`. Previene fuerza bruta. | `AuthController.php` |
| G10 | **Log de auditoría de admin** — registrar en una tabla `audit_log` (usuario, acción, entidad, id_entidad, ip, timestamp) cada vez que un admin/empleado crea, edita o elimina algo. | Todos los Controllers de admin | -->

---

## 2. Landing

`frontend/src/pages/Landing.jsx`

### Visual

| # | Mejora |
|---|--------|
| L1 | **Hero con CTA más potente** — el botón principal "Ir a la tienda" está debajo del fold en móvil. Moverlo al primer viewport con un subtítulo de valor ("Delivery en Bosa Brasil · Pago seguro") y el badge de horarios integrado en el hero, no en sección aparte. |
| L2 | **Sección "¿Por qué elegirnos?"** — agregar 3 íconos con texto corto (Entrega rápida / Productos frescos / Pago seguro) entre el hero y el carousel de productos. Refuerza confianza en usuarios nuevos. |
| L3 | **Carousel con indicadores de posición** — los 3 slides del carousel promocional no muestran puntos de paginación ni flechas visibles en móvil. Agregar dots clickeables abajo del carousel. |
| L4 | **Skeleton para productos en carga** — los productos de la landing aparecen vacíos hasta que llega la respuesta. Mostrar 4-6 tarjetas de shimmer grises con las mismas dimensiones. |
| L5 | **Horario dinámico** — el texto de horario está hardcodeado. Moverlo a una constante central (`src/config/negocio.js`) para poder cambiarlo desde un solo lugar, o mejor, desde el panel de administración. |

### Backend

| # | Mejora |
|---|--------|
| L6 | **Endpoint `/config/negocio`** — crear una tabla `configuracion` (clave/valor) y un `ConfigController::obtener()` público que devuelva horario, nombre del negocio, dirección y teléfono. La landing, el carrito y PagoSimulado consumen ese dato en vez de hardcodearlo. |

---

## 3. Login y Registro

`frontend/src/pages/Login.jsx` · `frontend/src/pages/Registro.jsx`

### Visual

| # | Mejora |
|---|--------|
| LR1 | **Imagen de login con ruta correcta** — `Login.jsx` carga `/Diseño sin título.png` (ruta con tildes y espacios). Renombrar el archivo a `/login-bg.png` y actualizar la referencia. Actualmente puede fallar en servidores con rutas sensibles a mayúsculas. |
| LR2 | **Indicador de fortaleza de contraseña visual** — el componente `PasswordRequirements` existe pero no muestra una barra de progreso de fortaleza (débil / media / fuerte) con color. Agregar la barra como primer elemento visual antes de la lista de requisitos. |
| LR3 | **Estado de carga en botón "Iniciar sesión"** — actualmente el botón se deshabilita pero no muestra spinner. Igualar al patrón de `Registro.jsx` que sí muestra "Creando cuenta...". |
| LR4 | **Mensaje de bienvenida post-login** — al redirigir tras login exitoso, mostrar un toast "¡Bienvenido, {nombre}!" usando el `ToastContext` propuesto en G2. |

### Backend

| # | Mejora |
|---|--------|
<!-- | LR5 | **Token de reset en body, no en URL** — el flujo de reset de contraseña expone el token en la URL (`?token=xxx`), quedando en el historial del navegador y en logs de servidor. Cambiar a envío por POST en el body. |
| LR6 | **Expiración de token de reset** — verificar que el token tiene un TTL de máximo 15 minutos en `AuthController::resetConfirm()`. Si la columna `reset_token_expiry` no existe, agregarla vía `ensureColumns()`. |
| LR7 | **Bloqueo por intentos fallidos** — después de 5 intentos de login fallidos, bloquear el usuario por 15 minutos y devolver `429 Too Many Requests`. Registrar el evento en `audit_log`. |  -->

---

## 4. Tienda

`frontend/src/pages/Tienda.jsx`

### Visual

| # | Mejora |
|---|--------|
| T1 | **Indicador de búsqueda activa** — durante los 400ms de debounce y mientras espera respuesta, mostrar un spinner pequeño dentro del input de búsqueda (posición `absolute right-3`). Actualmente no hay feedback visual de que está buscando. |
| T2 | **Empty state por categoría** — si una categoría no tiene productos, mostrar un mensaje específico ("No hay productos en esta categoría todavía") en vez del contenedor vacío actual. |
| T3 | **Badge de "Agotado"** — las tarjetas de producto no muestran cuando el stock es 0. Agregar un badge rojo "Agotado" superpuesto a la imagen y deshabilitar el botón "Agregar" cuando `stock === 0`. |
| T4 | **Favoritos sincronizados** — los favoritos se guardan solo en `localStorage`. Moverlos al backend (tabla `favoritos`) para que persistan entre dispositivos. Mostrar un ícono de corazón relleno/vacío con animación de escala al hacer clic. |
| T5 | **Paleta de colores de categorías dinámica** — los 10 colores hardcodeados se repiten con más de 10 categorías. Generar el color a partir de un hash del nombre de la categoría (`hsl((hash % 360), 60%, 45%)`) para que siempre sea consistente y nunca se repita. |
| T6 | **Vista de lista vs. cuadrícula** — agregar toggle entre vista de grilla (actual) y lista horizontal, para que el usuario elija según preferencia. Guardar preferencia en `localStorage`. |

### Backend

| # | Mejora |
|---|--------|
| T7 | **Endpoint de favoritos** — `POST /favoritos`, `DELETE /favoritos/{producto_id}`, `GET /favoritos` — tabla `favorito (Num_Documento, Cod_Producto)`. Vinculado a la sesión del usuario. |
| T8 | **Stock en el listado de productos** — el endpoint `GET /productos` no devuelve el campo `stock` actual del inventario. Hacer un JOIN con la tabla `inventario` para incluirlo y poder mostrar el badge "Agotado" (T3). |

---

## 5. Carrito y Pago

`frontend/src/pages/Carrito.jsx` · `frontend/src/pages/PagoSimulado.jsx`

### Visual

| # | Mejora |
|---|--------|
| C1 | **Resumen de precio desglosado** — mostrar en el resumen del carrito: subtotal, costo de envío (o "Gratis" si aplica), y total final con tipografía más grande para el total. El envío de $7.900 solo aparece calculado, no explicado ("Envío estándar · domicilio dentro de Bosa Brasil"). |
| C2 | **Animación al agregar/quitar** — cuando la cantidad de un ítem llega a 0 y se elimina, la fila desaparece abruptamente. Agregar `transition: opacity 0.2s, max-height 0.3s` para una salida suave. |
| C3 | **Botón "Vaciar bolsa" con confirmación** — actualmente vacía el carrito instantáneamente sin confirmación. Usar el `<ModalConfirmar>` de G4. |
| C4 | **Tarjeta con número de tarjeta más realista** — en PagoSimulado la vista previa muestra `{form.numero_tarjeta || "•••• •••• •••• ••••"}`. Agregar un ícono de chip EMV (rectángulo dorado) en la esquina superior izquierda para que se parezca a una tarjeta física. |

### Backend

| # | Mejora |
|---|--------|
<!-- | C5 | **Validación de stock al crear pedido** — `PedidoController::crear()` debe verificar que cada ítem tenga stock suficiente antes de insertar. Si no alcanza, devolver `422 Unprocessable Entity` con el nombre del producto agotado. |
| C6 | **Rollback transaccional** — el proceso de creación de pedido hace múltiples inserts (pedido, detalle, pago, usuario_pedido). Envolverlos en `$this->db->beginTransaction()` / `commit()` / `rollback()` para evitar pedidos sin detalle en caso de fallo parcial. | -->

---

## 6. Mis Pedidos

`frontend/src/pages/MisPedidos.jsx`

### Visual

| # | Mejora |
|---|--------|
| MP1 | **Filtro por estado** — agregar chips horizontales ("Todos · Pendiente · En camino · Entregado · Cancelado") encima de la tabla. Filtrar la lista en cliente sin hacer nuevo fetch. |
| MP2 | **Vista detalle de pedido** — al hacer clic en un pedido, expandir una fila accordion (o abrir un modal lateral) con el detalle de ítems, subtotales y dirección de entrega. Actualmente no hay forma de ver los ítems del pedido. |
| MP3 | **Paginación** — listar solo los 10 pedidos más recientes con botón "Ver más" (infinite scroll o paginación clásica) para no sobrecargar la tabla con decenas de filas. |
| MP4 | **Estado vacío personalizado** — cuando no hay pedidos, mostrar ilustración + texto "Aún no has realizado pedidos" + botón "Ir a la tienda". El estado vacío actual es solo texto plano. |
| MP5 | **Botón "Repetir pedido"** — en pedidos entregados, agregar un botón que pre-llene el carrito con los mismos ítems (si tienen stock). Mejora la retención y la experiencia de compra recurrente. |

### Backend

| # | Mejora |
|---|--------|
| MP6 | **Detalle de ítems en `misPedidos`** — el endpoint actual no incluye `detalle_pedido`. Hacer JOIN con `detalle_pedido` y `producto` para devolver los ítems dentro de cada pedido sin hacer un request extra. |
| MP7 | **Endpoint de repetir pedido** — `POST /pedidos/{id}/repetir` — clona los ítems del pedido al carrito activo del usuario, verificando stock. |

---

## 7. Perfil

`frontend/src/pages/Perfil.jsx`

### Visual

| # | Mejora |
|---|--------|
| P1 | **Cambio de contraseña integrado** — agregar una sección colapsable "Cambiar contraseña" dentro de la página de perfil (no una página separada), con campos "Contraseña actual", "Nueva contraseña" y "Confirmar". Actualmente no existe esta opción en la UI de perfil. |
| P2 | **Avatar con inicial dinámica** — el avatar muestra la primera letra del nombre. Agregar opción de subir imagen de perfil (limitada a 2 MB, JPG/PNG) con previsualización circular. |
| P3 | **Feedback de guardado** — el botón "Guardar cambios" no muestra claramente si el cambio fue exitoso. Agregar checkmark animado dentro del botón durante 2 segundos después de una respuesta exitosa. |
| P4 | **Campo de barrio informativo** — el campo "Barrio" está fijo en "Bosa Brasil" y deshabilitado. Reemplazarlo por un badge informativo ("Zona de servicio: Bosa Brasil") con ícono de mapa, para que sea más claro que es una restricción del negocio y no un error. |

### Backend

| # | Mejora |
|---|--------|
| P5 | **Endpoint de subida de avatar** — `POST /auth/avatar` con `multipart/form-data`, guarda la imagen en `backend/uploads/avatares/{doc}.jpg`, devuelve la URL. Agregar columna `avatar_url` a la tabla `persona`. |
| P6 | **Validación de contraseña actual al cambiar** — `AuthController::cambiarPassword()` debe verificar que la contraseña actual es correcta antes de permitir el cambio. Actualmente solo valida la nueva contraseña. |

---

## 8. Domicilio

`frontend/src/pages/Domicilio/HistorialDomicilios.jsx` · `frontend/src/pages/Domicilio/Seguimiento.jsx`

### Visual

| # | Mejora |
|---|--------|
| D1 | **Timeline visual en Seguimiento** — reemplazar la lista de pasos con texto por una línea vertical de progreso con íconos por paso (📦 Preparando → 🛵 En camino → ✅ Entregado). El ítem activo tiene gradiente verde, los anteriores tienen check, los futuros están grises. |
| D2 | **Indicador de tiempo estimado** — mostrar "Tiempo estimado de entrega: ~30 min" si el estado es "En camino". Campo `tiempo_estimado` ya existe como parámetro opcional en `domicilioService.crear()`. |
| D3 | **Notificación push de estado** — cuando el seguimiento está activo (auto-refresh 30s), si el estado cambia, mostrar un toast proeminente "¡Tu pedido está en camino!" en vez de actualizar silenciosamente. |
| D4 | **Tarjetas en historial con más info** — las tarjetas del historial muestran solo estado y fecha. Agregar el total del pedido, número de ítems y método de entrega (domicilio/tienda) para contexto rápido. |
| D5 | **Botón "Cancelar pedido"** — en el historial, si el pedido está en "Pendiente" o "Confirmado", mostrar botón "Cancelar" que llame a `domicilioService.cancelar()` con el `<ModalConfirmar>` de G4. |

### Backend

| # | Mejora |
|---|--------|
| D6 | **Historial de cambios de estado** — agregar tabla `domicilio_historial (id, cod_domicilio, estado_anterior, estado_nuevo, cambiado_por, timestamp)` y registrar cada transición. El endpoint de seguimiento devuelve ese historial para el timeline de D1. |
| D7 | **Validación de transiciones de estado** — no permitir retroceder de "Entregado" → "En camino" ni de "Cancelado" → otro estado. Definir la máquina de estados permitida en `DomicilioController::actualizarEstado()`. |

---

## 9. Admin — Dashboard

`frontend/src/pages/admin/AdminDashboard.jsx`

### Visual

| # | Mejora |
|---|--------|
| AD1 | **Selector de rango de fechas** — el gráfico de ventas siempre muestra todos los meses. Agregar un dropdown "Últimos 7 días / 30 días / 6 meses / Este año" que filtre los datos del gráfico sin recargar la página. |
| AD2 | **KPI con variación vs. período anterior** — cada tarjeta de estadística muestra solo el número actual. Agregar debajo `+12% vs. semana pasada` en verde o rojo, usando flecha ↑↓. |
| AD3 | **Tabla de pedidos recientes con acciones rápidas** — la tabla de pedidos muestra solo lectura. Agregar botones de cambio de estado inline (igual que AdminPedidos) para que el admin no tenga que navegar a otro módulo para confirmar un pedido. |
| AD4 | **Alerta de stock bajo prominente** — si hay productos con stock ≤ 5, mostrar un banner amarillo en la parte superior del dashboard ("⚠ 3 productos con stock bajo — Ver inventario →") que enlace al módulo de inventario. |
| AD5 | **Gráfico de métodos de pago** — agregar un pequeño gráfico de dona (puro CSS/SVG) mostrando la distribución de pagos (Simulado vs. MercadoPago) junto al gráfico de ventas. |

### Backend

| # | Mejora |
|---|--------|
| AD6 | **Endpoint de resumen del dashboard** — `GET /reportes/dashboard` que devuelva en un solo request: pedidos hoy, ingresos hoy, productos activos, stock bajo, ventas por mes (últimos 6 meses), últimos 5 pedidos. Actualmente el dashboard hace 3 requests separados. |

---

## 10. Admin — Pedidos

`frontend/src/pages/admin/AdminPedidos.jsx`

### Visual

| # | Mejora |
|---|--------|
| AP1 | **Detalle expandible de pedido** — al hacer clic en la fila, expandir una sub-fila con los ítems del pedido (nombre, cantidad, precio unitario, subtotal). Evita ir a otra pantalla para ver qué pidieron. |
| AP2 | **Acciones masivas** — checkbox por fila + barra flotante cuando hay selección: "Confirmar seleccionados", "Cancelar seleccionados", "Exportar seleccionados a CSV". |
| AP3 | **Indicador visual de urgencia** — pedidos en "Pendiente" con más de 2 horas sin confirmación aparecen con borde rojo y badge "Urgente". Calculado desde `Fecha_Pedido`. |
| AP4 | **Vista de pedidos por columnas (Kanban)** — vista alternativa al modo tabla: columnas por estado con tarjetas de pedido que se pueden arrastrar (drag-and-drop) para cambiar estado. Librería: `@dnd-kit/core` (ligera). |

### Backend

| # | Mejora |
|---|--------|
| AP5 | **Filtros en `GET /pedidos`** — agregar `?estado=`, `?fecha_desde=`, `?fecha_hasta=`, `?cliente=`, `?pagina=` para reducir la carga y permitir búsquedas más precisas. |
| AP6 | **Endpoint de exportación** — `GET /pedidos/exportar?formato=csv` que devuelva el CSV con headers `Content-Disposition: attachment; filename="pedidos.csv"`. |

---

## 11. Admin — Productos

`frontend/src/pages/admin/AdminProductos.jsx`

### Visual

| # | Mejora |
|---|--------|
| PR1 | **Subida de imágenes real** — el sistema actual acepta solo URLs. Agregar un campo de subida de archivo (`<input type="file">`) con previsualización, que suba la imagen al endpoint `POST /productos/{id}/imagen` y guarde la URL relativa. |
| PR2 | **Vista de grilla de productos** — el modal de imagen con zoom/pan es útil pero la tabla no muestra la imagen. Agregar una vista de tarjetas (toggle tabla/grilla) con la imagen de cada producto visible. |
| PR3 | **Validación de precio y stock con formato colombiano** — los inputs de precio aceptan cualquier texto. Agregar `inputMode="numeric"` y formatear con puntos de miles (`$12.500`) en el preview, guardando el valor numérico limpio. |
| PR4 | **Estado "Activo / Inactivo"** — agregar un toggle de estado por producto para poder ocultarlo de la tienda sin eliminarlo. Nuevo campo `activo TINYINT(1) DEFAULT 1` en la tabla. |

### Backend

| # | Mejora |
|---|--------|
| PR5 | **Endpoint de subida de imagen** — `POST /productos/{id}/imagen` con `multipart/form-data`. Guarda en `backend/uploads/productos/{id}.jpg`, actualiza `Foto` en la tabla `producto`. Máximo 5 MB, valida tipo MIME. |
| PR6 | **Soft delete en lugar de DELETE físico** — en vez de borrar el registro, marcar `activo = 0`. Los pedidos históricos mantienen la referencia al producto. Adaptar `GET /productos` para filtrar por `activo = 1` por defecto. |

---

## 12. Admin — Inventario

`frontend/src/pages/admin/AdminInventario.jsx`

### Visual

| # | Mejora |
|---|--------|
| IN1 | **Registro de movimientos** — al actualizar el stock, mostrar en la misma fila un historial mini: "última actualización: hace 2 horas (+20 unidades)". Requiere tabla `inventario_movimiento`. |
| IN2 | **Importación masiva de stock** — botón "Importar CSV" que suba un archivo con dos columnas (Cod_Producto, nueva_cantidad) y actualice el stock en lote. El formato se puede descargar como plantilla. |
| IN3 | **Alerta visual de agotados** — las filas con stock = 0 deben tener fondo rojo suave (`bg-red-50`) para que destaquen sin necesidad de leer el número. Las de stock ≤ 5, fondo amarillo (`bg-amber-50`). |
| IN4 | **Umbral de alerta configurable** — el umbral de 10 está hardcodeado en `inventarioService.alertas(10)`. Agregar un input en la UI que permita cambiarlo y guardarlo en `localStorage`. |

### Backend

| # | Mejora |
|---|--------|
| IN5 | **Tabla de movimientos de inventario** — `inventario_movimiento (id, cod_inventario, tipo ENUM('entrada','salida','ajuste'), cantidad, usuario, timestamp, notas)`. Registrar cada cambio desde `InventarioController::actualizar()`. |
| IN6 | **Endpoint de importación masiva** — `POST /inventario/importar` que acepte JSON `[{cod_producto, cantidad}]` y actualice en una sola transacción con rollback completo si alguno falla. |

---

## 13. Admin — Pagos

`frontend/src/pages/admin/AdminPagos.jsx`

### Visual

| # | Mejora |
|---|--------|
| PG1 | **Resumen de totales** — encima de la tabla, mostrar 3 tarjetas: "Total completados ($xxx)", "Total pendientes (n)", "Total fallidos (n)". Calculado en cliente a partir de la lista ya cargada. |
| PG2 | **Verificación manual de pagos** — para pagos con `verificacion = null` (aún no revisados), mostrar botón "Aprobar" / "Rechazar" con campo de notas. Llama al endpoint `PUT /pago/{id}/verificar` que ya existe. Actualmente este endpoint existe en backend pero no tiene UI en AdminPagos. |
| PG3 | **Filtro por rango de fechas y método** — agregar fecha desde/hasta y selector de método (Simulado, MercadoPago, Nequi, etc.) para acotar búsquedas en volumen alto. |
| PG4 | **Exportar pagos a CSV** — botón "Exportar" que descargue los pagos filtrados como CSV con columnas: ID pago, pedido, cliente, monto, método, estado, fecha. |

### Backend

| # | Mejora |
|---|--------|
| PG5 | **Filtros en `GET /pago`** — `?estado=`, `?metodo=`, `?fecha_desde=`, `?fecha_hasta=`, `?pagina=` para no devolver todos los registros sin filtro. |
| PG6 | **Resumen estadístico** — `GET /pago/resumen` devuelve `{ total_completados, monto_completados, total_pendientes, total_fallidos }` para las tarjetas de PG1 en un solo request. |

---

## 14. Admin — Domicilios

`frontend/src/pages/admin/AdminDomicilios.jsx`

### Visual

| # | Mejora |
|---|--------|
| DM1 | **Mapa de entregas** — integrar un mapa de Leaflet.js (gratuito, sin API key) que muestre puntos por dirección de entrega con color según estado. Permite ver distribución geográfica de domicilios del día. |
| DM2 | **Panel kanban de estados** — igual que AP4 para pedidos, una vista de columnas por estado de domicilio (Pendiente / En camino / Entregado / Cancelado) con tarjetas de información rápida. |
| DM3 | **Tiempo en cada estado** — mostrar "En preparación desde hace 45 min" para los domicilios urgentes. Calculado desde el `updated_at` del último cambio de estado (requiere D6). |
| DM4 | **Asignación de repartidor** — campo `repartidor` (texto libre o FK a empleados con rol "Domiciliario") por domicilio. Mostrado en la tarjeta. |

### Backend

| # | Mejora |
|---|--------|
| DM5 | **Campo `repartidor_id`** — columna en `domicilio` que referencia a un `Num_Documento` de `persona` con rol "Domiciliario". `GET /domicilio/todos` incluye el nombre del repartidor asignado. |
| DM6 | **Notificación al repartidor** — al asignar un domicilio, enviar email al repartidor con los datos de entrega (requiere el SMTP ya configurado en `ContactoController`). |

---

## 15. Admin — Usuarios

`frontend/src/pages/admin/AdminUsuarios.jsx`

### Visual

| # | Mejora |
|---|--------|
| US1 | **Tabla con avatar de inicial** — agregar una columna con el círculo de inicial (igual que en Perfil) para identificar visualmente a los usuarios más rápido. |
| US2 | **Modal de detalle de usuario** — clic en la fila → modal con historial de pedidos del usuario, total gastado, última actividad. Actualmente la fila es solo lectura sin más información. |
| US3 | **Búsqueda en tiempo real** — el filtro actual recarga. Agregar búsqueda local (filter en el array ya cargado) para documento, nombre, correo y barrio. |
| US4 | **Botón "Resetear contraseña"** — en el modal de usuario, botón que genera un token de reset y envía el email al usuario (usa el flujo de reset ya existente). |

### Backend

| # | Mejora |
|---|--------|
| US5 | **Endpoint de stats por usuario** — `GET /usuarios/{doc}/stats` devuelve `{ total_pedidos, monto_total, ultima_compra, estado_cuenta }` para el modal de US2. |
| US6 | **Endpoint admin de reset de contraseña** — `POST /auth/admin-reset/{doc}` (solo admin) genera un token de reset y envía el email sin que el usuario lo solicite. |

---

## 16. Admin — Reportes

`frontend/src/pages/admin/AdminReportes.jsx`

### Visual

| # | Mejora |
|---|--------|
| RE1 | **Exportación a Excel nativa** — implementar descarga de `.xlsx` (sin dependencias, usando el formato XML de Excel 2003 `application/vnd.ms-excel` o el formato CSV con BOM UTF-8 para abrir correctamente en Excel colombiano). |
| RE2 | **Gráficos interactivos** — los reportes son tablas. Agregar gráficos de barras SVG (sin librerías) para "Ventas por día", "Productos más vendidos" y "Pedidos por estado", iguales al gráfico del Dashboard. |
| RE3 | **Filtro por rango de fechas** — todos los reportes devuelven datos históricos completos. Agregar fecha desde/hasta en el formulario de exportación y que los endpoints los acepten como query params. |
| RE4 | **Reporte de clientes** — tabla de clientes con total gastado, número de pedidos y última compra. Actualmente `GET /reportes/registros` devuelve audit log, no un reporte de clientes per se. |

### Backend

| # | Mejora |
|---|--------|
| RE5 | **Parámetros de fecha en reportes** — `GET /reportes/ventas?desde=2026-01-01&hasta=2026-06-30`, ídem en `productos-mas-vendidos` e `ingresos`. `ReporteController` agrega cláusulas `WHERE fecha BETWEEN :desde AND :hasta`. |
| RE6 | **Endpoint de reporte de clientes** — `GET /reportes/clientes` devuelve `[{ nombre, documento, correo, total_pedidos, monto_total, ultima_compra }]` con JOIN entre `persona`, `pedido` y `usuario_pedido`. |

---

## 17. Admin — Ventas Presenciales

`frontend/src/pages/admin/AdminVentas.jsx`

### Visual

| # | Mejora |
|---|--------|
| VT1 | **Generación de ticket/recibo** — al completar la venta, mostrar un modal con el resumen de la venta (ítems, total, método de pago, fecha, número de ticket) y botón "Imprimir" que abre `window.print()` con una hoja de estilos de impresión (`@media print`). |
| VT2 | **Historial de ventas del día** — panel lateral colapsable con las últimas ventas realizadas en la sesión (guardado en `useState`, no persiste). Permite ver rápidamente cuánto se ha vendido. |
| VT3 | **Atajo de teclado para búsqueda** — al presionar `F3` o `/`, mover el focus al input de búsqueda de productos. Agiliza el flujo de punto de venta en teclado. |
| VT4 | **Scanner de código de barras** — input que detecta cadenas de más de 6 dígitos sin espacios en menos de 100ms (firma de un lector de código de barras USB) y agrega el producto al carrito automáticamente. |

### Backend

| # | Mejora |
|---|--------|
| VT5 | **Número de ticket correlativo** — agregar columna `num_ticket INT AUTO_INCREMENT` a la tabla `pedido` para ventas con `Canal_Venta = 'Presencial'`. `PedidoController::crearVentaPresencial()` lo devuelve en la respuesta para mostrarlo en el recibo. |
| VT6 | **Descuento por venta presencial** — campo `descuento_manual DECIMAL(5,2)` en `pedido` que el empleado puede aplicar al momento de la venta (con límite del 20% para empleados, sin límite para admins). |

---

## 18. Admin — Categorías y Proveedores

`frontend/src/pages/admin/AdminCategorias.jsx` · `frontend/src/pages/admin/AdminProveedores.jsx`

### Visual

| # | Mejora |
|---|--------|
| CP1 | **Color por categoría** — agregar campo `color HEX(7)` a la tabla `categoria`. En `AdminCategorias`, un `<input type="color">` para asignar el color. Ese color reemplaza los hardcodeados en `Tienda.jsx` (punto T5). |
| CP2 | **Icono por categoría** — campo `icono VARCHAR(50)` con el nombre de un ícono de Font Awesome o un emoji. Se muestra en la tienda y en el sidebar de categorías. |
| CP3 | **Proveedor con productos asociados** — en `AdminProveedores`, al expandir un proveedor, listar los productos que tiene asociados con su stock actual, sin ir al módulo de inventario. |
| CP4 | **Validación de nombre único** — en `AdminCategorias`, antes de crear o editar, verificar que no existe otra categoría con el mismo nombre (comparación case-insensitive en frontend). |

### Backend

| # | Mejora |
|---|--------|
| CP5 | **Columnas `color` e `icono` en `categoria`** — agregar vía `ensureColumns()` o migración manual. `GET /categorias` las devuelve; `POST /categorias` y `PUT /categorias/{id}` las aceptan. |
| CP6 | **Validación de unicidad en backend** — `CategoriaController::crear()` y `actualizar()` verifican nombre único antes de insertar (actualmente solo lo hace el frontend, si lo hace). |

---

## 19. Admin — Métodos de Pago

`frontend/src/pages/admin/AdminMetodosPago.jsx`

### Visual

| # | Mejora |
|---|--------|
| MT1 | **Preview del QR en tiempo real** — al subir un QR nuevo, mostrarlo inmediatamente en la tarjeta sin recargar la página. Usar `URL.createObjectURL(file)` para previsualizar antes de confirmar la subida. |
| MT2 | **Estado activo/inactivo visible** — el toggle activo/inactivo de cada método debe ser visualmente prominente: un switch estilo iOS (pill verde/gris) más grande que el checkbox actual, con etiqueta "Activo / Inactivo" al lado. |
| MT3 | **Sección de instrucciones de pago** — campo `instrucciones TEXT` por método que el admin puede editar y que aparece en PagoSimulado como guía para el cliente ("Abre Nequi → Transferir → Escanea el QR"). |

### Backend

| # | Mejora |
|---|--------|
| MT4 | **Campo `instrucciones`** — columna `instrucciones TEXT DEFAULT NULL` en `metodo_pago_config`. `MetodoPagoConfigController::actualizar()` la acepta y `GET /metodos-pago` la devuelve. `PagoSimulado.jsx` la consume para mostrar la guía contextual. |

---

## 20. Backend — API General

### Seguridad

| # | Mejora | Archivo |
|---|--------|---------|
| B1 | **Sanitización de inputs con `htmlspecialchars`** — varios campos de texto libre (notas, observaciones, nombres) se guardan sin sanitizar. Aplicar `htmlspecialchars(strip_tags(trim($valor)))` en todos los campos que no sean numéricos o emails. | Todos los Controllers |
| B2 | **Headers de seguridad HTTP** — agregar en `index.php`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. | `backend/public/index.php` |
| B3 | **Token JWT con `jti` (JWT ID)** — agregar un claim `jti` único al token para poder invalidar tokens individuales en logout sin depender de sesion_id. Registrar los `jti` inválidos en una tabla `token_blocklist`. | `config/JWT.php`, `AuthController.php` |

### Performance

| # | Mejora | Archivo |
|---|--------|---------|
| B4 | **Índices en tablas críticas** — verificar que existen índices en `pago(Cod_pedido)`, `detalle_pedido(Cod_Pedido)`, `usuario_pedido(Cod_pedido)`, `domicilio(Cod_Pedido)`. Sin ellos, los JOINs hacen full scan. | Base de datos |
| B5 | **Lazy loading de modelos** — `PagoModel::ensureColumns()` corre en cada instancia aunque las columnas ya existan. Agregar un flag estático `private static bool $columnsChecked = false` para ejecutarlo solo una vez por request. | `PagoModel.php` |

### Estructura

| # | Mejora | Archivo |
|---|--------|---------|
| B6 | **Clase base `BaseController`** — los métodos `$this->ok()`, `$this->error()`, `$this->body()` están duplicados en todos los controllers. Extraerlos a una clase `BaseController` que todos extienden. | Todos los Controllers |
| B7 | **Validador reutilizable** — crear `app/Helpers/Validador.php` con métodos estáticos: `requeridos($body, $campos)`, `email($valor)`, `rango($valor, $min, $max)`, `longitud($valor, $min, $max)`. Eliminar la duplicación de validación en cada controller. | Nueva clase |

---

## 21. Resumen de prioridades

### Alta — Impacto directo en funcionalidad o seguridad

| Clave | Descripción |
|-------|-------------|
| C5 | Validar stock al crear pedido (evita vender productos agotados) |
| C6 | Transacciones en creación de pedido (evita datos corruptos) |
| G7 | Paginación en listados (evita timeout con muchos registros) |
| G9 | Rate limiting en login (seguridad) |
| LR5 | Token de reset en body, no en URL (seguridad) |
| B1 | Sanitización de inputs (seguridad) |
| B2 | Headers de seguridad HTTP (seguridad) |
| B5 | Flag estático en `ensureColumns()` (performance en cada request) |
| T8 | Stock en listado de productos (evita que se compren artículos agotados) |

### Media — Mejoras de experiencia y profesionalismo

| Clave | Descripción |
|-------|-------------|
| G1 | Skeleton loaders uniformes |
| G2 | Toast/notificación unificado |
| G4 | Modal de confirmación para destructivos |
| MP2 | Detalle de ítems en "Mis pedidos" |
| MP5 | "Repetir pedido" |
| AD6 | Endpoint unificado de dashboard |
| AP5 | Filtros en `GET /pedidos` |
| PG2 | Verificación manual de pagos con UI |
| D1 | Timeline visual en seguimiento |
| D6 | Historial de cambios de estado |
| IN5 | Tabla de movimientos de inventario |
| PR5 | Subida real de imágenes de productos |
| B6 | `BaseController` (reduce código duplicado) |

### Baja — Pulido visual y features adicionales

| Clave | Descripción |
|-------|-------------|
| T4 | Favoritos en backend |
| T6 | Vista lista vs. cuadrícula en tienda |
| AP4 | Vista Kanban de pedidos |
| VT1 | Recibo imprimible en ventas presenciales |
| DM1 | Mapa de entregas con Leaflet |
| CP1 | Color e ícono por categoría |
| MT3 | Instrucciones de pago por método |
| RE1 | Exportación a Excel |
| L6 | Endpoint de configuración del negocio |

---

*Generado a partir del escaneo completo de `frontend/src/pages/`, `frontend/src/components/` y `backend/app/Controllers/` — Mercado Digital, junio 2026.*
