// frontend/src/services/api.js
// Permite usar la API desde otros dispositivos (ej: celular) sin quedar amarrado a "localhost".
// Puedes sobrescribirlo con VITE_API_BASE_URL en `.env` si lo necesitas.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}/mercado_digital/backend/public`;

if (import.meta.env.DEV) {
  // Ayuda a diagnosticar problemas de CORS/URL en desarrollo.
  console.info("[api] BASE_URL:", BASE_URL);
}

export function resolverImagen(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const limpia = String(url).replace(/^\/+/, "");
  return `${BASE_URL}/${limpia}`;
}

async function request(ruta, opciones = {}) {
  const token = localStorage.getItem("md_token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
    ...opciones,
  };

  const url = `${BASE_URL}/${ruta}`;
  let res;
  try {
    res = await fetch(url, config);
  } catch (e) {
    // Esto pasa típicamente por: API apagada, URL mal, CORS bloqueado, o mixed content (https->http).
    const detalle = e instanceof Error ? e.message : String(e);
    throw new Error(`No se pudo conectar con la API (${detalle}). URL: ${url}`);
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

  // Si la API invalida el token (expirado o sesion cerrada), limpiamos la sesion local y forzamos login.
  if (!res.ok && res.status === 401) {
    const msg = (data?.message || data?.mensaje || textoLimpio || "").toLowerCase();
    const debeCerrarSesion =
      msg.includes("sesion cerrada") ||
      msg.includes("sesion expirada") ||
      msg.includes("token inv") ||
      msg.includes("token requerido");

    if (debeCerrarSesion) {
      localStorage.removeItem("md_token");
      localStorage.removeItem("md_usuario");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=session");
      }
    }
  }

  if (!res.ok) {
    const base = data?.message || data?.mensaje || "";
    const detalle = data?.detail ? ` ${data.detail}` : "";
    const mensaje = (base + detalle).trim() || textoLimpio.slice(0, 220);
    throw new Error(mensaje || "Error en la solicitud.");
  }

  if (!data) {
    throw new Error(textoLimpio || "La API no devolvio JSON valido.");
  }

  return data;
}

const get  = (ruta)       => request(ruta, { method: "GET" });
const post = (ruta, body) => request(ruta, { method: "POST",   body: JSON.stringify(body) });
const put  = (ruta, body) => request(ruta, { method: "PUT",    body: JSON.stringify(body) });
const del  = (ruta)       => request(ruta, { method: "DELETE" });

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login:    (correo, contrasena) => post("auth/login",    { correo, contrasena }),
  registro: (datos)              => post("auth/registro", datos),
  cambiarPassword: (datos)       => post("auth/cambiar-password", datos),
  resetRequest: (correo)         => post("auth/reset-request", { correo }),
  resetConfirm: (token, nueva_contrasena) => post("auth/reset-confirm", { token, nueva_contrasena }),
  me:       ()                   => get("auth/me"),
  actualizarPerfil: (datos)      => put("auth/perfil", datos),
};

// ── Productos ─────────────────────────────────────────────
export const productoService = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append("categoria", filtros.categoria);
    if (filtros.buscar)    params.append("buscar",    filtros.buscar);
    const qs = params.toString();
    return get(`productos${qs ? "?" + qs : ""}`);
  },
  obtener:     (id)        => get(`productos/${id}`),
  crear:       (datos)     => post("productos", datos),
  actualizar:  (id, datos) => put(`productos/${id}`, datos),
  eliminar:    (id)        => del(`productos/${id}`),
  masVendidos: ()          => get("productos/mas-vendidos"),
};

// ── Categorías ────────────────────────────────────────────
export const categoriaService = {
  listar:    ()          => get("categorias"),
  crear:     (datos)     => post("categorias", datos),
  actualizar:(id, datos) => put(`categorias/${id}`, datos),
  eliminar:  (id)        => del(`categorias/${id}`),
};

export const proveedorService = {
  listar:    ()          => get("proveedores"),
  obtener:   (id)        => get(`proveedores/${id}`),
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
  obtener:      (id)            => get(`pedidos/${id}`),
  crear:        (datos)         => post("pedidos", datos),
  todos:        ()              => get("pedidos"),
  cambiarEstado:(id, estado)    => put(`pedidos/${id}/estado`, { estado }),
};

// ── Reportes ──────────────────────────────────────────────
export const reporteService = {
  registros:            ()       => get("reportes"),
  ventas:              ()       => get("reportes/ventas"),
  productosMasVendidos:()       => get("reportes/productos-mas-vendidos"),
  pedidosPorEstado:    ()       => get("reportes/pedidos-estado"),
  ingresos:            (p)      => get(`reportes/ingresos?periodo=${p}`),
};

// ── Inventario ────────────────────────────────────────────
export const inventarioService = {
  listar:    ()               => get("inventario"),
  actualizar:(id, datos)      => put(`inventario/${id}`, datos),
  alertas:   (umbral = 10)    => get(`inventario/alertas?umbral=${umbral}`),
};

// ── Ofertas ─────────────────────────────────────────────────────
export const ofertaService = {
  listar:     ()          => get("ofertas"),
  listarTodas:()          => get("ofertas/todas"),
  crear:      (datos)     => post("ofertas", datos),
  actualizar: (id, datos) => put(`ofertas/${id}`, datos),
  eliminar:   (id)        => del(`ofertas/${id}`),
};

export const usuarioService = {
  listar:     ()          => get("usuarios"),
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
  cancelar:        (pedido)         => get(`domicilio/cancelar?pedido=${pedido}`),
  seguimiento:     (pedido)         => get(`domicilio/seguimiento?pedido=${pedido}`),
  todos:           ()               => get("domicilio/todos"),
  actualizarEstado:(id, estado)     => put(`domicilio/${id}/estado`, { estado }),
};

// ── Helper para subir archivos (multipart/form-data) ──────
async function uploadFile(ruta, formData) {
  const token = localStorage.getItem("md_token");
  const url   = `${BASE_URL}/${ruta}`;
  let res;
  try {
    res = await fetch(url, {
      method:  "POST",
      // NO ponemos Content-Type: el navegador lo establece con el boundary correcto
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    formData,
    });
  } catch (e) {
    throw new Error(`No se pudo conectar con la API (${e instanceof Error ? e.message : String(e)}). URL: ${url}`);
  }
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  const textoLimpio = (raw || "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!res.ok) {
    const base = data?.message || data?.mensaje || "";
    const det  = data?.detail ? ` ${data.detail}` : "";
    throw new Error((base + det).trim() || textoLimpio.slice(0, 220) || "Error al subir archivo.");
  }
  return data;
}

// ── Pago ──────────────────────────────────────────────────
export const pagoService = {
  obtener:          (pedidoId)                  => get(`pago/${pedidoId}`),
  todos:            ()                           => get("pago"),
  subirComprobante: (pedidoId, formData)         => uploadFile(`pago/${pedidoId}/comprobante`, formData),
  verificar:        (pagoId, estado, notas = "") => put(`pago/${pagoId}/verificar`, { estado, notas }),
};

// ── Configuración de métodos de pago (QR + número) ────────
export const metodoPagoConfigService = {
  listar:    ()             => get("metodos-pago"),
  obtener:   (metodo)       => get(`metodos-pago/${metodo}`),
  actualizar:(id, datos)    => put(`metodos-pago/${id}`, datos),
  uploadQR:  (id, formData) => uploadFile(`metodos-pago/${id}/upload-qr`, formData),
};
