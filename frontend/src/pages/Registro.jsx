import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { authService } from "../services/api";

function validarContrasena(contrasena) {
  if (contrasena.length < 8) return "La contrasena debe tener minimo 8 caracteres.";
  if (!/[A-Z]/.test(contrasena)) return "La contrasena debe incluir al menos 1 letra mayuscula.";
  if (!/[a-z]/.test(contrasena)) return "La contrasena debe incluir al menos 1 letra minuscula.";
  if (!/\d/.test(contrasena)) return "La contrasena debe incluir al menos 1 numero.";
  return "";
}

function checkRequisitos(pw) {
  return [
    { cumple: pw.length >= 8, texto: "Minimo 8 caracteres" },
    { cumple: /[A-Z]/.test(pw), texto: "Al menos 1 letra mayuscula" },
    { cumple: /[a-z]/.test(pw), texto: "Al menos 1 letra minuscula" },
    { cumple: /\d/.test(pw), texto: "Al menos 1 numero" },
  ];
}

function OjoIcon({ abierto }) {
  if (abierto) return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Registro() {
  const { iniciarSesion } = useAuth();
  const { esOscuro } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    num_documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    barrio: "Chicala del Sur",
    direccion: "",
    contrasena: "",
    confirmar: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.contrasena !== form.confirmar) {
      setError("Las contrasenas no coinciden.");
      return;
    }
    const errorPassword = validarContrasena(form.contrasena);
    if (errorPassword) {
      setError(errorPassword);
      return;
    }

    setCargando(true);
    try {
      const res = await authService.registro({
        num_documento: form.num_documento,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        telefono: form.telefono,
        barrio: form.barrio,
        direccion: form.direccion,
        contrasena: form.contrasena,
      });
      iniciarSesion(res.token, res.usuario);
      navigate("/tienda");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md lg:max-w-6xl bg-white rounded-[1rem] shadow-lg border border-gray-100 overflow-hidden lg:grid lg:grid-cols-[1.05fr,1.1fr]">
        <div
          className="px-7 py-8 text-white lg:px-10 lg:py-12 flex flex-col justify-between"
          style={{ background: "linear-gradient(155deg, #3C5148 0%, #6B8E4E 58%, #B2C5B2 100%)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">Mercado Digital</p>
            <h1 className="text-2xl lg:text-4xl font-black mt-3 leading-tight">Crea tu cuenta</h1>
            <p className="text-white/85 text-sm lg:text-base mt-3 max-w-md">
              Registra tus datos para comprar, guardar tu perfil y recibir acceso inmediato a la tienda.
            </p>
          </div>

          <div className="hidden lg:block mt-8 space-y-3">
            <div className="rounded-[0.9rem] border border-white/20 bg-white/12 backdrop-blur-sm p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/65 font-semibold">Lo que necesitas</p>
              <div className="mt-3 space-y-2 text-sm text-white/90">
                <p>Tu correo sera usado para iniciar sesion y recuperar la contrasena.</p>
                <p>Debes registrar una direccion valida dentro del barrio habilitado.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[0.85rem] bg-white/10 px-4 py-3 border border-white/15">
                <p className="text-white/65 text-[11px] uppercase tracking-[0.18em]">Minimo</p>
                <p className="mt-2 text-lg font-bold">8 chars</p>
              </div>
              <div className="rounded-[0.85rem] bg-white/10 px-4 py-3 border border-white/15">
                <p className="text-white/65 text-[11px] uppercase tracking-[0.18em]">Incluye</p>
                <p className="mt-2 text-lg font-bold">Aa</p>
              </div>
              <div className="rounded-[0.85rem] bg-white/10 px-4 py-3 border border-white/15">
                <p className="text-white/65 text-[11px] uppercase tracking-[0.18em]">Incluye</p>
                <p className="mt-2 text-lg font-bold">123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 lg:p-9 xl:p-10">
          {error && <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-rose-200 bg-rose-50 text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-3">
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <input type="number" name="num_documento" value={form.num_documento} onChange={handleChange} required placeholder="Numero de documento" className="md-input sm:col-span-2" />
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre" className="md-input" />
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required placeholder="Apellido" className="md-input" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="Correo electronico" className="md-input sm:col-span-2" />
              <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Telefono" className="md-input" />
              <select name="barrio" value={form.barrio} onChange={handleChange} required className="md-input">
                <option value="Chicala del Sur">Chicala del Sur (Bogota)</option>
              </select>
            </div>

            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Direccion completa" className="md-input" />

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <div className="relative">
                <input type={verContrasena ? "text" : "password"} name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="Contrasena" className="md-input pr-12" />
                <button type="button" onClick={() => setVerContrasena((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verContrasena ? "Ocultar" : "Ver"}>
                  <OjoIcon abierto={verContrasena} />
                </button>
              </div>
              <div className="relative">
                <input type={verConfirmar ? "text" : "password"} name="confirmar" value={form.confirmar} onChange={handleChange} required placeholder="Confirmar contrasena" className="md-input pr-12" />
                <button type="button" onClick={() => setVerConfirmar((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verConfirmar ? "Ocultar" : "Ver"}>
                  <OjoIcon abierto={verConfirmar} />
                </button>
              </div>
            </div>

            {form.contrasena.length > 0 && (
              <div className="rounded-[0.85rem] border px-4 py-3 text-sm lg:px-4 lg:py-2.5"
                style={{
                  borderColor: form.contrasena.length >= 8 && /[A-Z]/.test(form.contrasena) && /[a-z]/.test(form.contrasena) && /\d/.test(form.contrasena) ? "#6B8E4E" : esOscuro ? "#4a5568" : "#B2C5B2",
                  backgroundColor: esOscuro ? "#1f2937" : "#F8FAF9",
                }}>
                <p className="font-semibold mb-2 lg:mb-1" style={{ color: esOscuro ? "#f1f5f9" : "#1e293b" }}>Requisitos de la contrasena</p>
                <div className="space-y-1 lg:text-[13px]">
                  {checkRequisitos(form.contrasena).map((r) => (
                    <div key={r.texto} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white transition"
                        style={{ backgroundColor: r.cumple ? "#6B8E4E" : "#ef4444" }}>
                        {r.cumple ? "✓" : "✕"}
                      </span>
                      <span style={{ color: r.cumple ? "#6B8E4E" : "#ef4444", fontWeight: r.cumple ? 500 : 600 }}>
                        {r.texto}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1.5 pt-1.5"
                    style={{ borderTop: `1px solid ${esOscuro ? "rgba(107,142,78,0.2)" : "rgba(107,142,78,0.12)"}` }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white transition"
                      style={{ backgroundColor: form.confirmar === form.contrasena && form.contrasena.length > 0 ? "#6B8E4E" : "#ef4444" }}>
                      {form.confirmar === form.contrasena && form.contrasena.length > 0 ? "✓" : "✕"}
                    </span>
                    <span style={{ color: form.confirmar === form.contrasena && form.contrasena.length > 0 ? "#6B8E4E" : "#ef4444", fontWeight: form.confirmar === form.contrasena ? 500 : 600 }}>
                      {form.confirmar.length === 0 ? "Confirma tu contrasena" : "Las contrasenas coinciden"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {form.contrasena.length === 0 && (
              <div className="rounded-[0.85rem] border px-4 py-3 text-sm lg:px-4 lg:py-2.5"
                style={{ borderColor: esOscuro ? "#4a5568" : "#B2C5B2", backgroundColor: esOscuro ? "#1f2937" : "#F8FAF9" }}>
                <p className="font-semibold mb-1 lg:mb-0.5" style={{ color: esOscuro ? "#f1f5f9" : "#1e293b" }}>Requisitos de la contrasena</p>
                <div className="space-y-0.5 lg:text-[13px]" style={{ color: esOscuro ? "#cbd5e1" : "#3C5148" }}>
                  <p>Minimo 8 caracteres.</p>
                  <p>Debe incluir al menos 1 letra mayuscula.</p>
                  <p>Debe incluir al menos 1 letra minuscula.</p>
                  <p>Debe incluir al menos 1 numero.</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={cargando} className="w-full md-btn-primary font-semibold py-3 lg:py-3.5 rounded-[0.85rem] transition disabled:opacity-60">
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-6 lg:mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[0.85rem] border-2 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: "#3C5148", color: "#3C5148", backgroundColor: "rgba(107,142,78,0.08)" }}
            >
              Ya tienes cuenta? Inicia sesion
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[0.85rem] border text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              style={{ borderColor: "var(--md-border)" }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
