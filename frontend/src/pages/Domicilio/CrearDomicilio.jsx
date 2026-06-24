import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { domicilioService } from "../../services/api";

export default function CrearDomicilio() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const navigate  = useNavigate();
  const { usuario } = useAuth();

  const direccionRegistrada = usuario?.Direccion || "";
  const telefonoRegistrado  = usuario?.Telefono  || "";
  const nombreUsuario       = [usuario?.Nombre, usuario?.Apellido].filter(Boolean).join(" ");
  const direccionPendiente = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("md_checkout_delivery_address") || "null");
    } catch {
      return null;
    }
  })();
  const shippingQuote = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("md_checkout_shipping_quote") || "null");
    } catch {
      return null;
    }
  })();

  // "confirmar" → muestra la dirección guardada para validar
  // "formulario" → muestra campos para escribir una nueva dirección
  const direccionInicial = direccionPendiente?.direccion || direccionRegistrada;
  const [fase, setFase]       = useState(direccionInicial ? "confirmar" : "formulario");
  const [form, setForm]       = useState({ direccion: direccionInicial || "", telefono: telefonoRegistrado, notas: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError]     = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function registrarEnvio(direccion, telefono, notas) {
    if (!pedidoId) {
      setError("No se encontró el número de pedido. Vuelve al carrito.");
      return;
    }
    if (!direccion.trim()) {
      setError("La dirección es obligatoria.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      await domicilioService.crear({
        pedido:      parseInt(pedidoId, 10),
        direccion:   direccion.trim(),
        telefono:    telefono?.trim() || null,
        notas:       notas?.trim()    || null,
        costo_envio: shippingQuote ? Number(shippingQuote.costoEnvio) : 7900,
      });
      sessionStorage.removeItem("md_checkout_delivery_address");
      navigate("/mis-pedidos");
    } catch (e) {
      setError(e.message || "No se pudo registrar el domicilio. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  // "Sí, enviar aquí" → registra con la dirección guardada, sin formulario
  function handleUsarDireccionRegistrada() {
    registrarEnvio(direccionPendiente?.direccion || direccionRegistrada, telefonoRegistrado, "");
  }

  // Envío del formulario de nueva dirección
  function handleSubmit(e) {
    e.preventDefault();
    registrarEnvio(form.direccion, form.telefono, form.notas);
  }

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />

      {/* Overlay de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 text-center shadow-2xl max-w-xs mx-4">
            <svg
              className="animate-spin h-11 w-11 mx-auto mb-3"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "#6B8E4E" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="font-bold text-slate-800 text-base">Registrando envío...</p>
            <p className="text-sm text-slate-500 mt-1">Por favor espera un momento</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Encabezado */}
        <div
          className="rounded-[2rem] p-6 text-white mb-5"
          style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
        >
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">
            Módulo de Entrega
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛵</span>
            <div>
              <h1 className="text-2xl font-black">Datos de envío</h1>
              <p className="text-white/85 text-sm mt-0.5">
                {pedidoId ? `Pedido #${pedidoId}` : "Confirma tu dirección de entrega"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--md-surface)",
            border: "1px solid var(--md-border)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl border text-sm"
              style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}
            >
              {error}
            </div>
          )}

          {/* ── Fase 1: Confirmar dirección registrada ── */}
          {fase === "confirmar" && (
            <div>
              <h2 className="text-lg font-extrabold mb-1" style={{ color: "#1B2727" }}>
                ¿Enviamos a tu dirección registrada?
              </h2>
              <p className="text-sm mb-5" style={{ color: "#3C5148" }}>
                {nombreUsuario ? (
                  <>
                    <span className="font-semibold">{nombreUsuario}</span>, encontramos la dirección
                    que guardaste al registrarte:
                  </>
                ) : (
                  "Encontramos la dirección que guardaste al registrarte:"
                )}
              </p>

              {/* Tarjeta con la dirección */}
              <div
                className="rounded-2xl p-5 mb-6"
                style={{
                  backgroundColor: "rgba(107,142,78,0.07)",
                  border: "1px solid #B2C5B2",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5 shrink-0">📍</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold break-words leading-snug"
                      style={{ color: "#1B2727" }}
                    >
                      {direccionRegistrada}
                    </p>
                    {telefonoRegistrado && (
                      <p className="text-xs mt-1.5" style={{ color: "#3C5148" }}>
                        📞 {telefonoRegistrado}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setForm({ direccion: "", telefono: telefonoRegistrado, notas: "" });
                    setFase("formulario");
                  }}
                  disabled={cargando}
                  className="flex-1 py-3 rounded-xl border text-sm font-semibold transition hover:bg-gray-50"
                  style={{ borderColor: "#d1d5db", color: "#4b5563" }}
                >
                  Cambiar dirección
                </button>
                <button
                  type="button"
                  onClick={handleUsarDireccionRegistrada}
                  disabled={cargando}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                >
                  Sí, enviar aquí →
                </button>
              </div>
            </div>
          )}

          {/* ── Fase 2: Formulario nueva dirección ── */}
          {fase === "formulario" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold mb-1" style={{ color: "#1B2727" }}>
                  Nueva dirección de entrega
                </h2>
                <p className="text-sm mb-4" style={{ color: "#3C5148" }}>
                  Ingresa los datos del lugar donde recibirás tu pedido.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Calle 45 # 12-34, Barrio El Centro"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                  autoFocus
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notas para el domiciliario
                </label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleChange}
                  placeholder="Ej: Timbre roto, llamar al llegar, apto 302..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
                  disabled={cargando}
                />
              </div>

              <div className="pt-2 flex gap-3">
                {direccionRegistrada && (
                  <button
                    type="button"
                    onClick={() => { setError(""); setFase("confirmar"); }}
                    disabled={cargando}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    ← Volver
                  </button>
                )}
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                >
                  Confirmar envío →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
