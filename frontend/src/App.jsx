// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

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

// Paginas admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOfertas from "./pages/admin/AdminOfertas";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminInventario from "./pages/admin/AdminInventario";
import AdminDomicilios from "./pages/admin/AdminDomicilios";
import AdminPagos from "./pages/admin/AdminPagos";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminProveedores from "./pages/admin/AdminProveedores";
import RouteTitle from "./components/RouteTitle";

function RutaPrivada({ children }) {
  const { estaLogueado, cargando } = useAuth();
  if (cargando) return null;
  return estaLogueado() ? children : <Navigate to="/login" />;
}

// Solo administrador
function RutaAdmin({ children }) {
  const { estaLogueado, esAdmin, cargando } = useAuth();
  if (cargando) return null;
  if (!estaLogueado()) return <Navigate to="/login" />;
  if (!esAdmin()) return <Navigate to="/tienda" />;
  return children;
}

// Solo empleado
function RutaEmpleado({ children }) {
  const { estaLogueado, esEmpleado, cargando } = useAuth();
  if (cargando) return null;
  if (!estaLogueado()) return <Navigate to="/login" />;
  if (!esEmpleado()) return <Navigate to="/tienda" />;
  return children;
}

function RutaSoloPublica({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return null;
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
        <Route path="/carrito" element={<RutaPrivada><Carrito /></RutaPrivada>} />
        <Route path="/mis-pedidos" element={<RutaPrivada><MisPedidos /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />

        {/* Pago */}
        <Route path="/pago/qr"       element={<RutaPrivada><PagoQR /></RutaPrivada>} />
        <Route path="/pago/resultado" element={<RutaPrivada><PagoResultado /></RutaPrivada>} />

        {/* Domicilio cliente */}
        <Route path="/domicilio/crear" element={<RutaPrivada><CrearDomicilio /></RutaPrivada>} />
        <Route path="/domicilio/historial" element={<RutaPrivada><HistorialDomicilios /></RutaPrivada>} />
        <Route path="/domicilio/seguimiento" element={<RutaPrivada><Seguimiento /></RutaPrivada>} />

        {/* Admin (solo Administrador) */}
        <Route path="/admin/dashboard"   element={<RutaAdmin><AdminDashboard /></RutaAdmin>} />
        <Route path="/admin/productos"   element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
        <Route path="/admin/ofertas"     element={<RutaAdmin><AdminOfertas /></RutaAdmin>} />
        <Route path="/admin/pedidos"     element={<RutaAdmin><AdminPedidos /></RutaAdmin>} />
        <Route path="/admin/inventario"  element={<RutaAdmin><AdminInventario /></RutaAdmin>} />
        <Route path="/admin/domicilios"  element={<RutaAdmin><AdminDomicilios /></RutaAdmin>} />
        <Route path="/admin/reportes"    element={<RutaAdmin><AdminReportes /></RutaAdmin>} />
        <Route path="/admin/pagos"       element={<RutaAdmin><AdminPagos /></RutaAdmin>} />
        <Route path="/admin/usuarios"    element={<RutaAdmin><AdminUsuarios /></RutaAdmin>} />
        <Route path="/admin/categorias"  element={<RutaAdmin><AdminCategorias /></RutaAdmin>} />
        <Route path="/admin/proveedores" element={<RutaAdmin><AdminProveedores /></RutaAdmin>} />

        {/* Empleado (solo Empleado) */}
        <Route path="/empleado/dashboard"  element={<RutaEmpleado><AdminDashboard /></RutaEmpleado>} />
        <Route path="/empleado/productos"  element={<RutaEmpleado><AdminProductos /></RutaEmpleado>} />
        <Route path="/empleado/pedidos"    element={<RutaEmpleado><AdminPedidos /></RutaEmpleado>} />
        <Route path="/empleado/inventario" element={<RutaEmpleado><AdminInventario /></RutaEmpleado>} />
        <Route path="/empleado/domicilios" element={<RutaEmpleado><AdminDomicilios /></RutaEmpleado>} />
        <Route path="/empleado/reportes"   element={<RutaEmpleado><AdminReportes /></RutaEmpleado>} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">404</div>
                <h2 className="text-2xl font-bold text-gray-700">Pagina no encontrada</h2>
                <a href="/" className="text-sm mt-4 inline-block" style={{ color: "#74B495" }}>Volver al inicio</a>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
