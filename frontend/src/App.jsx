// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Paginas publicas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

// Paginas cliente
import Tienda from "./pages/Tienda";
import Carrito from "./pages/Carrito";
import MisPedidos from "./pages/MisPedidos";

// Paginas admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOfertas from "./pages/admin/AdminOfertas";
import AdminProductos from "./pages/admin/AdminProductos";

function RutaPrivada({ children }) {
  const { estaLogueado, cargando } = useAuth();
  if (cargando) return null;
  return estaLogueado() ? children : <Navigate to="/login" />;
}

function RutaAdmin({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return null;
  if (!estaLogueado()) return <Navigate to="/login" />;
  if (!esAdmin() && !esEmpleado()) return <Navigate to="/tienda" />;
  return children;
}

function RutaSoloPublica({ children }) {
  const { estaLogueado, esAdmin, esEmpleado, cargando } = useAuth();
  if (cargando) return null;
  if (estaLogueado()) {
    return <Navigate to={esAdmin() || esEmpleado() ? "/admin/dashboard" : "/tienda"} />;
  }
  return children;
}

function Proximamente({ nombre }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">Construccion</div>
        <h2 className="text-2xl font-bold text-gray-700">{nombre}</h2>
        <p className="text-gray-400 mt-2">Este modulo se construira en el siguiente paso.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Publicas */}
      <Route path="/" element={<RutaSoloPublica><Landing /></RutaSoloPublica>} />
      <Route path="/login" element={<RutaSoloPublica><Login /></RutaSoloPublica>} />
      <Route path="/registro" element={<RutaSoloPublica><Registro /></RutaSoloPublica>} />

      {/* Cliente */}
      <Route path="/tienda" element={<RutaPrivada><Tienda /></RutaPrivada>} />
      <Route path="/carrito" element={<RutaPrivada><Carrito /></RutaPrivada>} />
      <Route path="/mis-pedidos" element={<RutaPrivada><MisPedidos /></RutaPrivada>} />
      <Route path="/perfil" element={<RutaPrivada><Proximamente nombre="Mi perfil" /></RutaPrivada>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<RutaAdmin><AdminDashboard /></RutaAdmin>} />
      <Route path="/admin/productos" element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
      <Route path="/admin/ofertas" element={<RutaAdmin><AdminOfertas /></RutaAdmin>} />
      <Route path="/admin/pedidos" element={<RutaAdmin><Proximamente nombre="Gestion de Pedidos" /></RutaAdmin>} />
      <Route path="/admin/inventario" element={<RutaAdmin><Proximamente nombre="Inventario" /></RutaAdmin>} />
      <Route path="/admin/reportes" element={<RutaAdmin><Proximamente nombre="Reportes" /></RutaAdmin>} />
      <Route path="/admin/usuarios" element={<RutaAdmin><Proximamente nombre="Gestion de Usuarios" /></RutaAdmin>} />

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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
