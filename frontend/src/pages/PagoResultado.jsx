import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService } from "../services/api";
import { useCart } from "../context/CartContext";

const POLL_INTERVAL = 4000; // cada 4 s
const POLL_MAX      = 10;   // máximo 10 intentos (40 s)

export default function PagoResultado() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { clearCart } = useCart();

  const pedidoId  = Number(params.get("pedido"));
  const statusUrl = params.get("status") || params.get("collection_status") || "";
  const paymentId = params.get("payment_id") || params.get("collection_id") || "";

  const [pago,     setPago]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");

  const pollRef   = useRef(null);
  const intentos  = useRef(0);

  function detenerPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  function aplicarPago(p) {
    setPago(p);
    if (p?.Estado_Pago === "Completado") { clearCart(); detenerPolling(); }
    if (p?.Estado_Pago === "Fallido")    { detenerPolling(); }
  }

  useEffect(() => {
    if (!pedidoId) { setError("Pedido inválido."); setCargando(false); return; }

    // Primera verificación: consulta a MP con el payment_id de la URL
    pagoService.verificarMP(pedidoId, paymentId || null)
      .then((res) => aplicarPago(res.pago))
      .catch(() => {
        // Fallback: usar el status que MP puso en la URL
        const estadoFallback =
          statusUrl === "approved" ? "Completado" :
          statusUrl === "rejected" ? "Fallido"    : "Pendiente";
        setPago({ Estado_Pago: estadoFallback });
      })
      .finally(() => setCargando(false));

    // Polling: si el estado sigue Pendiente, reintenta cada 4 s hasta confirmar
    pollRef.current = setInterval(async () => {
      intentos.current += 1;
      if (intentos.current >= POLL_MAX) { detenerPolling(); return; }

      try {
        const res = await pagoService.verificarMP(pedidoId, paymentId || null);
        aplicarPago(res.pago);
      } catch { /* silencioso */ }
    }, POLL_INTERVAL);

    return detenerPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId, paymentId]);

  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

  if (cargando) {
    return (
      <div className="min-h-screen md-app-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{ borderColor: "#009EE3", borderTopColor: "transparent" }} />
          <p className="text-slate-400 text-sm">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  const estado     = pago?.Estado_Pago || "Pendiente";
  const aprobado   = estado === "Completado";
  const rechazado  = estado === "Fallido";
  const pendiente  = !aprobado && !rechazado;

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-12">

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm border"
            style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {error}
          </div>
        )}

        <div className="rounded-[2rem] border p-8 text-center"
          style={
            aprobado  ? { backgroundColor: "rgba(16,185,129,0.07)", borderColor: "#6ee7b7" }
            : rechazado ? { backgroundColor: "#fee2e2",              borderColor: "#fca5a5" }
            :             { backgroundColor: "rgba(245,158,11,0.07)", borderColor: "#fcd34d" }
          }>

          {/* Ícono */}
          <p className="text-6xl mb-4">
            {aprobado ? "✅" : rechazado ? "❌" : "⏳"}
          </p>

          {/* Título */}
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
            {aprobado  ? "¡Pago aprobado!"
            : rechazado ? "Pago rechazado"
            :             "Pago en proceso"}
          </h1>

          {/* Mensaje */}
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {aprobado
              ? "Tu pago fue procesado exitosamente por MercadoPago. Ya puedes registrar tu dirección de entrega."
              : rechazado
              ? "El pago fue rechazado. Puedes intentarlo de nuevo con otro método de pago."
              : "Tu pago está siendo procesado. Recibirás una confirmación en breve."}
          </p>

          {/* Detalles */}
          {pago && (
            <div className="rounded-2xl px-4 py-3 mb-6 text-left space-y-2"
              style={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pedido</span>
                <span className="font-bold text-slate-800">#{pedidoId}</span>
              </div>
              {pago.Monto_Pago && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monto</span>
                  <span className="font-bold text-slate-800">{fmt(pago.Monto_Pago)}</span>
                </div>
              )}
              {pago.mp_payment_method && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Método</span>
                  <span className="font-bold text-slate-800 capitalize">{pago.mp_payment_method}</span>
                </div>
              )}
              {pago.mp_payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ID transacción</span>
                  <span className="font-mono text-xs text-slate-600">{pago.mp_payment_id}</span>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          {aprobado && (
            <button
              onClick={() => navigate(`/domicilio/crear?pedido=${pedidoId}`)}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-base transition"
              style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
            >
              Continuar → Registrar dirección de entrega
            </button>
          )}

          {rechazado && (
            <button
              onClick={() => navigate(`/pago/qr?pedido=${pedidoId}`)}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-base transition"
              style={{ background: "linear-gradient(135deg,#009EE3,#00BCFF)" }}
            >
              Intentar de nuevo
            </button>
          )}

          {pendiente && (
            <div className="space-y-3">
              <p className="text-xs text-amber-700 font-semibold">
                Tu pago puede demorar unos minutos en confirmarse.
              </p>
              <button
                onClick={() => navigate("/mis-pedidos")}
                className="w-full py-3 rounded-2xl text-sm font-bold border transition"
                style={{ borderColor: "#fcd34d", color: "#92400e" }}
              >
                Ver mis pedidos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
