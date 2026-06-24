// frontend/src/services/api.js
// Permite usar la API desde otros dispositivos (ej: celular) sin quedar amarrado a "localhost".
// Puedes sobrescribirlo con VITE_API_BASE_URL en `.env` si lo necesitas.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}/mercado_digital/backend/public`;

if (import.meta.env.DEV) {
  // Ayuda a diagnosticar problemas de CORS/URL en desarrollo.
  // eslint-disable-next-line no-console
  console.info("[api] BASE_URL:", BASE_URL);
}

export function resolverImagen(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const limpia = String(url).replace(/^\/+/, "");
  return `${BASE_URL}/${limpia}`;
}

// ── Manejo centralizado de errores ─────────────────────────
// Toda petición fallida lanza un ApiError con status/code, en vez de un Error
// genérico. El GlobalErrorProvider (frontend/src/context/ErrorContext.jsx) se
// registra como handler y muestra la pantalla de error correspondiente para
// cualquier llamada que no se marque como { silent: true } (login, registro y
// flujos de credenciales mantienen su manejo inline de siempre).
export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    // Cuerpo crudo de la respuesta (si lo hubo): permite leer campos extra que
    // algunos endpoints agregan, p.ej. retry_after en el bloqueo de cuenta.
    this.data = data;
  }
}

let globalErrorHandler = null;
export function setGlobalErrorHandler(fn) {
  globalErrorHandler = fn;
}

function codigoDesdeStatus(status) {
  switch (status) {
    case 400: return "BAD_REQUEST";
    case 401: return "UNAUTHORIZED";
    case 403: return "FORBIDDEN";
    case 404: return "NOT_FOUND";
    default: return "SERVER_ERROR";
  }
}

// Errores de infraestructura (servidor caído, BD caída, sin red, servicio externo
// caído) siempre deben tomar toda la pantalla, incluso en llamadas marcadas como
// "silent" (login/registro/etc): "silent" solo protege el manejo inline de errores
// de validación (400/401/403), no oculta una caída real del sistema.
const CODIGOS_CRITICOS = new Set(["SERVER_ERROR", "DB_CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "NETWORK_ERROR"]);

function reportarYLanzar(err, silent, retry) {
  const debeReportar = (!silent || CODIGOS_CRITICOS.has(err.code)) && globalErrorHandler;
  if (debeReportar) {
    globalErrorHandler({ tipo: err.code, detalle: err.message, retry });
  }
  throw err;
}

async function request(ruta, opciones = {}) {
  const { silent = false, ...fetchOpciones } = opciones;
  const token = sessionStorage.getItem("md_token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOpciones.headers,
    },
    ...fetchOpciones,
  };

  const url = `${BASE_URL}/${ruta}`;
  const reintentar = () => request(ruta, opciones);
  let res;
  try {
    res = await fetch(url, config);
  } catch (e) {
    // Esto pasa típicamente por: API apagada, URL mal, CORS bloqueado, mixed content, o sin red.
    const detalle = e instanceof Error ? e.message : String(e);
    const sinRed = typeof navigator !== "undefined" && navigator.onLine === false;
    return reportarYLanzar(
      new ApiError(`No se pudo conectar con la API (${detalle}). URL: ${url}`, {
        code: sinRed ? "NETWORK_ERROR" : "DB_CONNECTION_ERROR",
      }),
      silent,
      reintentar
    );
  }
  const raw = await res.text();

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  const textoLimpio = (raw || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Si la API invalida el token (expirado o sesión cerrada), limpiamos la sesión local.
  // La pantalla de error 401 (global o de los guards de ruta) ofrece el botón "Iniciar sesión".
  if (!res.ok && res.status === 401) {
    const msg = (data?.message || data?.mensaje || textoLimpio || "").toLowerCase();
    const debeCerrarSesion =
      msg.includes("sesion cerrada") ||
      msg.includes("sesion expirada") ||
      msg.includes("token inv") ||
      msg.includes("token requerido");

    if (debeCerrarSesion) {
      sessionStorage.removeItem("md_token");
      sessionStorage.removeItem("md_usuario");
    }
  }

  if (!res.ok) {
    const base = data?.message || data?.mensaje || "";
    const detalle = data?.detail ? ` ${data.detail}` : "";
    const mensaje = (base + detalle).trim() || textoLimpio.slice(0, 220) || "Error en la solicitud.";
    const code = data?.code || codigoDesdeStatus(res.status);
    return reportarYLanzar(new ApiError(mensaje, { status: res.status, code, data }), silent, reintentar);
  }

  if (!data) {
    return reportarYLanzar(
      new ApiError(textoLimpio || "La API no devolvio JSON valido.", { status: res.status, code: "SERVER_ERROR" }),
      silent,
      reintentar
    );
  }

  return data;
}

const get  = (ruta, extra = {})       => request(ruta, { method: "GET", ...extra });
const post = (ruta, body, extra = {}) => request(ruta, { method: "POST",   body: JSON.stringify(body), ...extra });
const put  = (ruta, body, extra = {}) => request(ruta, { method: "PUT",    body: JSON.stringify(body), ...extra });
const del  = (ruta, extra = {})       => request(ruta, { method: "DELETE", ...extra });

// ── Auth ──────────────────────────────────────────────────
// silent: true → estas llamadas mantienen su manejo de error inline (formularios
// de Login/Registro/Perfil) en vez de disparar la pantalla de error global.
export const authService = {
  login:    (correo, contrasena) => post("auth/login",    { correo, contrasena }, { silent: true }),
  registro: (datos)              => post("auth/registro", datos, { silent: true }),
  cambiarPassword: (datos)       => post("auth/cambiar-password", datos, { silent: true }),
  resetRequest: (correo)         => post("auth/reset-request", { correo }, { silent: true }),
  resetConfirm: (token, nueva_contrasena) => post("auth/reset-confirm", { token, nueva_contrasena }, { silent: true }),
  me:       ()                   => get("auth/me", { silent: true }),
  actualizarPerfil: (datos)      => put("auth/perfil", datos, { silent: true }),
  logout:   ()                   => post("auth/logout", {}, { silent: true }),
};

// ── Productos ─────────────────────────────────────────────
export const productoService = {
  listar: (filtros = {}, extra = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append("categoria", filtros.categoria);
    if (filtros.buscar)    params.append("buscar",    filtros.buscar);
    const qs = params.toString();
    return get(`productos${qs ? "?" + qs : ""}`, extra);
  },
  obtener:     (id)        => get(`productos/${id}`),
  crear:       (datos)     => post("productos", datos),
  actualizar:  (id, datos) => put(`productos/${id}`, datos),
  eliminar:    (id)        => del(`productos/${id}`),
  masVendidos: ()          => get("productos/mas-vendidos"),
};

// ── Categorías ────────────────────────────────────────────
export const categoriaService = {
  listar:    (extra = {}) => get("categorias", extra),
  crear:     (datos)     => post("categorias", datos),
  actualizar:(id, datos) => put(`categorias/${id}`, datos),
  eliminar:  (id)        => del(`categorias/${id}`),
};

export const proveedorService = {
  listar:    (extra = {})      => get("proveedores", extra),
  obtener:   (id, extra = {})  => get(`proveedores/${id}`, extra),
  crear:     (datos)     => post("proveedores", datos),
  actualizar:(id, datos) => put(`proveedores/${id}`, datos),
  eliminar:  (id)        => del(`proveedores/${id}`),
};

// ── Carrito ───────────────────────────────────────────────
export const carritoService = {
  obtener: ()      => get("carrito"),
  agregar: (datos) => post("carrito/agregar", datos),
  quitar:  (id)    => del(`carrito/item/${id}`),
  vaciar:  ()      => del("carrito/vaciar"),
};

// ── Pedidos ───────────────────────────────────────────────
export const pedidoService = {
  mis_pedidos:  ()              => get("pedidos/mis-pedidos"),
  obtener:      (id, extra = {})  => get(`pedidos/${id}`, extra),
  crear:        (datos)         => post("pedidos", datos),
  todos:        (extra = {})    => get("pedidos", extra),
  cambiarEstado:(id, estado)    => put(`pedidos/${id}/estado`, { estado }),
  actualizarEntrega:(id, tipo_entrega) => put(`pedidos/${id}/entrega`, { tipo_entrega }),
  notificarDomicilio:(id)       => post(`pedidos/${id}/notificar-domicilio`, {}),
};

export const ventaService = {
  crearPresencial: (datos) => post("ventas/presencial", datos),
};

function queryReportes(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.periodo) params.append("periodo", filtros.periodo);
  if (filtros.desde) params.append("desde", filtros.desde);
  if (filtros.hasta) params.append("hasta", filtros.hasta);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ── Reportes ──────────────────────────────────────────────
export const reporteService = {
  registros:            (f = {}) => get(`reportes${queryReportes(f)}`),
  ventas:              (f = {}, extra = {}) => get(`reportes/ventas${queryReportes(f)}`, extra),
  productosMasVendidos:(f = {}) => get(`reportes/productos-mas-vendidos${queryReportes(f)}`),
  pedidosPorEstado:    (f = {}) => get(`reportes/pedidos-estado${queryReportes(f)}`),
  ingresos:            (p, f = {}) => get(`reportes/ingresos${queryReportes({ ...f, periodo: p })}`),
};

// ── Inventario ────────────────────────────────────────────
export const inventarioService = {
  listar:    (extra = {})     => get("inventario", extra),
  actualizar:(id, datos)      => put(`inventario/${id}`, datos),
  alertas:   (umbral = 10)    => get(`inventario/alertas?umbral=${umbral}`),
};

// ── Ofertas ─────────────────────────────────────────────────────
export const ofertaService = {
  listar:     ()          => get("ofertas"),
  listarTodas:(extra = {})=> get("ofertas/todas", extra),
  crear:      (datos)     => post("ofertas", datos),
  actualizar: (id, datos) => put(`ofertas/${id}`, datos),
  eliminar:   (id)        => del(`ofertas/${id}`),
  uploadBanner: (formData) => uploadFile("ofertas/upload-banner", formData),
};

export const usuarioService = {
  listar:     (extra = {}) => get("usuarios", extra),
  stats:      ()          => get("usuarios/stats"),
  roles:      ()          => get("usuarios/roles"),
  crear:      (datos)     => post("usuarios", datos),
  actualizar: (doc, datos)=> put(`usuarios/${doc}`, datos),
  cambiarRol: (doc, rolId)=> put(`usuarios/${doc}/rol`, { rol_id: rolId }),
  cambiarEstado: (doc, estado)=> put(`usuarios/${doc}/estado`, { estado }),
  eliminar:   (doc)       => del(`usuarios/${doc}`),
};

// ── Domicilio ─────────────────────────────────────────────
export const domicilioService = {
  crear:           (datos)          => post("domicilio/crear", datos),
  misEnvios:       ()               => get("domicilio/usuario"),
  detalle:         (pedido)         => get(`domicilio/detalle?pedido=${pedido}`),
  cancelar:        (pedido)         => post("domicilio/cancelar", { pedido }),
  seguimiento:     (pedido)         => get(`domicilio/seguimiento?pedido=${pedido}`),
  todos:           (extra = {})     => get("domicilio/todos", extra),
  actualizarEstado:(id, estado, extra = {}) => put(`domicilio/${id}/estado`, { estado, ...extra }),
};

// ── Helper para subir archivos (multipart/form-data) ──────
export async function uploadFile(ruta, formData, { silent = false } = {}) {
  const token = sessionStorage.getItem("md_token");
  const url   = `${BASE_URL}/${ruta}`;
  const reintentar = () => uploadFile(ruta, formData, { silent });
  let res;
  try {
    res = await fetch(url, {
      method:  "POST",
      // NO ponemos Content-Type: el navegador lo establece con el boundary correcto
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    formData,
    });
  } catch (e) {
    const sinRed = typeof navigator !== "undefined" && navigator.onLine === false;
    return reportarYLanzar(
      new ApiError(`No se pudo conectar con la API (${e instanceof Error ? e.message : String(e)}). URL: ${url}`, {
        code: sinRed ? "NETWORK_ERROR" : "DB_CONNECTION_ERROR",
      }),
      silent,
      reintentar
    );
  }
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  const textoLimpio = (raw || "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!res.ok) {
    const base = data?.message || data?.mensaje || "";
    const det  = data?.detail ? ` ${data.detail}` : "";
    const mensaje = (base + det).trim() || textoLimpio.slice(0, 220) || "Error al subir archivo.";
    const code = data?.code || codigoDesdeStatus(res.status);
    return reportarYLanzar(new ApiError(mensaje, { status: res.status, code, data }), silent, reintentar);
  }
  return data;
}

// ── Pago ──────────────────────────────────────────────────
export const pagoService = {
  obtener:          (pedidoId)              => get(`pago/${pedidoId}`),
  todos:            (extra = {})            => get("pago", extra),
  crearPreferencia: (pedidoId, frontendUrl) => post(`pago/${pedidoId}/preferencia`, { frontend_url: frontendUrl }),
  verificarMP:      (pedidoId, paymentId, extra = {}) => get(`pago/${pedidoId}/verificar-mp${paymentId ? `?payment_id=${paymentId}` : ""}`, extra),
  simular:          (pedidoId, metodo, datos) => post(`pago/${pedidoId}/simulado`, { metodo, datos }),
  subirComprobante: (pedidoId, formData)    => uploadFile(`pago/${pedidoId}/comprobante`, formData),
  verificar:        (pagoId, estado, notas = "") => put(`pago/${pagoId}/verificar`, { estado, notas }),
};

export const metodoPagoConfigService = {
  listar: () => get("metodos-pago"),
  obtener: (metodo) => get(`metodos-pago/${metodo}`),
  actualizar: (id, datos) => put(`metodos-pago/${id}`, datos),
  uploadQR: (id, formData) => uploadFile(`metodos-pago/${id}/upload-qr`, formData),
};
