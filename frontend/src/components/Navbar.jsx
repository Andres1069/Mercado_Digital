import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar({ carritoCount }) {
  const { usuario, cerrarSesion, esAdmin, esEmpleado } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const count = carritoCount ?? itemsCount;

  const handleCerrar = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <nav
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to={esAdmin() || esEmpleado() ? "/admin/dashboard" : "/tienda"}
          className="flex items-center gap-2 font-extrabold text-xl tracking-tight"
        >
          <span className="text-2xl">MD</span>
          <span className="hidden sm:block">Mercado Digital</span>
        </Link>

        {!esAdmin() && !esEmpleado() && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/tienda" className="hover:text-white/70 transition">Productos</Link>
            <Link
              to="/tienda?ofertas=1"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold transition hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}
            >
              Ofertas
            </Link>
          </div>
        )}

        {(esAdmin() || esEmpleado()) && (
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link to="/admin/dashboard" className="hover:text-white/70 transition">Dashboard</Link>
            <Link to="/admin/productos" className="hover:text-white/70 transition">Productos</Link>
            <Link to="/admin/ofertas" className="hover:text-white/70 transition">Ofertas</Link>
            <Link to="/admin/pedidos" className="hover:text-white/70 transition">Pedidos</Link>
            {esAdmin() && <Link to="/admin/reportes" className="hover:text-white/70 transition">Reportes</Link>}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!esAdmin() && !esEmpleado() && (
            <Link to="/carrito" className="relative p-2 rounded-xl transition hover:bg-white/20" aria-label="Carrito">
              <span className="text-xl">Cart</span>
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}
                >
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition text-sm font-medium hover:bg-white/20 bg-white/10"
            >
              <span>User</span>
              <span className="hidden sm:block max-w-24 truncate">{usuario?.Nombre}</span>
              <span className="text-xs opacity-70">v</span>
            </button>

            {menuAbierto && (
              <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div
                  className="px-4 py-3 border-b"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  <p className="font-bold text-sm text-white truncate">{usuario?.Nombre} {usuario?.Apellido}</p>
                  <p className="text-xs text-white/70">{usuario?.rol}</p>
                </div>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                  className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                >
                  Mi perfil
                </Link>
                {!esAdmin() && !esEmpleado() && (
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMenuAbierto(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                  >
                    Mis pedidos
                  </Link>
                )}
                <button
                  onClick={handleCerrar}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t"
                >
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
