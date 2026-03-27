import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { productoService, ofertaService, categoriaService } from "../services/api";

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
  const tieneOferta = Number(producto.Porcentaje_Descuento || 0) > 0;
  const precio = tieneOferta ? producto.precio_oferta : producto.Precio;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
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
        <p className="text-xs text-gray-400 mb-0.5">{producto.categoria || ""}</p>
        <p className="font-semibold text-sm text-gray-800 leading-tight line-clamp-2 flex-1">{producto.Nombre}</p>
        <div className="mt-2 mb-3 flex items-baseline gap-2">
          <span className="font-black text-base" style={{ color: "#1B2727" }}>{formatMoney(precio)}</span>
          {tieneOferta && (
            <span className="text-xs text-gray-400 line-through">{formatMoney(producto.Precio)}</span>
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

function CategoriaCard({ cat, index }) {
  const colores = [
    { bg: "rgba(168,200,152,0.15)", accent: "#6B8E4E" },
    { bg: "rgba(135,127,215,0.12)", accent: "#3C5148" },
    { bg: "rgba(249,115,22,0.1)",   accent: "#6B8E4E" },
    { bg: "rgba(6,182,212,0.1)",    accent: "#06b6d4" },
    { bg: "rgba(236,72,153,0.1)",   accent: "#6B8E4E" },
    { bg: "rgba(245,158,11,0.1)",   accent: "#f59e0b" },
    { bg: "rgba(99,102,241,0.1)",   accent: "#6B8E4E" },
    { bg: "rgba(16,185,129,0.1)",   accent: "#6B8E4E" },
  ];
  const c = colores[index % colores.length];
  const iconos = ["🧴","🥛","🍞","🥤","🌾","🍿","🥣","🫙","🧃","🍫","🥚","🧹"];

  return (
    <Link to="/login"
      className="rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition overflow-hidden flex flex-col"
      style={{ backgroundColor: "white" }}>
      <div className="h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: c.bg }}>
        {iconos[index % iconos.length]}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm text-gray-800">{cat.Nombre}</p>
        <p className="text-xs mt-0.5" style={{ color: c.accent }}>
          +{cat.total_productos || "varios"} <span className="text-gray-400">productos</span>
        </p>
        <Link to="/login"
          className="mt-2 block text-center py-1.5 rounded-xl text-xs font-bold text-white w-full transition hover:opacity-90"
          style={{ backgroundColor: c.accent }}>
          Ver categoría
        </Link>
      </div>
    </Link>
  );
}

export default function Landing() {
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

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark className="w-9 h-9" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 leading-none">Mercado</p>
              <p className="text-base font-black tracking-tight leading-none" style={{ fontFamily: "Georgia, serif", color: "#1B2727" }}>
                Digital
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-5">
            <a href="#ofertas" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">Ofertas</a>
            <a href="#categorias" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">Categorias</a>
            <a href="#nosotros" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">Nosotros</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="hidden sm:block px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition">
              Iniciar sesion
            </Link>
            <Link to="/registro"
              className="px-4 sm:px-5 py-2 rounded-full text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
              Registrarse
            </Link>
            {/* Hamburguesa móvil */}
            <button
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition"
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

      <main>
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="py-10 md:py-20" style={{ background: "linear-gradient(180deg, #D5DDDF 0%, #FFFFFF 100%)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-5 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
                style={{ backgroundColor: "rgba(168,200,152,0.2)", borderColor: "rgba(116,180,149,0.3)", color: "#2f4d44" }}>
                Mercado de barrio, experiencia mas limpia
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                style={{ fontFamily: "Georgia, serif", color: "#1f2937" }}>
                Compra despensa diaria con una interfaz que si da{" "}
                <span style={{ color: "#1B2727" }}>confianza.</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 mt-5 leading-relaxed max-w-xl">
                Productos esenciales, ofertas visibles y un proceso sencillo para comprar sin ruido visual ni pasos innecesarios.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/registro"
                  className="px-7 py-3.5 rounded-full font-bold text-white shadow-md hover:-translate-y-0.5 transition text-sm"
                  style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
                  Crear cuenta
                </Link>
                <Link to="/login"
                  className="px-7 py-3.5 rounded-full font-semibold border-2 border-gray-200 hover:bg-gray-50 transition text-sm">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>

            {/* Card oferta semana */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="px-6 pt-6 pb-4" style={{ backgroundColor: "rgba(178,197,178,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-lg text-gray-800">Ofertas de la semana</p>
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
                      <div key={p.Cod_Producto} className="bg-white rounded-2xl p-3 text-center shadow-sm">
                        {p.Imagen_url || p.imagen_url ? (
                          <img src={p.Imagen_url || p.imagen_url} alt={p.Nombre}
                            className="w-full h-20 object-cover rounded-xl mb-2" />
                        ) : (
                          <div className="w-full h-20 rounded-xl mb-2 flex items-center justify-center text-3xl"
                            style={{ backgroundColor: "rgba(168,200,152,0.15)" }}>🛒</div>
                        )}
                        <p className="text-xs font-semibold text-gray-700 truncate">{p.Nombre}</p>
                        <p className="text-xs font-black mt-0.5" style={{ color: "#1B2727" }}>{formatMoney(p.precio_oferta)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-white flex items-center justify-between">
                <p className="text-sm text-gray-400">{ofertas.length} promociones activas</p>
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
        <section id="categorias" className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Explorar</p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Categorias</h2>
              </div>
              <p className="text-sm text-gray-400">Encuentra lo que buscas de forma rapida</p>
            </div>
            {categorias.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categorias.map((cat, i) => (
                  <CategoriaCard key={cat.Cod_Categoria} cat={cat} index={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl h-40 animate-pulse bg-gray-100" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Medios de pago ───────────────────────────────────── */}
        <section className="py-14" style={{ backgroundColor: "#f9fafb" }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Pagos</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">Medios de pago aceptados</h2>
              <p className="text-gray-400 mt-2 text-sm">Paga de forma rapida y segura con los metodos que ya usas</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">

              {/* Nequi */}
              <div className="rounded-3xl p-6 text-white shadow-lg flex items-center gap-5"
                style={{ background: "linear-gradient(135deg, #5b21b6, #8b5cf6)" }}>
                <NequiBadge />
                <div>
                  <p className="font-black text-xl">Nequi</p>
                  <p className="text-white/75 text-sm mt-1">Paga directo desde tu app sin salir del flujo de compra.</p>
                  <span className="inline-block mt-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    Billetera digital
                  </span>
                </div>
              </div>

              {/* Daviplata */}
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
              <p className="text-xs text-gray-400">
                Todos los pagos son procesados de forma segura. Tu informacion nunca es compartida.
              </p>
            </div>
          </div>
        </section>

        {/* ── Nosotros ─────────────────────────────────────────── */}
        <section id="nosotros" className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Quienes somos</p>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                  Tu mercado de barrio,{" "}
                  <span style={{ color: "#1B2727" }}>ahora en digital.</span>
                </h2>
                <p className="text-gray-500 mt-5 leading-relaxed">
                  Mercado Digital nace de la idea de llevar la experiencia del mercado local a una plataforma sencilla, ordenada y sin ruido visual. Creemos que comprar la despensa de la semana debe ser tan natural como caminar al mercado de la esquina.
                </p>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Trabajamos con proveedores locales para ofrecerte productos frescos, precios justos y entregas a domicilio en tu barrio. Sin apps complicadas, sin pasos innecesarios.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { valor: "8+",    label: "Categorias" },
                    { valor: "24/7",  label: "Disponible" },
                    { valor: "100%",  label: "Digital" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                      <p className="text-2xl font-black" style={{ color: "#6B8E4E" }}>{s.valor}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icono: "🚚", titulo: "Entrega a domicilio",  desc: "Tu pedido llega rapido y sin complicaciones hasta tu puerta." },
                  { icono: "🏷️", titulo: "Ofertas reales",       desc: "Promociones claras, visibles y faciles de aprovechar." },
                  { icono: "🔒", titulo: "Compra segura",        desc: "Tu informacion y tus pedidos se mantienen protegidos." },
                  { icono: "📦", titulo: "Inventario fresco",    desc: "Productos actualizados y stock real en todo momento." },
                ].map((b) => (
                  <div key={b.titulo} className="rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="text-3xl mb-3">{b.icono}</div>
                    <p className="font-bold text-sm text-gray-800">{b.titulo}</p>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Final ────────────────────────────────────────── */}
        <section className="py-14" style={{ backgroundColor: "rgba(178,197,178,0.2)" }}>
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Empieza a comprar hoy,{" "}
              <span style={{ color: "#1B2727" }}>es gratis.</span>
            </h2>
            <p className="text-gray-400 mt-4 text-base">
              Crea tu cuenta en segundos y accede a todos los productos, ofertas y categorias del mercado.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/registro"
                className="px-8 py-4 rounded-full font-bold text-white shadow-md hover:-translate-y-0.5 transition"
                style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
                Crear cuenta gratis
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:bg-gray-50 transition">
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
              <p className="font-black text-gray-800" style={{ fontFamily: "Georgia, serif" }}>Mercado Digital</p>
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



