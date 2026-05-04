import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
  pedidoService,
  productoService,
  reporteService,
  resolverImagen,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";

const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(n) {
  if (!n && n !== 0) return "—";
  const num = Number(n);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `$${(num / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(num);
}

function fmtFull(n) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n) || 0);
}

function badgePedido(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado"))                     return { bg: "rgba(107,142,78,0.2)",  color: "#6B8E4E" };
  if (e.includes("camino"))                        return { bg: "rgba(107,142,78,0.18)",   color: "#3C5148" };
  if (e.includes("prepar") || e.includes("confirmado")) return { bg: "rgba(178,197,178,0.2)", color: "#3C5148" };
  if (e.includes("cancel"))                        return { bg: "rgba(239,68,68,0.15)",   color: "#f87171" };
  return                                                  { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" };
}

/* ── Gráfica de barras SVG ─────────────────────────── */
function BarChart({ data }) {
  if (!data.length) return (
    <div className="h-[300px] flex items-center justify-center" style={{ color: "#1B2727" }}>
      Sin datos suficientes
    </div>
  );
  const values = data.map((d) => Number(d.value || 0));
  const max = Math.max(...values, 1);
  const W = 720, H = 300;
  const pad = { top: 18, right: 18, bottom: 36, left: 58 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const points = data.map((d, i) => {
    const x = pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = pad.top + innerH - (Number(d.value || 0) / max) * innerH;
    return { ...d, x, y };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1).x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    return { y, value: max * ratio };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "300px" }} role="img" aria-label="Ventas por dia">
      <defs>
        <linearGradient id="ventasAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#16a34a" stopOpacity="0.36" />
          <stop offset="95%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
        <filter id="ventasLineShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#16a34a" floodOpacity="0.16" />
        </filter>
      </defs>

      {grid.map((g) => (
        <g key={g.y}>
          <line x1={pad.left} y1={g.y} x2={W - pad.right} y2={g.y}
            stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 5" />
          <text x={pad.left - 12} y={g.y + 4} textAnchor="end" fontSize="12" fill="#64748b">
            {fmt(g.value)}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="url(#ventasAreaGradient)" />
      <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#ventasLineShadow)" />

      {points.map((p) => (
        <g key={`${p.label}-${p.x}`}>
          <line x1={p.x} y1={pad.top + innerH} x2={p.x} y2={pad.top + innerH + 6} stroke="#e2e8f0" />
          <text x={p.x} y={H - 12} textAnchor="middle" fontSize="12" fill="#64748b">
            {p.label}
          </text>
          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="3">
            <title>{`${p.label}: ${fmtFull(p.value)}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ── Dashboard ──────────────────────────────────────── */
export default function AdminDashboard() {
  const { usuario, esEmpleado } = useAuth();
  const esEmp = esEmpleado();
  const base  = esEmp ? "/empleado" : "/admin";

  const [cargando,   setCargando]   = useState(true);
  const [pedidos,    setPedidos]    = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [chartData,  setChartData]  = useState([]);

  const cargar = async () => {
    setCargando(true);
    try {
      const [pedRes, prodRes, ventasRes] = await Promise.allSettled([
        pedidoService.todos(),
        productoService.listar(),
        reporteService.ventas(),
      ]);

      const peds  = pedRes.status  === "fulfilled" ? (pedRes.value.pedidos   || []) : [];
      const prods = prodRes.status === "fulfilled" ? (prodRes.value.productos || []) : [];
      const vents = ventasRes.status === "fulfilled" ? ventasRes.value : null;

      setPedidos(peds);
      setProductos(prods);

      /* Construir datos de la gráfica */
      if (vents?.ventas?.length) {
        setChartData(
          vents.ventas.slice(-9).map((v) => ({
            label: MESES[new Date(v.fecha || v.mes || "").getMonth()] ?? String(v.mes || "").slice(0, 3),
            value: Number(v.total || v.ingresos || 0),
          }))
        );
      } else {
        /* Fallback: agrupar pedidos por mes */
        const byMonth = {};
        peds.forEach((p) => {
          const d = new Date(p.Fecha_Pedido || "");
          if (!isNaN(d.getTime())) {
            const k = `${d.getFullYear()}-${d.getMonth()}`;
            if (!byMonth[k]) byMonth[k] = { label: MESES[d.getMonth()], value: 0, ts: d.getTime() };
            byMonth[k].value += Number(p.Total || 0);
          }
        });
        const entries = Object.values(byMonth).sort((a, b) => a.ts - b.ts).slice(-9);
        setChartData(entries);
      }
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /* Derivados */
  const hoy        = new Date();
  const pedidosHoy = pedidos.filter((p) => {
    const d = new Date(p.Fecha_Pedido || "");
    return d.getDate() === hoy.getDate() && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  }).length;

  const totalVentas    = pedidos.reduce((s, p) => s + Number(p.Total || 0), 0);
  const bajoStock      = productos.filter((p) => Number(p.Cantidad || 0) <= 5).length;
  const ventasGrafica  = chartData.reduce((s, d) => s + Number(d.value || 0), 0);
  const cambioVentas   = chartData.length >= 2 && Number(chartData[0].value || 0) > 0
    ? ((Number(chartData.at(-1).value || 0) - Number(chartData[0].value || 0)) / Number(chartData[0].value || 1)) * 100
    : 0;
  const recentPedidos  = [...pedidos]
    .sort((a, b) => new Date(b.Fecha_Pedido || 0) - new Date(a.Fecha_Pedido || 0))
    .slice(0, 6);
  const recentProductos = productos.slice(0, 6);

  const STATS = [
    {
      label: "Pedidos del dia",
      iconClass: "fa-solid fa-clipboard-check",
      value: cargando ? "—" : pedidosHoy,
      icon: "📋",
      color: "#3C5148",
      bg: "rgba(107,142,78,0.18)",
      to: `${base}/pedidos`,
    },
    {
      label: "Ventas totales",
      iconClass: "fa-solid fa-sack-dollar",
      value: cargando ? "—" : fmt(totalVentas),
      icon: "💰",
      color: "#6B8E4E",
      bg: "rgba(107,142,78,0.2)",
      to: `${base}/reportes`,
    },
    {
      label: "Productos",
      iconClass: "fa-solid fa-boxes-stacked",
      value: cargando ? "—" : productos.length,
      icon: "📦",
      color: "#3C5148",
      bg: "rgba(178,197,178,0.2)",
      to: `${base}/productos`,
    },
    {
      label: "Stock bajo",
      iconClass: "fa-solid fa-triangle-exclamation",
      value: cargando ? "—" : bajoStock,
      icon: "⚠️",
      color: bajoStock > 0 ? "#f87171" : "#6B8E4E",
      bg: bajoStock > 0 ? "rgba(239,68,68,0.15)" : "rgba(107,142,78,0.2)",
      to: `${base}/inventario`,
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: "#3C5148" }}>
                Bienvenido, {usuario?.Nombre || "usuario"}
              </p>
            </div>
            <button onClick={cargar} disabled={cargando}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              style={{ ...CARD, color: "#3C5148" }}>
              {cargando ? "Cargando..." : "↻ Actualizar"}
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {STATS.map(({ label, value, iconClass, color, bg, to }) => (
              <Link key={label} to={to}
                className="rounded-2xl p-5 flex items-center gap-4 transition hover:-translate-y-0.5"
                style={CARD}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: bg, color }}>
                  <i className={iconClass} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider leading-none"
                    style={{ color: "#6B8E4E" }}>{label}</p>
                  <p className="text-2xl font-black mt-1.5 leading-none" style={{ color }}>{value}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Gráfica + Pedidos recientes ── */}
          <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-4 mb-4">

            {/* Ventas por día */}
            <div className="rounded-2xl p-6" style={CARD}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: "#1B2727" }}>Ventas por Dia</h2>
                  <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                    {chartData.length ? `Total periodo: ${fmt(ventasGrafica)}` : "Cargando datos de ventas..."}
                  </p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full font-semibold self-start"
                  style={{
                    backgroundColor: cambioVentas >= 0 ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)",
                    color: cambioVentas >= 0 ? "#15803d" : "#dc2626",
                  }}>
                  {cambioVentas >= 0 ? "+" : ""}{cambioVentas.toFixed(0)}% este periodo
                </span>
              </div>
              <p className="sr-only" style={{ color: "#6B8E4E" }}>
                {chartData.length
                  ? `${chartData.length} periodos registrados · pico ${fmt(Math.max(...chartData.map((d) => d.value)))}`
                  : "Cargando datos de ventas..."}
              </p>
              {cargando ? (
                <div className="h-[300px] rounded-xl animate-pulse"
                  style={{ backgroundColor: "rgba(107,142,78,0.08)" }} />
              ) : (
                <BarChart data={chartData} />
              )}
            </div>

            {/* Pedidos recientes */}
            <div className="rounded-2xl p-6 flex flex-col" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "#1B2727" }}>Pedidos Recientes</h2>
                <Link to={`${base}/pedidos`}
                  className="text-xs font-semibold transition hover:opacity-70"
                  style={{ color: "#6B8E4E" }}>
                  Ver todos →
                </Link>
              </div>

              <div className="flex-1 space-y-2.5 overflow-hidden">
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse"
                      style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                  ))
                ) : recentPedidos.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: "#6B8E4E" }}>
                    Sin pedidos aún
                  </p>
                ) : (
                  recentPedidos.map((p) => {
                    const badge  = badgePedido(p.Estado_Pedido);
                    const nombre = `${p.Nombre || ""} ${p.Apellido || ""}`.trim() || `#${p.Cod_Pedido}`;
                    return (
                      <div key={p.Cod_Pedido} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl"
                          style={{
                            background: "linear-gradient(135deg, rgba(107,142,78,0.12), rgba(178,197,178,0.22))",
                            color: "#6B8E4E",
                            fontSize: 0,
                          }}>
                          <i className="fa-regular fa-clipboard" style={{ fontSize: 42 }} aria-hidden="true" />
                          📋
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "#1B2727" }}>
                            #{p.Cod_Pedido} · {nombre}
                          </p>
                          <p className="text-[11px]" style={{ color: "#6B8E4E" }}>
                            {fmtFull(p.Total)}
                          </p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 whitespace-nowrap"
                          style={{ backgroundColor: badge.bg, color: badge.color }}>
                          {p.Estado_Pedido || "Pendiente"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Tabla de productos ── */}
          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
              <h2 className="text-base font-bold" style={{ color: "#1B2727" }}>Gestion de Productos</h2>
              <Link to={`${base}/productos`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80"
                style={{ backgroundColor: "rgba(107,142,78,0.18)", color: "#3C5148" }}>
                Ver todos
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.1)" }}>
                  {["Producto", "Categoria", "Precio", "Stock", "Estado"].map((h, i) => (
                    <th key={h}
                      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider
                        ${i === 0 ? "text-left" : ""}
                        ${i === 1 ? "text-left hidden sm:table-cell" : ""}
                        ${i >= 2 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-4 rounded animate-pulse"
                          style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : recentProductos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center" style={{ color: "#6B8E4E" }}>
                      Sin productos registrados
                    </td>
                  </tr>
                ) : (
                  recentProductos.map((prod) => {
                    const stock  = Number(prod.Cantidad || 0);
                    const activo = String(prod.Estado || "").toLowerCase() === "activo" || stock > 0;
                    const stockColor = stock <= 5 ? "#f87171" : stock <= 20 ? "#fbbf24" : "#6B8E4E";
                    const imagenProducto = prod.Imagen_url || prod.imagen_url || prod.Imagen || prod.Foto || "";
                    return (
                      <tr key={prod.Cod_Producto}
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.025)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}>

                        {/* Producto */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                              style={{ backgroundColor: "rgba(107,142,78,0.12)" }}>
                              {imagenProducto ? (
                                <img src={resolverImagen(imagenProducto)} alt={prod.Nombre}
                                  className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                              )}
                            </div>
                            <p className="font-semibold truncate max-w-[150px]"
                              style={{ color: "#1B2727" }}>
                              {prod.Nombre}
                            </p>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs px-2 py-1 rounded-lg"
                            style={{ backgroundColor: "rgba(107,142,78,0.12)", color: "#3C5148" }}>
                            {prod.Categoria || prod.categoria || "—"}
                          </span>
                        </td>

                        {/* Precio */}
                        <td className="px-5 py-3 text-center">
                          <p className="font-bold" style={{ color: "#1B2727" }}>
                            {fmtFull(prod.Precio)}
                          </p>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-3 text-center">
                          <span className="font-black text-base" style={{ color: stockColor }}>
                            {stock}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: activo ? "rgba(107,142,78,0.2)" : "rgba(239,68,68,0.15)",
                              color: activo ? "#6B8E4E" : "#f87171",
                            }}>
                            {activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
