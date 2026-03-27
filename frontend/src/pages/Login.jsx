import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const loginInicial = { correo: "", contrasena: "" };
const resetInicial = { correo: "", token: "", nueva_contrasena: "", confirmar_contrasena: "" };

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = useState(loginInicial);
  const [formReset, setFormReset] = useState(resetInicial);
  const [error, setError] = useState("");
  const [errorReset, setErrorReset] = useState("");
  const [mensajeReset, setMensajeReset] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [pasoReset, setPasoReset] = useState(tokenFromUrl ? 2 : 1);
  const [verContrasena, setVerContrasena] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeReset = (e) => setFormReset({ ...formReset, [e.target.name]: e.target.value });

  const resetToken = useMemo(() => formReset.token || tokenFromUrl, [formReset.token, tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await authService.login(form.correo, form.contrasena);
      iniciarSesion(res.token, res.usuario);

      if (res.usuario.rol === "Administrador") {
        navigate("/admin/dashboard");
        return;
      }
      if (res.usuario.rol === "Empleado") {
        navigate("/empleado/dashboard");
        return;
      }

      navigate("/tienda");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setErrorReset("");
    setMensajeReset("");
    setCambiandoPassword(true);

    try {
      const res = await authService.resetRequest(formReset.correo);
      setMensajeReset(res.message || "Si el correo existe, enviaremos un codigo para restablecer la contrasena.");
      setPasoReset(2);
    } catch (err) {
      setErrorReset(err.message);
    } finally {
      setCambiandoPassword(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setErrorReset("");
    setMensajeReset("");

    if (!resetToken) {
      setErrorReset("Debes ingresar el codigo/token que llego a tu correo.");
      return;
    }
    if (formReset.nueva_contrasena !== formReset.confirmar_contrasena) {
      setErrorReset("Las contrasenas no coinciden.");
      return;
    }

    setCambiandoPassword(true);
    try {
      const res = await authService.resetConfirm(resetToken, formReset.nueva_contrasena);
      setMensajeReset(res.message || "Contrasena actualizada correctamente.");
      setFormReset(resetInicial);
      setPasoReset(1);
    } catch (err) {
      setErrorReset(err.message);
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-sm md:max-w-5xl bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden md:grid md:grid-cols-[0.92fr,1.08fr]">
        <div
          className="px-7 py-8 text-white md:px-10 md:py-12 flex flex-col justify-between"
          style={{ background: "linear-gradient(145deg, #1B2727 0%, #3C5148 52%, #6B8E4E 100%)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">Mercado Digital</p>
            <h1 className="text-2xl md:text-4xl font-black mt-3 leading-tight">Bienvenido de nuevo</h1>
            <p className="text-white/80 text-sm md:text-base mt-3 max-w-md">
              Ingresa a tu cuenta para comprar, seguir pedidos o entrar al panel administrativo.
            </p>
          </div>

          <div className="hidden md:block mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 backdrop-blur-sm p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Acceso rapido</p>
              <div className="mt-4 space-y-3 text-sm text-white/85">
                <p>Compra productos y revisa tus pedidos desde cualquier dispositivo.</p>
                <p>Si olvidaste tu clave, puedes pedir el codigo de recuperacion sin salir de esta pantalla.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/8 px-4 py-4 border border-white/10">
                <p className="text-white/60 text-[11px] uppercase tracking-[0.2em]">Sesiones</p>
                <p className="mt-2 text-lg font-bold">Seguras</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-4 py-4 border border-white/10">
                <p className="text-white/60 text-[11px] uppercase tracking-[0.2em]">Recuperacion</p>
                <p className="mt-2 text-lg font-bold">Por correo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 md:p-10 lg:p-12">
          {error && (
            <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-rose-200 bg-rose-50 text-rose-700">
              {error}
            </div>
          )}

          {reason === "session" && (
            <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-amber-200 bg-amber-50 text-amber-800">
              Tu sesion fue cerrada porque iniciaste en otro dispositivo o el token expiro. Inicia sesion nuevamente.
            </div>
          )}

          {!mostrarCambioPassword && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electronico</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tucorreo@ejemplo.com" className="md-input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contrasena</label>
                <div className="relative">
                  <input
                    type={verContrasena ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    required
                    placeholder="********"
                    className="md-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setVerContrasena((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    tabIndex={-1}
                    aria-label={verContrasena ? "Ocultar contrasena" : "Ver contrasena"}
                  >
                    <OjoIcon abierto={verContrasena} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60"
                style={{ background: "#6B8E4E" }}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}

          <div className={mostrarCambioPassword ? "" : "mt-6 pt-6 border-t border-[var(--md-border)]"}>
            <button
              type="button"
              onClick={() => {
                setMostrarCambioPassword(!mostrarCambioPassword);
                setErrorReset("");
                setMensajeReset("");
                setPasoReset(tokenFromUrl ? 2 : 1);
              }}
              className="w-full text-sm font-semibold text-left md-accent-text"
            >
              {mostrarCambioPassword ? "Ocultar cambio de contrasena" : "Cambiar contrasena"}
            </button>

            {mostrarCambioPassword && (
              <div className="space-y-4 mt-4">
                {errorReset && <div className="px-4 py-3 rounded-2xl text-sm border border-rose-200 bg-rose-50 text-rose-700">{errorReset}</div>}
                {mensajeReset && <div className="px-4 py-3 rounded-2xl text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">{mensajeReset}</div>}

                {pasoReset === 1 ? (
                  <form onSubmit={handleResetRequest} className="space-y-4">
                    <input type="email" name="correo" value={formReset.correo} onChange={handleChangeReset} required placeholder="Correo electronico" className="md-input" />
                    <button type="submit" disabled={cambiandoPassword} className="w-full text-white font-semibold py-3 rounded-2xl transition disabled:opacity-60" style={{ backgroundColor: "#3C5148" }}>
                      {cambiandoPassword ? "Enviando..." : "Enviar codigo al correo"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetConfirm} className="space-y-4 md:space-y-3">
                    <input type="text" name="token" value={formReset.token} onChange={handleChangeReset} required={!tokenFromUrl} placeholder="Codigo o token recibido" className="md-input" />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="relative">
                        <input type={verNueva ? "text" : "password"} name="nueva_contrasena" value={formReset.nueva_contrasena} onChange={handleChangeReset} required minLength={8} placeholder="Nueva contrasena" className="md-input pr-12" />
                        <button type="button" onClick={() => setVerNueva((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verNueva ? "Ocultar" : "Ver"}><OjoIcon abierto={verNueva} /></button>
                      </div>
                      <div className="relative">
                        <input type={verConfirmar ? "text" : "password"} name="confirmar_contrasena" value={formReset.confirmar_contrasena} onChange={handleChangeReset} required minLength={8} placeholder="Confirmar contrasena" className="md-input pr-12" />
                        <button type="button" onClick={() => setVerConfirmar((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verConfirmar ? "Ocultar" : "Ver"}><OjoIcon abierto={verConfirmar} /></button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                      <button type="submit" disabled={cambiandoPassword} className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60" style={{ backgroundColor: "#3C5148" }}>
                        {cambiandoPassword ? "Actualizando..." : "Actualizar contrasena"}
                      </button>
                      <button type="button" onClick={() => setPasoReset(1)} className="w-full md:w-auto md:px-2 text-sm font-semibold text-slate-600 hover:underline">
                        Volver
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className={mostrarCambioPassword ? "mt-6 flex flex-col sm:flex-row md:flex-col gap-3" : "mt-8 flex flex-col sm:flex-row md:flex-col gap-3"}>
            <Link
              to="/registro"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: "#6B8E4E", color: "#6B8E4E", backgroundColor: "rgba(107,142,78,0.08)" }}
            >
              No tienes cuenta? Registrate aqui
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
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
