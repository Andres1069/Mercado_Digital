import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { categoriaService, ofertaService, productoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Card({ titulo, valor, detalle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{titulo}</p>
      <p className="text-3xl font-extrabold text-gray-800 mt-2">{valor}</p>
      <p className="text-sm text-gray-500 mt-1">{detalle}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    productos: 0,
    categorias: 0,
    ofertasActivas: 0,
    bajoStock: 0,
  });

  const cargarDashboard = async () => {
    setCargando(true);
    setError("");
    try {
      const [prodsRes, catsRes, ofertasRes] = await Promise.allSettled([
        productoService.listar(),
        categoriaService.listar(),
        ofertaService.listar(),
      ]);

      const productos = prodsRes.status === "fulfilled" ? (prodsRes.value.productos || []) : [];
      const categorias = catsRes.status === "fulfilled" ? (catsRes.value.categorias || []) : [];
      const ofertas = ofertasRes.status === "fulfilled" ? (ofertasRes.value.ofertas || []) : [];
      const bajoStock = productos.filter((p) => Number(p.Cantidad || 0) <= 5).length;

      setStats({
        productos: productos.length,
        categorias: categorias.length,
        ofertasActivas: ofertas.length,
        bajoStock,
      });

      if (prodsRes.status === "rejected" || catsRes.status === "rejected") {
        setError("No se pudieron cargar todos los datos del dashboard.");
      }
    } catch {
      setError("Error inesperado al cargar el dashboard.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const mensajeStock = useMemo(() => {
    if (stats.bajoStock === 0) return "Sin alertas de inventario";
    if (stats.bajoStock === 1) return "1 producto con stock bajo";
    return `${stats.bajoStock} productos con stock bajo`;
  }, [stats.bajoStock]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Panel Administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenido {usuario?.Nombre || "usuario"}.
            </p>
          </div>
          <button
            onClick={cargarDashboard}
            disabled={cargando}
            className="text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60"
            style={{ backgroundColor: "#74B495" }}
          >
            {cargando ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>

        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl border text-sm"
            style={{ backgroundColor: "#fff8e8", borderColor: "#f8d37b", color: "#8a6b1a" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <Card titulo="Productos" valor={stats.productos} detalle="Registrados en catalogo" />
          <Card titulo="Categorias" valor={stats.categorias} detalle="Categorias activas" />
          <Card titulo="Ofertas" valor={stats.ofertasActivas} detalle="Promociones activas" />
          <Card titulo="Stock Bajo" valor={stats.bajoStock} detalle={mensajeStock} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones rapidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Link to="/admin/productos" className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Gestionar productos
            </Link>
            <Link to="/admin/ofertas" className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Gestionar ofertas
            </Link>
            <Link to="/admin/pedidos" className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Ver pedidos
            </Link>
            <Link to="/admin/inventario" className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Revisar inventario
            </Link>
            <Link to="/admin/reportes" className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Consultar reportes
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Estado del sistema</h2>
          <p className="text-sm text-gray-500">
            El modulo de productos ya esta activo. Puedes crear, editar y eliminar desde la seccion Productos.
          </p>
        </div>
      </div>
    </div>
  );
}
