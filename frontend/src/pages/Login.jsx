import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
  UserPlus,
  Clock3
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const loginInicial = { correo: "", contrasena: "" };
const resetInicial = { correo: "", token: "", nueva_contrasena: "", confirmar_contrasena: "" };
const LOGIN_ARTWORK = "/Diseño sin título.png";

function OjoIcon({ abierto }) {
  return abierto ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />;
}

export default function Login() {
  const { iniciarSesion } = useAuth();
  const { esOscuro } = useTheme();
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

  // Cuenta bloqueada por intentos fallidos: cronómetro hasta que se puede reintentar.
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null); // epoch ms
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeReset = (e) => setFormReset({ ...formReset, [e.target.name]: e.target.value });

  const resetToken = useMemo(() => formReset.token || tokenFromUrl, [formReset.token, tokenFromUrl]);

  useEffect(() => {
    if (!bloqueadoHasta) return;

    const actualizar = () => {
      const restante = Math.max(0, Math.ceil((bloqueadoHasta - Date.now()) / 1000));
      setSegundosRestantes(restante);
      if (restante <= 0) {
        setBloqueadoHasta(null);
        setError("");
      }
    };

    actualizar();
    const id = setInterval(actualizar, 1000);
    return () => clearInterval(id);
  }, [bloqueadoHasta]);

  const formatoMMSS = (segundos) =>
    `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bloqueadoHasta) return;
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
      if (err.code === "ACCOUNT_LOCKED" && err.data?.retry_after) {
        setBloqueadoHasta(Date.now() + err.data.retry_after * 1000);
      }
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
      setMensajeReset(res.message || "Si el correo existe, enviaremos un código para restablecer la contraseña.");
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
      setErrorReset("Debes ingresar el código o token que llegó a tu correo.");
      return;
    }

    if (formReset.nueva_contrasena !== formReset.confirmar_contrasena) {
      setErrorReset("Las contraseñas no coinciden.");
      return;
    }

    setCambiandoPassword(true);
    try {
      const res = await authService.resetConfirm(resetToken, formReset.nueva_contrasena);
      setMensajeReset(res.message || "Contraseña actualizada correctamente.");
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
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 md:p-6 relative overflow-x-hidden" style={{ backgroundColor: esOscuro ? "#0d1a12" : "#f8fafc" }}>
      <div
        className="w-full max-w-lg md:max-w-[900px] md:h-[640px] rounded-[2rem] shadow-lg overflow-hidden md:grid md:grid-cols-[1.1fr,1fr]"
        style={{
          backgroundColor: esOscuro ? "#142018" : "#ffffff",
          border: `1px solid ${esOscuro ? "rgba(79,106,75,0.18)" : "#e5e7eb"}`,
        }}
      >
        <div
          className="px-5 py-6 sm:px-6 sm:py-8 text-white md:px-10 md:py-12 flex flex-col justify-between"
          style={{
            background: esOscuro
              ? "linear-gradient(145deg, #0a1f10 0%, #142a18 52%, #1f3d1f 100%)"
              : "linear-gradient(145deg, #1B2727 0%, #3C5148 52%, #6B8E4E 100%)",
          }}
        >
          <div className="max-w-md">
            <img
              src="/logo/Logo-Mercado-Digital-Blanco.png"
              alt="Mercado Digital"
              className="h-10 md:h-12 w-auto mb-4 drop-shadow-md object-contain"
            />
            <h1 className="text-3xl md:text-[2.2rem] font-black leading-[1.1] tracking-tight drop-shadow-sm">
              Bienvenido de nuevo
            </h1>
            <p className="text-white/85 text-sm mt-3 font-medium leading-relaxed max-w-[90%]">
              Ingresa a tu cuenta para comprar, seguir pedidos o entrar al panel administrativo.
            </p>
          </div>

          <div className="hidden md:flex mt-6 justify-center">
            <div className="relative w-full max-w-[500px] min-h-[220px] sm:min-h-[260px] md:min-h-[290px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-[#172116]">
              <img
                src="/login/loginmen.png"
                alt="Ilustración de acceso"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-2xl border border-white/40">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: "#64748b" }}>Mercado Digital</p>
                <p className="font-black text-base" style={{ color: "#0f172a" }}>Compra fácil y rápido</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 md:p-10 lg:px-10 lg:py-8 flex flex-col justify-center relative" style={{ backgroundColor: esOscuro ? "#142018" : "#ffffff" }}>
          <div className="absolute top-6 left-0 right-0 px-7 md:px-10">
            {error && (
              <div className="px-4 py-3 rounded-2xl text-sm border border-rose-200 bg-rose-50 text-rose-700 w-full animate-fade-in shadow-sm">
                {bloqueadoHasta ? (
                  <div className="flex items-center gap-3">
                    <Clock3 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Cuenta bloqueada.</p>
                      <p>
                        Intenta en{" "}
                        <span className="font-bold tabular-nums">{formatoMMSS(segundosRestantes)}</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}

            {reason === "session" && (
              <div className="px-4 py-3 rounded-2xl text-sm border border-amber-200 bg-amber-50 text-amber-800 w-full animate-fade-in shadow-sm">
                Tu sesión expiró. Inicia sesión nuevamente.
              </div>
            )}
          </div>

          <div className="w-full mt-4">
            {!mostrarReset && (
            <div className="max-w-xl mx-auto w-full">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#1e293b" }}>Iniciar sesión</h2>
                  <p className="text-sm mt-2" style={{ color: esOscuro ? "#94a3b8" : "#64748b" }}>Accede con tu correo y contraseña.</p>
                </div>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: esOscuro ? "#8aab7e" : "#94a3b8" }}
                  />

                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    disabled={!!bloqueadoHasta}
                    placeholder="tucorreo@ejemplo.com"
                    className="md-input pl-12 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: esOscuro ? "#cbd5e1" : "#334155" }}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={verContrasena ? "text" : "password"}
                      name="contrasena"
                      value={form.contrasena}
                      onChange={handleChange}
                      required
                      disabled={!!bloqueadoHasta}
                      placeholder="********"
                      className="md-input pr-12 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setVerContrasena((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition p-1"
                      style={{ color: esOscuro ? "#8aab7e" : "#94a3b8" }}
                      tabIndex={-1}
                      aria-label={verContrasena ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      <OjoIcon abierto={verContrasena} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando || !!bloqueadoHasta}
                  className="w-full text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60"
                  style={{ background: "#6B8E4E" }}
                >
                  {bloqueadoHasta
                    ? `Bloqueado (${formatoMMSS(segundosRestantes)})`
                    : cargando
                    ? "Ingresando..."
                    : "Ingresar"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={abrirReset}
                  className="text-sm font-semibold md-accent-text hover:underline transition"
                >
                  Olvidé mi contraseña
                </button>
              </div>
            </div>
          )}

          {mostrarReset && (
            <div className="max-w-[420px] mx-auto w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black" style={{ color: esOscuro ? "#f8fafc" : "#1e293b" }}>Restablecer contraseña</h2>
                <p className="text-sm mt-2" style={{ color: esOscuro ? "#94a3b8" : "#64748b" }}>
                  {pasoReset === 1
                    ? "Te enviaremos un código a tu correo para continuar."
                    : "Ingresa el código recibido y define tu nueva contraseña."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border p-5" style={{
                borderColor: esOscuro ? "rgba(79,106,75,0.18)" : "#e2e8f0",
                backgroundColor: esOscuro ? "rgba(10,26,18,0.5)" : "rgba(248,250,252,0.7)",
              }}>
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: esOscuro ? "#cbd5e1" : "#334155" }}>Correo electronico</label>
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
                      {cambiandoPassword ? "Enviando..." : "Enviar código"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetConfirm} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: esOscuro ? "#cbd5e1" : "#334155" }}>Código o token</label>
                      <input
                        type="text"
                        name="token"
                        value={formReset.token}
                        onChange={handleChangeReset}
                        required={!tokenFromUrl}
                        placeholder="Código recibido"
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
                          placeholder="Nueva contraseña"
                          className="md-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setVerNueva((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition p-1"
                          style={{ color: esOscuro ? "#8aab7e" : "#94a3b8" }}
                          tabIndex={-1}
                          aria-label={verNueva ? "Ocultar contraseña" : "Ver contraseña"}
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
                          placeholder="Confirmar contraseña"
                          className="md-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setVerConfirmar((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition p-1"
                          style={{ color: esOscuro ? "#8aab7e" : "#94a3b8" }}
                          tabIndex={-1}
                          aria-label={verConfirmar ? "Ocultar contraseña" : "Ver contraseña"}
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
                      {cambiandoPassword ? "Actualizando..." : "Guardar nueva contraseña"}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={pasoReset === 2 && !tokenFromUrl ? () => setPasoReset(1) : cerrarReset}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: esOscuro ? "#b7d8a3" : "#475569" }}
                >
                  {pasoReset === 2 && !tokenFromUrl ? "Volver al correo" : "Volver al inicio de sesión"}
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
              ¿No tienes cuenta? Registrate aqui
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition"
              style={{
                borderColor: esOscuro ? "rgba(79,106,75,0.18)" : "#e5e7eb",
                color: esOscuro ? "#b7d8a3" : "#475569",
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center" style={{ color: esOscuro ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
        <p className="text-[8px] uppercase tracking-wider font-semibold">
          &copy; {new Date().getFullYear()} Mercado Digital S.A.S. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
