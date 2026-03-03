// frontend/src/pages/Landing.jsx
// Página pública de presentación (sin login requerido)

import { Link } from "react-router-dom";

const categorias = [
  { icono: "🧴", nombre: "Aseo Personal" },
  { icono: "🥛", nombre: "Lácteos" },
  { icono: "🍞", nombre: "Panadería" },
  { icono: "🥤", nombre: "Bebidas" },
  { icono: "🌾", nombre: "Granos" },
  { icono: "🍿", nombre: "Snacks" },
  { icono: "🥣", nombre: "Cereales" },
  { icono: "🫙", nombre: "Aceites" },
];

const beneficios = [
  { icono: "🚀", titulo: "Entrega rápida", desc: "Recibe tu pedido en la puerta de tu casa." },
  { icono: "💳", titulo: "Múltiples pagos", desc: "Efectivo, Nequi, Daviplata, Tarjeta." },
  { icono: "🏷️", titulo: "Mejores precios", desc: "Ofertas y descuentos todos los días." },
  { icono: "🔒", titulo: "Compra segura", desc: "Tu información siempre protegida." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="text-white px-6 py-4 flex justify-between items-center shadow-lg" style={{ backgroundColor: "#74B495" }}>
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>🛒</span>
          <span>Mercado Digital</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"
            className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium">
            Iniciar sesión
          </Link>
          <Link to="/registro"
            className="px-4 py-2 rounded-lg transition text-sm font-bold"
            style={{ backgroundColor: "#F5E7C5", color: "#74B495" }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="text-white py-20 px-6 text-center" style={{ background: "linear-gradient(135deg, #A8C898, #74B495)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Tu mercado favorito, <br /> ahora en línea 🛍️
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Compra productos frescos y de despensa desde la comodidad de tu hogar.
            Entrega a domicilio, pagos fáciles y los mejores precios.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/registro"
              className="font-bold px-8 py-3 rounded-full hover:opacity-90 transition text-lg shadow"
              style={{ backgroundColor: "#F5E7C5", color: "#74B495" }}>
              Empezar a comprar
            </Link>
            <Link to="/login"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/20 transition text-lg">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categorías ─────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#F5E7C5" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">¿Qué necesitas hoy?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categorias.map((cat) => (
              <Link key={cat.nombre} to="/login"
                className="bg-white rounded-2xl p-6 text-center shadow hover:shadow-md hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="text-4xl mb-2">{cat.icono}</div>
                <p className="font-medium text-gray-700">{cat.nombre}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beneficios ─────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map((b) => (
              <div key={b.titulo} className="text-center p-6 rounded-2xl" style={{ backgroundColor: "#F3CCB8" }}>
                <div className="text-4xl mb-3">{b.icono}</div>
                <h3 className="font-bold mb-1" style={{ color: "#74B495" }}>{b.titulo}</h3>
                <p className="text-gray-500 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <section className="text-white py-16 px-6 text-center" style={{ backgroundColor: "#877FD7" }}>
        <h2 className="text-3xl font-bold mb-4">¿Listo para comprar?</h2>
        <p className="text-white/80 mb-8">Créate una cuenta gratis y empieza a disfrutar.</p>
        <Link to="/registro"
          className="font-bold px-8 py-3 rounded-full hover:opacity-90 transition text-lg"
          style={{ backgroundColor: "#F5E7C5", color: "#877FD7" }}>
          Crear cuenta gratis
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-6 text-center text-sm">
        <p>© 2025 Mercado Digital. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
