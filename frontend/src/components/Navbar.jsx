import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import BrandMark from "./BrandMark";

export default function Navbar({ carritoCount }) {
  const { usuario, cerrarSesion, esAdmin, esEmpleado } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const count = carritoCount ?? itemsCount;

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos dias" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const handleCerrar = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/15 shadow-lg"
      style={{ background: "linear-gradient(90deg, #74B495 0%, #877FD7 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-6 text-white">
        <Link
          to={esAdmin() || esEmpleado() ? "/admin/dashboard" : "/tienda"}
          className="flex items-center gap-3 min-w-0 pr-2"
        >
          <BrandMark className="w-12 h-12" />
          <div className="leading-none min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/72 font-semibold mb-1">
              Mercado
            </p>
            <p className="md-title-serif text-[1.6rem] sm:text-[1.75rem] leading-none whitespace-nowrap">
              Digital
            </p>
          </div>
        </Link>

        {(esAdmin() || esEmpleado()) && (
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            {[
              ["/admin/dashboard", "Dashboard"],
              ["/admin/productos", "Productos"],
              ["/admin/ofertas", "Ofertas"],
              ["/admin/pedidos", "Pedidos"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-xl hover:bg-white/10 transition"
              >
                {label}
              </Link>
            ))}
            {esAdmin() && (
              <Link to="/admin/usuarios" className="px-3 py-2 rounded-xl hover:bg-white/10 transition">
                Usuarios
              </Link>
            )}
            {esAdmin() && (
              <Link to="/admin/reportes" className="px-3 py-2 rounded-xl hover:bg-white/10 transition">
                Reportes
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!esAdmin() && !esEmpleado() && (
            <Link
              to="/carrito"
              className="relative w-11 h-11 rounded-2xl transition hover:bg-white/10 flex items-center justify-center flex-shrink-0"
              aria-label="Carrito"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-xl leading-none">🛍️</span>
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[11px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold"
                  style={{ background: "linear-gradient(135deg, #A8C898, #877FD7)" }}
                >
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[1.35rem] transition hover:bg-white/12 min-w-[220px]"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(255,255,255,0.14)" }}>
                👋
              </div>
              <div className="hidden sm:block text-left min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/68 font-semibold">{saludo}</p>
                <p className="max-w-36 truncate font-semibold text-[1.05rem] leading-none mt-1">
                  {usuario?.Nombre}
                </p>
              </div>
              <span className="text-xs opacity-70 flex-shrink-0">▾</span>
            </button>

            {menuAbierto && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-3xl overflow-hidden shadow-2xl border border-black/5"
                style={{ backgroundColor: "#fffdf8" }}
              >
                <div className="px-5 py-4 text-white" style={{ background: "linear-gradient(135deg, #74B495, #877FD7)" }}>
                  <p className="font-bold text-sm truncate">{usuario?.Nombre} {usuario?.Apellido}</p>
                  <p className="text-xs text-white/75 mt-1">{usuario?.rol}</p>
                </div>
                <div className="p-2 text-slate-700">
                  <Link to="/perfil" onClick={() => setMenuAbierto(false)} className="block px-4 py-3 rounded-2xl text-sm hover:bg-slate-50 transition">
                    Mi perfil
                  </Link>
                  {!esAdmin() && !esEmpleado() && (
                    <Link to="/mis-pedidos" onClick={() => setMenuAbierto(false)} className="block px-4 py-3 rounded-2xl text-sm hover:bg-slate-50 transition">
                      Mis pedidos
                    </Link>
                  )}
                  <button
                    onClick={handleCerrar}
                    className="w-full text-left px-4 py-3 rounded-2xl text-sm text-rose-600 hover:bg-rose-50 transition"
                  >
                    Cerrar sesion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
