import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

function OjoIcon({ abierto }) {
  if (abierto) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const loginInicial = { correo: "", contrasena: "" };
const resetInicial = { correo: "", token: "", nueva_contrasena: "", confirmar_contrasena: "" };
const LOGIN_ARTWORK = "/Diseño sin título.png";

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
  const [mostrarReset, setMostrarReset] = useState(Boolean(tokenFromUrl));
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
      setErrorReset("Debes ingresar el codigo o token que llego a tu correo.");
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
      setMostrarReset(false);
    } catch (err) {
      setErrorReset(err.message);
    } finally {
      setCambiandoPassword(false);
    }
  };

  function abrirReset() {
    setMostrarReset(true);
    setErrorReset("");
    setMensajeReset("");
    setPasoReset(tokenFromUrl ? 2 : 1);
  }

  function cerrarReset() {
    setMostrarReset(false);
    setErrorReset("");
    setMensajeReset("");
    setPasoReset(tokenFromUrl ? 2 : 1);
  }

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-sm md:max-w-5xl bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden md:grid md:grid-cols-[0.9fr,1.1fr]">
        <div
          className="px-7 py-8 text-white md:px-10 md:py-12 flex flex-col justify-between"
          style={{ background: "linear-gradient(145deg, #1B2727 0%, #3C5148 52%, #6B8E4E 100%)" }}
        >
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">Mercado Digital</p>
            <h1 className="text-2xl md:text-4xl font-black mt-3 leading-tight">Bienvenido de nuevo</h1>
            <p className="text-white/80 text-sm md:text-base mt-3">
              Ingresa a tu cuenta para comprar, seguir pedidos o entrar al panel administrativo.
            </p>
          </div>

          <div className="hidden md:flex mt-10">
            <div className="relative w-full min-h-[360px] rounded-[2rem] overflow-hidden border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute -top-10 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -right-8 w-44 h-44 rounded-full bg-[#B9D39D]/20 blur-2xl" />

              <div className="relative h-full p-7 flex items-center justify-center">
                <div className="relative w-full max-w-[360px]">
                  <div className="absolute -inset-4 rounded-[2rem] border border-white/10 bg-black/10 blur-sm" />
                  <div className="absolute -top-4 -left-4 w-20 h-20 rounded-[1.5rem] bg-white/12 backdrop-blur-md border border-white/10" />
                  <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-[#DCE8CC]/15 border border-white/10" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#F2F0EA] shadow-[0_30px_60px_rgba(0,0,0,0.24)]">
                    <img
                      src={LOGIN_ARTWORK}
                      alt="Ilustración de acceso"
                      className="w-full h-[330px] object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 md:p-10 lg:p-12 flex flex-col justify-center">
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

          {!mostrarReset && (
            <div className="max-w-md mx-auto w-full">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-800">Iniciar sesion</h2>
                  <p className="text-sm text-slate-500 mt-2">Accede con tu correo y contrasena.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electronico</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="md-input"
                  />
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

              <div className="mt-6 pt-6 border-t border-[var(--md-border)] text-center">
                <button
                  type="button"
                  onClick={abrirReset}
                  className="text-sm font-semibold md-accent-text hover:opacity-80 transition"
                >
                  Olvide mi contrasena
                </button>
              </div>
            </div>
          )}

          {mostrarReset && (
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Restablecer contrasena</h2>
                <p className="text-sm text-slate-500 mt-2">
                  {pasoReset === 1
                    ? "Te enviaremos un codigo a tu correo para continuar."
                    : "Ingresa el codigo recibido y define tu nueva contrasena."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                {errorReset && (
                  <div className="px-4 py-3 rounded-2xl mb-4 text-sm border border-rose-200 bg-rose-50 text-rose-700">
                    {errorReset}
                  </div>
                )}

                {mensajeReset && (
                  <div className="px-4 py-3 rounded-2xl mb-4 text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">
                    {mensajeReset}
                  </div>
                )}

                {pasoReset === 1 ? (
                  <form onSubmit={handleResetRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electronico</label>
                      <input
                        type="email"
                        name="correo"
                        value={formReset.correo}
                        onChange={handleChangeReset}
                        required
                        placeholder="tucorreo@ejemplo.com"
                        className="md-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={cambiandoPassword}
                      className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                      style={{ backgroundColor: "#3C5148" }}
                    >
                      {cambiandoPassword ? "Enviando..." : "Enviar codigo"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetConfirm} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Codigo o token</label>
                      <input
                        type="text"
                        name="token"
                        value={formReset.token}
                        onChange={handleChangeReset}
                        required={!tokenFromUrl}
                        placeholder="Codigo recibido"
                        className="md-input"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={verNueva ? "text" : "password"}
                          name="nueva_contrasena"
                          value={formReset.nueva_contrasena}
                          onChange={handleChangeReset}
                          required
                          minLength={8}
                          placeholder="Nueva contrasena"
                          className="md-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setVerNueva((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                          tabIndex={-1}
                          aria-label={verNueva ? "Ocultar contrasena" : "Ver contrasena"}
                        >
                          <OjoIcon abierto={verNueva} />
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={verConfirmar ? "text" : "password"}
                          name="confirmar_contrasena"
                          value={formReset.confirmar_contrasena}
                          onChange={handleChangeReset}
                          required
                          minLength={8}
                          placeholder="Confirmar contrasena"
                          className="md-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setVerConfirmar((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                          tabIndex={-1}
                          aria-label={verConfirmar ? "Ocultar contrasena" : "Ver contrasena"}
                        >
                          <OjoIcon abierto={verConfirmar} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cambiandoPassword}
                      className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                      style={{ backgroundColor: "#3C5148" }}
                    >
                      {cambiandoPassword ? "Actualizando..." : "Guardar nueva contrasena"}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={pasoReset === 2 && !tokenFromUrl ? () => setPasoReset(1) : cerrarReset}
                  className="text-sm font-semibold text-slate-600 hover:underline"
                >
                  {pasoReset === 2 && !tokenFromUrl ? "Volver al correo" : "Volver al inicio de sesion"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 max-w-md mx-auto w-full flex flex-col gap-3">
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
