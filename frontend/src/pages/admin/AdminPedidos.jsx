import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { pedidoService } from "../../services/api";

const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const ESTADOS = ["Pendiente", "Confirmado", "En preparacion", "En camino", "Entregado", "Cancelado"];

function badgeColor(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado") || e.includes("completado")) return { bg: "rgba(107,142,78,0.2)",  text: "#6B8E4E" };
  if (e.includes("cancel")    || e.includes("fallido"))   return { bg: "rgba(239,68,68,0.15)",   text: "#f87171" };
  if (e.includes("camino")    || e.includes("prepar") || e.includes("confirmado")) return { bg: "rgba(107,142,78,0.18)", text: "#3C5148" };
  return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" };
}

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminPedidos() {
  const [pedidos, setPedidos]         = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState("");
  const [buscar, setBuscar]           = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cambiando, setCambiando]     = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true); setError("");
    try {
      const res = await pedidoService.todos();
      setPedidos(res.pedidos || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los pedidos.");
    } finally { setCargando(false); }
  }

  async function handleCambiarEstado(codPedido, nuevoEstado) {
    setCambiando(codPedido);
    try {
      await pedidoService.cambiarEstado(codPedido, nuevoEstado);
      setPedidos((prev) => prev.map((p) => p.Cod_Pedido === codPedido ? { ...p, Estado_Pedido: nuevoEstado } : p));
    } catch (e) { alert(e.message || "Error al cambiar estado."); }
    finally { setCambiando(null); }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchEstado = filtroEstado === "Todos" || p.Estado_Pedido === filtroEstado;
    const matchBuscar = buscar === "" || String(p.Cod_Pedido).includes(buscar) ||
      String(p.Num_Documento || "").includes(buscar) ||
      `${p.Nombre || ""} ${p.Apellido || ""}`.toLowerCase().includes(buscar.toLowerCase());
    return matchEstado && matchBuscar;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8">

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Pedidos</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{pedidos.length} pedidos en total</p>
            </div>
            <button onClick={cargar}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              Actualizar
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input type="text" placeholder="Buscar por # pedido, documento o nombre..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE}>
              <option>Todos</option>
              {ESTADOS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {error}
            </div>
          )}

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Pedido","Cliente","Fecha","Total","Pago","Estado","Cambiar Estado"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 4 ? "hidden md:table-cell" : ""} ${i === 3 || i === 5 || i === 6 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No hay pedidos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((p) => {
                    const cBadge = badgeColor(p.Estado_Pedido);
                    return (
                      <tr key={p.Cod_Pedido} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: "#1B2727" }}>#{p.Cod_Pedido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Cantidad_articulos} art.</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium" style={{ color: "#3C5148" }}>{p.Nombre} {p.Apellido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Num_Documento}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: "#6B8E4E" }}>
                          {formatFecha(p.Fecha_Pedido)}
                        </td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: "#6B8E4E" }}>
                          ${Number(p.Monto_Pago || p.Total_Carrito || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-center">
                          <p className="text-xs" style={{ color: "#3C5148" }}>{p.Metodo_Pago || "-"}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Estado_Pago || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: cBadge.bg, color: cBadge.text }}>
                            {p.Estado_Pedido}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select value={p.Estado_Pedido} disabled={cambiando === p.Cod_Pedido}
                            onChange={(e) => handleCambiarEstado(p.Cod_Pedido, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg focus:outline-none disabled:opacity-50"
                            style={{ backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" }}>
                            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                          </select>
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
