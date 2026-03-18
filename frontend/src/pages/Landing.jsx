import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import ProductoCard from "../components/ProductoCard";
import { ofertaService, productoService } from "../services/api";
import { aplicarOfertas } from "../utils/productos";

const categorias = [
  { icono: "🧴", nombre: "Aseo Personal" },
  { icono: "🥛", nombre: "Lacteos" },
  { icono: "🍞", nombre: "Panaderia" },
  { icono: "🥤", nombre: "Bebidas" },
  { icono: "🌾", nombre: "Granos" },
  { icono: "🍿", nombre: "Snacks" },
  { icono: "🥣", nombre: "Cereales" },
  { icono: "🫙", nombre: "Aceites" },
];

const beneficios = [
  { icono: "🚚", titulo: "Entrega agil", desc: "Tu pedido llega rapido, sin vueltas ni procesos confusos." },
  { icono: "💳", titulo: "Pago simple", desc: "Efectivo, billeteras digitales en un mismo flujo. (Nequi - Daviplata)" },
  { icono: "🏷️", titulo: "Ofertas reales", desc: "Promociones claras, visibles y faciles de aprovechar." },
  { icono: "🔒", titulo: "Compra segura", desc: "Tu informacion y tus pedidos se mantienen protegidos." },
];

const stats = [
  { valor: "8+", etiqueta: "categorias esenciales" },
  { valor: "24/7", etiqueta: "pedidos desde cualquier lugar" },
  { valor: "1 cuenta", etiqueta: "para comprar, seguir y gestionar" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargandoProductos(true);
      try {
        const [prods, ofrs] = await Promise.all([
          productoService.listar(),
          ofertaService.listar(),
        ]);
        const lista = aplicarOfertas(prods.productos || [], ofrs.ofertas || []);
        if (!cancelado) setProductos(lista.slice(0, 8));
      } catch (e) {
        console.error(e);
        if (!cancelado) setProductos([]);
      } finally {
        if (!cancelado) setCargandoProductos(false);
      }
    };

    cargar();
    return () => { cancelado = true; };
  }, []);

  return (
    <div className="min-h-screen text-slate-900 md-app-bg">
      <nav className="sticky top-0 z-30 border-b border-black/5" style={{ backgroundColor: "rgba(247, 245, 239, 0.96)" }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark className="w-11 h-11" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mercado</p>
              <p className="text-xl font-black tracking-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/productos"
              className="hidden sm:inline-block px-4 py-2.5 rounded-full text-sm font-semibold border border-slate-300 hover:border-slate-500 transition"
            >
              Ver productos
            </Link>
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-full text-sm font-semibold border border-slate-300 hover:border-slate-500 transition"
            >
              Iniciar sesion
            </Link>
            <Link
              to="/registro"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #74B495, #877FD7)" }}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-24">
            <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold mb-6 border border-[var(--md-sage)]/40" style={{ backgroundColor: "rgba(168, 200, 152, 0.18)", color: "#2f4d44" }}>
                  Mercado de barrio, experiencia mas limpia
                </div>

                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight max-w-3xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#34594f" }}
                >
                  Compra despensa diaria con una interfaz que si da confianza.
                </h1>

                <p className="text-lg md:text-xl text-slate-600 mt-6 max-w-2xl leading-relaxed">
                  Productos esenciales, ofertas visibles y un proceso sencillo para comprar sin ruido visual ni pasos innecesarios.
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                    to="/registro"
                    className="px-7 py-3.5 rounded-full font-semibold text-white shadow-md hover:-translate-y-0.5 transition"
                    style={{ background: "linear-gradient(135deg, #74B495, #877FD7)" }}
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    to="/login"
                    className="px-7 py-3.5 rounded-full font-semibold border border-slate-300 hover:bg-white/70 transition"
                  >
                    Ya tengo cuenta
                  </Link>
                  <Link
                    to="/productos"
                    className="px-7 py-3.5 rounded-full font-semibold border border-slate-300 hover:bg-white/70 transition"
                  >
                    Ver productos
                  </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-10">
                  {stats.map((item) => (
                    <div key={item.etiqueta} className="rounded-3xl p-5 border border-black/5 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.75)" }}>
                      <p className="text-2xl font-black" style={{ color: "#5b54b8" }}>{item.valor}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.etiqueta}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div
                  className="rounded-[2rem] p-6 md:p-8 shadow-2xl border border-black/5"
                  style={{ background: "linear-gradient(160deg, #74B495 0%, #877FD7 100%)" }}
                >
                  <div className="rounded-[1.5rem] p-5 md:p-6" style={{ backgroundColor: "#fffdf9" }}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Entrega destacada</p>
                        <h2 className="text-2xl font-black mt-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#4f4aa9" }}>
                          Canasta base semanal
                        </h2>
                      </div>
                      <div className="text-4xl">🥬</div>
                    </div>

                    <div className="space-y-3">
                      {[
                        ["Frutas y verduras", "Fresco del dia"],
                        ["Despensa esencial", "Arroz, aceite, granos"],
                        ["Pago flexible", "Efectivo o digital"],
                      ].map(([titulo, desc]) => (
                        <div key={titulo} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: "rgba(168, 200, 152, 0.16)" }}>
                          <div>
                            <p className="font-semibold text-slate-800">{titulo}</p>
                            <p className="text-xs text-slate-500">{desc}</p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: "#74B495" }}>OK</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl mt-5 px-5 py-4 text-white" style={{ background: "linear-gradient(135deg, #A8C898, #74B495)" }}>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/75">Promesa</p>
                      <p className="text-lg font-semibold mt-1">Menos adorno, mas claridad al momento de comprar.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Productos</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#34594f" }}>
                  Aprovecha en Mercado Digital. 👨🏻‍💻
                </h2>
              </div>
              <Link
                to="/productos"
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-slate-300 hover:bg-white/70 transition"
              >
                Ver catalogo completo
              </Link>
            </div>

            {cargandoProductos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100">
                    <div className="bg-gray-100 h-44 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="bg-gray-100 h-3 rounded-full w-1/2" />
                      <div className="bg-gray-100 h-4 rounded-full" />
                      <div className="bg-gray-100 h-8 rounded-xl mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="rounded-3xl border border-black/5 bg-white/70 p-8 text-center text-slate-500">
                No pudimos cargar productos en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productos.map((p) => (
                  <ProductoCard
                    key={p.Cod_Producto}
                    producto={p}
                    onAgregar={() => navigate(`/login?reason=cart&next=${encodeURIComponent("/productos")}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Categorias</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#4f4aa9" }}>
                  Lo que necesitas, ordenado de forma simple.
                </h2>
              </div>
              <p className="text-slate-500 max-w-xl">
                Una sola grilla, una sola paleta y categorias faciles de reconocer.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categorias.map((cat) => (
                <Link
                  key={cat.nombre}
                  to="/productos"
                  className="group rounded-3xl p-5 border border-black/5 shadow-sm hover:-translate-y-1 transition"
                  style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
                >
                  <div className="text-3xl mb-4">{cat.icono}</div>
                  <p className="font-semibold text-slate-800 group-hover:text-black">{cat.nombre}</p>
                  <p className="text-xs text-slate-500 mt-2">Ver disponibles</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div
              className="rounded-[2rem] p-8 md:p-10 border border-black/5 shadow-sm"
              style={{ background: "linear-gradient(180deg, rgba(168, 200, 152, 0.24) 0%, rgba(135, 127, 215, 0.12) 100%)" }}
            >
              <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Beneficios</p>
                  <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#34594f" }}>
                    Una experiencia mas estable y menos saturada.
                  </h2>
                </div>
                <p className="text-slate-600 max-w-xl">
                  Mantuvimos el contenido, pero lo llevamos a una composicion mas consistente.
                </p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {beneficios.map((b) => (
                  <div key={b.titulo} className="rounded-3xl p-5 border border-white/70 shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.82)" }}>
                    <div className="text-3xl mb-4">{b.icono}</div>
                    <h3 className="font-bold text-lg" style={{ color: "#74B495" }}>{b.titulo}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 pt-6">
          <div className="max-w-6xl mx-auto px-5">
            <div
              className="rounded-[2.2rem] px-8 py-10 md:px-12 md:py-14 text-white overflow-hidden relative"
              style={{ background: "linear-gradient(140deg, #74B495 0%, #877FD7 100%)" }}
            >
              <div className="relative max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Empieza hoy</p>
                <h2 className="text-3xl md:text-5xl font-black mt-3 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Menos colores peleando entre si. Mas foco en comprar.
                </h2>
                <p className="text-emerald-50/80 mt-4 text-lg">
                  Crea tu cuenta y entra a una tienda mas clara, mas ordenada y mas facil de usar.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link to="/registro" className="px-7 py-3.5 rounded-full font-semibold shadow-sm" style={{ backgroundColor: "white", color: "#6a63c8" }}>
                    Crear cuenta gratis
                  </Link>
                  <Link
                    to="/login"
                    className="px-7 py-3.5 rounded-full font-semibold border border-white/30 hover:bg-white/10 transition"
                  >
                    Entrar ahora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-6">
        <div
          className="text-white"
          style={{ background: "linear-gradient(135deg, #74B495 0%, #877FD7 100%)" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 items-center">
            <div className="text-sm leading-8 text-white/88">
              <a href="#" className="block hover:text-white transition">Terminos y condiciones</a>
              <a href="#" className="block hover:text-white transition">Politica de privacidad</a>
              <a href="#" className="block hover:text-white transition">Politica de cookies</a>
              <a href="#" className="block hover:text-white transition">Calidad y servicio</a>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/75 mt-3">Tu mercado cercano, ahora mas claro y mas facil.</p>

              <div className="flex items-center justify-center gap-3 mt-6">
                {["f", "ig", "yt", "p", "in"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold shadow-sm hover:-translate-y-0.5 transition"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="text-sm leading-8 text-white/88 md:text-right">
              <a href="#" className="block hover:text-white transition">Nosotros</a>
              <a href="#" className="block hover:text-white transition">Blog</a>
              <a href="#" className="block hover:text-white transition">Contacto</a>
              <a href="#" className="block hover:text-white transition">Preguntas frecuentes</a>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 text-white/70 text-xs">
          <div className="max-w-6xl mx-auto px-6 py-4 text-center">
            Mercado Digital | Compras del dia a dia | soporte@mercadodigital.com | +57 300 000 00 00
          </div>
        </div>
      </footer>
    </div>
  );
}
