import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService, pedidoService } from "../services/api";
import AddressConfirmationModal from "../components/AddressConfirmationModal";

const HORARIO_PEDIDOS = "Los pedidos se realizan de lunes a viernes de 10 AM a 5 PM. Fines de semana de 10 AM a 4 PM.";

export default function PagoQR() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const pedidoId   = Number(params.get("pedido"));

  const [pago,      setPago]      = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState("");
  const [redirigiendo, setRedirigiendo] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState("domicilio");
  const [mostrarModalDireccion, setMostrarModalDireccion] = useState(false);
  const [direccionConfirmada, setDireccionConfirmada] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("md_checkout_delivery_address") || "null");
    } catch {
      return null;
    }
  });

  const requiereDireccion = tipoEntrega === "domicilio";
  useEffect(() => {
    if (!pedidoId) { setError("Pedido inválido."); setCargando(false); return; }

    pagoService.obtener(pedidoId)
      .then((res) => {
        setPago(res.pago);
        if (res.pago?.Tipo_Entrega) setTipoEntrega(String(res.pago.Tipo_Entrega).toLowerCase());
        // Si ya está completado, ir directo al resultado
        if (res.pago?.Estado_Pago === "Completado") {
          navigate(`/pago/resultado?pedido=${pedidoId}&status=approved`);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [pedidoId, navigate]);

  async function handlePagar() {
    if (requiereDireccion && !direccionConfirmada) {
      setMostrarModalDireccion(true);
      return;
    }
    setError("");
    setRedirigiendo(true);
    const ventanaPago = window.open("about:blank", "_blank");
    if (ventanaPago) {
      ventanaPago.opener = null;
      ventanaPago.document.title = "Cargando MercadoPago...";
      ventanaPago.document.body.innerHTML = "<p style=\"font-family: Arial, sans-serif; padding: 24px;\">Cargando pasarela de pago...</p>";
    }

    try {
      await pedidoService.actualizarEntrega(pedidoId, tipoEntrega);
      const res = await pagoService.crearPreferencia(pedidoId, window.location.origin);
      const checkoutUrl = res.init_point || res.sandbox_init_point;
      if (!checkoutUrl) throw new Error("MercadoPago no devolvio una URL de pago.");

      if (ventanaPago && !ventanaPago.closed) {
        ventanaPago.location.href = checkoutUrl;
      } else {
        window.location.assign(checkoutUrl);
        return;
      }
      setRedirigiendo(false);
    } catch (e) {
      if (ventanaPago && !ventanaPago.closed) ventanaPago.close();
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
      <AddressConfirmationModal
        open={mostrarModalDireccion}
        onClose={() => setMostrarModalDireccion(false)}
        onConfirm={(payload) => setDireccionConfirmada(payload)}
      />

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

        <div className="rounded-[1.5rem] border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold leading-relaxed text-green-800 mb-4">
          {HORARIO_PEDIDOS}
        </div>

        <div className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5 mb-4">
          <h2 className="font-extrabold text-slate-800 text-base mb-3">Como quieres recibir tu pedido?</h2>
          <div className="grid gap-3">
            {[
              {
                value: "domicilio",
                title: "Que lo lleven a mi casa",
                text: "Despacharemos el pedido a la direccion que registres despues del pago.",
              },
              {
                value: "recoger_tienda",
                title: "Pasar por el pedido a tienda",
                text: "Prepararemos tu pedido para recogerlo en tienda dentro del horario de atencion.",
              },
            ].map((opcion) => {
              const activo = tipoEntrega === opcion.value;
              return (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => setTipoEntrega(opcion.value)}
                  className="w-full rounded-2xl px-4 py-3 text-left transition"
                  style={{
                    border: `2px solid ${activo ? "#6B8E4E" : "#e5e7eb"}`,
                    backgroundColor: activo ? "rgba(107,142,78,0.1)" : "#ffffff",
                  }}
                >
                  <p className="font-extrabold text-sm" style={{ color: activo ? "#3C5148" : "#111827" }}>
                    {opcion.title}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed text-slate-500">{opcion.text}</p>
                </button>
              );
            })}
          </div>
          {requiereDireccion && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {direccionConfirmada
                ? `Dirección confirmada: ${direccionConfirmada.direccion}`
                : "Debes confirmar tu dirección antes de pagar."}
            </div>
          )}
        </div>

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
              "Haz clic en «Pagar con MercadoPago» para abrir la pasarela en una pestana nueva.",
              "Elige tu método de pago: Nequi, Daviplata, tarjeta débito/crédito u otros.",
              `Confirma el pago de ${fmt(pago?.Monto_Pago)}.`,
              tipoEntrega === "domicilio"
                ? "Al aprobarse el pago, registra la direccion para el domicilio."
                : "Al aprobarse el pago, tu pedido quedara listo para gestion de recogida en tienda.",
              "Si cancelas en MercadoPago, serás redirigido al carrito para continuar.",
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
        <div className="space-y-3">
          <button
            onClick={handlePagar}
            disabled={redirigiendo || !pago || (requiereDireccion && !direccionConfirmada)}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-base disabled:opacity-50 transition"
            style={{ background: "linear-gradient(135deg,#009EE3,#00BCFF)" }}
          >
            {redirigiendo ? "Redirigiendo a MercadoPago..." : `Pagar ${fmt(pago?.Monto_Pago)} con MercadoPago`}
          </button>

          <button
            type="button"
            onClick={() => navigate("/carrito")}
            disabled={redirigiendo}
            className="w-full py-3 rounded-2xl text-sm font-bold border transition disabled:opacity-50"
            style={{ borderColor: "#cbd5e1", color: "#475569", backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            Cancelar y volver al carrito
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-3">
          Pago seguro procesado por MercadoPago · SSL 256-bit
        </p>
      </div>
    </div>
  );
}
