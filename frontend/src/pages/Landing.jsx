import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";
import { productoService, ofertaService, categoriaService } from "../services/api";
import { useTheme } from "../context/ThemeContext";

function formatMoney(v) {
  return `$${Number(v || 0).toLocaleString("es-CO")}`;
}

function NequiBadge() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/18 flex items-center justify-center flex-shrink-0 shadow-inner">
      <img
        src="https://yt3.googleusercontent.com/tBl_djxQMQ-IAxboBoNRIeKJ9hDXG8fC-M2ZEWHWCykr-P0umEveM3dbGi4Di04EHFRn7aB7=s900-c-k-c0x00ffffff-no-rj"
        alt="Logo Nequi"
        className="w-12 h-12 object-contain rounded-xl"
      />
    </div>
  );
}

function DaviplataBadge() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/18 flex items-center justify-center flex-shrink-0 shadow-inner">
      <img
        src="https://play-lh.googleusercontent.com/bNPDiFqg28L6ckatfuP-WgrxDRDk0JEOkC6nUIQp7Q61RW78i1bw-ffMmEjyxl-qP6dv3ANDOQqmIbBtgJI3EA"
        alt="Logo Daviplata"
        className="w-12 h-12 object-contain rounded-xl"
      />
    </div>
  );
}

function ProductoCard({ producto }) {
  const { esOscuro } = useTheme();
  const tieneOferta = Number(producto.Porcentaje_Descuento || 0) > 0;
  const precio = tieneOferta ? producto.precio_oferta : producto.Precio;

  return (
    <div
      className="rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
      style={{
        backgroundColor: esOscuro ? "#111827" : "#ffffff",
        borderColor: esOscuro ? "rgba(148,163,184,0.16)" : "#f3f4f6",
      }}
    >
      <div className="relative">
        {producto.Imagen_url || producto.imagen_url ? (
          <img
            src={producto.Imagen_url || producto.imagen_url}
            alt={producto.Nombre}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-5xl"
            style={{ backgroundColor: "rgba(178,197,178,0.15)" }}>
            🛒
          </div>
        )}
        {tieneOferta && (
          <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: "#6B8E4E" }}>
            -{producto.Porcentaje_Descuento}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs mb-0.5" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>{producto.categoria || ""}</p>
        <p className="font-semibold text-sm leading-tight line-clamp-2 flex-1" style={{ color: esOscuro ? "#e5e7eb" : "#1f2937" }}>{producto.Nombre}</p>
        <div className="mt-2 mb-3 flex items-baseline gap-2">
          <span className="font-black text-base" style={{ color: esOscuro ? "#f8fafc" : "#1B2727" }}>{formatMoney(precio)}</span>
          {tieneOferta && (
            <span className="text-xs line-through" style={{ color: esOscuro ? "#64748b" : "#9ca3af" }}>{formatMoney(producto.Precio)}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#6B8E4E" }}>
            Añadir
          </Link>
          <Link to="/login" className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#3C5148" }}>
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
}

function normalizarCategoria(nombre = "") {
  return nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function obtenerVisualCategoria(nombre, index) {
  const clave = normalizarCategoria(nombre);
  const paletas = [
    { icono: "\uD83E\uDDF4", top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83E\uDDFC", top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" },
    { icono: "\uD83E\uDD64", top: "#fdf0e4", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83E\uDD63", top: "#dff4fb", accent: "#06b6d4", accentDark: "#0891b2" },
    { icono: "\uD83C\uDF6C", top: "#fbe7f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83C\uDF3D", top: "#fdf2dc", accent: "#f59e0b", accentDark: "#d97706" },
    { icono: "\uD83E\uDD5B", top: "#eaedff", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83C\uDF5E", top: "#e3f5f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83E\uDDFD", top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "\uD83C\uDF6B", top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" }
  ];
  const fallback = paletas[index % paletas.length];

  if (clave.includes("aceite")) return paletas[0];
  if (clave.includes("aseo")) return paletas[1];
  if (clave.includes("bebida")) return paletas[2];
  if (clave.includes("cereal")) return paletas[3];
  if (clave.includes("dulce")) return paletas[4];
  if (clave.includes("grano")) return paletas[5];
  if (clave.includes("lacteo") || clave.includes("lacteos")) return paletas[6];
  if (clave.includes("pan")) return paletas[7];
  if (clave.includes("hogar")) return paletas[8];
  if (clave.includes("snack")) return paletas[9];

  return fallback;
}

function CategoriaCard({ cat, index }) {
  const { esOscuro } = useTheme();
  const visual = obtenerVisualCategoria(cat.Nombre, index);
  const totalProductos = Number(cat.total_productos || 0);
  const resumen = totalProductos > 0
    ? `+${totalProductos} ${totalProductos === 1 ? "producto" : "productos"}`
    : "+varios productos";

  return (
    <Link to="/login"
      className="group rounded-[28px] overflow-hidden flex flex-col transition duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: esOscuro ? "#111827" : "#ffffff",
        border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.9)"}`,
        boxShadow: esOscuro ? "0 16px 30px rgba(2,6,23,0.26)" : "0 14px 30px rgba(15,23,42,0.08)",
      }}>
      <div className="h-28 flex items-center justify-center text-4xl" style={{ backgroundColor: esOscuro ? "rgba(255,255,255,0.06)" : visual.top }}>
        {visual.icono}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-black text-[1.05rem] leading-tight" style={{ color: esOscuro ? "#f8fafc" : "#0f172a" }}>{cat.Nombre}</p>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{resumen}</p>
        <span
          className="mt-4 block text-center py-2.5 rounded-2xl text-sm font-bold text-white transition group-hover:brightness-105"
          style={{ background: `linear-gradient(135deg, ${visual.accent}, ${visual.accentDark})` }}>
          Ver categoria
        </span>
      </div>
    </Link>
  );
}

export default function Landing() {
  const { esOscuro } = useTheme();
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [menuMovil, setMenuMovil] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      productoService.listar(),
      ofertaService.listar(),
      categoriaService.listar(),
    ]).then(([prodsRes, ofrsRes, catsRes]) => {
      const prods = prodsRes.status === "fulfilled" ? (prodsRes.value.productos || []) : [];
      const ofrs  = ofrsRes.status  === "fulfilled" ? (ofrsRes.value.ofertas   || []) : [];
      const cats  = catsRes.status  === "fulfilled" ? (catsRes.value.categorias || []) : [];

      const ofertasPorProducto = new Map(
        ofrs.filter((o) => o.Cod_Producto).map((o) => [Number(o.Cod_Producto), o])
      );
      const prodsConOferta = prods.map((p) => {
        const o = ofertasPorProducto.get(Number(p.Cod_Producto));
        if (!o) return p;
        return {
          ...p,
          Porcentaje_Descuento: Number(o.Porcentaje_Descuento || 0),
          precio_oferta: Number(o.precio_oferta || p.Precio),
        };
      });

      setProductos(prodsConOferta);
      setOfertas(ofrs);
      setCategorias(cats);
    });
  }, []);

  const productosDestacados = productos.slice(0, 4);
  const productosEnOferta   = productos.filter((p) => Number(p.Porcentaje_Descuento || 0) > 0).slice(0, 4);
  const maxDescuento        = ofertas.length ? Math.max(...ofertas.map((o) => Number(o.Porcentaje_Descuento || 0))) : 0;
  const pagosSectionStyle = {
    background: esOscuro
      ? "radial-gradient(circle at 20% 18%, rgba(255,17,119,0.16), transparent 28%), radial-gradient(circle at 82% 14%, rgba(239,68,68,0.18), transparent 24%), linear-gradient(180deg, #09101f 0%, #0f172a 100%)"
      : "#f9fafb",
  };
  const nequiCardStyle = {
    background: esOscuro
      ? "linear-gradient(135deg, #170114 0%, #25031d 52%, #310827 100%)"
      : "linear-gradient(135deg, #3d1a43 0%, #5b275f 100%)",
    border: esOscuro ? "1px solid rgba(255,17,119,0.26)" : "1px solid rgba(124,58,237,0.16)",
    boxShadow: esOscuro
      ? "0 24px 46px rgba(2,6,23,0.42), 0 10px 18px rgba(255,17,119,0.12)"
      : "0 18px 34px rgba(15,23,42,0.18)",
  };
  const daviCardStyle = {
    background: "linear-gradient(135deg, #b5121b 0%, #df1f2f 52%, #ff4b4b 100%)",
    border: esOscuro ? "1px solid rgba(255,130,130,0.18)" : "1px solid rgba(220,38,38,0.12)",
    boxShadow: esOscuro
      ? "0 24px 46px rgba(2,6,23,0.42), 0 10px 18px rgba(248,113,113,0.12)"
      : "0 18px 34px rgba(15,23,42,0.18)",
  };
  const pagoIconBoxStyle = {
    backgroundColor: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
  };
  const pagoBadgeStyle = {
    backgroundColor: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.12)",
  };
  const aboutStats = [
    { valor: "8+", label: "Categorias", detalle: "lineas esenciales" },
    { valor: "24/7", label: "Disponible", detalle: "cuando lo necesites" },
    { valor: "100%", label: "Digital", detalle: "sin pasos extra" },
  ];
  const aboutBenefits = [
    { icono: "🚚", titulo: "Entrega a domicilio", desc: "Tu pedido llega rapido y sin complicaciones hasta tu puerta.", accent: "#38bdf8", soft: "rgba(56,189,248,0.16)" },
    { icono: "🏷️", titulo: "Ofertas reales", desc: "Promociones claras, visibles y faciles de aprovechar.", accent: "#f59e0b", soft: "rgba(245,158,11,0.16)" },
    { icono: "🔒", titulo: "Compra segura", desc: "Tu informacion y tus pedidos se mantienen protegidos.", accent: "#10b981", soft: "rgba(16,185,129,0.16)" },
    { icono: "📦", titulo: "Inventario fresco", desc: "Productos actualizados y stock real en todo momento.", accent: "#8b5cf6", soft: "rgba(139,92,246,0.16)" },
  ];
  const aboutSectionStyle = {
    background: esOscuro
      ? "radial-gradient(circle at 18% 20%, rgba(107,142,78,0.16), transparent 28%), linear-gradient(180deg, #0f172a 0%, #111827 100%)"
      : "radial-gradient(circle at 18% 18%, rgba(168,200,152,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  };
  const aboutTagStyle = {
    backgroundColor: esOscuro ? "rgba(15,23,42,0.62)" : "rgba(255,255,255,0.84)",
    border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.9)"}`,
    color: "#94a3b8",
    boxShadow: esOscuro ? "0 12px 24px rgba(2,6,23,0.18)" : "0 10px 20px rgba(15,23,42,0.05)",
  };
  const aboutStatCardStyle = {
    background: esOscuro
      ? "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(17,24,39,0.92) 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.92)"}`,
    boxShadow: esOscuro ? "0 18px 32px rgba(2,6,23,0.22)" : "0 14px 30px rgba(15,23,42,0.08)",
  };
  const aboutBenefitCardStyle = {
    background: esOscuro
      ? "linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(17,24,39,0.88) 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
    border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.92)"}`,
    boxShadow: esOscuro ? "0 18px 34px rgba(2,6,23,0.22)" : "0 14px 28px rgba(15,23,42,0.07)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: esOscuro ? "#0f172a" : "#ffffff", color: esOscuro ? "#e5e7eb" : "#0f172a" }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 border-b shadow-sm"
        style={{
          backgroundColor: esOscuro ? "#0b1327" : "#ffffff",
          borderColor: esOscuro ? "#1f2937" : "#f3f4f6",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark className="w-9 h-9" />
            <div>
              <p className="text-[10px] uppercase tracking-widest leading-none" style={{ color: esOscuro ? "#94a3b8" : "#94a3b8" }}>Mercado</p>
              <p className="text-base font-black tracking-tight leading-none" style={{ fontFamily: "Georgia, serif", color: esOscuro ? "#e5e7eb" : "#1B2727" }}>
                Digital
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-5">
            <a href="#ofertas" className="text-sm font-semibold transition" style={{ color: esOscuro ? "#a7b3c9" : "#4b5563" }}>Ofertas</a>
            <a href="#categorias" className="text-sm font-semibold transition" style={{ color: esOscuro ? "#a7b3c9" : "#4b5563" }}>Categorias</a>
            <a href="#nosotros" className="text-sm font-semibold transition" style={{ color: esOscuro ? "#a7b3c9" : "#4b5563" }}>Nosotros</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle
              className="px-4 py-2 rounded-full text-sm"
              style={{
                backgroundColor: esOscuro ? "rgba(15,23,42,0.88)" : "#ffffff",
                border: `1px solid ${esOscuro ? "#334155" : "#e5e7eb"}`,
                color: esOscuro ? "#e5e7eb" : "#111827",
              }}
              hideLabelOnMobile
            />
            <Link to="/login"
              className="hidden sm:block px-4 py-2 rounded-full text-sm font-semibold border transition"
              style={{ borderColor: esOscuro ? "#334155" : "#e5e7eb", color: esOscuro ? "#e5e7eb" : "#111827" }}>
              Iniciar sesion
            </Link>
            <Link to="/registro"
              className="px-4 sm:px-5 py-2 rounded-full text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
              Registrarse
            </Link>
            {/* Hamburguesa móvil */}
            <button
              className="sm:hidden p-2 rounded-xl transition"
              style={{ color: esOscuro ? "#cbd5e1" : "#374151" }}
              onClick={() => setMenuMovil(!menuMovil)}
              aria-label="Menu"
            >
              {menuMovil
                ? <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
        {/* Menú móvil desplegable */}
        {menuMovil && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            <a href="#ofertas" onClick={() => setMenuMovil(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Ofertas</a>
            <a href="#categorias" onClick={() => setMenuMovil(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Categorias</a>
            <a href="#nosotros" onClick={() => setMenuMovil(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Nosotros</a>
            <Link to="/login" onClick={() => setMenuMovil(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition border-t border-gray-100 mt-1 pt-3">
              Iniciar sesion
            </Link>
          </div>
        )}
      </nav>

      <main style={{ backgroundColor: esOscuro ? "#0f172a" : "#ffffff" }}>
        {/* ── Hero ────────────────────────────────────────────── */}
        <section
          className="py-10 md:py-20"
          style={{
            background: esOscuro
              ? "linear-gradient(180deg, #111827 0%, #0f172a 100%)"
              : "linear-gradient(180deg, #D5DDDF 0%, #FFFFFF 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-5 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5 border"
                style={{
                  backgroundColor: esOscuro ? "rgba(22,101,52,0.18)" : "rgba(255,255,255,0.78)",
                  borderColor: esOscuro ? "rgba(163,230,53,0.18)" : "rgba(107,142,78,0.22)",
                  color: esOscuro ? "#cfe9b6" : "#35503e",
                  backdropFilter: "blur(10px)",
                  boxShadow: esOscuro ? "0 10px 24px rgba(2,6,23,0.18)" : "0 10px 22px rgba(148,163,184,0.12)",
                }}>
                Mercado de barrio, experiencia mas limpia
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                style={{ fontFamily: "Georgia, serif", color: esOscuro ? "#e5e7eb" : "#1f2937" }}>
                Compra despensa diaria con una interfaz que si da{" "}
                <span style={{ color: esOscuro ? "#84cc16" : "#1B2727" }}>confianza.</span>
              </h1>
              <p className="text-base md:text-lg mt-5 leading-relaxed max-w-xl" style={{ color: esOscuro ? "#9fb0c8" : "#6b7280" }}>
                Productos esenciales, ofertas visibles y un proceso sencillo para comprar sin ruido visual ni pasos innecesarios.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/registro"
                  className="px-7 py-3.5 rounded-full font-bold text-white shadow-md hover:-translate-y-0.5 transition text-sm"
                  style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
                  Crear cuenta
                </Link>
                <Link to="/login"
                  className="px-7 py-3.5 rounded-full font-semibold border-2 transition text-sm"
                  style={{ borderColor: esOscuro ? "#334155" : "#e5e7eb", color: esOscuro ? "#e5e7eb" : "#111827" }}>
                  Ya tengo cuenta
                </Link>
              </div>
            </div>

            {/* Card oferta semana */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border" style={{ borderColor: esOscuro ? "#334155" : "#f3f4f6" }}>
              <div className="px-6 pt-6 pb-4" style={{ backgroundColor: esOscuro ? "rgba(30,41,59,0.72)" : "rgba(178,197,178,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-lg" style={{ color: esOscuro ? "#e5e7eb" : "#1f2937" }}>Ofertas de la semana</p>
                  {maxDescuento > 0 && (
                    <span className="px-4 py-2 rounded-2xl text-white font-black text-sm shadow"
                      style={{ backgroundColor: "#3C5148" }}>
                      Hasta {maxDescuento}% OFF
                    </span>
                  )}
                </div>
                {productosEnOferta.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {productosEnOferta.slice(0, 4).map((p) => (
                      <div key={p.Cod_Producto} className="rounded-2xl p-3 text-center shadow-sm" style={{ backgroundColor: esOscuro ? "#0f172a" : "#ffffff" }}>
                        {p.Imagen_url || p.imagen_url ? (
                          <img src={p.Imagen_url || p.imagen_url} alt={p.Nombre}
                            className="w-full h-20 object-cover rounded-xl mb-2" />
                        ) : (
                          <div className="w-full h-20 rounded-xl mb-2 flex items-center justify-center text-3xl"
                            style={{ backgroundColor: "rgba(168,200,152,0.15)" }}>🛒</div>
                        )}
                        <p className="text-xs font-semibold truncate" style={{ color: esOscuro ? "#cbd5e1" : "#374151" }}>{p.Nombre}</p>
                        <p className="text-xs font-black mt-0.5" style={{ color: esOscuro ? "#e5e7eb" : "#1B2727" }}>{formatMoney(p.precio_oferta)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ backgroundColor: esOscuro ? "#0f172a" : "#ffffff" }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: esOscuro ? "#0b1327" : "#ffffff" }}>
                <p className="text-sm" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>{ofertas.length} promociones activas</p>
                <Link to="/login"
                  className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#3C5148" }}>
                  Ver ofertas
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Productos Destacados ─────────────────────────────── */}
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Catálogo</p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Productos destacados</h2>
              </div>
              <Link to="/login" className="text-sm font-semibold hover:underline" style={{ color: "#6B8E4E" }}>
                Ver todos →
              </Link>
            </div>
            {productosDestacados.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productosDestacados.map((p) => (
                  <ProductoCard key={p.Cod_Producto} producto={p} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl h-64 animate-pulse bg-gray-100" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Ofertas Especiales ───────────────────────────────── */}
        {productosEnOferta.length > 0 && (
          <section id="ofertas" className="py-14" style={{ backgroundColor: "#f9fafb" }}>
            <div className="max-w-6xl mx-auto px-5">
              <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Descuentos</p>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                    🛍️ Ofertas especiales 🔥
                  </h2>
                </div>
                <Link to="/login" className="text-sm font-semibold hover:underline" style={{ color: "#6B8E4E" }}>
                  Ver todas las ofertas →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productosEnOferta.map((p) => (
                  <ProductoCard key={p.Cod_Producto} producto={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Categorias ───────────────────────────────────────── */}
        <section
          id="categorias"
          className="py-16 md:py-18"
          style={{
            background: esOscuro
              ? "linear-gradient(180deg, #111827 0%, #0f172a 100%)"
              : "#ffffff",
          }}
        >
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] font-bold mb-1" style={{ color: esOscuro ? "#94a3b8" : "#94a3b8" }}>Explorar</p>
                <h2 className="text-3xl md:text-4xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>Categorias</h2>
              </div>
              <p className="text-sm" style={{ color: esOscuro ? "#94a3b8" : "#94a3b8" }}>Encuentra lo que buscas de forma rapida</p>
            </div>
            {categorias.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {categorias.map((cat, i) => (
                  <CategoriaCard key={cat.Cod_Categoria} cat={cat} index={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[28px] h-60 animate-pulse"
                    style={{ backgroundColor: esOscuro ? "rgba(255,255,255,0.08)" : "#f1f5f9" }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Medios de pago ───────────────────────────────────── */}
        <section className="py-14" style={pagosSectionStyle}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.32em] font-bold mb-2" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>Pagos</p>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>Medios de pago aceptados</h2>
              <p className="mt-2 text-sm" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>Paga de forma rapida y segura con los metodos que ya usas</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">

              {/* Nequi */}
              <div className="rounded-3xl p-6 text-white shadow-lg flex items-center gap-5"
                style={{ background: "linear-gradient(135deg, #5b21b6, #8b5cf6)" }}>
                <NequiBadge />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-[4px]" style={{ backgroundColor: "#ff1177" }} />
                    <p className="font-black text-2xl tracking-tight">Nequi</p>
                  </div>
                  <p className="text-white/80 text-sm mt-1 leading-relaxed">Paga directo desde tu app sin salir del flujo de compra.</p>
                  <span className="inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full" style={pagoBadgeStyle}>
                    Billetera digital
                  </span>
                </div>
              </div>

              {/* Daviplata */}
              <div className="relative overflow-hidden rounded-3xl p-6 text-white flex items-center gap-5 transition hover:-translate-y-1"
                style={daviCardStyle}>
                <div className="absolute inset-0 opacity-20"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 38%, transparent 100%)" }} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.18] pointer-events-none hidden sm:block">
                  <svg width="110" height="92" viewBox="0 0 110 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M30 27C42 16 59 15 70 23H85C88 23 90 25 89 28L88 36C94 41 98 49 98 58C98 73 82 82 61 82C37 82 19 71 19 54C19 46 23 39 30 34V27Z" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M70 23L76 18" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="78" cy="48" r="3.5" fill="white"/>
                  </svg>
                </div>
                <div className="relative w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0"
                  style={{ ...pagoIconBoxStyle, background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)" }}>
                  <span className="text-3xl font-black text-white">D</span>
                </div>
                <div className="relative">
                  <p className="font-black text-2xl tracking-tight">
                    <span className="tracking-[-0.06em]">DAVI</span>
                    <span className="font-semibold tracking-[-0.02em]">plata</span>
                  </p>
                  <p className="text-white/80 text-sm mt-1 leading-relaxed max-w-[18rem]">Usa tu cuenta DAVIplata para completar el pago al instante.</p>
                  <span className="inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full" style={pagoBadgeStyle}>
              <div className="rounded-3xl p-6 text-white shadow-lg flex items-center gap-5"
                style={{ background: "linear-gradient(135deg, #b91c1c, #ef4444)" }}>
                <DaviplataBadge />
                <div>
                  <p className="font-black text-xl">Daviplata</p>
                  <p className="text-white/75 text-sm mt-1">Usa tu cuenta Daviplata para completar el pago al instante.</p>
                  <span className="inline-block mt-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    Billetera digital
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>
                Todos los pagos son procesados de forma segura. Tu informacion nunca es compartida.
              </p>
            </div>
          </div>
        </section>

        {/* ── Nosotros ─────────────────────────────────────────── */}
        <section id="nosotros" className="py-16 md:py-20" style={aboutSectionStyle}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
              <div className="max-w-xl">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.24em] font-bold mb-5" style={aboutTagStyle}>
                  Quienes somos
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-[3.25rem] font-black leading-[1.14] md:leading-[1.12]" style={{ fontFamily: "Georgia, serif", color: esOscuro ? "#f8fafc" : "#111827" }}>
                  <span className="block">Tu mercado de barrio,</span>
                  <span className="block mt-1.5" style={{ color: esOscuro ? "#d9f99d" : "#3C5148" }}>ahora en digital.</span>
                </h2>
                <p className="mt-6 text-base md:text-lg leading-8" style={{ color: esOscuro ? "#cbd5e1" : "#64748b" }}>
                  Mercado Digital nace de la idea de llevar la experiencia del mercado local a una plataforma sencilla, ordenada y sin ruido visual. Creemos que comprar la despensa de la semana debe ser tan natural como caminar al mercado de la esquina.
                </p>
                <p className="mt-4 text-base md:text-lg leading-8" style={{ color: esOscuro ? "#cbd5e1" : "#64748b" }}>
                  Trabajamos con proveedores locales para ofrecerte productos frescos, precios justos y entregas a domicilio en tu barrio. Sin apps complicadas, sin pasos innecesarios.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
                  {aboutStats.map((s) => (
                    <div key={s.label} className="rounded-[26px] p-4 sm:p-5 text-center" style={aboutStatCardStyle}>
                      <p className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: "#94a3b8" }}>{s.label}</p>
                      <p className="text-3xl sm:text-4xl font-black mt-3" style={{ color: esOscuro ? "#f8fafc" : "#3C5148" }}>{s.valor}</p>
                      <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>{s.detalle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {aboutBenefits.map((b) => (
                  <div key={b.titulo} className="rounded-[28px] p-5 sm:p-6 transition duration-300 hover:-translate-y-1" style={aboutBenefitCardStyle}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                      style={{ backgroundColor: b.soft, boxShadow: `inset 0 0 0 1px ${esOscuro ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)"}` }}>
                      {b.icono}
                    </div>
                    <p className="font-black text-lg leading-tight" style={{ color: esOscuro ? "#f8fafc" : "#0f172a" }}>{b.titulo}</p>
                    <p className="text-sm mt-2.5 leading-7" style={{ color: "#94a3b8" }}>{b.desc}</p>
                    <div className="mt-5 h-1.5 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${b.accent}, rgba(255,255,255,0))` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Final ────────────────────────────────────────── */}
        <section
          className="py-14"
          style={{
            background: esOscuro
              ? "linear-gradient(180deg, rgba(107,142,78,0.18) 0%, #0f172a 100%)"
              : "rgba(178,197,178,0.2)",
          }}
        >
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-4xl font-black leading-tight" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>
              Empieza a comprar hoy,{" "}
              <span style={{ color: esOscuro ? "#d9f99d" : "#1B2727" }}>es gratis.</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: esOscuro ? "#94a3b8" : "#9ca3af" }}>
              Crea tu cuenta en segundos y accede a todos los productos, ofertas y categorias del mercado.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/registro"
                className="px-8 py-4 rounded-full font-bold text-white shadow-md hover:-translate-y-0.5 transition"
                style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
                Crear cuenta gratis
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-full font-semibold border-2 transition"
                style={{ borderColor: esOscuro ? "#334155" : "#e5e7eb", color: esOscuro ? "#e5e7eb" : "#111827" }}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BrandMark className="w-9 h-9" />
              <p className="font-black" style={{ fontFamily: "Georgia, serif", color: esOscuro ? "#f8fafc" : "#1f2937" }}>Mercado Digital</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu mercado cercano, ahora mas claro y mas facil de usar.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Tienda</p>
            <div className="space-y-2 text-sm text-gray-500">
              <a href="#categorias" className="block hover:text-gray-800 transition">Categorias</a>
              <a href="#ofertas" className="block hover:text-gray-800 transition">Ofertas</a>
              <Link to="/login" className="block hover:text-gray-800 transition">Mi cuenta</Link>
              <Link to="/registro" className="block hover:text-gray-800 transition">Registrarse</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Empresa</p>
            <div className="space-y-2 text-sm text-gray-500">
              <a href="#nosotros" className="block hover:text-gray-800 transition">Nosotros</a>
              <a href="#" className="block hover:text-gray-800 transition">Blog</a>
              <a href="#" className="block hover:text-gray-800 transition">Contacto</a>
              <a href="#" className="block hover:text-gray-800 transition">Preguntas frecuentes</a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Contacto</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>soporte@mercadodigital.com</p>
              <p>+57 300 000 00 00</p>
              <p>Lun – Sáb · 8 am – 8 pm</p>
            </div>
            <div className="flex gap-2 mt-5">
              {["f", "ig", "tw"].map((r) => (
                <a key={r} href="#"
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-gray-400 hover:text-gray-700 transition">
                  {r}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
            <span>© 2024 Mercado Digital. Todos los derechos reservados.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600 transition">Terminos</a>
              <a href="#" className="hover:text-gray-600 transition">Privacidad</a>
              <a href="#" className="hover:text-gray-600 transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
