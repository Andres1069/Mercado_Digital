import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService, metodoPagoConfigService, resolverImagen } from "../services/api";
import { useCart } from "../context/CartContext";

const ICONOS = { Nequi: "💜", Daviplata: "🟡" };
const COLORES = {
  Nequi:     { fondo: "#6b21a8", claro: "rgba(107,33,168,0.10)", borde: "#a855f7" },
  Daviplata: { fondo: "#b45309", claro: "rgba(180,83,9,0.10)",   borde: "#f59e0b" },
};

export default function PagoQR() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const pedidoId   = Number(params.get("pedido"));
  const metodo     = params.get("metodo") || "Nequi";

  const { clearCart } = useCart();

  const [config,     setConfig]     = useState(null);
  const [pago,       setPago]       = useState(null);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState("");

  // Formulario
  const [monto,      setMonto]      = useState("");
  const [archivo,    setArchivo]    = useState(null);
  const [nombreArch, setNombreArch] = useState("");
  const [enviando,   setEnviando]   = useState(false);
  const [resultado,  setResultado]  = useState(null); // { es_correcto, verificacion, mensaje }
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const inputFileRef = useRef(null);

  const colores = COLORES[metodo] || COLORES.Nequi;

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pedidoId) { setError("Pedido inválido."); setCargando(false); return; }

    Promise.all([
      metodoPagoConfigService.obtener(metodo),
      pagoService.obtener(pedidoId),
    ])
      .then(([cfgRes, pagoRes]) => {
        setConfig(cfgRes.config);
        setPago(pagoRes.pago);
        // Si ya tiene comprobante, mostramos el resultado anterior
        if (pagoRes.pago?.verificacion && pagoRes.pago?.comprobante_url) {
          const yaAprobado = pagoRes.pago.verificacion === "aprobado";
          if (yaAprobado) clearCart();
          setResultado({
            es_correcto:  yaAprobado,
            verificacion: pagoRes.pago.verificacion,
            mensaje: pagoRes.pago.notas_verificacion || "Comprobante ya enviado.",
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [pedidoId, metodo, clearCart]);

  // ── Manejo de archivo ──────────────────────────────────────────────────
  function handleArchivo(e) {
    const f = e.target.files[0];
    if (!f) return;
    const extOK = /\.(png|jpe?g|pdf)$/i.test(f.name);
    if (!extOK) {
      setError("Solo se permiten archivos PNG, JPG, JPEG o PDF.");
      e.target.value = "";
      return;
    }
    setArchivo(f);
    setNombreArch(f.name);
    setError("");
  }

  // ── Envío del comprobante ──────────────────────────────────────────────
  async function handleEnviar(e) {
    e.preventDefault();
    setError("");

    // Validar campos y que el monto sea exactamente el esperado
    setIntentoEnvio(true);
    const montoNum   = Math.round(Number(String(monto).replace(/\./g, "")));
    const esperado   = Number(pago?.Monto_Pago || 0);
    const montoVacio = !monto || montoNum <= 0;
    const archivoVacio = !archivo;

    if (montoVacio || archivoVacio) {
      const faltantes = [];
      if (montoVacio)   faltantes.push("el monto pagado");
      if (archivoVacio) faltantes.push("el comprobante (imagen o PDF)");
      setError(`Debes completar los siguientes campos antes de enviar: ${faltantes.join(" y ")}.`);
      return;
    }

    if (esperado > 0 && montoNum !== esperado) {
      setError(`El monto ingresado (${fmt(montoNum)}) no coincide con el total a pagar (${fmt(esperado)}). Debes ingresar el valor exacto.`);
      return;
    }
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("comprobante", archivo);
      fd.append("monto_comprobante", String(Math.round(Number(String(monto).replace(/\./g, "")))));
      const res = await pagoService.subirComprobante(pedidoId, fd);
      if (res.verificacion === "aprobado") clearCart();
      setResultado(res);
    } catch (e) {
      setError(e.message || "Error al enviar el comprobante.");
    } finally {
      setEnviando(false);
    }
  }

  // ── Formateo de moneda ─────────────────────────────────────────────────
  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

  // ── Render de estados ──────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen md-app-bg">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-slate-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Encabezado de método */}
        <div
          className="rounded-[2rem] p-6 text-white mb-5"
          style={{ backgroundColor: colores.fondo }}
        >
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">Método de pago</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ICONOS[metodo] || "💳"}</span>
            <div>
              <h1 className="text-2xl font-black">{metodo}</h1>
              {pago && <p className="text-white/85 text-sm mt-0.5">Total a pagar: <span className="font-extrabold">{fmt(pago.Monto_Pago)}</span></p>}
            </div>
          </div>
          {pago && (
            <p className="text-xs text-white/60 mt-3">Pedido #{pedidoId} · Pedido registrado</p>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm border"
            style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {/* ── Resultado de verificación ── */}
        {resultado && (
          <div
            className="rounded-[1.8rem] border p-6 mb-5"
            style={
              resultado.verificacion === "aprobado"
                ? { backgroundColor: "rgba(16,185,129,0.08)", borderColor: "#6ee7b7" }
                : resultado.verificacion === "rechazado"
                ? { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }
                : { backgroundColor: "rgba(245,158,11,0.07)", borderColor: "#fcd34d" }
            }
          >
            {/* ── Pendiente: mensaje principal ── */}
            {resultado.verificacion === "pendiente" && (
              <>
                <p className="text-4xl mb-3 text-center">⏳</p>
                <p className="font-extrabold text-slate-800 text-lg text-center">
                  ¡Comprobante recibido!
                </p>
                <p className="text-center text-slate-600 mt-2 text-sm leading-relaxed">
                  Tu pedido será confirmado en unos minutos.<br />
                  Por favor espera mientras un administrador revisa tu pago.
                </p>
                <div className="mt-4 rounded-2xl px-4 py-3 text-center"
                  style={{ backgroundColor: "rgba(245,158,11,0.10)" }}>
                  <p className="text-xs font-semibold text-amber-700">
                    Recibirás confirmación una vez sea aprobado. Puedes revisar el estado en
                    <button
                      onClick={() => navigate("/mis-pedidos")}
                      className="underline font-bold ml-1"
                    >
                      Mis pedidos
                    </button>.
                  </p>
                </div>
              </>
            )}

            {/* ── Aprobado por admin ── */}
            {resultado.verificacion === "aprobado" && (
              <>
                <p className="text-4xl mb-3 text-center">✅</p>
                <p className="font-extrabold text-slate-800 text-lg text-center">¡Pago aprobado!</p>
                <p className="text-center text-slate-600 mt-2 text-sm">
                  El administrador verificó tu pago. Ya puedes registrar la dirección de entrega.
                </p>
                <button
                  onClick={() => navigate(`/domicilio/crear?pedido=${pedidoId}`)}
                  className="mt-4 w-full py-3 rounded-2xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                >
                  Continuar → Registrar dirección de entrega
                </button>
              </>
            )}

            {/* ── Rechazado por admin ── */}
            {resultado.verificacion === "rechazado" && (
              <>
                <p className="text-4xl mb-3 text-center">❌</p>
                <p className="font-extrabold text-slate-800 text-lg text-center">Pago rechazado</p>
                <p className="text-center text-slate-600 mt-2 text-sm">
                  {resultado.mensaje || "El administrador rechazó el comprobante."}
                </p>
                <button
                  onClick={() => { setResultado(null); setArchivo(null); setNombreArch(""); setMonto(""); setIntentoEnvio(false); setError(""); }}
                  className="mt-4 w-full py-2.5 rounded-2xl border text-sm font-bold transition"
                  style={{ borderColor: colores.borde, color: colores.fondo }}
                >
                  Subir nuevo comprobante
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Panel de instrucciones y QR ── */}
        {!resultado && (
          <>
            <div className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5 mb-4">
              <h2 className="font-extrabold text-slate-800 text-base mb-4">
                Cómo pagar con {metodo}
              </h2>

              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: colores.fondo }}>1</span>
                  <span>Abre tu app de <strong>{metodo}</strong> y selecciona <em>Pagar con QR</em> o <em>Transferir</em>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: colores.fondo }}>2</span>
                  <span>
                    {config?.qr_url ? "Escanea el código QR o " : "Ingresa "}
                    {config?.numero
                      ? <>escríbele al número <strong>{config.numero}</strong>.</>
                      : "transfiere al número registrado."}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: colores.fondo }}>3</span>
                  <span>Envía exactamente <strong>{fmt(pago?.Monto_Pago)}</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: colores.fondo }}>4</span>
                  <span>Descarga el comprobante y súbelo en el formulario de abajo.</span>
                </li>
              </ol>

              {/* QR e info de pago */}
              <div className="mt-5 flex flex-col sm:flex-row gap-4 items-center">
                {/* QR */}
                <div
                  className="w-40 h-40 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ borderColor: colores.borde, backgroundColor: colores.claro }}
                >
                  {config?.qr_url ? (
                    <img
                      src={resolverImagen(config.qr_url)}
                      alt={`QR ${metodo}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <p className="text-3xl">📷</p>
                      <p className="text-xs text-slate-400 mt-1">QR no configurado</p>
                    </div>
                  )}
                </div>

                {/* Datos */}
                <div className="flex-1 space-y-3">
                  {config?.numero && (
                    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: colores.claro }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Número {metodo}</p>
                      <p className="text-xl font-extrabold mt-0.5" style={{ color: colores.fondo }}>
                        {config.numero}
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl px-4 py-3 bg-slate-50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Monto exacto</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{fmt(pago?.Monto_Pago)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Formulario de comprobante ── */}
            <form
              onSubmit={handleEnviar}
              className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5"
            >
              <h2 className="font-extrabold text-slate-800 text-base mb-4">Subir comprobante de pago</h2>

              {/* Monto */}
              {(() => {
                const montoNum      = Number(String(monto).replace(/\./g, ""));
                const esperado      = Number(pago?.Monto_Pago || 0);
                const montoVacio    = intentoEnvio && (!monto || montoNum <= 0);
                const montoIncorrecto = monto && montoNum > 0 && esperado > 0 && montoNum !== esperado;
                const montoOk       = monto && montoNum === esperado && esperado > 0;
                const bordeColor    = montoVacio || montoIncorrecto ? "#dc2626" : montoOk ? "#6B8E4E" : "var(--md-border)";
                const bgColor       = montoVacio || montoIncorrecto ? "#fff5f5" : montoOk ? "rgba(16,185,129,0.05)" : "white";
                return (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: montoVacio ? "#dc2626" : "#64748b" }}>
                      Monto que pagaste (tal como aparece en el comprobante)
                      {montoVacio && <span className="ml-1 normal-case">— campo obligatorio</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={esperado > 0 ? `Debe ser ${fmt(esperado)}` : "Ej: 45900"}
                        value={monto}
                        onChange={(e) => { setMonto(e.target.value.replace(/[^0-9.]/g, "")); setIntentoEnvio(false); setError(""); }}
                        className="w-full px-4 py-3 pr-10 rounded-2xl border-2 text-slate-800 font-bold text-lg focus:outline-none transition"
                        style={{ borderColor: bordeColor, backgroundColor: bgColor }}
                      />
                      {montoOk && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">✅</span>
                      )}
                      {montoIncorrecto && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">❌</span>
                      )}
                    </div>
                    {pago && (
                      <p className="text-xs mt-1.5 font-medium"
                        style={{ color: montoIncorrecto ? "#dc2626" : montoOk ? "#059669" : "#94a3b8" }}>
                        {montoIncorrecto
                          ? `El monto debe ser exactamente ${fmt(esperado)}. Verifica tu comprobante.`
                          : montoOk
                          ? `Monto correcto. Coincide con el total del pedido.`
                          : `El monto debe ser exactamente ${fmt(esperado)}.`}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Archivo */}
              {(() => {
                const archivoError = intentoEnvio && !archivo;
                return (
                  <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: archivoError ? "#dc2626" : "#64748b" }}>
                      Comprobante (PNG, JPG, JPEG o PDF)
                      {archivoError && <span className="ml-1 normal-case">— campo obligatorio</span>}
                    </label>
                    <input
                      ref={inputFileRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => { handleArchivo(e); setIntentoEnvio(false); setError(""); }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => inputFileRef.current?.click()}
                      className="w-full py-4 rounded-2xl border-2 border-dashed text-sm font-semibold transition"
                      style={{
                        borderColor: archivoError ? "#dc2626" : archivo ? colores.borde : "#cbd5e1",
                        color:       archivoError ? "#dc2626" : archivo ? colores.fondo : "#64748b",
                        backgroundColor: archivoError ? "#fff5f5" : archivo ? colores.claro : "transparent",
                      }}
                    >
                      {nombreArch ? `📎 ${nombreArch}` : archivoError ? "⚠ Selecciona el comprobante" : "Toca para seleccionar archivo"}
                    </button>
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-3.5 rounded-2xl text-white font-extrabold text-base disabled:opacity-50 transition"
                style={{ backgroundColor: colores.fondo }}
              >
                {enviando ? "Enviando..." : "Enviar comprobante"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
