# Mejoras visuales — Pasarela de Pagos (Simulador)

Revisión de `frontend/src/pages/PagoSimulado.jsx` y `frontend/src/pages/Carrito.jsx` (modal de checkout), con propuestas para que el simulador se vea más profesional y "real" sin salir de la paleta de colores actual del proyecto:

```
--md-bg:        #D5DDDF
--md-surface:   #FFFFFF
--md-border:    #B2C5B2
--md-text:      #1B2727
--md-text-soft: #3C5148
--md-aqua:      #6B8E4E
--md-accent:    linear-gradient(135deg, #6B8E4E, #3C5148)
```

---

## 1. Indicador de pasos (stepper) en el checkout

Actualmente el modal del carrito tiene "Paso 1: tipo de entrega" y "Paso 2: confirmar pago", pero el usuario no ve en qué paso está ni cuántos quedan.

**Propuesta:** agregar un stepper simple arriba del modal:

```
①──── Entrega        ②──── Pago
```

- Círculo activo con `background: var(--md-accent)`, texto blanco.
- Círculo inactivo/completado con `border: 1px solid var(--md-border)`, fondo `var(--md-surface)`.
- Línea conectora en `#B2C5B2`.

Esto da sensación de "flujo de pago real" (tipo Mercado Pago / Stripe Checkout) sin agregar dependencias.

---

## 2. Tarjeta de crédito visual (preview en vivo)

Hoy el formulario de Tarjeta es solo inputs planos. Una pasarela "auténtica" muestra una vista previa de la tarjeta mientras el usuario escribe.

**Propuesta:** sobre el formulario de Tarjeta, agregar una tarjeta visual:

```jsx
<div
  className="rounded-2xl p-5 mb-4 text-white relative overflow-hidden"
  style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
>
  <div className="flex justify-between items-start mb-8">
    <span className="text-xs uppercase tracking-widest text-white/70">Mercado Digital</span>
    <span className="text-2xl">💳</span>
  </div>
  <p className="text-lg tracking-[0.2em] font-mono mb-4">
    {form.numero_tarjeta || "•••• •••• •••• ••••"}
  </p>
  <div className="flex justify-between text-xs text-white/80">
    <span className="uppercase">{form.nombre_tarjeta || "NOMBRE DEL TITULAR"}</span>
    <span>{form.expiracion || "MM/AA"}</span>
  </div>
</div>
```

- Reutiliza el mismo gradiente del encabezado (`#3C5148 → #6B8E4E`), por lo que mantiene identidad visual.
- Se actualiza en vivo con `form.numero_tarjeta`, `form.nombre_tarjeta`, `form.expiracion` (ya formateados por `formatCard`/`formatExpiry`).
- Opcional: detectar marca de tarjeta (Visa/Mastercard) por el primer dígito y mostrar el ícono correspondiente en la esquina (Visa = 4, Mastercard = 5).

---

## 3. Logos/íconos de método de pago más reales

Los botones de método (`💳 Tarjeta`, `📱 Nequi`, `📲 Daviplata`) usan emojis genéricos. Para un look más "fintech":

- **Nequi**: usar el color de marca `#DA1E64` solo como acento del ícono (no del botón general, para no romper la paleta), o un ícono tipo billetera.
- **Daviplata**: acento `#E4022D` similar.
- Mantener el botón seleccionado con `linear-gradient(135deg,#3C5148,#6B8E4E)` como ya está (eso da consistencia), pero agregar un pequeño "badge" de color de marca dentro del ícono circular:

```jsx
<div
  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
  style={{ backgroundColor: metodo === m.id ? "rgba(255,255,255,0.2)" : "#f3f4f6" }}
>
  {m.icon}
</div>
```

Esto separa visualmente el ícono del texto del botón y da más jerarquía.

---

## 4. Resumen del pedido visible durante el pago

Actualmente, en `PagoSimulado.jsx` solo se ve el número de pedido y el tipo de entrega en el encabezado, pero no el **monto a pagar**. Un usuario real necesita ver cuánto está pagando antes de confirmar.

**Propuesta:** agregar una tarjeta de resumen entre el encabezado y el formulario:

```jsx
<div
  className="rounded-2xl p-4 mb-5 flex items-center justify-between"
  style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}
>
  <div>
    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total a pagar</p>
    <p className="text-2xl font-black" style={{ color: "#1B2727" }}>
      ${Number(total).toLocaleString("es-CO")}
    </p>
  </div>
  <span className="text-3xl">🧾</span>
</div>
```

Esto requiere pasar el `total` (o consultarlo vía `pedidoService.obtener(pedidoId)`) a `PagoSimulado`, ya sea por query param o por una llamada al backend.

---

## 5. Feedback de "transacción en curso" más realista

El overlay de "Procesando pago..." ya existe y es bueno. Para sumar autenticidad:

- Mostrar pasos secuenciales durante los 2 segundos de espera simulada, por ejemplo:
  1. "Verificando datos…" (0–0.7s)
  2. "Conectando con el banco…" (0.7–1.4s)
  3. "Confirmando transacción…" (1.4–2s)

```jsx
const [pasoProceso, setPasoProceso] = useState(0);
const PASOS_PROCESO = [
  "Verificando datos…",
  "Conectando con el banco…",
  "Confirmando transacción…",
];
// dentro del setTimeout: ir incrementando pasoProceso cada ~666ms
```

Mostrar el texto debajo del spinner actual. Mantiene los mismos estilos (`text-slate-500`, spinner `#6B8E4E`).

---

## 6. Resultado: comprobante con número de transacción

En la pantalla de resultado (aprobado/rechazado) se podría añadir un "número de referencia" simulado para que se vea como un comprobante real:

```jsx
<div
  className="mt-4 px-4 py-2 rounded-xl text-xs font-mono"
  style={{ backgroundColor: "rgba(107,142,78,0.07)", border: "1px solid #B2C5B2", color: "#3C5148" }}
>
  Ref: MD-{pedidoId}-{Date.now().toString().slice(-6)}
</div>
```

Solo visual (no se persiste), pero refuerza la sensación de "transacción procesada por un sistema real".

---

## 7. Microanimaciones sutiles

- Botón "Pagar con {metodo}": agregar `active:scale-[0.98]` para feedback táctil.
- Pantalla de resultado: agregar `animate-[fadeIn_0.3s_ease-out]` (ya existe `animate-pulse`/`animate-bounce` en otros componentes del proyecto, así que es consistente usar utilidades de Tailwind existentes).
- Selector de método de pago: transición de color ya existe (`transition`), se puede añadir `hover:scale-[1.02]` cuando no está seleccionado.

---

## 8. Validación en tiempo real (en vez de solo al enviar)

Actualmente `validar()` solo corre en `handleSubmit`. Para sensación de pasarela "seria":

- Mostrar un check verde (✓) junto al campo cuando es válido, igual al patrón ya usado en `Registro.jsx` para la confirmación de contraseña (`coinciden === true` → ✓ verde).
- Por ejemplo, en "Número de tarjeta", mostrar ✓ cuando tiene 16 dígitos; en "Clave Dinámica", ✓ cuando tiene al menos 4 caracteres.

Esto reutiliza un patrón visual que ya existe en el proyecto (`Registro.jsx`), por lo que no introduce un nuevo lenguaje visual.

---

## 9. Pie de "seguridad" (trust badges)

Agregar una franja pequeña debajo del formulario, con candado y texto, usando los mismos tonos:

```jsx
<p className="text-center text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
  🔒 Pago simulado — entorno de pruebas de Mercado Digital
</p>
```

Comunica claramente que es un entorno simulado (transparencia) sin perder la estética de "pasarela seria".

---

## Resumen de prioridad sugerida

| # | Mejora | Esfuerzo | Impacto visual |
|---|--------|----------|-----------------|
| 2 | Tarjeta visual en vivo | Medio | Alto |
| 4 | Resumen de monto a pagar | Bajo | Alto |
| 1 | Stepper de pasos | Bajo | Medio |
| 6 | Número de referencia | Bajo | Medio |
| 8 | Validación en tiempo real | Medio | Medio |
| 5 | Pasos del "procesando" | Bajo | Medio |
| 3 | Íconos de marca | Bajo | Bajo-Medio |
| 7 | Microanimaciones | Bajo | Bajo |
| 9 | Trust badge | Muy bajo | Bajo |

Todas las propuestas usan únicamente los colores y gradientes ya definidos en `index.css` y los patrones de componentes existentes (tarjetas con `var(--md-surface)` / `var(--md-border)`, gradiente `#3C5148 → #6B8E4E`, badges `rgba(107,142,78,0.0x)`), por lo que no rompen la identidad visual del proyecto.
