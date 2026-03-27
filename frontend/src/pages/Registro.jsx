import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { authService } from "../services/api";

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
    if (form.contrasena.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
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
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle
          className="px-4 py-2 rounded-full text-sm border shadow-sm"
          style={{
            backgroundColor: "var(--md-surface)",
            borderColor: "var(--md-border)",
            color: "var(--md-text)",
          }}
          hideLabelOnMobile
        />
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        {/* Header de color */}
        <div className="px-7 py-5 text-white" style={{ background: "linear-gradient(135deg, #3C5148, #6B8E4E)" }}>
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Mercado Digital</p>
          <h1 className="text-2xl font-black mt-1">Crear cuenta</h1>
          <p className="text-white/75 text-sm mt-1">Empieza a comprar en segundos.</p>
        </div>

        <div className="p-7">

          {error && <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-rose-200 bg-rose-50 text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="number" name="num_documento" value={form.num_documento} onChange={handleChange} required placeholder="Numero de documento" className="md-input" />

            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre" className="md-input" />
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required placeholder="Apellido" className="md-input" />
            </div>

            <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="Correo electronico" className="md-input" />
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Telefono" className="md-input" />

            <div className="grid sm:grid-cols-2 gap-4">
              <select name="barrio" value={form.barrio} onChange={handleChange} required className="md-input">
                <option value="Chicala del Sur">Chicala del Sur (Bogota)</option>
              </select>
              <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Direccion" className="md-input" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <input type={verContrasena ? "text" : "password"} name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="Contrasena" className="md-input pr-12" />
                <button type="button" onClick={() => setVerContrasena(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verContrasena ? "Ocultar" : "Ver"}>
                  <OjoIcon abierto={verContrasena} />
                </button>
              </div>
              <div className="relative">
                <input type={verConfirmar ? "text" : "password"} name="confirmar" value={form.confirmar} onChange={handleChange} required placeholder="Confirmar contrasena" className="md-input pr-12" />
                <button type="button" onClick={() => setVerConfirmar(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verConfirmar ? "Ocultar" : "Ver"}>
                  <OjoIcon abierto={verConfirmar} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={cargando} className="w-full md-btn-primary font-semibold py-3.5 rounded-2xl transition disabled:opacity-60">
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: "#3C5148", color: "#3C5148", backgroundColor: "rgba(107,142,78,0.08)" }}
            >
              ¿Ya tienes cuenta? Inicia sesion
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              style={{ borderColor: "var(--md-border)" }}
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
