import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ carritoCount }) {
  const { usuario, cerrarSesion, esAdmin, esEmpleado } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const count = carritoCount ?? itemsCount;
  const rolUsuario = usuario?.rol || (usuario ? "Sin rol" : "Invitado");

  const handleCerrar = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/15 shadow-lg"
      style={{ background: "linear-gradient(90deg, #1B2727 0%, #3C5148 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 text-white">
        <Link
          to={esAdmin() ? "/admin/dashboard" : esEmpleado() ? "/empleado/dashboard" : "/tienda"}
          className="flex items-center gap-3 min-w-0 pr-2"
        >
          <BrandMark className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="leading-none min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/72 font-semibold mb-1">
              Mercado
            </p>
            <p className="md-title-serif text-[1.35rem] sm:text-[1.75rem] leading-none whitespace-nowrap">
              Digital
            </p>
          </div>
        </Link>

        {/* Links admin — sidebar cubre móvil/tablet */}
        {esAdmin() && (
          <div className="hidden xl:flex items-center gap-1 text-xs font-medium overflow-hidden">
            {[
              ["/admin/dashboard",   "Dashboard"],
              ["/admin/productos",   "Productos"],
              ["/admin/ofertas",     "Ofertas"],
              ["/admin/pedidos",     "Pedidos"],
              ["/admin/pagos",       "Pagos"],
              ["/admin/inventario",  "Inventario"],
              ["/admin/domicilios",  "Domicilios"],
              ["/admin/reportes",    "Reportes"],
              ["/admin/usuarios",    "Usuarios"],
              ["/admin/categorias",  "Categorias"],
              ["/admin/proveedores", "Proveedores"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Links empleado */}
        {esEmpleado() && (
          <div className="hidden md:flex items-center gap-1 text-xs font-medium">
            {[
              ["/empleado/dashboard",  "Dashboard"],
              ["/empleado/pedidos",    "Pedidos"],
              ["/empleado/inventario", "Inventario"],
              ["/empleado/domicilios", "Domicilios"],
              ["/empleado/reportes",   "Reportes"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {!esAdmin() && !esEmpleado() && (
            <ThemeToggle
              iconOnly
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl text-white hover:bg-white/10 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
          )}

          {!esAdmin() && !esEmpleado() && (
            <Link
              to="/carrito"
              className="navbar-cart-button relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition hover:bg-white/10 flex items-center justify-center flex-shrink-0"
              aria-label="Carrito"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <i className="fa-solid fa-cart-shopping text-lg leading-none" aria-hidden="true" />
              <span className="text-xl leading-none">🛍️</span>
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[11px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold"
                  style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}
                >
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-[1.35rem] transition hover:bg-white/12"
              style={{ background: "rgba(213,221,223,0.15)" }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(255,255,255,0.14)" }}>
                👋
              </div>
              <div className="hidden sm:block text-left min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-normal text-white/68 font-semibold">{rolUsuario}</p>
                <p className="max-w-36 truncate font-semibold text-[1.05rem] leading-none mt-1">
                  {usuario?.Nombre}
                </p>
              </div>
              <span className="text-xs opacity-70 flex-shrink-0">▾</span>
            </button>

            {menuAbierto && (
              <div
                className="absolute right-0 mt-2 w-56 sm:w-60 rounded-3xl overflow-hidden shadow-2xl border border-black/5"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <div className="px-5 py-4 text-white" style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}>
                  <p className="font-bold text-sm truncate">{usuario?.Nombre} {usuario?.Apellido}</p>
                  <p className="text-xs text-white/80 mt-1 uppercase tracking-normal font-semibold">{rolUsuario}</p>
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
