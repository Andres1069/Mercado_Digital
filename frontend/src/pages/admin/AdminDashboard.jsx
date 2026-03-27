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

const CARD = {
  backgroundColor: "var(--md-surface)",
  border: "1px solid var(--md-border)",
  boxShadow: "var(--md-shadow)",
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function fmt(n) {
  if (!n && n !== 0) return "-";
  const num = Number(n);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}

function fmtFull(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

function badgePedido(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado")) return { bg: "rgba(107,142,78,0.2)", color: "#6B8E4E" };
  if (e.includes("camino")) return { bg: "rgba(107,142,78,0.18)", color: "#3C5148" };
  if (e.includes("prepar") || e.includes("confirmado")) return { bg: "rgba(178,197,178,0.2)", color: "#3C5148" };
  if (e.includes("cancel")) return { bg: "rgba(239,68,68,0.15)", color: "#f87171" };
  return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" };
}

function BarChart({ data }) {
  if (!data.length) {
    return (
      <div className="h-44 flex items-center justify-center" style={{ color: "var(--md-text)" }}>
        Sin datos suficientes
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 100;
  const H = 56;
  const padX = 2;
  const n = data.length;
  const slotW = (W - padX * 2) / n;
  const barW = slotW * 0.55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "176px" }}>
      <line x1={padX} y1={H - 8} x2={W - padX} y2={H - 8} stroke="rgba(107,142,78,0.12)" strokeWidth="0.4" />
      {data.map((d, i) => {
        const ratio = d.value / max;
        const barH = Math.max(ratio * (H - 16), 1.5);
        const x = padX + i * slotW + (slotW - barW) / 2;
        const y = H - 8 - barH;
        const isTop = d.value === max;
        const opacity = 0.4 + ratio * 0.6;

        return (
          <g key={i}>
            <rect x={x} y={H - 8 - (H - 16)} width={barW} height={H - 16} rx="1.5" fill="rgba(107,142,78,0.06)" />
            <rect x={x} y={y} width={barW} height={barH} rx="1.5" fill={isTop ? "#6B8E4E" : "#4A6741"} opacity={opacity} />
            <text x={x + barW / 2} y={H - 0.5} fontSize="3.5" textAnchor="middle" fill="var(--md-text-soft)">
              {d.label}
            </text>
            {isTop && (
              <text x={x + barW / 2} y={y - 1.5} fontSize="3.2" textAnchor="middle" fill="var(--md-text)" fontWeight="bold">
                {fmt(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboard() {
  const { usuario, esEmpleado } = useAuth();
  const esEmp = esEmpleado();
  const base = esEmp ? "/empleado" : "/admin";

  const [cargando, setCargando] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [chartData, setChartData] = useState([]);

  const cargar = async () => {
    setCargando(true);
    try {
      const [pedRes, prodRes, ventasRes] = await Promise.allSettled([
        pedidoService.todos(),
        productoService.listar(),
        reporteService.ventas(),
      ]);

      const peds = pedRes.status === "fulfilled" ? pedRes.value.pedidos || [] : [];
      const prods = prodRes.status === "fulfilled" ? prodRes.value.productos || [] : [];
      const vents = ventasRes.status === "fulfilled" ? ventasRes.value : null;

      setPedidos(peds);
      setProductos(prods);

      if (vents?.ventas?.length) {
        setChartData(
          vents.ventas.slice(-9).map((v) => ({
            label: MESES[new Date(v.fecha || v.mes || "").getMonth()] ?? String(v.mes || "").slice(0, 3),
            value: Number(v.total || v.ingresos || 0),
          }))
        );
      } else {
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

  useEffect(() => {
    cargar();
  }, []);

  const hoy = new Date();
  const pedidosHoy = pedidos.filter((p) => {
    const d = new Date(p.Fecha_Pedido || "");
    return d.getDate() === hoy.getDate() && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  }).length;

  const totalVentas = pedidos.reduce((s, p) => s + Number(p.Total || 0), 0);
  const bajoStock = productos.filter((p) => Number(p.Cantidad || 0) <= 5).length;
  const recentPedidos = [...pedidos]
    .sort((a, b) => new Date(b.Fecha_Pedido || 0) - new Date(a.Fecha_Pedido || 0))
    .slice(0, 6);
  const recentProductos = productos.slice(0, 6);

  const STATS = [
    { label: "Pedidos del dia", value: cargando ? "-" : pedidosHoy, icon: "📋", color: "#3C5148", bg: "rgba(107,142,78,0.18)", to: `${base}/pedidos` },
    { label: "Ventas totales", value: cargando ? "-" : fmt(totalVentas), icon: "💰", color: "#6B8E4E", bg: "rgba(107,142,78,0.2)", to: `${base}/reportes` },
    { label: "Productos", value: cargando ? "-" : productos.length, icon: "📦", color: "#3C5148", bg: "rgba(178,197,178,0.2)", to: `${base}/productos` },
    {
      label: "Stock bajo",
      value: cargando ? "-" : bajoStock,
      icon: "⚠️",
      color: bajoStock > 0 ? "#f87171" : "#6B8E4E",
      bg: bajoStock > 0 ? "rgba(239,68,68,0.15)" : "rgba(107,142,78,0.2)",
      to: `${base}/inventario`,
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "var(--md-text)" }}>Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--md-text-soft)" }}>
                Bienvenido, {usuario?.Nombre || "usuario"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle
                className="px-4 py-2 rounded-xl text-sm"
                style={{ ...CARD, color: "var(--md-text)" }}
              />
              <button
                onClick={cargar}
                disabled={cargando}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                style={{ ...CARD, color: "var(--md-text)" }}
              >
                {cargando ? "Cargando..." : "↻ Actualizar"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {STATS.map(({ label, value, icon, color, bg, to }) => (
              <Link key={label} to={to} className="rounded-2xl p-5 flex items-center gap-4 transition hover:-translate-y-0.5" style={CARD}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: bg }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider leading-none" style={{ color: "#6B8E4E" }}>{label}</p>
                  <p className="text-2xl font-black mt-1.5 leading-none" style={{ color }}>{value}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-4 mb-4">
            <div className="rounded-2xl p-6" style={CARD}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold" style={{ color: "var(--md-text)" }}>Ventas por Dia</h2>
                <span className="text-[11px] px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: "rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Por periodo
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: "#6B8E4E" }}>
                {chartData.length
                  ? `${chartData.length} periodos registrados · pico ${fmt(Math.max(...chartData.map((d) => d.value)))}`
                  : "Cargando datos de ventas..."}
              </p>
              {cargando ? (
                <div className="h-44 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.08)" }} />
              ) : (
                <BarChart data={chartData} />
              )}
            </div>

            <div className="rounded-2xl p-6 flex flex-col" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--md-text)" }}>Pedidos Recientes</h2>
                <Link to={`${base}/pedidos`} className="text-xs font-semibold transition hover:opacity-70" style={{ color: "#6B8E4E" }}>
                  Ver todos →
                </Link>
              </div>

              <div className="flex-1 space-y-2.5 overflow-hidden">
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                  ))
                ) : recentPedidos.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: "#6B8E4E" }}>Sin pedidos aun</p>
                ) : (
                  recentPedidos.map((p) => {
                    const badge = badgePedido(p.Estado_Pedido);
                    const nombre = `${p.Nombre || ""} ${p.Apellido || ""}`.trim() || `#${p.Cod_Pedido}`;
                    return (
                      <div key={p.Cod_Pedido} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ backgroundColor: "rgba(107,142,78,0.15)" }}>
                          📋
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "var(--md-text)" }}>
                            #{p.Cod_Pedido} · {nombre}
                          </p>
                          <p className="text-[11px]" style={{ color: "#6B8E4E" }}>{fmtFull(p.Total)}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color }}>
                          {p.Estado_Pedido || "Pendiente"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--md-text)" }}>Gestion de Productos</h2>
              <Link to={`${base}/productos`} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{ backgroundColor: "rgba(107,142,78,0.18)", color: "#3C5148" }}>
                Ver todos
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.1)" }}>
                  {["Producto", "Categoria", "Precio", "Stock", "Estado"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? "text-left" : ""} ${i === 1 ? "text-left hidden sm:table-cell" : ""} ${i >= 2 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}
                    >
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
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
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
                    const stock = Number(prod.Cantidad || 0);
                    const activo = String(prod.Estado || "").toLowerCase() === "activo" || stock > 0;
                    const stockColor = stock <= 5 ? "#f87171" : stock <= 20 ? "#fbbf24" : "#6B8E4E";
                    return (
                      <tr
                        key={prod.Cod_Producto}
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.025)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "rgba(107,142,78,0.12)" }}>
                              {prod.Foto ? (
                                <img src={resolverImagen(prod.Foto)} alt={prod.Nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                              )}
                            </div>
                            <p className="font-semibold truncate max-w-[150px]" style={{ color: "var(--md-text)" }}>
                              {prod.Nombre}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "rgba(107,142,78,0.12)", color: "#3C5148" }}>
                            {prod.Categoria || prod.categoria || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <p className="font-bold" style={{ color: "var(--md-text)" }}>{fmtFull(prod.Precio)}</p>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span className="font-black text-base" style={{ color: stockColor }}>{stock}</span>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: activo ? "rgba(107,142,78,0.2)" : "rgba(239,68,68,0.15)",
                              color: activo ? "#6B8E4E" : "#f87171",
                            }}
                          >
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
