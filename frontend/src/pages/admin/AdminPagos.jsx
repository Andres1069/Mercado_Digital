import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { pagoService } from "../../services/api";

const ESTADOS_FILTRO = ["todos", "Completado", "Pendiente", "Fallido"];
const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };

const BADGE_ESTADO = {
  Completado: { bg: "rgba(107,142,78,0.2)",  color: "#6B8E4E",  label: "Completado" },
  Pendiente:  { bg: "rgba(245,158,11,0.15)", color: "#d97706",  label: "Pendiente"  },
  Fallido:    { bg: "rgba(239,68,68,0.15)",  color: "#f87171",  label: "Fallido"    },
};

const METODO_LABEL = {
  nequi:          "Nequi",
  daviplata:      "Daviplata",
  credit_card:    "Tarjeta crédito",
  debit_card:     "Tarjeta débito",
  pse:            "PSE",
  account_money:  "Cuenta MP",
};

function BadgeEstado({ estado }) {
  const s = BADGE_ESTADO[estado] || BADGE_ESTADO.Pendiente;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function AdminPagos() {
  const [pagos,    setPagos]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");
  const [filtro,   setFiltro]   = useState("todos");
  const [buscar,   setBuscar]   = useState("");

  async function cargar() {
    setCargando(true); setError("");
    try {
      const res = await pagoService.todos();
      setPagos(res.pagos || []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

  const filtrados = pagos.filter((p) => {
    const matchFiltro = filtro === "todos" || p.Estado_Pago === filtro;
    const q = buscar.toLowerCase();
    const matchBuscar = !q
      || String(p.Cod_Pago).includes(q)
      || String(p.Cod_pedido).includes(q)
      || (p.cliente_nombre  || "").toLowerCase().includes(q)
      || (p.cliente_apellido|| "").toLowerCase().includes(q)
      || (p.cliente_documento || "").includes(q)
      || (p.Metodo_Pago     || "").toLowerCase().includes(q)
      || (p.mp_payment_id   || "").includes(q);
    return matchFiltro && matchBuscar;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestión de Pagos</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
                Pagos procesados automáticamente por MercadoPago
              </p>
            </div>
            <button onClick={cargar} disabled={cargando}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex gap-2 flex-wrap">
              {ESTADOS_FILTRO.map((f) => (
                <button key={f} onClick={() => setFiltro(f)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition capitalize"
                  style={
                    filtro === f
                      ? { backgroundColor: "#6B8E4E", color: "white", border: "1px solid #6B8E4E" }
                      : { backgroundColor: "rgba(107,142,78,0.08)", color: "#3C5148", border: "1px solid rgba(107,142,78,0.15)" }
                  }>
                  {f === "todos" ? "Todos" : BADGE_ESTADO[f]?.label || f}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Buscar por ID, cliente, método, transacción..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

          {/* Tabla */}
          {cargando ? (
            <div className="text-center py-20 text-sm" style={{ color: "#6B8E4E" }}>Cargando pagos...</div>
          ) : filtrados.length === 0 ? (
            <div className="rounded-2xl p-14 text-center" style={CARD}>
              <p className="text-4xl mb-3">💳</p>
              <p className="font-bold" style={{ color: "#6B8E4E" }}>No hay pagos que coincidan</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-x-auto" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                    {["#Pago","#Pedido","Cliente","Método","Monto","ID Transacción","Método MP","Estado"].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#6B8E4E" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.Cod_Pago} className="transition"
                      style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>

                      <td className="px-4 py-3.5 font-mono font-bold whitespace-nowrap" style={{ color: "#3C5148" }}>
                        #{p.Cod_Pago}
                      </td>
                      <td className="px-4 py-3.5 font-mono whitespace-nowrap" style={{ color: "#6B8E4E" }}>
                        #{p.Cod_pedido}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-semibold" style={{ color: "#1B2727" }}>{p.cliente_nombre} {p.cliente_apellido}</p>
                        <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.cliente_documento}</p>
                      </td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#3C5148" }}>
                        {p.Metodo_Pago}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold whitespace-nowrap" style={{ color: "#6B8E4E" }}>
                        {fmt(p.Monto_Pago)}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.mp_payment_id ? (
                          <span className="font-mono text-xs" style={{ color: "#3C5148" }}>{p.mp_payment_id}</span>
                        ) : (
                          <span className="text-xs" style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: "#3C5148" }}>
                        {p.mp_payment_method
                          ? (METODO_LABEL[p.mp_payment_method] || p.mp_payment_method)
                          : <span className="text-xs" style={{ color: "#94a3b8" }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <BadgeEstado estado={p.Estado_Pago || "Pendiente"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
