import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ carritoCount }) {
  const { usuario, cerrarSesion, esAdmin, esEmpleado } = useAuth();
  const { itemsCount } = useCart();
  const { esOscuro } = useTheme();

  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const estaLogueado = Boolean(usuario);

  const count = carritoCount ?? itemsCount;

  const rolUsuario =
    usuario?.rol || (estaLogueado ? "Invitado" : "Invitado");

  const handleCerrar = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b shadow-lg backdrop-blur-xl"
      style={{
        backgroundColor: esOscuro
          ? "rgba(15,23,42,0.92)"
          : "rgba(255,255,255,0.92)",
        borderColor: esOscuro
          ? "rgba(148,163,184,0.12)"
          : "#e5e7eb",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-3 sm:px-5 py-3 flex items-center gap-3 sm:gap-4"
        style={{
          color: esOscuro ? "#f8fafc" : "#111827",
        }}
      >
        {/* LOGO */}
        <Link
          to={
            esAdmin()
              ? "/admin/dashboard"
              : esEmpleado()
              ? "/empleado/dashboard"
              : "/"
          }
          className="flex items-center shrink-0"
        >
          <img
            src={esOscuro ? "/Logo-Mercado-Digital-Blanco.png" : "/Logo-Mercado-Digital.png"}
            alt="Mercado Digital"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </Link>

        {/* LINKS ADMIN */}
        {esAdmin() && (
          <div className="hidden xl:flex items-center gap-1 text-xs font-medium overflow-hidden">
            {[
              ["/admin/dashboard", "Dashboard"],
              ["/admin/productos", "Productos"],
              ["/admin/ofertas", "Ofertas"],
              ["/admin/pedidos", "Pedidos"],
              ["/admin/pagos", "Pagos"],
              ["/admin/inventario", "Inventario"],
              ["/admin/domicilios", "Domicilios"],
              ["/admin/reportes", "Reportes"],
              ["/admin/usuarios", "Usuarios"],
              ["/admin/categorias", "Categorías"],
              ["/admin/proveedores", "Proveedores"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-xl transition whitespace-nowrap"
                style={{
                  color: esOscuro ? "#e2e8f0" : "#334155",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = esOscuro
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* LINKS EMPLEADO */}
        {esEmpleado() && (
          <div className="hidden md:flex items-center gap-1 text-xs font-medium">
            {[
              ["/empleado/dashboard", "Dashboard"],
              ["/empleado/pedidos", "Pedidos"],
              ["/empleado/inventario", "Inventario"],
              ["/empleado/domicilios", "Domicilios"],
              ["/empleado/reportes", "Reportes"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-xl transition whitespace-nowrap"
                style={{
                  color: esOscuro ? "#e2e8f0" : "#334155",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = esOscuro
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* BOTONES CLIENTE */}
        {!esAdmin() && !esEmpleado() && !estaLogueado && (
          <div className="flex flex-wrap items-center gap-3">
            {/* EXPLORAR */}
            <Link
              to="/tienda"
              className="group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300"
              style={{
                background: esOscuro
                  ? "rgba(255,255,255,0.06)"
                  : "#f8fafc",
                border: `1px solid ${
                  esOscuro
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0"
                }`,
                color: esOscuro ? "#ffffff" : "#111827",
              }}
            >
              <span className="text-base transition-transform group-hover:scale-110">
                🛒
              </span>

              <span>Explorar</span>
            </Link>

            {/* LOGIN */}
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: esOscuro
                  ? "rgba(107,142,78,0.12)"
                  : "#f0fdf4",
                border: `1px solid ${
                  esOscuro
                    ? "rgba(107,142,78,0.25)"
                    : "#bbf7d0"
                }`,
                color: "#6B8E4E",
              }}
            >
              <span className="text-base transition-transform group-hover:-translate-y-0.5">
                🔐
              </span>

              <span>Iniciar sesión</span>
            </Link>

            {/* REGISTRO */}
            <Link
              to="/registro"
              className="group flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #6B8E4E 0%, #3C5148 100%)",
              }}
            >
              <span className="text-base transition-transform group-hover:rotate-6">
                ✨
              </span>

              <span>Registrarse</span>
            </Link>
          </div>
        )}

        {/* DERECHA */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* THEME TOGGLE */}
          {!esAdmin() && !esEmpleado() && (
            <ThemeToggle
              iconOnly
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl transition flex items-center justify-center"
              style={{
                background: esOscuro
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(15,23,42,0.05)",
                color: esOscuro ? "#ffffff" : "#111827",
              }}
            />
          )}

          {/* CARRITO */}
          {!esAdmin() && !esEmpleado() && (
            <Link
              to="/carrito"
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition flex items-center justify-center"
              aria-label="Carrito"
              style={{
                background: esOscuro
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(15,23,42,0.05)",
                color: esOscuro ? "#ffffff" : "#111827",
              }}
            >
              <span className="text-xl leading-none">🛍️</span>

              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[11px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B8E4E, #3C5148)",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          )}

          {/* MENÚ USUARIO */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-[1.35rem] transition"
              style={{
                background: esOscuro
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(15,23,42,0.05)",
              }}
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: esOscuro
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(15,23,42,0.06)",
                }}
              >
                👋
              </div>

              <div className="hidden sm:block text-left min-w-0 flex-1">
                <p
                  className="text-[10px] uppercase tracking-normal font-semibold"
                  style={{
                    color: esOscuro ? "#94a3b8" : "#64748b",
                  }}
                >
                  {rolUsuario}
                </p>

                <p className="max-w-36 truncate font-semibold text-[1.05rem] leading-none mt-1">
                  {estaLogueado
                    ? usuario?.Nombre
                    : "Bienvenido"}
                </p>
              </div>

              <span
                className="text-xs flex-shrink-0"
                style={{
                  opacity: 0.7,
                }}
              >
                ▾
              </span>
            </button>

            {menuAbierto && (
              <div
                className="absolute right-0 mt-2 w-56 sm:w-60 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  backgroundColor: esOscuro
                    ? "#111827"
                    : "#ffffff",
                  border: `1px solid ${
                    esOscuro
                      ? "rgba(148,163,184,0.12)"
                      : "#e5e7eb"
                  }`,
                }}
              >
                {estaLogueado ? (
                  <>
                    <div
                      className="px-5 py-4 text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #6B8E4E, #3C5148)",
                      }}
                    >
                      <p className="font-bold text-sm truncate">
                        {usuario?.Nombre} {usuario?.Apellido}
                      </p>

                      <p className="text-xs text-white/80 mt-1 uppercase font-semibold">
                        {rolUsuario}
                      </p>
                    </div>

                    <div
                      className="p-2"
                      style={{
                        color: esOscuro
                          ? "#e5e7eb"
                          : "#334155",
                      }}
                    >
                      <Link
                        to="/perfil"
                        onClick={() => setMenuAbierto(false)}
                        className="block px-4 py-3 rounded-2xl text-sm"
                      >
                        Mi perfil
                      </Link>

                      {!esAdmin() && !esEmpleado() && (
                        <Link
                          to="/mis-pedidos"
                          onClick={() =>
                            setMenuAbierto(false)
                          }
                          className="block px-4 py-3 rounded-2xl text-sm"
                        >
                          Mis pedidos
                        </Link>
                      )}

                      <button
                        onClick={handleCerrar}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm"
                        style={{
                          color: "#e11d48",
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="p-2"
                    style={{
                      color: esOscuro
                        ? "#e5e7eb"
                        : "#334155",
                    }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMenuAbierto(false)}
                      className="block px-4 py-3 rounded-2xl text-sm"
                    >
                      Iniciar sesión
                    </Link>

                    <Link
                      to="/registro"
                      onClick={() => setMenuAbierto(false)}
                      className="block px-4 py-3 rounded-2xl text-sm"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}