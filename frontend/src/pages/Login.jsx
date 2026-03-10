import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

const loginInicial = { correo: "", contrasena: "" };
const resetInicial = {
  correo: "",
  num_documento: "",
  nueva_contrasena: "",
  confirmar_contrasena: "",
};

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(loginInicial);
  const [formReset, setFormReset] = useState(resetInicial);
  const [error, setError] = useState("");
  const [errorReset, setErrorReset] = useState("");
  const [mensajeReset, setMensajeReset] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeReset = (e) => setFormReset({ ...formReset, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await authService.login(form.correo, form.contrasena);
      iniciarSesion(res.token, res.usuario);

      if (res.usuario.rol === "Administrador" || res.usuario.rol === "Empleado") {
        navigate("/admin/dashboard");
        return;
      }

      navigate("/tienda");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambioPassword = async (e) => {
    e.preventDefault();
    setErrorReset("");
    setMensajeReset("");

    if (formReset.nueva_contrasena !== formReset.confirmar_contrasena) {
      setErrorReset("Las contrasenas no coinciden.");
      return;
    }

    setCambiandoPassword(true);

    try {
      const res = await authService.cambiarPassword({
        correo: formReset.correo,
        num_documento: formReset.num_documento,
        nueva_contrasena: formReset.nueva_contrasena,
      });
      setMensajeReset(res.message || "Contrasena actualizada correctamente.");
      setFormReset(resetInicial);
    } catch (err) {
      setErrorReset(err.message);
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.95fr,1.05fr] rounded-[2rem] overflow-hidden md-surface">
        <div className="hidden lg:flex text-white p-10 xl:p-12 flex-col justify-between" style={{ backgroundColor: "#74B495" }}>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Mercado Digital</p>
            <h1 className="md-title-serif text-5xl font-black leading-tight mt-6">
              Vuelve a comprar sin perder tiempo.
            </h1>
            <p className="text-white/78 text-lg mt-6 leading-relaxed">
              Accede a tu cuenta, revisa tus pedidos y mantén tus datos actualizados en una interfaz más clara.
            </p>
          </div>
          <div className="space-y-3">
            {["Acceso rapido", "Perfil siempre editable", "Recuperacion de contrasena integrada"].map((item) => (
              <div key={item} className="rounded-2xl px-4 py-3 border border-white/15" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-7 md:p-10 bg-[var(--md-surface)]">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Inicio de sesion</p>
            <h2 className="text-4xl font-black md-title-serif mt-2">
              <span style={{ color: "#74B495" }}>Bienvenido</span>
            </h2>
            <p className="text-slate-500 mt-3">Ingresa con tu correo y contrasena.</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-rose-200 bg-rose-50 text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electronico</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tucorreo@ejemplo.com" className="md-input" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contrasena</label>
              <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="********" className="md-input" />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white font-semibold py-3.5 rounded-2xl transition disabled:opacity-60"
              style={{ background: "#74B495" }}
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--md-border)]">
            <button
              type="button"
              onClick={() => {
                setMostrarCambioPassword(!mostrarCambioPassword);
                setErrorReset("");
                setMensajeReset("");
              }}
              className="w-full text-sm font-semibold text-left md-accent-text"
            >
              {mostrarCambioPassword ? "Ocultar cambio de contrasena" : "Cambiar contrasena"}
            </button>

            {mostrarCambioPassword && (
              <form onSubmit={handleCambioPassword} className="space-y-4 mt-4">
                {errorReset && <div className="px-4 py-3 rounded-2xl text-sm border border-rose-200 bg-rose-50 text-rose-700">{errorReset}</div>}
                {mensajeReset && <div className="px-4 py-3 rounded-2xl text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">{mensajeReset}</div>}

                <input type="email" name="correo" value={formReset.correo} onChange={handleChangeReset} required placeholder="Correo electronico" className="md-input" />
                <input type="text" name="num_documento" value={formReset.num_documento} onChange={handleChangeReset} required placeholder="Numero de documento" className="md-input" />
                <input type="password" name="nueva_contrasena" value={formReset.nueva_contrasena} onChange={handleChangeReset} required minLength={6} placeholder="Nueva contrasena" className="md-input" />
                <input type="password" name="confirmar_contrasena" value={formReset.confirmar_contrasena} onChange={handleChangeReset} required minLength={6} placeholder="Confirmar contrasena" className="md-input" />

                <button type="submit" disabled={cambiandoPassword} className="w-full text-white font-semibold py-3 rounded-2xl transition disabled:opacity-60" style={{ backgroundColor: "#877FD7" }}>
                  {cambiandoPassword ? "Actualizando..." : "Actualizar contrasena"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            No tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold md-accent-text">
              Registrate aqui
            </Link>
          </p>
          <p className="text-center text-sm text-slate-400 mt-2">
            <Link to="/" className="hover:underline">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
