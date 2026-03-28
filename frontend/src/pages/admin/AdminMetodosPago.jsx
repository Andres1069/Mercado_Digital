import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { metodoPagoConfigService, resolverImagen } from "../../services/api";

const ICONOS  = { Nequi: "💜", Daviplata: "🟡" };
const COLORES = {
  Nequi:     { fondo: "#6b21a8", claro: "rgba(107,33,168,0.15)", borde: "#a855f7" },
  Daviplata: { fondo: "#b45309", claro: "rgba(180,83,9,0.15)",   borde: "#f59e0b" },
};

const LABEL = { color: "var(--md-text-soft)" };
const INPUT_STYLE = { backgroundColor: "var(--md-surface-soft)", border: "1px solid var(--md-border)", color: "var(--md-text)" };

function TarjetaMetodo({ cfg, onActualizar }) {
  const col        = COLORES[cfg.metodo] || COLORES.Nequi;
  const qrInputRef = useRef(null);

  const [numero,    setNumero]    = useState(cfg.numero || "");
  const [guardNum,  setGuardNum]  = useState(false);
  const [msgNum,    setMsgNum]    = useState("");

  const [qrArchivo, setQrArchivo] = useState(null);
  const [qrNombre,  setQrNombre]  = useState("");
  const [subiendo,  setSubiendo]  = useState(false);
  const [msgQR,     setMsgQR]     = useState("");

  async function handleGuardarNumero(e) {
    e.preventDefault();
    setGuardNum(true); setMsgNum("");
    try {
      await metodoPagoConfigService.actualizar(cfg.id, { numero });
      setMsgNum("Numero guardado correctamente.");
      onActualizar();
    } catch (err) { setMsgNum(err.message); }
    finally { setGuardNum(false); }
  }

  function handleSeleccionQR(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!/\.(png|jpe?g)$/i.test(f.name)) {
      setMsgQR("Solo se permiten imagenes PNG, JPG o JPEG para el QR.");
      e.target.value = "";
      return;
    }
    setQrArchivo(f);
    setQrNombre(f.name);
    setMsgQR("");
  }

  async function handleSubirQR(e) {
    e.preventDefault();
    if (!qrArchivo) { setMsgQR("Selecciona una imagen primero."); return; }
    setSubiendo(true); setMsgQR("");
    try {
      const fd = new FormData();
      fd.append("qr", qrArchivo);
      await metodoPagoConfigService.uploadQR(cfg.id, fd);
      setMsgQR("QR actualizado correctamente.");
      setQrArchivo(null);
      setQrNombre("");
      onActualizar();
    } catch (err) { setMsgQR(err.message); }
    finally { setSubiendo(false); }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" }}>
      {/* Header */}
      <div className="px-6 py-5 text-white" style={{ backgroundColor: col.fondo }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{ICONOS[cfg.metodo] || "💳"}</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Metodo de pago</p>
            <h2 className="text-xl font-extrabold">{cfg.metodo}</h2>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: "rgba(213,221,223,0.25)", color: "white" }}>
            {cfg.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="p-6 grid sm:grid-cols-2 gap-6">
        {/* QR actual */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={LABEL}>QR actual</p>
          <div className="rounded-2xl border-2 h-52 flex items-center justify-center overflow-hidden"
            style={{ borderColor: col.borde, backgroundColor: col.claro }}>
            {cfg.qr_url ? (
              <img src={resolverImagen(cfg.qr_url)} alt={`QR ${cfg.metodo}`} className="max-h-full object-contain p-2" />
            ) : (
              <div className="text-center p-4">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-sm" style={{ color: "#6B8E4E" }}>Sin QR configurado</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubirQR} className="mt-4 space-y-3">
            <input ref={qrInputRef} type="file" accept=".png,.jpg,.jpeg" onChange={handleSeleccionQR} className="hidden" />
            <button type="button" onClick={() => qrInputRef.current?.click()}
              className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition"
              style={{
                borderColor: qrArchivo ? col.borde : "rgba(213,221,223,0.2)",
                color: qrArchivo ? col.borde : "#8A9E8A",
                backgroundColor: qrArchivo ? col.claro : "transparent",
              }}>
              {qrNombre ? `📎 ${qrNombre}` : "Seleccionar imagen QR (PNG / JPG)"}
            </button>
            <button type="submit" disabled={subiendo || !qrArchivo}
              className="w-full py-2.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition"
              style={{ backgroundColor: col.fondo }}>
              {subiendo ? "Subiendo..." : "Subir QR"}
            </button>
            {msgQR && (
              <p className="text-xs text-center" style={{ color: msgQR.includes("correctamente") ? "#6B8E4E" : "#f87171" }}>
                {msgQR}
              </p>
            )}
          </form>
        </div>

        {/* Número */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={LABEL}>Numero de {cfg.metodo}</p>
          <div className="rounded-2xl px-4 py-4 mb-4" style={{ backgroundColor: col.claro }}>
            <p className="text-xs" style={{ color: "#6B8E4E" }}>Numero actual</p>
            <p className="text-2xl font-extrabold mt-0.5" style={{ color: col.borde }}>
              {cfg.numero || <span className="text-base font-medium" style={{ color: "#1B2727" }}>Sin configurar</span>}
            </p>
          </div>

          <form onSubmit={handleGuardarNumero} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={LABEL}>Nuevo numero</label>
              <input type="tel" value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/[^0-9\s\-+]/g, ""))}
                placeholder="Ej: 3001234567"
                className="w-full px-4 py-3 rounded-xl text-base font-semibold focus:outline-none"
                style={INPUT_STYLE} />
            </div>
            <button type="submit" disabled={guardNum}
              className="w-full py-2.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition"
              style={{ backgroundColor: col.fondo }}>
              {guardNum ? "Guardando..." : "Guardar numero"}
            </button>
            {msgNum && (
              <p className="text-xs text-center" style={{ color: msgNum.includes("correctamente") ? "#6B8E4E" : "#f87171" }}>
                {msgNum}
              </p>
            )}
          </form>

          <div className="mt-5 rounded-xl p-4" style={{ border: "1px dashed rgba(107,142,78,0.18)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B8E4E" }}>Informacion</p>
            <ul className="text-xs space-y-1.5" style={{ color: "#6B8E4E" }}>
              <li>• El QR y el numero son visibles por los clientes al pagar.</li>
              <li>• Formatos de QR aceptados: PNG, JPG, JPEG.</li>
              <li>• Al subir un nuevo QR se elimina el anterior automaticamente.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminMetodosPago() {
  const [configs,  setConfigs]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");

  async function cargar() {
    setCargando(true); setError("");
    try {
      const res = await metodoPagoConfigService.listar();
      setConfigs(res.config || []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Metodos de Pago</h1>
            <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
              Configura el QR y el numero de cada metodo digital disponible para los clientes
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {cargando ? (
            <div className="text-center py-24 text-sm" style={{ color: "#6B8E4E" }}>Cargando configuracion...</div>
          ) : (
            <div className="space-y-6">
              {configs.map((cfg) => (
                <TarjetaMetodo key={cfg.id} cfg={cfg} onActualizar={cargar} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
