import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { productoService, ofertaService, categoriaService, resolverImagen } from "../services/api";
import { useTheme } from "../context/ThemeContext";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

function normalizarCategoria(nombre = "") {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obtenerVisualCategoria(nombre = "", index) {
  const clave = normalizarCategoria(nombre);
  const paletas = [
    { icono: "🛢️", top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🧼", top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" },
    { icono: "🥤", top: "#fdf0e4", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🌾", top: "#dff4fb", accent: "#06b6d4", accentDark: "#0891b2" },
    { icono: "🍬", top: "#fbe7f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🍞", top: "#fdf2dc", accent: "#f59e0b", accentDark: "#d97706" },
    { icono: "🧀", top: "#eaedff", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🥐", top: "#e3f5f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🏠", top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { icono: "🍪", top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" },
  ];

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

  return paletas[index % paletas.length];
}

function ProductoCard({ producto }) {
  const { esOscuro } = useTheme();
  const tieneOferta = Number(producto.Porcentaje_Descuento || 0) > 0;
  const precio = tieneOferta ? Number(producto.precio_oferta || producto.Precio) : Number(producto.Precio);
  const imagen = resolverImagen(producto.Imagen_url || producto.imagen_url || producto.imagen || "");

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-sm transition hover:shadow-md flex flex-col h-full"
      style={{
        backgroundColor: esOscuro ? "#111827" : "#ffffff",
        border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "#e5e7eb"}`,
      }}
    >
      <div className="h-44 overflow-hidden bg-gray-100">
        {imagen ? (
          <img src={imagen} alt={producto.Nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ backgroundColor: "rgba(107,142,78,0.08)" }}>
            🛒
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
            {producto.categoria || producto.Categoria || "Producto"}
          </span>
          {tieneOferta && (
            <span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full" style={{ backgroundColor: "#ECFDF5", color: "#166534" }}>
              -{producto.Porcentaje_Descuento}%
            </span>
          )}
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-3" style={{ color: esOscuro ? "#e5e7eb" : "#111827" }}>
          {producto.Nombre}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>
              {formatMoney(precio)}
            </p>
            {tieneOferta && (
              <p className="text-xs line-through" style={{ color: esOscuro ? "#64748b" : "#9ca3af" }}>
                {formatMoney(producto.Precio)}
              </p>
            )}
          </div>
          <Link
            to="/tienda"
            className="text-xs font-semibold uppercase px-3 py-2 rounded-2xl text-white transition"
            style={{ backgroundColor: "#6B8E4E" }}
          >
            Añadir
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoriaCard({ categoria, index }) {
  const { esOscuro } = useTheme();
  const visual = obtenerVisualCategoria(categoria.Nombre || categoria.nombre || "", index);
  const total = Number(categoria.total_productos || categoria.totalProductos || 0);

  return (
    <Link
      to="/tienda"
      className="group rounded-[28px] overflow-hidden transition duration-300 hover:-translate-y-1 flex flex-col h-full"
      style={{
        backgroundColor: esOscuro ? "#111827" : "#ffffff",
        border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.9)"}`,
        boxShadow: esOscuro ? "0 18px 40px rgba(2,6,23,0.16)" : "0 14px 30px rgba(15,23,42,0.08)",
      }}
    >
      <div
        className="h-24 rounded-b-none"
        style={{
          background: `linear-gradient(135deg, ${visual.top}, ${visual.accent})`,
        }}
      />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] font-semibold mb-3" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
            Categoría
          </p>
          <p className="font-black text-xl leading-tight" style={{ color: esOscuro ? "#f8fafc" : "#0f172a" }}>
            {categoria.Nombre || categoria.nombre}
          </p>
          <p className="text-sm mt-3" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
            {total > 0 ? `${total} ${total === 1 ? "producto" : "productos"}` : "Productos disponibles"}
          </p>
        </div>

        <span
          className="mt-6 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white transition group-hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${visual.accent}, ${visual.accentDark})` }}
        >
          Ver categoria
        </span>
      </div>
    </Link>
  );
}

export default function Landing() {
  const { esOscuro } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const slides = [
    {
      label: "Envío express",
      title: "Recibe tu pedido en tiempo récord",
      description:
        "Seguimiento en vivo, despachos confiables y entregas optimizadas para que tus compras lleguen directo a la puerta.",
    },
    {
      label: "Pagos seguros",
      title: "Procesamiento de pago confiable",
      description:
        "Disfruta de pagos protegidos y confirmaciones instantáneas con la pasarela de Mercado Pago integrada.",
    },
    {
      label: "Ofertas exclusivas",
      title: "Ahorra en los productos más buscados",
      description:
        "Encuentra descuentos seleccionados, promoción por tiempo limitado y categorías destacadas en nuestra plataforma.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [prodsRes, catsRes] = await Promise.all([
          productoService.listar(),
          categoriaService.listar(),
        ]);

        const prods = prodsRes.productos || [];
        const cats = catsRes.categorias || [];
        const ofertasRes = await ofertaService.listar();
        const ofrs = ofertasRes.ofertas || [];

        const ofertasPorProducto = new Map(
          ofrs.filter((o) => o.Cod_Producto).map((o) => [Number(o.Cod_Producto), o])
        );

        const prodsConOferta = prods.map((producto) => {
          const oferta = ofertasPorProducto.get(Number(producto.Cod_Producto));
          if (!oferta) return producto;
          return {
            ...producto,
            Porcentaje_Descuento: Number(oferta.Porcentaje_Descuento || 0),
            precio_oferta: Number(oferta.precio_oferta || producto.Precio),
          };
        });

        setProductos(prodsConOferta);
        setCategorias(cats);
      } catch (error) {
        console.error("Error cargando datos de landing:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const destacados = productos.slice(0, 4);
  const productosOferta = productos.filter((p) => Number(p.Porcentaje_Descuento || 0) > 0).slice(0, 4);

  return (
    <div className="min-h-screen" style={{ backgroundColor: esOscuro ? "#0f172a" : "#ffffff", color: esOscuro ? "#e5e7eb" : "#0f172a" }}>
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          backgroundColor: esOscuro ? "#0b1327" : "#ffffff",
          borderColor: esOscuro ? "#1f2937" : "#e5e7eb",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={esOscuro ? "/Logo-Mercado-Digital-Blanco.png" : "/Logo-Mercado-Digital.png"}
              alt="Mercado Digital"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
              <a href="#ofertas" className="transition hover:text-green-700" style={{ color: esOscuro ? "#d1d5db" : "#374151" }}>
                Ofertas
              </a>
              <a href="#categorias" className="transition hover:text-green-700" style={{ color: esOscuro ? "#d1d5db" : "#374151" }}>
                Categorías
              </a>
              <a href="#productos" className="transition hover:text-green-700" style={{ color: esOscuro ? "#d1d5db" : "#374151" }}>
                Productos
              </a>
            </nav>

            <button
              type="button"
              onClick={() => setMenuAbierto((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center rounded-full border p-3 text-lg font-semibold transition"
              style={{
                backgroundColor: esOscuro ? "rgba(255,255,255,0.08)" : "#f8fafc",
                borderColor: esOscuro ? "rgba(255,255,255,0.16)" : "#e5e7eb",
                color: esOscuro ? "#f8fafc" : "#111827",
              }}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            >
              <span aria-hidden="true">{menuAbierto ? "✕" : "☰"}</span>
            </button>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold transition-colors border"
                style={{
                  backgroundColor: esOscuro ? "rgba(255,255,255,0.06)" : "#f8fafc",
                  borderColor: esOscuro ? "rgba(255,255,255,0.16)" : "#e5e7eb",
                  color: esOscuro ? "#f8fafc" : "#111827",
                }}
              >
                Iniciar sesión
              </Link>

              <Link
                to="/registro"
                className="rounded-full px-4 py-2 text-sm font-bold text-white transition"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6B8E4E 0%, #3C5148 100%)",
                }}
              >
                Registrarse
              </Link>
            </div>

            <ThemeToggle
              iconOnly
              className="px-3 py-2 rounded-full"
              style={{
                backgroundColor: esOscuro ? "rgba(255,255,255,0.08)" : "#f8fafc",
                border: `1px solid ${esOscuro ? "rgba(148,163,184,0.16)" : "#e5e7eb"}`,
                color: esOscuro ? "#f8fafc" : "#111827",
              }}
            />
          </div>

          {menuAbierto && (
            <div
              className="md:hidden w-full max-w-md mx-auto mt-3 rounded-[28px] border px-4 py-4 shadow-xl backdrop-blur-xl"
              style={{
                backgroundColor: esOscuro ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
                borderColor: esOscuro ? "rgba(148,163,184,0.16)" : "rgba(226,232,240,0.9)",
              }}
            >
              <nav className="space-y-3 text-sm font-semibold">
                <a
                  href="#ofertas"
                  className="block rounded-3xl px-4 py-4 transition"
                  style={{
                    backgroundColor: esOscuro ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    color: esOscuro ? "#f8fafc" : "#111827",
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Ofertas
                </a>
                <a
                  href="#categorias"
                  className="block rounded-3xl px-4 py-4 transition"
                  style={{
                    backgroundColor: esOscuro ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    color: esOscuro ? "#f8fafc" : "#111827",
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Categorías
                </a>
                <a
                  href="#productos"
                  className="block rounded-3xl px-4 py-4 transition"
                  style={{
                    backgroundColor: esOscuro ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    color: esOscuro ? "#f8fafc" : "#111827",
                  }}
                  onClick={() => setMenuAbierto(false)}
                >
                  Productos
                </a>
              </nav>

              <div className="mt-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="block rounded-full px-4 py-4 text-center text-sm font-semibold transition border"
                  style={{
                    backgroundColor: esOscuro ? "rgba(255,255,255,0.06)" : "#f8fafc",
                    borderColor: esOscuro ? "rgba(255,255,255,0.16)" : "#e5e7eb",
                    color: esOscuro ? "#f8fafc" : "#111827",
                  }}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="block rounded-full px-4 py-4 text-center text-sm font-bold text-white transition"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #6B8E4E 0%, #3C5148 100%)",
                  }}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-10">
        {/* SLIDER INDEPENDIENTE */}
      <section className="mb-10 mt-24">
        <div
          className="relative overflow-hidden rounded-[32px] p-10 shadow-xl transition-all"
          style={{
            backgroundColor: esOscuro ? "#111827" : "#ffffff",
            border: `1px solid ${
              esOscuro ? "rgba(148,163,184,0.16)" : "#e5e7eb"
            }`,
          }}
        >
          <div className="relative z-10">
            <span
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{
                backgroundColor: esOscuro
                  ? "rgba(107,142,78,0.12)"
                  : "#ecfdf5",
                color: esOscuro ? "#b7d8a3" : "#166534",
              }}
            >
              {slides[activeSlide].label}
            </span>

            <h2
              className="mt-6 text-3xl sm:text-5xl font-black leading-tight"
              style={{
                color: esOscuro ? "#f8fafc" : "#111827",
              }}
            >
              {slides[activeSlide].title}
            </h2>

            <p
              className="mt-4 max-w-2xl text-base leading-8"
              style={{
                color: esOscuro ? "#cbd5e1" : "#475569",
              }}
            >
              {slides[activeSlide].description}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-3 w-3 rounded-full transition ${
                    activeSlide === index
                      ? "bg-green-600"
                      : esOscuro
                      ? "bg-slate-600"
                      : "bg-slate-300"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSlide(
                    (prev) => (prev - 1 + slides.length) % slides.length
                  )
                }
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition"
                style={{
                  backgroundColor: esOscuro ? "#1e293b" : "#f1f5f9",
                  color: esOscuro ? "#f8fafc" : "#111827",
                }}
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveSlide((prev) => (prev + 1) % slides.length)
                }
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition"
                style={{
                  backgroundColor: "#6B8E4E",
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10">
  <div className="max-w-3xl">
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
      style={{
        backgroundColor: esOscuro
          ? "rgba(107,142,78,0.12)"
          : "#ecfdf5",
        color: esOscuro ? "#b7d8a3" : "#166534",
      }}
    >
      Compra fácil y sin filas
    </span>

    <h1
      className="mt-6 text-4xl sm:text-5xl font-black leading-tight"
      style={{
        color: esOscuro ? "#f8fafc" : "#0f172a",
      }}
    >
      Todo lo que necesitas para tu hogar, en un solo lugar.
    </h1>

    <p
      className="mt-5 text-base leading-8 max-w-2xl"
      style={{
        color: esOscuro ? "#cbd5e1" : "#475569",
      }}
    >
      Descubre ofertas, categorías y productos listos para comprar.
      Navega rápido, agrega al carrito y recíbelo en la puerta de tu
      casa.
    </p>
  </div>
</section>

        <section id="ofertas" className="py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
                Ofertas
              </p>
              <h2 className="mt-3 text-3xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>
                Los mejores descuentos del momento.
              </h2>
            </div>
            <Link
              to="/tienda"
              className="text-sm font-semibold transition hover:text-green-700"
              style={{ color: esOscuro ? "#d1d5db" : "#166534" }}
            >
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cargando ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="h-72 rounded-3xl bg-gray-200 animate-pulse" />
              ))
            ) : productosOferta.length === 0 ? (
              <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#111827" : "#ffffff" }}>
                <p style={{ color: esOscuro ? "#d1d5db" : "#475569" }}>No hay ofertas disponibles.</p>
              </div>
            ) : (
              productosOferta.map((producto) => <ProductoCard key={producto.Cod_Producto || producto.id || producto.Num_Documento} producto={producto} />)
            )}
          </div>
        </section>

        <section id="categorias" className="py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
              Categorías
            </p>
            <h2 className="mt-3 text-3xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>
              Encuentra lo que necesitas rápido.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cargando ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="h-44 rounded-3xl bg-gray-200 animate-pulse" />
              ))
            ) : categorias.length === 0 ? (
              <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#111827" : "#ffffff" }}>
                <p style={{ color: esOscuro ? "#d1d5db" : "#475569" }}>No se encontraron categorías.</p>
              </div>
            ) : (
              categorias.slice(0, 8).map((categoria, index) => {
                const nombreCategoria = (categoria.Nombre || categoria.nombre || "").trim().toLowerCase();
                const productoEjemplo = productos.find((producto) => {
                  const nombreProdCategoria = (producto.Categoria || producto.categoria || "").trim().toLowerCase();
                  return nombreProdCategoria === nombreCategoria && (producto.Imagen_url || producto.imagen_url || producto.imagen || "");
                });
                return (
                  <CategoriaCard
                    key={categoria.Id_categoria || categoria.id || index}
                    categoria={categoria}
                    index={index}
                    imagenEjemplo={productoEjemplo?.Imagen_url || productoEjemplo?.imagen_url || productoEjemplo?.imagen || ""}
                  />
                );
              })
            )}
          </div>
        </section>

        <section id="productos" className="py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: esOscuro ? "#94a3b8" : "#6b7280" }}>
                Productos
              </p>
              <h2 className="mt-3 text-3xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#111827" }}>
                Artículos frescos para cada día.
              </h2>
            </div>
            <p className="text-sm" style={{ color: esOscuro ? "#cbd5e1" : "#6b7280" }}>
              Selección actualizada con los mejores precios.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cargando ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="h-72 rounded-3xl bg-gray-200 animate-pulse" />
              ))
            ) : destacados.length === 0 ? (
              <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#111827" : "#ffffff" }}>
                <p style={{ color: esOscuro ? "#d1d5db" : "#475569" }}>No hay productos para mostrar.</p>
              </div>
            ) : (
              destacados.map((producto) => <ProductoCard key={producto.Cod_Producto || producto.id || producto.Num_Documento} producto={producto} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
