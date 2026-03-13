import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  categoriaService,
  ofertaService,
  productoService,
  reporteService,
  usuarioService,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Card({ titulo, valor, detalle, tono = "green" }) {
  const estilos = {
    green: {
      bg: "rgba(168, 200, 152, 0.18)",
      accent: "#74B495",
    },
    purple: {
      bg: "rgba(135, 127, 215, 0.16)",
      accent: "#877FD7",
    },
    mixed: {
      bg: "rgba(116, 180, 149, 0.12)",
      accent: "#2d5463",
    },
  };

  const estilo = estilos[tono] || estilos.green;

  return (
    <div className="rounded-[1.8rem] border border-[var(--md-border)] p-5 shadow-sm" style={{ backgroundColor: "#fffdf9" }}>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg mb-4"
        style={{ backgroundColor: estilo.bg, color: estilo.accent }}
      >
        ●
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 font-semibold">{titulo}</p>
      <p className="text-4xl font-black text-slate-900 mt-2">{valor}</p>
      <p className="text-sm text-slate-500 mt-2">{detalle}</p>
    </div>
  );
}

function QuickLink({ to, titulo, detalle }) {
  return (
    <Link
      to={to}
      className="rounded-[1.4rem] border border-[var(--md-border)] p-4 bg-white hover:-translate-y-0.5 hover:shadow-sm transition"
    >
      <p className="font-semibold text-slate-800">{titulo}</p>
      <p className="text-sm text-slate-500 mt-1">{detalle}</p>
    </Link>
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
    usuarios: 0,
    reportes: 0,
  });

  const cargarDashboard = async () => {
    setCargando(true);
    setError("");
    try {
      const [prodsRes, catsRes, ofertasRes, usuariosRes, reportesRes] = await Promise.allSettled([
        productoService.listar(),
        categoriaService.listar(),
        ofertaService.listar(),
        usuarioService.stats(),
        reporteService.registros(),
      ]);

      const productos = prodsRes.status === "fulfilled" ? (prodsRes.value.productos || []) : [];
      const categorias = catsRes.status === "fulfilled" ? (catsRes.value.categorias || []) : [];
      const ofertas = ofertasRes.status === "fulfilled" ? (ofertasRes.value.ofertas || []) : [];
      const usuariosStats = usuariosRes.status === "fulfilled" ? (usuariosRes.value.stats || {}) : {};
      const reportes = reportesRes.status === "fulfilled" ? (reportesRes.value.reportes || []) : [];
      const bajoStock = productos.filter((p) => Number(p.Cantidad || 0) <= 5).length;

      setStats({
        productos: productos.length,
        categorias: categorias.length,
        ofertasActivas: ofertas.length,
        bajoStock,
        usuarios: Number(usuariosStats.total || 0),
        reportes: reportes.length,
      });

      if (
        prodsRes.status === "rejected" ||
        catsRes.status === "rejected" ||
        usuariosRes.status === "rejected"
      ) {
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
    if (stats.bajoStock === 1) return "1 producto con stock critico";
    return `${stats.bajoStock} productos con stock critico`;
  }, [stats.bajoStock]);

  const saludoResumen = useMemo(() => {
    if (stats.bajoStock > 0) return "Hay inventario que revisar hoy.";
    if (stats.ofertasActivas === 0) return "No hay promociones activas en este momento.";
    return "El panel se ve estable y con actividad normal.";
  }, [stats.bajoStock, stats.ofertasActivas]);

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6 mb-7">
          <div
            className="rounded-[2rem] px-7 py-6 text-white overflow-hidden relative"
            style={{ backgroundColor: "#74B495" }}
          >
            <p className="text-xs uppercase tracking-[0.32em] text-white/75">Panel administrativo</p>
            <h1 className="text-3xl md:text-4xl font-black md-title-serif mt-3">
              Bienvenido {usuario?.Nombre || "usuario"}
            </h1>
            <p className="text-white/90 mt-4 text-base md:text-lg max-w-2xl leading-relaxed">
              {saludoResumen} Desde aqui puedes controlar productos, ofertas, usuarios y reportes sin perder de vista el estado general.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={cargarDashboard}
                disabled={cargando}
                className="px-5 py-3 rounded-2xl font-semibold text-sm disabled:opacity-60"
                style={{ backgroundColor: "white", color: "#2f6b5b" }}
              >
                {cargando ? "Actualizando..." : "Actualizar datos"}
              </button>
              <Link to="/admin/reportes" className="px-5 py-3 rounded-2xl font-semibold text-sm border border-white/30 hover:bg-white/10 transition">
                Ver reportes
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-7">
              <div className="rounded-2xl px-4 py-3 border border-white/20 bg-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Usuarios</p>
                <p className="text-2xl font-black mt-1">{stats.usuarios}</p>
              </div>
              <div className="rounded-2xl px-4 py-3 border border-white/20 bg-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Reportes</p>
                <p className="text-2xl font-black mt-1">{stats.reportes}</p>
              </div>
              <div className="rounded-2xl px-4 py-3 border border-white/20 bg-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Stock bajo</p>
                <p className="text-2xl font-black mt-1">{stats.bajoStock}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 font-semibold">Resumen rapido</p>
            <div className="space-y-4 mt-5">
              <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(168, 200, 152, 0.18)" }}>
                <p className="text-sm text-slate-500">Usuarios registrados</p>
                <p className="text-3xl font-black mt-1" style={{ color: "#2e5a4d" }}>{stats.usuarios}</p>
              </div>
              <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(135, 127, 215, 0.15)" }}>
                <p className="text-sm text-slate-500">Reportes guardados</p>
                <p className="text-3xl font-black mt-1" style={{ color: "#6c62ca" }}>{stats.reportes}</p>
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--md-border)] px-4 py-4">
                <p className="text-sm text-slate-500">Estado del sistema</p>
                <p className="text-base font-semibold text-slate-800 mt-1">
                  {stats.bajoStock > 0 ? "Requiere atencion en inventario" : "Operacion estable"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-2xl border text-sm"
            style={{ backgroundColor: "#fff8e8", borderColor: "#f8d37b", color: "#8a6b1a" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          <Card titulo="Productos" valor={stats.productos} detalle="Registrados en catalogo" tono="green" />
          <Card titulo="Categorias" valor={stats.categorias} detalle="Categorias activas" tono="purple" />
          <Card titulo="Ofertas" valor={stats.ofertasActivas} detalle="Promociones visibles ahora" tono="mixed" />
          <Card titulo="Stock bajo" valor={stats.bajoStock} detalle={mensajeStock} tono="purple" />
        </div>

        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="rounded-[2rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-5">Acciones rapidas</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <QuickLink to="/admin/productos" titulo="Gestionar productos" detalle="Crear, editar y organizar catalogo" />
              <QuickLink to="/admin/ofertas" titulo="Gestionar ofertas" detalle="Publicar promociones activas" />
              <QuickLink to="/admin/pedidos" titulo="Ver pedidos" detalle="Revisar flujo de compra y despacho" />
              <QuickLink to="/admin/usuarios" titulo="Gestionar usuarios" detalle="Roles, datos y administracion" />
              <QuickLink to="/admin/inventario" titulo="Revisar inventario" detalle="Detectar alertas y reposicion" />
              <QuickLink to="/admin/reportes" titulo="Consultar reportes" detalle="Resumenes y exportaciones" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-5">Lectura del dia</h2>
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(116, 180, 149, 0.12)" }}>
                <p className="text-sm font-semibold text-slate-800">Inventario</p>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.bajoStock > 0
                    ? "Hay productos que conviene revisar antes de que afecten ventas."
                    : "No hay alertas importantes en el inventario actual."}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(135, 127, 215, 0.12)" }}>
                <p className="text-sm font-semibold text-slate-800">Promociones</p>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.ofertasActivas > 0
                    ? `Tienes ${stats.ofertasActivas} ofertas activas publicadas.`
                    : "No hay ofertas activas; podria ser buen momento para lanzar una."}
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--md-border)] p-4">
                <p className="text-sm font-semibold text-slate-800">Siguiente paso sugerido</p>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.bajoStock > 0 ? "Empieza por inventario y luego revisa productos destacados." : "Revisa reportes o prepara nuevas ofertas desde el panel."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
