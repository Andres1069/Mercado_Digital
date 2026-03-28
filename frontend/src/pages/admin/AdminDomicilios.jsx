import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { domicilioService } from "../../services/api";

const ESTADOS = ["Pendiente", "En preparacion", "En camino", "Entregado", "Cancelado"];
const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };

function badgeEstado(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado"))   return { bg: "rgba(107,142,78,0.2)",  text: "#6B8E4E",  icon: "✅" };
  if (e.includes("camino"))      return { bg: "rgba(107,142,78,0.18)",   text: "#3C5148",  icon: "🛵" };
  if (e.includes("preparacion")) return { bg: "rgba(178,197,178,0.2)", text: "#3C5148",  icon: "📦" };
  if (e.includes("cancel"))      return { bg: "rgba(239,68,68,0.15)",   text: "#f87171",  icon: "❌" };
  return                                { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24",  icon: "⏳" };
}

const RESUMEN_CONFIG = [
  { label: "Pendiente",      icon: "⏳", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.4)",  text: "#fbbf24" },
  { label: "En preparacion", icon: "📦", bg: "rgba(178,197,178,0.2)", border: "rgba(178,197,178,0.4)", text: "#3C5148" },
  { label: "En camino",      icon: "🛵", bg: "rgba(107,142,78,0.18)",  border: "rgba(107,142,78,0.4)",  text: "#3C5148" },
  { label: "Entregado",      icon: "✅", bg: "rgba(107,142,78,0.2)",  border: "rgba(107,142,78,0.4)",  text: "#6B8E4E" },
];

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminDomicilios() {
  const [domicilios, setDomicilios] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState("");
  const [buscar, setBuscar]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cambiando, setCambiando]   = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const res = await domicilioService.todos();
      setDomicilios(res.domicilios || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los domicilios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleCambiarEstado(codDomicilio, nuevoEstado) {
    setCambiando(codDomicilio);
    try {
      await domicilioService.actualizarEstado(codDomicilio, nuevoEstado);
      setDomicilios((prev) =>
        prev.map((d) =>
          d.Cod_Domicilio === codDomicilio
            ? { ...d, Estado_Domicilio: nuevoEstado, Estado_Pedido: nuevoEstado }
            : d
        )
      );
    } catch (e) {
      alert(e.message || "Error al cambiar estado.");
    } finally {
      setCambiando(null);
    }
  }

  const filtrados = domicilios.filter((d) => {
    const matchEstado = filtroEstado === "Todos" || d.Estado_Domicilio === filtroEstado;
    const matchBuscar =
      buscar === "" ||
      String(d.Cod_Pedido || "").includes(buscar) ||
      String(d.Num_Documento || "").includes(buscar) ||
      `${d.Nombre || ""} ${d.Apellido || ""}`.toLowerCase().includes(buscar.toLowerCase()) ||
      (d.Direccion_entrega || "").toLowerCase().includes(buscar.toLowerCase());
    return matchEstado && matchBuscar;
  });

  const countPorEstado = (e) => domicilios.filter((d) => d.Estado_Domicilio === e).length;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Domicilios</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{domicilios.length} domicilios registrados</p>
            </div>
            <button onClick={cargar}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              Actualizar
            </button>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {RESUMEN_CONFIG.map(({ label, icon, bg, border, text }) => {
              const activo = filtroEstado === label;
              return (
                <button key={label}
                  onClick={() => setFiltroEstado(activo ? "Todos" : label)}
                  className="rounded-2xl p-4 text-left transition hover:opacity-90"
                  style={{
                    backgroundColor: activo ? bg : "rgba(107,142,78,0.06)",
                    border: activo ? `2px solid ${border}` : "1px solid rgba(107,142,78,0.12)",
                  }}>
                  <p className="text-xl mb-1">{icon}</p>
                  <p className="text-2xl font-extrabold" style={{ color: text }}>{countPorEstado(label)}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "#6B8E4E" }}>{label}</p>
                </button>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input type="text" placeholder="Buscar por # pedido, documento, nombre o direccion..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE}>
              <option value="Todos">Todos los estados</option>
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
                  {["Pedido", "Cliente", "Direccion", "Pago", "Estado", "Cambiar estado"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${i === 1 ? "hidden md:table-cell text-left" : ""} ${i === 2 ? "hidden lg:table-cell text-left" : ""} ${i === 3 ? "hidden md:table-cell text-center" : ""} ${i === 4 || i === 5 ? "text-center" : ""} ${i === 0 ? "text-left" : ""}`}
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
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No hay domicilios que coincidan.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((d) => {
                    const badge = badgeEstado(d.Estado_Domicilio);
                    return (
                      <tr key={d.Cod_Domicilio} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3">
                          <p className="font-bold" style={{ color: "#1B2727" }}>#{d.Cod_Pedido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{formatFecha(d.Fecha_Domicilio)}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium" style={{ color: "#3C5148" }}>{d.Nombre} {d.Apellido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>
                            {d.Telefono_entrega || d.Telefono_cliente || d.Num_Documento}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs max-w-52 truncate" style={{ color: "#3C5148" }}>
                            {d.Direccion_entrega || <span style={{ color: "#1B2727", fontStyle: "italic" }}>Sin direccion</span>}
                          </p>
                          {d.Notas && (
                            <p className="text-xs mt-0.5 max-w-52 truncate" style={{ color: "#6B8E4E" }} title={d.Notas}>
                              {d.Notas}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-center">
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{d.Metodo_Pago || "-"}</p>
                          <p className="text-xs font-semibold" style={{ color: d.verificacion === "aprobado" ? "#6B8E4E" : "#fbbf24" }}>
                            {d.verificacion || "pendiente"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: badge.bg, color: badge.text }}>
                            {badge.icon} {d.Estado_Domicilio || "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={d.Estado_Domicilio || "Pendiente"}
                            disabled={cambiando === d.Cod_Domicilio}
                            onChange={(e) => handleCambiarEstado(d.Cod_Domicilio, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg focus:outline-none disabled:opacity-50"
                            style={INPUT_STYLE}>
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
