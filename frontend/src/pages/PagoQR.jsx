import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService } from "../services/api";

export default function PagoQR() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const pedidoId   = Number(params.get("pedido"));

  const [pago,      setPago]      = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState("");
  const [redirigiendo, setRedirigiendo] = useState(false);

  useEffect(() => {
    if (!pedidoId) { setError("Pedido inválido."); setCargando(false); return; }

    pagoService.obtener(pedidoId)
      .then((res) => {
        setPago(res.pago);
        // Si ya está completado, ir directo al resultado
        if (res.pago?.Estado_Pago === "Completado") {
          navigate(`/pago/resultado?pedido=${pedidoId}&status=approved`);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [pedidoId, navigate]);

  async function handlePagar() {
    setError("");
    setRedirigiendo(true);
    try {
      const res = await pagoService.crearPreferencia(pedidoId, window.location.origin);
      // Redirigir al checkout de MercadoPago
      window.location.href = res.init_point;
    } catch (e) {
      setError(e.message || "No se pudo iniciar el pago.");
      setRedirigiendo(false);
    }
  }

  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

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

      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Logo MercadoPago */}
        <div className="rounded-[2rem] p-6 text-white mb-5"
          style={{ background: "linear-gradient(135deg,#009EE3,#00BCFF)" }}>
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">Pasarela de pago</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💳</span>
            <div>
              <h1 className="text-2xl font-black">MercadoPago</h1>
              {pago && (
                <p className="text-white/85 text-sm mt-0.5">
                  Total: <span className="font-extrabold">{fmt(pago.Monto_Pago)}</span>
                </p>
              )}
            </div>
          </div>
          {pago && (
            <p className="text-xs text-white/60 mt-3">Pedido #{pedidoId}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm border"
            style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {/* Métodos aceptados */}
        <div className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5 mb-4">
          <h2 className="font-extrabold text-slate-800 text-base mb-4">Métodos de pago aceptados</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icono: "💜", nombre: "Nequi",     color: "#6b21a8" },
              { icono: "🟡", nombre: "Daviplata", color: "#b45309" },
              { icono: "💳", nombre: "Tarjeta",   color: "#1d4ed8" },
            ].map(({ icono, nombre, color }) => (
              <div key={nombre}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}>
                <span className="text-2xl">{icono}</span>
                <span className="text-xs font-bold" style={{ color }}>{nombre}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            También PSE y otras opciones disponibles en el checkout
          </p>
        </div>

        {/* Instrucciones */}
        <div className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5 mb-5">
          <h2 className="font-extrabold text-slate-800 text-base mb-3">¿Cómo funciona?</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            {[
              "Haz clic en «Pagar con MercadoPago» para ser redirigido de forma segura.",
              "Elige tu método de pago: Nequi, Daviplata, tarjeta débito/crédito u otros.",
              `Confirma el pago de ${fmt(pago?.Monto_Pago)}.`,
              "Serás redirigido de vuelta automáticamente con la confirmación.",
            ].map((texto, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#009EE3,#00BCFF)" }}>
                  {i + 1}
                </span>
                <span>{texto}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Botón pagar */}
        <button
          onClick={handlePagar}
          disabled={redirigiendo || !pago}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base disabled:opacity-50 transition"
          style={{ background: "linear-gradient(135deg,#009EE3,#00BCFF)" }}
        >
          {redirigiendo ? "Redirigiendo a MercadoPago..." : `Pagar ${fmt(pago?.Monto_Pago)} con MercadoPago`}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Pago seguro procesado por MercadoPago · SSL 256-bit
        </p>
      </div>
    </div>
  );
}
