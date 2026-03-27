import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

/* ── Íconos SVG ─────────────────────────────────────────── */
const Ico = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  productos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  ofertas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  pedidos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  pagos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  inventario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  domicilios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  reportes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  config: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  categorias: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  proveedores: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  perfil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const LINKS_ADMIN = [
  { to: "/admin/dashboard",    label: "Dashboard",     icon: Ico.dashboard,   color: "#6B8E4E" },
  { to: "/admin/productos",    label: "Productos",     icon: Ico.productos,   color: "#6B8E4E" },
  { to: "/admin/ofertas",      label: "Ofertas",       icon: Ico.ofertas,     color: "#D5DDDF" },
  { to: "/admin/pedidos",      label: "Pedidos",       icon: Ico.pedidos,     color: "#6B8E4E" },
  { to: "/admin/pagos",        label: "Pagos",         icon: Ico.pagos,       color: "#6B8E4E" },
  { to: "/admin/inventario",   label: "Inventario",    icon: Ico.inventario,  color: "#D5DDDF" },
  { to: "/admin/domicilios",   label: "Domicilios",    icon: Ico.domicilios,  color: "#B2C5B2" },
  { to: "/admin/reportes",     label: "Reportes",      icon: Ico.reportes,    color: "#B2C5B2" },
  { to: "/admin/usuarios",     label: "Usuarios",      icon: Ico.usuarios,    color: "#B2C5B2" },
  { to: "/admin/metodos-pago", label: "Config. Pagos", icon: Ico.config,      color: "#B2C5B2" },
  { to: "/admin/categorias",   label: "Categorias",    icon: Ico.categorias,  color: "#6B8E4E" },
  { to: "/admin/proveedores",  label: "Proveedores",   icon: Ico.proveedores, color: "#B2C5B2" },
];

const LINKS_EMPLEADO = [
  { to: "/empleado/dashboard",  label: "Dashboard",  icon: Ico.dashboard,  color: "#6B8E4E" },
  { to: "/empleado/productos",  label: "Productos",  icon: Ico.productos,  color: "#6B8E4E" },
  { to: "/empleado/pedidos",    label: "Pedidos",    icon: Ico.pedidos,    color: "#6B8E4E" },
  { to: "/empleado/inventario", label: "Inventario", icon: Ico.inventario, color: "#D5DDDF" },
  { to: "/empleado/domicilios", label: "Domicilios", icon: Ico.domicilios, color: "#B2C5B2" },
  { to: "/empleado/reportes",   label: "Reportes",   icon: Ico.reportes,   color: "#B2C5B2" },
];

export default function Sidebar() {
  const { usuario, esEmpleado, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const esEmp = esEmpleado();
  const links = esEmp ? LINKS_EMPLEADO : LINKS_ADMIN;

  const cerrar = () => setAbierto(false);
  const handleLogout = () => { cerrarSesion(); navigate("/"); };

  const inicial = (usuario?.Nombre?.[0] || "U").toUpperCase();

  function Contenido() {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "#3C5148", borderRight: "1px solid rgba(107,142,78,0.2)" }}>

        {/* Logo */}
        <Link
          to={esEmp ? "/empleado/dashboard" : "/admin/dashboard"}
          onClick={cerrar}
          className="flex items-center gap-3 px-5 py-5 hover:bg-white/5 transition"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1B2727, #6B8E4E)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-base leading-none">Mercado</p>
            <p className="text-[11px] font-semibold leading-none mt-0.5" style={{ color: "#6B8E4E" }}>Digital Admin</p>
          </div>
        </Link>

        {/* Separador */}
        <div className="mx-4 border-t" style={{ borderColor: "rgba(107,142,78,0.12)" }} />

        {/* Usuario */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(107,142,78,0.12)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #1B2727, #6B8E4E)" }}>
              {inicial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: "#D5DDDF" }}>
                {usuario?.Nombre} {usuario?.Apellido}
              </p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#6B8E4E" }}>
                {esEmp ? "Empleado" : "Administrador"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <p className="px-5 text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "rgba(213,221,223,0.35)" }}>
          Menú
        </p>

        {/* Navegación */}
        <nav
          className="flex-1 px-3 overflow-y-auto space-y-0.5 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {links.map(({ to, label, icon, color }) => {
            const activo = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={cerrar}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={
                  activo
                    ? { backgroundColor: "rgba(107,142,78,0.22)", color: "#fff", borderLeft: `3px solid ${color}`, paddingLeft: "9px" }
                    : { color: "rgba(213,221,223,0.65)" }
                }
                onMouseEnter={(e) => { if (!activo) e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { if (!activo) { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "rgba(213,221,223,0.65)"; }}}
              >
                <span style={{ color: activo ? color : "inherit" }}>{icon}</span>
                <span className="flex-1 truncate">{label}</span>
                {activo && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Separador */}
        <div className="mx-4 border-t" style={{ borderColor: "rgba(107,142,78,0.12)" }} />

        {/* Footer */}
        <div className="p-3 space-y-0.5">
          <ThemeToggle
            className="w-full justify-start px-3 py-2.5 rounded-xl text-sm"
            style={{
              backgroundColor: "rgba(107,142,78,0.08)",
              border: "1px solid rgba(107,142,78,0.16)",
              color: "#D5DDDF",
            }}
          />
          <Link
            to="/perfil"
            onClick={cerrar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ color: "rgba(213,221,223,0.65)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "rgba(213,221,223,0.65)"; }}
          >
            {Ico.perfil}
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left"
            style={{ color: "rgba(213,221,223,0.65)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "rgba(213,221,223,0.65)"; }}
          >
            {Ico.logout}
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block w-60 flex-shrink-0">
        <div className="fixed left-0 top-0 h-screen w-60 z-30 flex flex-col">
          <Contenido />
        </div>
      </aside>

      {/* Mobile: botón hamburguesa */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #1B2727, #6B8E4E)" }}
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir menu"
      >
        {abierto
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        }
      </button>

      {/* Mobile: overlay + sidebar */}
      {abierto && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={cerrar} />
          <aside className="md:hidden fixed left-0 top-0 h-full w-60 z-50 flex flex-col shadow-2xl">
            <Contenido />
          </aside>
        </>
      )}
    </>
  );
}
