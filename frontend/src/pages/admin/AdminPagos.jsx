import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { pagoService, resolverImagen } from "../../services/api";

const ESTADOS_FILTRO = ["todos", "pendiente", "aprobado", "rechazado"];
const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };

const BADGE = {
  aprobado:  { bg: "rgba(107,142,78,0.2)", color: "#6B8E4E",  label: "Aprobado" },
  rechazado: { bg: "rgba(239,68,68,0.15)",  color: "#f87171",  label: "Rechazado" },
  pendiente: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24",  label: "Pendiente" },
};

const BADGE_PAGO = {
  Completado: { bg: "rgba(107,142,78,0.2)", color: "#6B8E4E" },
  Pendiente:  { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  Fallido:    { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
};

function BadgeVerificacion({ estado }) {
  const s = BADGE[estado] || BADGE.pendiente;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function AdminPagos() {
  const [pagos,     setPagos]     = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState("");
  const [filtro,    setFiltro]    = useState("todos");
  const [buscar,    setBuscar]    = useState("");

  const [modal,     setModal]     = useState(null);
  const [estado,    setEstado]    = useState("aprobado");
  const [notas,     setNotas]     = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msgModal,  setMsgModal]  = useState("");

  const [verImg,    setVerImg]    = useState(null);
  const [zoom,      setZoom]      = useState(1);
  const [drag,      setDrag]      = useState({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const [offset,    setOffset]    = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  function abrirVisor(src) { setVerImg(src); setZoom(1); setOffset({ x: 0, y: 0 }); }
  function cerrarVisor()   { setVerImg(null); }

  function handleWheel(e) { e.preventDefault(); setZoom((z) => Math.min(5, Math.max(1, z - e.deltaY * 0.005))); }
  function handleZoomBtn(delta) { setZoom((z) => Math.min(5, Math.max(1, parseFloat((z + delta).toFixed(1))))); }
  function resetZoom() { setZoom(1); setOffset({ x: 0, y: 0 }); }
  function handleMouseDown(e) { if (zoom <= 1) return; setDrag({ active: true, startX: e.clientX - offset.x, startY: e.clientY - offset.y, x: 0, y: 0 }); }
  function handleMouseMove(e) { if (!drag.active) return; setOffset({ x: e.clientX - drag.startX, y: e.clientY - drag.startY }); }
  function handleMouseUp() { setDrag((d) => ({ ...d, active: false })); }

  async function cargar() {
    setCargando(true); setError("");
    try {
      const res = await pagoService.todos();
      setPagos(res.pagos || []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleGuardar() {
    setGuardando(true); setMsgModal("");
    try {
      await pagoService.verificar(modal.pago.Cod_Pago, estado, notas);
      setMsgModal("Estado actualizado correctamente.");
      cargar();
      setTimeout(() => { setModal(null); setMsgModal(""); }, 1200);
    } catch (e) { setMsgModal(e.message); }
    finally { setGuardando(false); }
  }

  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

  const filtrados = pagos.filter((p) => {
    const matchFiltro = filtro === "todos" || (p.verificacion || "pendiente") === filtro;
    const q = buscar.toLowerCase();
    const matchBuscar = !q
      || String(p.Cod_Pago).includes(q)
      || String(p.Cod_pedido).includes(q)
      || (p.cliente_nombre || "").toLowerCase().includes(q)
      || (p.cliente_documento || "").includes(q)
      || (p.Metodo_Pago || "").toLowerCase().includes(q);
    return matchFiltro && matchBuscar;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Pagos</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>Revisa comprobantes y aprueba o rechaza pagos</p>
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

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex gap-2 flex-wrap">
              {ESTADOS_FILTRO.map((f) => (
                <button key={f} onClick={() => setFiltro(f)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition capitalize"
                  style={
                    filtro === f
                      ? { backgroundColor: "#6B8E4E", color: "white", border: "1px solid #6366f1" }
                      : { backgroundColor: "rgba(107,142,78,0.08)", color: "#3C5148", border: "1px solid rgba(107,142,78,0.15)" }
                  }>
                  {f === "todos" ? "Todos" : BADGE[f]?.label || f}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Buscar por pedido, cliente, metodo..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

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
                    {["#Pago","#Pedido","Cliente","Metodo","Esperado","Comprobante","Estado Pago","Verificacion","Acciones"].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#6B8E4E" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => {
                    const verif = p.verificacion || "pendiente";
                    const bp = BADGE_PAGO[p.Estado_Pago] || BADGE_PAGO.Pendiente;
                    return (
                      <tr key={p.Cod_Pago} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3.5 font-mono font-bold whitespace-nowrap" style={{ color: "#3C5148" }}>#{p.Cod_Pago}</td>
                        <td className="px-4 py-3.5 font-mono whitespace-nowrap" style={{ color: "#6B8E4E" }}>#{p.Cod_pedido}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-semibold" style={{ color: "#1B2727" }}>{p.cliente_nombre} {p.cliente_apellido}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.cliente_documento}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#3C5148" }}>{p.Metodo_Pago}</td>
                        <td className="px-4 py-3.5 font-extrabold whitespace-nowrap" style={{ color: "#6B8E4E" }}>{fmt(p.Monto_Pago)}</td>
                        <td className="px-4 py-3.5">
                          {p.comprobante_url ? (
                            <div className="space-y-1">
                              <button onClick={() => abrirVisor(resolverImagen(p.comprobante_url))}
                                className="text-xs font-semibold hover:underline" style={{ color: "#3C5148" }}>
                                Ver comprobante
                              </button>
                              {p.monto_comprobante && (
                                <p className="text-xs" style={{ color: "#6B8E4E" }}>Monto: {fmt(p.monto_comprobante)}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "#1B2727" }}>Sin comprobante</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: bp.bg, color: bp.color }}>
                            {p.Estado_Pago || "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <BadgeVerificacion estado={verif} />
                          {p.notas_verificacion && (
                            <p className="text-xs mt-1 max-w-[160px] truncate" style={{ color: "#6B8E4E" }} title={p.notas_verificacion}>
                              {p.notas_verificacion}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => { setModal({ pago: p }); setEstado(verif === "pendiente" ? "aprobado" : verif); setNotas(p.notas_verificacion || ""); setMsgModal(""); }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                            style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                            Verificar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal verificación */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
            <div className="rounded-2xl shadow-2xl w-full max-w-md p-6"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
              <h3 className="text-lg font-extrabold mb-1" style={{ color: "#1B2727" }}>Verificar pago #{modal.pago.Cod_Pago}</h3>
              <p className="text-sm mb-4" style={{ color: "#3C5148" }}>
                Cliente: <strong style={{ color: "#1B2727" }}>{modal.pago.cliente_nombre} {modal.pago.cliente_apellido}</strong>
                {" · "}Monto: <strong style={{ color: "#6B8E4E" }}>{fmt(modal.pago.Monto_Pago)}</strong>
                {modal.pago.monto_comprobante ? ` · Comp: ${fmt(modal.pago.monto_comprobante)}` : ""}
              </p>

              {modal.pago.comprobante_url && (
                <div className="mb-4 rounded-xl overflow-hidden max-h-52 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.12)" }}>
                  {/\.pdf$/i.test(modal.pago.comprobante_url) ? (
                    <a href={resolverImagen(modal.pago.comprobante_url)} target="_blank" rel="noreferrer"
                      className="text-sm font-semibold py-6" style={{ color: "#3C5148" }}>
                      📄 Ver PDF del comprobante
                    </a>
                  ) : (
                    <img src={resolverImagen(modal.pago.comprobante_url)} alt="Comprobante" className="max-h-52 object-contain" />
                  )}
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#3C5148" }}>Estado</label>
                  <div className="flex gap-2">
                    {["aprobado", "pendiente", "rechazado"].map((op) => (
                      <button key={op} onClick={() => setEstado(op)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition"
                        style={
                          estado === op
                            ? { backgroundColor: op === "aprobado" ? "#10b981" : op === "rechazado" ? "#ef4444" : "#f59e0b", color: "white", border: "none" }
                            : { backgroundColor: "rgba(107,142,78,0.08)", color: "#6B8E4E", border: "1px solid rgba(107,142,78,0.15)" }
                        }>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#3C5148" }}>Notas (opcional)</label>
                  <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
                    style={{ backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" }}
                    placeholder="Motivo de aprobacion o rechazo..." />
                </div>
              </div>

              {msgModal && (
                <p className="text-xs text-center mb-3"
                  style={{ color: msgModal.includes("correctamente") ? "#6B8E4E" : "#f87171" }}>
                  {msgModal}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visor de comprobante */}
        {verImg && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/90"
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => handleZoomBtn(-0.25)} disabled={zoom <= 1}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg disabled:opacity-30 transition">−</button>
                <span className="text-white text-sm font-semibold w-14 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoomBtn(0.25)} disabled={zoom >= 5}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg disabled:opacity-30 transition">+</button>
                {zoom > 1 && (
                  <button onClick={resetZoom} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition">
                    Resetear
                  </button>
                )}
              </div>
              <button onClick={cerrarVisor} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
                Cerrar ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center"
              style={{ cursor: zoom > 1 ? (drag.active ? "grabbing" : "grab") : "default" }}
              onWheel={handleWheel}>
              {/\.pdf$/i.test(verImg) ? (
                <iframe src={verImg} className="w-full h-full" title="Comprobante PDF" />
              ) : (
                <img ref={imgRef} src={verImg} alt="Comprobante" draggable={false}
                  onMouseDown={handleMouseDown}
                  className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
                  style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`, transformOrigin: "center center" }} />
              )}
            </div>
            {zoom <= 1 && <p className="text-center text-white/40 text-xs pb-3">Usa la rueda del mouse o los botones para hacer zoom</p>}
          </div>
        )}
      </div>
    </div>
  );
}
