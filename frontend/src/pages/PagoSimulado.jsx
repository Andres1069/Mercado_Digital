import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pagoService, pedidoService } from "../services/api";
import { useCart } from "../context/CartContext";

const METODOS = [
  { id: "Tarjeta",   label: "Tarjeta",   icon: "💳" },
  { id: "Nequi",     label: "Nequi",     icon: "📱" },
  { id: "Daviplata", label: "Daviplata", icon: "📲" },
];

const PASOS_PROCESO = [
  "Verificando datos…",
  "Conectando con el banco…",
  "Confirmando transacción…",
];

function formatCard(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

function detectarMarca(numero) {
  const n = numero.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5/.test(n)) return "Mastercard";
  return null;
}

function formatPhoneDisplay(v) {
  return v.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3").trim();
}

const APP_INFO = {
  Nequi: {
    nombre: "Nequi",
    gradient: "linear-gradient(135deg,#3D155F,#E6007E)",
    claveBg: "rgba(230,0,126,0.06)",
    claveBorder: "rgba(230,0,126,0.35)",
    inicial: "N",
  },
  Daviplata: {
    nombre: "DaviPlata",
    gradient: "linear-gradient(135deg,#7A0C2E,#EE3124)",
    claveBg: "rgba(238,49,36,0.06)",
    claveBorder: "rgba(238,49,36,0.35)",
    inicial: "D",
  },
};

function Check({ ok }) {
  if (!ok) return null;
  return <span className="text-emerald-500 text-sm font-bold ml-1">✓</span>;
}

export default function PagoSimulado() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { clearCart } = useCart();

  const pedidoId = Number(params.get("pedido"));
  const entrega  = params.get("entrega") || "domicilio";

  const [metodo, setMetodo] = useState("Tarjeta");
  const [form, setForm] = useState({
    numero_tarjeta: "",
    expiracion:     "",
    cvv:            "",
    nombre_tarjeta: "",
    celular:        "",
    clave_dinamica: "",
  });
  const [procesando, setProcesando] = useState(false);
  const [pasoProceso, setPasoProceso] = useState(0);
  const [resultado,  setResultado]  = useState(null);
  const [referencia, setReferencia] = useState("");
  const [error,      setError]      = useState("");
  const [contador,   setContador]   = useState(null);
  const [total,      setTotal]      = useState(null);
  const enviandoRef = useRef(false);
  const timerRef    = useRef(null);
  const otpRefs     = useRef([]);

  // Carga el total del pedido para mostrarlo durante el pago
  useEffect(() => {
    if (!pedidoId) return;
    pedidoService
      .obtener(pedidoId)
      .then((res) => {
        const monto = res.pedido?.Total_Carrito ?? res.pedido?.Monto_Pago;
        if (monto != null) setTotal(Number(monto));
      })
      .catch(() => {});
  }, [pedidoId]);

  // Auto-redirección con cuenta regresiva al aprobar pago + domicilio
  useEffect(() => {
    if (resultado?.aprobado && entrega === "domicilio") {
      setContador(4);
    }
  }, [resultado, entrega]);

  useEffect(() => {
    if (contador === null) return;
    if (contador === 0) {
      navigate(`/domicilio/crear?pedido=${pedidoId}`);
      return;
    }
    timerRef.current = setTimeout(() => setContador((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [contador, navigate, pedidoId]);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...form };
    if (name === "numero_tarjeta") {
      next.numero_tarjeta = formatCard(value);
    } else if (name === "expiracion") {
      next.expiracion = formatExpiry(value);
    } else if (name === "cvv") {
      next.cvv = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "celular") {
      next.celular = value.replace(/\D/g, "").slice(0, 10);
    } else {
      next[name] = value;
    }
    setForm(next);
  }

  function cambiarMetodo(id) {
    setMetodo(id);
    setError("");
    setForm((p) => ({ ...p, celular: "", clave_dinamica: "" }));
  }

  function handleOtpChange(idx, value) {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const arr = form.clave_dinamica.split("");
    arr[idx] = digit;
    setForm((p) => ({ ...p, clave_dinamica: arr.join("").slice(0, 4) }));
    if (digit && idx < 3) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx, e) {
    if (e.key === "Backspace" && !form.clave_dinamica[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
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
      if (form.clave_dinamica.replace(/\D/g, "").length !== 4)
        return "Ingresa la clave dinámica completa (4 dígitos).";
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
    setPasoProceso(0);

    await new Promise((res) => setTimeout(res, 700));
    setPasoProceso(1);
    await new Promise((res) => setTimeout(res, 700));
    setPasoProceso(2);
    await new Promise((res) => setTimeout(res, 600));

    try {
      const datos =
        metodo === "Tarjeta"
          ? {
              numero_tarjeta: form.numero_tarjeta,
              expiracion:     form.expiracion,
              cvv:            form.cvv,
              nombre_tarjeta: form.nombre_tarjeta,
            }
          : {
              celular:        form.celular,
              clave_dinamica: form.clave_dinamica,
            };

      const res = await pagoService.simular(pedidoId, metodo, datos);
      if (res.resultado?.aprobado) clearCart();
      setResultado(res.resultado);
      setReferencia(`MD-${pedidoId}-${Date.now().toString().slice(-6)}`);
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
          <p className="font-semibold" style={{ color: "#991b1b" }}>
            Pedido inválido. Vuelve al carrito.
          </p>
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
            <svg
              className="animate-spin h-11 w-11 mx-auto mb-3"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "#6B8E4E" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="font-bold text-slate-800 text-base">Procesando pago...</p>
            <p className="text-sm text-slate-500 mt-1">{PASOS_PROCESO[pasoProceso]}</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Encabezado */}
        <div
          className="rounded-[2rem] p-6 text-white mb-5"
          style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
        >
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">
            Pasarela de Pagos
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏦</span>
            <div>
              <h1 className="text-2xl font-black">Simulador de Pagos</h1>
              <p className="text-white/85 text-sm mt-0.5">
                Pedido #{pedidoId} ·{" "}
                {entrega === "domicilio" ? "🛵 Envío a domicilio" : "🏪 Recojo en tienda"}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del monto a pagar */}
        {total != null && (
          <div
            className="rounded-2xl p-4 mb-5 flex items-center justify-between"
            style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}
          >
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total a pagar</p>
              <p className="text-2xl font-black" style={{ color: "#1B2727" }}>
                ${total.toLocaleString("es-CO")}
              </p>
            </div>
            <span className="text-3xl">🧾</span>
          </div>
        )}

        {resultado ? (
          /* ── Pantalla de resultado ── */
          <div
            className="rounded-[1.8rem] border p-8 text-center animate-fade-in"
            style={
              resultado.aprobado
                ? { backgroundColor: "rgba(16,185,129,0.07)", borderColor: "#6ee7b7" }
                : { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }
            }
          >
            <p className="text-6xl mb-4">{resultado.aprobado ? "✅" : "❌"}</p>
            <h2 className="font-extrabold text-slate-800 text-2xl mb-2">
              {resultado.aprobado ? "¡Pago Exitoso!" : "Pago Rechazado"}
            </h2>
            <p className="text-slate-600 text-sm mb-3">{resultado.mensaje}</p>
            {referencia && (
              <p
                className="inline-block mb-7 px-4 py-2 rounded-xl text-xs font-mono"
                style={{ backgroundColor: "rgba(107,142,78,0.07)", border: "1px solid #B2C5B2", color: "#3C5148" }}
              >
                Ref: {referencia}
              </p>
            )}

            {resultado.aprobado ? (
              entrega === "domicilio" ? (
                <div>
                  <p className="text-xs text-slate-500 mb-3">
                    Redirigiendo al módulo de domicilio en{" "}
                    <span className="font-bold" style={{ color: "#6B8E4E" }}>
                      {contador}s
                    </span>
                    …
                  </p>
                  <button
                    onClick={() => navigate(`/domicilio/crear?pedido=${pedidoId}`)}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base hover:opacity-90 transition"
                    style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                  >
                    Registrar dirección de envío →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/mis-pedidos")}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-base hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                >
                  Ver mis pedidos →
                </button>
              )
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
                  Volver a la tienda
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Formulario de pago ── */
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.8rem] border p-5"
            style={{ borderColor: "var(--md-border)", backgroundColor: "var(--md-surface)" }}
          >
            <h2 className="font-extrabold text-slate-800 text-base mb-4">
              Selecciona tu método de pago
            </h2>

            {/* Selector de método */}
            <div className="flex gap-2 mb-5">
              {METODOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => cambiarMetodo(m.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition border flex items-center justify-center gap-2 ${
                    metodo === m.id ? "" : "hover:scale-[1.02]"
                  }`}
                  style={
                    metodo === m.id
                      ? { background: "linear-gradient(135deg,#3C5148,#6B8E4E)", color: "white", borderColor: "transparent" }
                      : { borderColor: "#d1d5db", color: "#374151", backgroundColor: "white" }
                  }
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: metodo === m.id ? "rgba(255,255,255,0.2)" : "#f3f4f6" }}
                  >
                    {m.icon}
                  </span>
                  {m.label}
                </button>
              ))}
            </div>

            {/* ── Campos Tarjeta ── */}
            {metodo === "Tarjeta" && (
              <div className="space-y-3">
                {/* Vista previa de la tarjeta */}
                <div
                  className="rounded-2xl p-5 text-white relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-xs uppercase tracking-widest text-white/70">Mercado Digital</span>
                    <span className="text-2xl">
                      {detectarMarca(form.numero_tarjeta) === "Visa" ? "VISA" : detectarMarca(form.numero_tarjeta) === "Mastercard" ? "🔴🟡" : "💳"}
                    </span>
                  </div>
                  <p className="text-lg tracking-[0.2em] font-mono mb-4">
                    {form.numero_tarjeta || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between text-xs text-white/80">
                    <span className="uppercase truncate max-w-[60%]">{form.nombre_tarjeta || "NOMBRE DEL TITULAR"}</span>
                    <span>{form.expiracion || "MM/AA"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center">
                    Número de tarjeta
                    <Check ok={form.numero_tarjeta.replace(/\s/g, "").length === 16} />
                  </label>
                  <input
                    name="numero_tarjeta"
                    value={form.numero_tarjeta}
                    onChange={handleChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-green-200"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    disabled={procesando}
                  />

                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center">
                      Expiración
                      <Check ok={/^\d{2}\/\d{2}$/.test(form.expiracion)} />
                    </label>
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
                    <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center">
                      CVV
                      <Check ok={form.cvv.length >= 3} />
                    </label>
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
                  <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center">
                    Nombre en la tarjeta
                    <Check ok={form.nombre_tarjeta.trim().length > 0} />
                  </label>
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

            {/* ── Campos Nequi / Daviplata ── */}
            {(metodo === "Nequi" || metodo === "Daviplata") && (
              <div className="space-y-3">
                {/* Vista previa estilo app */}
                <div
                  className="rounded-2xl p-5 text-white relative overflow-hidden"
                  style={{ background: APP_INFO[metodo].gradient }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-lg font-black">
                      {APP_INFO[metodo].inicial}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold leading-tight">{APP_INFO[metodo].nombre}</p>
                      <p className="text-[11px] text-white/70">Pago a Mercado Digital</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/70 uppercase tracking-widest mb-1">Vas a pagar</p>
                  <p className="text-2xl font-black mb-4">
                    {total != null ? `$${total.toLocaleString("es-CO")}` : "—"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/80 border-t border-white/15 pt-3">
                    <span>Número asociado</span>
                    <span className="font-mono">
                      {form.celular ? `+57 ${formatPhoneDisplay(form.celular)}` : "+57 ••• ••• ••••"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center">
                    Número de celular
                    <Check ok={form.celular.length === 10} />
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-200">
                    <span className="px-3 py-2.5 text-sm text-slate-500 bg-gray-50 border-r border-gray-200 select-none">
                      +57
                    </span>
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
                </div>

                {/* Clave Dinámica */}
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: APP_INFO[metodo].claveBg, border: `1px solid ${APP_INFO[metodo].claveBorder}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🔐</span>
                    <p className="text-xs font-bold flex items-center" style={{ color: "#3C5148" }}>
                      Clave Dinámica requerida
                      <Check ok={form.clave_dinamica.replace(/\D/g, "").length === 4} />
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Ingresa la clave de 4 dígitos enviada por {APP_INFO[metodo].nombre} para autorizar esta transacción.
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        value={form.clave_dinamica[i] || ""}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        inputMode="numeric"
                        maxLength={1}
                        disabled={procesando}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
                      />
                    ))}
                  </div>
                </div>
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
              className="w-full mt-5 py-3.5 rounded-2xl text-white font-extrabold text-base disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)" }}
            >
              Pagar con {metodo}
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              🔒 Pago simulado — entorno de pruebas de Mercado Digital
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
