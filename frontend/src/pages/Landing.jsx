import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { productoService, ofertaService, categoriaService, resolverImagen } from "../services/api";
import { useTheme } from "../context/ThemeContext";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

const HORARIO_PEDIDOS = "Pedidos: lunes a viernes de 10 AM a 5 PM. Fines de semana de 10 AM a 4 PM.";

function normalizarCategoria(nombre = "") {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obtenerImagenCategoria(nombre = "") {
  const clave = normalizarCategoria(nombre);
  if (clave.includes("aceite")) return "/Aceites.png";
  if (clave.includes("aseo")) return "/AseoP.png";
  if (clave.includes("bebida")) return "/Bebidas.png";
  if (clave.includes("cereal")) return "/Cereales.png";
  if (clave.includes("dulce")) return "/Dulces.png";
  if (clave.includes("grano")) return "/Granos.png";
  if (clave.includes("lacteo") || clave.includes("lacteos")) return "/Lacteos.png";
  if (clave.includes("pan")) return "/Panaderia.png";
  return "";
}

function obtenerVisualCategoria(nombre = "", index) {
  const clave = normalizarCategoria(nombre);
  const paletas = [
    { top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" },
    { top: "#fdf0e4", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#dff4fb", accent: "#06b6d4", accentDark: "#0891b2" },
    { top: "#fbe7f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#fdf2dc", accent: "#f59e0b", accentDark: "#d97706" },
    { top: "#eaedff", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#e3f5f0", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#eef5ec", accent: "#6B8E4E", accentDark: "#5f7f45" },
    { top: "#ecebfb", accent: "#3C5148", accentDark: "#32443d" },
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
        backgroundColor: esOscuro ? "#142018" : "#ffffff",
        border: `1px solid ${esOscuro ? "rgba(79,106,75,0.18)" : "#e5e7eb"}`,
      }}
    >
      <div className="h-44 overflow-hidden bg-gray-100">
        {imagen ? (
          <img src={imagen} alt={producto.Nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-black tracking-[0.2em]" style={{ backgroundColor: "rgba(107,142,78,0.08)", color: "#6B8E4E" }}>
            MD
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
  const imagenUrl = obtenerImagenCategoria(categoria.Nombre || categoria.nombre || "");
  const catId = categoria.Cod_Categoria || categoria.Id_categoria || categoria.id || "";

  return (
    <Link
      to={`/tienda?categoria=${catId}`}
      className="group rounded-[28px] overflow-hidden transition duration-300 hover:-translate-y-1 flex flex-col h-full"
      style={{
        backgroundColor: esOscuro ? "#142018" : "#ffffff",
        border: `1px solid ${esOscuro ? "rgba(79,106,75,0.18)" : "rgba(226,232,240,0.9)"}`,
        boxShadow: esOscuro ? "0 18px 40px rgba(5,15,8,0.16)" : "0 14px 30px rgba(15,23,42,0.08)",
      }}
    >
      <div className="h-32 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imagenUrl ? (
          <img
            src={imagenUrl}
            alt={categoria.Nombre || categoria.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${visual.top}, ${visual.accent})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
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
          Ver categoría
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
      image: "/carrusel/carrusel 91.png",
      imageAlt: "Envío express",
    },
    {
      label: "Pagos seguros",
      title: "Procesamiento de pago confiable",
      description:
        "Disfruta de pagos protegidos y confirmaciones instantáneas con la pasarela de Mercado Pago integrada.",
      image: "/carrusel/carrusel 92.png",
      imageAlt: "Pagos seguros",
    },
    {
      label: "Ofertas exclusivas",
      title: "Ahorra en los productos más buscados",
      description:
        "Encuentra descuentos seleccionados, promoción por tiempo limitado y categorías destacadas en nuestra plataforma.",
      image: "/carrusel/carrusel 93.png",
      imageAlt: "Ofertas exclusivas",
    },
    {
      label: "Variedad de productos",
      title: "Todo lo que necesitas en un solo lugar",
      description:
        "Desde frutas y verduras hasta productos de aseo y despensa, encuentra todo para tu hogar con la mejor calidad.",
      image: "/carrusel/carrusel 94.png",
      imageAlt: "Variedad de productos",
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
    <div className="min-h-screen" style={{ backgroundColor: esOscuro ? "#0d1a12" : "#ffffff", color: esOscuro ? "#e5e7eb" : "#0f172a" }}>
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          backgroundColor: esOscuro ? "#1f2b21" : "#ffffff",
          borderColor: esOscuro ? "#4f6a4b" : "#e5e7eb",
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
                border: `1px solid ${esOscuro ? "rgba(178,197,178,0.18)" : "#e5e7eb"}`,
                color: esOscuro ? "#f8fafc" : "#111827",
              }}
            />
          </div>

          {menuAbierto && (
            <div
              className="md:hidden w-full max-w-md mx-auto mt-3 rounded-[28px] border px-4 py-4 shadow-xl backdrop-blur-xl"
              style={{
                backgroundColor: esOscuro ? "rgba(31,43,33,0.96)" : "rgba(255,255,255,0.95)",
                borderColor: esOscuro ? "rgba(178,197,178,0.18)" : "rgba(226,232,240,0.9)",
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

      <main className="pb-10">
        <section
          className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-5 lg:pb-20"
          style={{
            backgroundImage: esOscuro
              ? "linear-gradient(180deg, #12351f 0%, #102016 48%, #172116 100%)"
              : "linear-gradient(180deg, #dff4dc 0%, #effaf0 48%, #ffffff 100%)",
          }}
        >
          <div
            className="relative mx-auto max-w-6xl overflow-hidden px-1 py-8 sm:px-4 lg:min-h-[470px] lg:px-0 lg:py-12"
            style={{
              color: esOscuro ? "#f8fafc" : "#111827",
            }}
          >
            <div className="absolute inset-0 opacity-[0.08] lg:-mx-20" aria-hidden="true">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent 0 18px, rgba(107,142,78,0.42) 18px 19px)",
                }}
              />
            </div>

            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
              <div className="max-w-xl">
                <span
                  className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]"
                  style={{
                    backgroundColor: esOscuro ? "rgba(183,216,163,0.14)" : "#ffffff",
                    color: esOscuro ? "#d9f99d" : "#166534",
                    border: `1px solid ${esOscuro ? "rgba(183,216,163,0.18)" : "#cdecc9"}`,
                  }}
                >
                  Mercado fresco online
                </span>

                <h1
                  className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-[56px]"
                  style={{ color: esOscuro ? "#f8fafc" : "#111827" }}
                >
                  Haz tu mercado con productos{" "}
                  <span style={{ color: "#16a34a" }}>frescos</span> para tu hogar
                </h1>

                <p
                  className="mt-5 max-w-lg text-sm font-medium leading-7 sm:text-base"
                  style={{ color: esOscuro ? "#cbd5e1" : "#3f4f46" }}
                >
                  Compra facil, encuentra ofertas y recibe tus productos sin filas.
                  Tenemos despachos dentro del horario de atencion para que tu
                  mercado llegue a tiempo.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/tienda"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl px-7 text-sm font-black text-white transition hover:brightness-110"
                    style={{ backgroundColor: "#16a34a" }}
                  >
                    Comprar ahora
                  </Link>

                  <a
                    href="#productos"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-5 text-sm font-bold transition"
                    style={{
                      backgroundColor: esOscuro ? "rgba(255,255,255,0.08)" : "#ffffff",
                      color: esOscuro ? "#f8fafc" : "#111827",
                      border: `1px solid ${esOscuro ? "rgba(79,106,75,0.20)" : "#dbe8d8"}`,
                    }}
                  >
                    Ver productos
                  </a>
                </div>

                <p
                  className="mt-6 text-sm font-semibold"
                  style={{ color: esOscuro ? "#b7d8a3" : "#166534" }}
                >
                  {HORARIO_PEDIDOS}
                </p>
              </div>

              <div className="relative min-h-[320px] sm:min-h-[390px] lg:min-h-[430px]">
                <div
                  className="absolute bottom-0 left-1/2 h-[78%] w-[76%] -translate-x-1/2 rounded-t-[120px]"
                  style={{
                    backgroundColor: esOscuro ? "rgba(22,163,74,0.28)" : "#bfe8b9",
                  }}
                  aria-hidden="true"
                />

                <img
                  src="/login.png"
                  alt="Mujer con productos frescos"
                  className="absolute bottom-0 left-1/2 z-10 h-full max-h-[430px] w-auto -translate-x-1/2 object-contain"
                />

                <div
                  className="absolute bottom-8 right-2 z-20 rounded-2xl px-4 py-3 shadow-xl sm:right-4"
                  style={{ backgroundColor: "#f97316", color: "#ffffff" }}
                >
                  <p className="text-sm font-black">Entrega</p>
                  <p className="text-[11px] font-semibold text-white/85">Rapida y segura</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl px-4 sm:px-5 pt-8">
          {/* SLIDER INDEPENDIENTE */}
          <section className="mb-10 w-full">
            <div
              className="relative overflow-hidden transition-all border"
              style={{
                backgroundColor: esOscuro ? "#142018" : "#f8faf8",
                borderColor: esOscuro ? "rgba(79,106,75,0.18)" : "#dbe5d8",
                boxShadow: esOscuro
                  ? "0 18px 50px rgba(0,0,0,0.35)"
                  : "0 16px 40px rgba(15, 23, 42, 0.12)",
              }}
            >
              <div
                className="relative aspect-[21/7] w-full min-h-[260px] overflow-hidden md:min-h-[360px] lg:min-h-[420px]"
                aria-hidden="true"
                style={{
                  backgroundColor: esOscuro ? "rgba(10,20,14,0.25)" : "#f3f8f2",
                }}
              >
                <img
                  key={slides[activeSlide].image}
                  src={encodeURI(slides[activeSlide].image)}
                  alt={slides[activeSlide].imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "center center" }}
                  draggable="false"
                  loading="eager"
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background: esOscuro
                      ? "linear-gradient(90deg, rgba(20,32,24,0.16) 0%, rgba(20,32,24,0) 20%, rgba(20,32,24,0) 80%, rgba(20,32,24,0.16) 100%)"
                      : "linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.16) 100%)",
                  }}
                />

                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-3 w-3 rounded-full transition ${
                        activeSlide === index
                          ? "bg-green-600"
                          : esOscuro
                            ? "bg-green-900"
                            : "bg-green-200"
                      }`}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
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
                <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#142018" : "#ffffff" }}>
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
                <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#142018" : "#ffffff" }}>
                  <p style={{ color: esOscuro ? "#d1d5db" : "#475569" }}>No se encontraron categorías.</p>
                </div>
              ) : (
                categorias
                  .slice(0, 8)
                  .map((categoria, index) => (
                    <CategoriaCard
                      key={categoria.Id_categoria || categoria.id || index}
                      categoria={categoria}
                      index={index}
                    />
                  ))
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
                <div className="rounded-3xl border p-8 text-center" style={{ backgroundColor: esOscuro ? "#142018" : "#ffffff" }}>
                  <p style={{ color: esOscuro ? "#d1d5db" : "#475569" }}>No hay productos para mostrar.</p>
                </div>
              ) : (
                destacados.map((producto) => <ProductoCard key={producto.Cod_Producto || producto.id || producto.Num_Documento} producto={producto} />)
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
