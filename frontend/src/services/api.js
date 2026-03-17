// frontend/src/services/api.js
// Permite usar la API desde otros dispositivos (ej: celular) sin quedar amarrado a "localhost".
// Puedes sobrescribirlo con VITE_API_BASE_URL en `.env` si lo necesitas.
// Nota: VITE_API_BASE_URL debe vivir en .env.local (no versionado) para no romper
// los entornos de otros compañeros. Si no existe, usamos la ruta por defecto.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}/crud/Mercado_Digital/backend/public`;

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
  const res = await fetch(`${BASE_URL}/${ruta}`, config);
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
  listar: () => get("categorias"),
};

export const proveedorService = {
  listar: () => get("proveedores"),
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

// ── Pagos ───────────────────────────────────────────────────────────
export const pagoService = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.desde) params.append("desde", filtros.desde);
    if (filtros.hasta) params.append("hasta", filtros.hasta);
    const qs = params.toString();
    return get(`pagos${qs ? "?" + qs : ""}`);
  },
  cambiarEstado: (id, estado) => put(`pagos/${id}/estado`, { estado }),
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
  listar:    ()          => get("inventario"),
  actualizar:(id, datos) => put(`inventario/${id}`, datos),
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
