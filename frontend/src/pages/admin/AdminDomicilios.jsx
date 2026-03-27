import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { domicilioService } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const ESTADOS = ["Pendiente", "En preparacion", "En camino", "Entregado", "Cancelado"];

function badgeEstado(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado")) return { bg: "rgba(107,142,78,0.2)", text: "#6B8E4E", icon: "✅" };
  if (e.includes("camino")) return { bg: "rgba(107,142,78,0.18)", text: "#3C5148", icon: "🛵" };
  if (e.includes("preparacion")) return { bg: "rgba(178,197,178,0.2)", text: "#3C5148", icon: "📦" };
  if (e.includes("cancel")) return { bg: "rgba(239,68,68,0.15)", text: "#f87171", icon: "❌" };
  return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", icon: "⏳" };
}

const RESUMEN_CONFIG = [
  { label: "Pendiente", icon: "⏳", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#fbbf24" },
  { label: "En preparacion", icon: "📦", bg: "rgba(178,197,178,0.2)", border: "rgba(178,197,178,0.4)", text: "#3C5148" },
  { label: "En camino", icon: "🛵", bg: "rgba(107,142,78,0.18)", border: "rgba(107,142,78,0.4)", text: "#3C5148" },
  { label: "Entregado", icon: "✅", bg: "rgba(107,142,78,0.2)", border: "rgba(107,142,78,0.4)", text: "#6B8E4E" },
];

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminDomicilios() {
  const { esOscuro } = useTheme();
  const [domicilios, setDomicilios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cambiando, setCambiando] = useState(null);

  const cardStyle = {
    backgroundColor: "var(--md-surface)",
    border: "1px solid var(--md-border)",
    boxShadow: "var(--md-shadow)",
  };

  const inputStyle = {
    backgroundColor: esOscuro ? "#0f172a" : "#F8FAF9",
    border: `1px solid ${esOscuro ? "#334155" : "#B2C5B2"}`,
    color: esOscuro ? "#e5e7eb" : "#1B2727",
  };
  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    opacity: 1,
    WebkitTextFillColor: esOscuro ? "#e5e7eb" : "#1B2727",
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #94a3b8 50%), linear-gradient(135deg, #94a3b8 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 16px) calc(50% - 3px), calc(100% - 10px) calc(50% - 3px)",
    backgroundSize: "6px 6px, 6px 6px",
    backgroundRepeat: "no-repeat",
    paddingRight: "2rem",
  };

  const updateBtnStyle = {
    backgroundColor: esOscuro ? "#1f2937" : "#B2C5B2",
    border: `1px solid ${esOscuro ? "#475569" : "#B2C5B2"}`,
    color: esOscuro ? "#e5e7eb" : "#1B2727",
  };

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

  useEffect(() => {
    cargar();
  }, [cargar]);

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
              <h1 className="text-2xl font-extrabold" style={{ color: "var(--md-text)" }}>Gestion de Domicilios</h1>
              <p className="text-sm mt-1" style={{ color: "var(--md-text-soft)" }}>{domicilios.length} domicilios registrados</p>
            </div>
            <button onClick={cargar} className="px-4 py-2 rounded-xl text-sm font-semibold transition" style={updateBtnStyle}>
              Actualizar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {RESUMEN_CONFIG.map(({ label, icon, bg, border, text }) => {
              const activo = filtroEstado === label;
              return (
                <button
                  key={label}
                  onClick={() => setFiltroEstado(activo ? "Todos" : label)}
                  className="rounded-2xl p-4 text-left transition hover:opacity-90"
                  style={{
                    backgroundColor: activo ? bg : esOscuro ? "rgba(30,41,59,0.55)" : "rgba(107,142,78,0.06)",
                    border: activo ? `2px solid ${border}` : `1px solid ${esOscuro ? "rgba(71,85,105,0.5)" : "rgba(107,142,78,0.12)"}`,
                  }}
                >
                  <p className="text-xl mb-1">{icon}</p>
                  <p className="text-2xl font-extrabold" style={{ color: text }}>{countPorEstado(label)}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "#6B8E4E" }}>{label}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="Buscar por # pedido, documento, nombre o direccion..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={inputStyle}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={selectStyle}
            >
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} style={{ color: "#111827", backgroundColor: "#f8fafc" }}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
            >
              {error}
            </div>
          )}

          <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Pedido", "Cliente", "Direccion", "Pago", "Estado", "Cambiar estado"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${i === 1 ? "hidden md:table-cell text-left" : ""} ${i === 2 ? "hidden lg:table-cell text-left" : ""} ${i === 3 ? "hidden md:table-cell text-center" : ""} ${i === 4 || i === 5 ? "text-center" : ""} ${i === 0 ? "text-left" : ""}`}
                      style={{ color: "#6B8E4E" }}
                    >
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
                      <tr
                        key={d.Cod_Domicilio}
                        className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = esOscuro ? "rgba(148,163,184,0.08)" : "rgba(107,142,78,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold" style={{ color: "var(--md-text)" }}>#{d.Cod_Pedido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{formatFecha(d.Fecha_Domicilio)}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-medium" style={{ color: "var(--md-text-soft)" }}>{d.Nombre} {d.Apellido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>
                            {d.Telefono_entrega || d.Telefono_cliente || d.Num_Documento}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs max-w-52 truncate" style={{ color: "var(--md-text-soft)" }}>
                            {d.Direccion_entrega || <span style={{ color: "var(--md-text)", fontStyle: "italic" }}>Sin direccion</span>}
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
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.text }}>
                            {badge.icon} {d.Estado_Domicilio || "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={d.Estado_Domicilio || "Pendiente"}
                            disabled={cambiando === d.Cod_Domicilio}
                            onChange={(e) => handleCambiarEstado(d.Cod_Domicilio, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg focus:outline-none disabled:opacity-50"
                            style={selectStyle}
                          >
                            {ESTADOS.map((e) => (
                              <option key={e} value={e} style={{ color: "#111827", backgroundColor: "#f8fafc" }}>
                                {e}
                              </option>
                            ))}
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
