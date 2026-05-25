import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService } from "../services/api";
import { useCart } from "../context/CartContext";

const METODOS = [
  { id: "Tarjeta",    label: "Tarjeta",    icon: "💳" },
  { id: "Nequi",      label: "Nequi",      icon: "📱" },
  { id: "Daviplata",  label: "Daviplata",  icon: "📲" },
];

function formatCard(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

export default function PagoSimulado() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const pedidoId = Number(params.get("pedido"));

  const [metodo, setMetodo] = useState("Tarjeta");
  const [form, setForm] = useState({
    numero_tarjeta: "", expiracion: "", cvv: "", nombre_tarjeta: "", celular: "",
  });
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const enviandoRef = useRef(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "numero_tarjeta") {
      setForm(p => ({ ...p, numero_tarjeta: formatCard(value) }));
    } else if (name === "expiracion") {
      setForm(p => ({ ...p, expiracion: formatExpiry(value) }));
    } else if (name === "cvv") {
      setForm(p => ({ ...p, cvv: value.replace(/\D/g, "").slice(0, 4) }));
    } else if (name === "celular") {
      setForm(p => ({ ...p, celular: value.replace(/\D/g, "").slice(0, 10) }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  }

  function validar() {
    if (metodo === "Tarjeta") {
      if (form.numero_tarjeta.replace(/\s/g, "").length !== 16)
        return "El número de tarjeta debe tener 16 dígitos.";
      if (!/^\d{2}\/\d{2}$/.test(form.expiracion))
        return "La fecha de expiración debe tener el formato MM/AA.";
      if (form.cvv.length < 3)
        return "El CVV debe tener al menos 3 dígitos.";
      if (!form.nombre_tarjeta.trim())
        return "Ingresa el nombre del titular.";
    } else {
      if (form.celular.length !== 10)
        return "El número de celular debe tener 10 dígitos.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (enviandoRef.current) return;

    const errMsg = validar();
    if (errMsg) { setError(errMsg); return; }

    enviandoRef.current = true;
    setError("");
    setProcesando(true);

    // Simula el tiempo de respuesta de una pasarela real
    await new Promise(res => setTimeout(res, 2000));

    try {
      const datos = metodo === "Tarjeta"
        ? { numero_tarjeta: form.numero_tarjeta, expiracion: form.expiracion, cvv: form.cvv, nombre_tarjeta: form.nombre_tarjeta }
        : { celular: form.celular };

      const res = await pagoService.simular(pedidoId, metodo, datos);
      setResultado(res.resultado);
      if (res.resultado?.aprobado) clearCart();
    } catch (e) {
      setError(e.message || "Error al procesar el pago.");
    } finally {
      setProcesando(false);
      enviandoRef.current = false;
    }
  }

  if (!pedidoId) {
    return (
      <div className="min-h-screen md-app-bg">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-red-500 font-semibold">Pedido inválido. Vuelve al carrito.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />

      {/* Overlay de carga */}
      {procesando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 text-center shadow-2xl max-w-xs mx-4">
            <svg className="animate-spin h-11 w-11 mx-auto mb-3" viewBox="0 0 24 24" fill="none" style={{ color: "#6B8E4E" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="font-bold text-slate-800 text-base">Procesando pago...</p>
            <p className="text-sm text-slate-500 mt-1">Por favor espera un momento</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="rounded-[2rem] p-6 text-white mb-5" style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}>
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">Simulador de pago</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏦</span>
            <div>
              <h1 className="text-2xl font-black">Pago de Prueba</h1>
              <p className="text-white/85 text-sm mt-0.5">Pedido #{pedidoId} · Entorno de desarrollo</p>
            </div>
          </div>
        </div>

        {resultado ? (
          /* ── Pantalla de resultado ── */
          <div
            className="rounded-[1.8rem] border p-8 text-center"
            style={resultado.aprobado
              ? { backgroundColor: "rgba(16,185,129,0.07)", borderColor: "#6ee7b7" }
              : { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }}
          >
            <p className="text-6xl mb-4">{resultado.aprobado ? "✅" : "❌"}</p>
            <h2 className="font-extrabold text-slate-800 text-2xl mb-2">
              {resultado.aprobado ? "¡Pago Exitoso!" : "Pago Rechazado"}
            </h2>
            <p className="text-slate-600 text-sm mb-7">{resultado.mensaje}</p>

            {resultado.aprobado ? (
              <button
                onClick={() => navigate(`/domicilio/crear?pedido=${pedidoId}`)}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                Continuar a domicilio →
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setResultado(null); setError(""); }}
                  className="w-full py-3 rounded-2xl text-white font-bold hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={() => navigate("/tienda")}
                  className="w-full py-3 rounded-2xl border text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  style={{ borderColor: "#cbd5e1" }}
                >
                  Volver al inicio
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Formulario de pago ── */
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.8rem] border border-[var(--md-border)] bg-[var(--md-surface)] p-5"
          >
            <h2 className="font-extrabold text-slate-800 text-base mb-4">Selecciona tu método de pago</h2>

            {/* Selector de método */}
            <div className="flex gap-2 mb-5">
              {METODOS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setMetodo(m.id); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition border"
                  style={metodo === m.id
                    ? { background: "linear-gradient(135deg,#3C5148,#6B8E4E)", color: "white", borderColor: "transparent" }
                    : { borderColor: "#d1d5db", color: "#374151", backgroundColor: "white" }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Campos tarjeta */}
            {metodo === "Tarjeta" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Número de tarjeta</label>
                  <input
                    name="numero_tarjeta"
                    value={form.numero_tarjeta}
                    onChange={handleChange}
                    placeholder="4000 0000 0000 0000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-green-200"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    disabled={procesando}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    <span className="text-green-600 font-semibold">Aprobado:</span> 4000 0000 0000 0000 ·{" "}
                    <span className="text-red-500 font-semibold">Rechazado:</span> cualquier otro número
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Expiración</label>
                    <input
                      name="expiracion"
                      value={form.expiracion}
                      onChange={handleChange}
                      placeholder="MM/AA"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      disabled={procesando}
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">CVV</label>
                    <input
                      name="cvv"
                      value={form.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      disabled={procesando}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre en la tarjeta</label>
                  <input
                    name="nombre_tarjeta"
                    value={form.nombre_tarjeta}
                    onChange={handleChange}
                    placeholder="JUAN PÉREZ"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-green-200"
                    autoComplete="cc-name"
                    disabled={procesando}
                  />
                </div>
              </div>
            )}

            {/* Campos Nequi / Daviplata */}
            {(metodo === "Nequi" || metodo === "Daviplata") && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Número de celular</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-200">
                  <span className="px-3 py-2.5 text-sm text-slate-500 bg-gray-50 border-r border-gray-200 select-none">+57</span>
                  <input
                    name="celular"
                    value={form.celular}
                    onChange={handleChange}
                    placeholder="3000000000"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    inputMode="numeric"
                    disabled={procesando}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  <span className="text-green-600 font-semibold">Aprobado:</span> 3000000000 ·{" "}
                  <span className="text-red-500 font-semibold">Rechazado:</span> cualquier otro número
                </p>
              </div>
            )}

            {error && (
              <div
                className="mt-4 px-3 py-2 rounded-xl text-xs border"
                style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando}
              className="w-full mt-5 py-3.5 rounded-2xl text-white font-extrabold text-base disabled:opacity-50 hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
            >
              Pagar con {metodo}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
