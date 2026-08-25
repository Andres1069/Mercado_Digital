// frontend/src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GlobalErrorProvider } from "./context/ErrorContext";
import { BellRing, Clock3, PackageCheck, X } from "lucide-react";
import { pedidoService } from "./services/api";
import ErrorPage from "./components/errors/ErrorPage";
import LoadingScreen from "./components/LoadingScreen";

// Paginas publicas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

// Paginas cliente
import Tienda from "./pages/Tienda";
import Carrito from "./pages/Carrito";
import MisPedidos from "./pages/MisPedidos";
import Perfil from "./pages/Perfil";

// Paginas domicilio
import CrearDomicilio from "./pages/Domicilio/CrearDomicilio";
import HistorialDomicilios from "./pages/Domicilio/HistorialDomicilios";
import Seguimiento from "./pages/Domicilio/Seguimiento";

// Paginas pago
import PagoQR from "./pages/PagoQR";
import PagoResultado from "./pages/PagoResultado";
import PagoSimulado from "./pages/PagoSimulado";

// Paginas admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOfertas from "./pages/admin/AdminOfertas";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminVentas from "./pages/admin/AdminVentas";
import AdminInventario from "./pages/admin/AdminInventario";
import AdminDomicilios from "./pages/admin/AdminDomicilios";
import AdminPagos from "./pages/admin/AdminPagos";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminProveedores from "./pages/admin/AdminProveedores";
import RouteTitle from "./components/RouteTitle";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

const ESTADOS_PENDIENTES_ADMIN = ["pendiente", "preparando", "en preparacion", "en proceso", "procesando", "confirmado"];

function esPedidoPendienteAdmin(pedido) {
  const estado = String(pedido.Estado_Pedido || "Pendiente").trim().toLowerCase();
  return ESTADOS_PENDIENTES_ADMIN.some((pendiente) => estado.includes(pendiente));
}

function AdminPendingOrdersNotice() {
  const { usuario, token, esAdmin, cargando } = useAuth();
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [visible, setVisible] = useState(false);

  const storageKey = useMemo(
    () => `md_admin_pending_notice_${token || usuario?.Num_Documento || usuario?.correo || "admin"}`,
    [token, usuario]
  );

  useEffect(() => {
    if (cargando || !usuario || !esAdmin()) return;
    if (sessionStorage.getItem(storageKey) === "visto") return;

    let cancelado = false;

    const cargarPendientes = async () => {
      try {
        // silent: es una notificación de fondo, no debe interrumpir al admin si falla.
        const res = await pedidoService.todos({ silent: true });
        if (cancelado) return;

        const pendientes = (res.pedidos || [])
          .filter(esPedidoPendienteAdmin)
          .sort((a, b) => new Date(b.Fecha_Pedido || 0) - new Date(a.Fecha_Pedido || 0));

        setPedidosPendientes(pendientes);
        setVisible(pendientes.length > 0);
        sessionStorage.setItem(storageKey, "visto");
      } catch {
        // Si falla la consulta, evitamos bloquear el ingreso del administrador.
      }
    };

    const id = window.setTimeout(cargarPendientes, 450);
    return () => {
      cancelado = true;
      window.clearTimeout(id);
    };
  }, [cargando, esAdmin, storageKey, token, usuario]);

  if (!visible) return null;

  const recientes = pedidosPendientes.slice(0, 3);
  const total = pedidosPendientes.length;

  return (
    <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-[#5f7658]/60 dark:bg-[#1f2b21] dark:shadow-black/40">
      <div className="flex items-start gap-3 bg-gradient-to-br from-amber-50 via-white to-white p-4 dark:from-[#263524] dark:via-[#1f2b21] dark:to-[#1f2b21]">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
          <BellRing className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                {total === 1 ? "Hay 1 pedido pendiente" : `Hay ${total} pedidos pendientes`}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
                Revisa los pedidos que aun necesitan gestion.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#263524] dark:hover:text-[#f3f7ed]"
              aria-label="Cerrar notificacion"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {recientes.map((pedido) => {
              const nombre = `${pedido.Nombre || ""} ${pedido.Apellido || ""}`.trim() || "Cliente";
              return (
                <div key={pedido.Cod_Pedido} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 px-3 py-2 dark:border-[#4f6a4b] dark:bg-[#263524]/80">
                  <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      Pedido #{pedido.Cod_Pedido} · {nombre}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{pedido.Estado_Pedido || "Pendiente"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/admin/pedidos"
            onClick={() => setVisible(false)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3C5148] px-3 py-2.5 text-sm font-bold text-white transition hover:brightness-110 dark:bg-lime-600 dark:text-slate-950"
          >
            <PackageCheck className="h-4 w-4" />
            Ver pedidos pendientes
          </Link>
        </div>
      </div>
    </div>
  );
}

// "Ir al inicio" de la pantalla 403 debe llevar al panel que sí le corresponde al usuario.
function inicioPorRol(esAdmin, esEmpleado) {
  if (esAdmin()) return "/admin/dashboard";
  if (esEmpleado()) return "/empleado/dashboard";
  return "/tienda";
}

function RutaPrivada({ children }) {
  const { estaLogueado, cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  return estaLogueado() ? children : <ErrorPage tipo="UNAUTHORIZED" />;
}

// Solo administrador
function RutaAdmin({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  if (!estaLogueado()) return <ErrorPage tipo="UNAUTHORIZED" />;
  if (!esAdmin()) return <ErrorPage tipo="FORBIDDEN" inicioHref={inicioPorRol(esAdmin, esEmpleado)} />;
  return children;
}

// Solo empleado
function RutaEmpleado({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  if (!estaLogueado()) return <ErrorPage tipo="UNAUTHORIZED" />;
  if (!esEmpleado()) return <ErrorPage tipo="FORBIDDEN" inicioHref={inicioPorRol(esAdmin, esEmpleado)} />;
  return children;
}

function RutaStaff({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  if (!estaLogueado()) return <ErrorPage tipo="UNAUTHORIZED" />;
  if (!esAdmin() && !esEmpleado()) return <ErrorPage tipo="FORBIDDEN" inicioHref={inicioPorRol(esAdmin, esEmpleado)} />;
  return children;
}

function RutaSoloPublica({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  if (estaLogueado()) {
    if (esAdmin())    return <Navigate to="/admin/dashboard" />;
    if (esEmpleado()) return <Navigate to="/empleado/dashboard" />;
    return <Navigate to="/tienda" />;
  }
  return children;
}


function AppRoutes() {
  return (
    <>
      <RouteTitle />
      <Routes>
        {/* Publicas */}
        <Route path="/" element={<RutaSoloPublica><Landing /></RutaSoloPublica>} />
        <Route path="/login" element={<RutaSoloPublica><Login /></RutaSoloPublica>} />
        <Route path="/registro" element={<RutaSoloPublica><Registro /></RutaSoloPublica>} />

        {/* Cliente */}
        <Route path="/tienda" element={<RutaPrivada><Tienda /></RutaPrivada>} />
        <Route path="/comprar" element={<Navigate to="/tienda" />} />
        <Route path="/carrito" element={<RutaPrivada><Carrito /></RutaPrivada>} />
        <Route path="/mi-carrito" element={<Navigate to="/carrito" />} />
        <Route path="/mis-pedidos" element={<RutaPrivada><MisPedidos /></RutaPrivada>} />
        <Route path="/pedidos" element={<Navigate to="/mis-pedidos" />} />
        <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />

        {/* Pago */}
        <Route path="/pago/qr"       element={<RutaPrivada><PagoQR /></RutaPrivada>} />
        <Route path="/pago/mercadopago" element={<Navigate to="/pago/qr" />} />
        <Route path="/pago/resultado" element={<RutaPrivada><PagoResultado /></RutaPrivada>} />
        <Route path="/pago/simulado" element={<RutaPrivada><PagoSimulado /></RutaPrivada>} />

        {/* Domicilio cliente */}
        <Route path="/domicilio/crear" element={<RutaPrivada><CrearDomicilio /></RutaPrivada>} />
        <Route path="/domicilio/registrar-entrega" element={<Navigate to="/domicilio/crear" />} />
        <Route path="/domicilio/historial" element={<RutaPrivada><HistorialDomicilios /></RutaPrivada>} />
        <Route path="/domicilio/seguimiento" element={<RutaPrivada><Seguimiento /></RutaPrivada>} />

        {/* Admin (solo Administrador) */}
        <Route path="/admin/dashboard"   element={<RutaAdmin><AdminDashboard /></RutaAdmin>} />
        <Route path="/admin/inicio"      element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/productos"   element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
        <Route path="/admin/ofertas"     element={<RutaAdmin><AdminOfertas /></RutaAdmin>} />
        <Route path="/admin/pedidos"     element={<RutaAdmin><AdminPedidos /></RutaAdmin>} />
        <Route path="/admin/gestion-pedidos" element={<Navigate to="/admin/pedidos" />} />
        <Route path="/admin/ventas"      element={<RutaStaff><AdminVentas /></RutaStaff>} />
        <Route path="/admin/ventas-en-tienda" element={<Navigate to="/admin/ventas" />} />
        <Route path="/admin/inventario"  element={<RutaAdmin><AdminInventario /></RutaAdmin>} />
        <Route path="/admin/domicilios"  element={<RutaAdmin><AdminDomicilios /></RutaAdmin>} />
        <Route path="/admin/entregas"    element={<Navigate to="/admin/domicilios" />} />
        <Route path="/admin/reportes"    element={<RutaAdmin><AdminReportes /></RutaAdmin>} />
        <Route path="/admin/reportes-ventas" element={<Navigate to="/admin/reportes" />} />
        <Route path="/admin/pagos"       element={<RutaAdmin><AdminPagos /></RutaAdmin>} />
        <Route path="/admin/usuarios"    element={<RutaAdmin><AdminUsuarios /></RutaAdmin>} />
        <Route path="/admin/categorias"  element={<RutaAdmin><AdminCategorias /></RutaAdmin>} />
        <Route path="/admin/proveedores" element={<RutaAdmin><AdminProveedores /></RutaAdmin>} />

        {/* Empleado (solo Empleado) */}
        <Route path="/empleado/dashboard"  element={<RutaEmpleado><AdminDashboard /></RutaEmpleado>} />
        <Route path="/empleado/inicio"     element={<Navigate to="/empleado/dashboard" />} />
        <Route path="/empleado/productos"  element={<RutaEmpleado><AdminProductos /></RutaEmpleado>} />
        <Route path="/empleado/pedidos"    element={<RutaEmpleado><AdminPedidos /></RutaEmpleado>} />
        <Route path="/empleado/gestion-pedidos" element={<Navigate to="/empleado/pedidos" />} />
        <Route path="/empleado/ventas"     element={<RutaStaff><AdminVentas /></RutaStaff>} />
        <Route path="/empleado/ventas-en-tienda" element={<Navigate to="/empleado/ventas" />} />
        <Route path="/empleado/inventario" element={<RutaEmpleado><AdminInventario /></RutaEmpleado>} />
        <Route path="/empleado/domicilios" element={<RutaEmpleado><AdminDomicilios /></RutaEmpleado>} />
        <Route path="/empleado/entregas"   element={<Navigate to="/empleado/domicilios" />} />
        <Route path="/empleado/reportes"   element={<RutaEmpleado><AdminReportes /></RutaEmpleado>} />
        <Route path="/empleado/reportes-ventas" element={<Navigate to="/empleado/reportes" />} />

        {/* 404 */}
        <Route path="*" element={<ErrorPage tipo="NOT_FOUND" />} />
      </Routes>
    </>
  );
}

function AppContent() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <AppRoutes />
      </div>
      {location.pathname === "/" && <Footer />}
      <AdminPendingOrdersNotice />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <GlobalErrorProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </GlobalErrorProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
