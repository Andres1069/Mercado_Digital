import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService, categoriaService, productoService, resolverImagen } from "../services/api";

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
  const [cats, setCats] = useState([]);
  const [populares, setPopulares] = useState([]);
  const [productosPreview, setProductosPreview] = useState([]);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [resCats, resProds] = await Promise.all([
          categoriaService.listar(),
          productoService.listar({}),
        ]);
        if (cancelado) return;
        const listaCats = resCats?.categorias || [];
        const listaProds = resProds?.productos || [];
        setProductosPreview(listaProds);
        setCats(listaCats.slice(0, 8));
        setPopulares(listaProds.slice(0, 6));
      } catch {
        // opcional: esta seccion es decorativa, no bloquea el login
      }
    })();
    return () => { cancelado = true; };
  }, []);

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
      <div className="w-full max-w-lg md:max-w-5xl bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden md:grid md:grid-cols-[0.9fr,1.1fr]">
        <div
          className="px-6 py-8 text-white md:px-10 md:py-12 flex flex-col justify-between"
          style={{ background: "linear-gradient(145deg, #1B2727 0%, #3C5148 52%, #6B8E4E 100%)" }}
        >
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">Mercado Digital</p>
            <h1 className="text-2xl md:text-4xl font-black mt-3 leading-tight">Bienvenido de nuevo</h1>
            <p className="text-white/80 text-sm md:text-base mt-3">
              Ingresa a tu cuenta para comprar, seguir pedidos o entrar al panel administrativo.
            </p>
          </div>

          <div className="hidden md:flex mt-8 justify-center">
            <div className="relative w-full max-w-[420px] min-h-[260px] sm:min-h-[320px] md:min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.18)] bg-slate-900">
              <img
                src="/chicasofa.png"
                alt="Ilustración de acceso"
                className="w-full h-full object-cover object-center"
              />
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
            <div className="max-w-xl mx-auto w-full">
              <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Vista previa de productos/categorias (solo cuando no esta llenando el formulario) */}
              {(cats.length > 0 || populares.length > 0) && !form.correo && !form.contrasena && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Categories</h3>
                    <button
                      type="button"
                      onClick={() => navigate("/tienda")}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cats.map((c, idx) => {
                      const nombre = String(c.Nombre || "");
                      const iconos = {
                        Snacks: "🍿",
                        Desayuno: "🥐",
                        Bebidas: "🥤",
                        Café: "☕",
                        Enlatados: "🥫",
                        Frutas: "🍎",
                        Salsas: "🧂",
                        Vegetales: "🥬",
                        "Aseo Personal": "🧴",
                        Lácteos: "🥛",
                        Panadería: "🥖",
                        Granos: "🌾",
                        Dulces: "🍬",
                        Aceites: "🫙",
                      };
                      const emoji = iconos[nombre] || "🛒";

                      const paletas = [
                        { top: "linear-gradient(135deg, rgba(107,142,78,0.55), rgba(60,81,72,0.25))", accent: "#6B8E4E" },
                        { top: "linear-gradient(135deg, rgba(59,130,246,0.55), rgba(34,211,238,0.22))", accent: "#0ea5e9" },
                        { top: "linear-gradient(135deg, rgba(245,158,11,0.55), rgba(251,191,36,0.22))", accent: "#f59e0b" },
                        { top: "linear-gradient(135deg, rgba(244,114,182,0.55), rgba(236,72,153,0.22))", accent: "#e11d48" },
                      ];
                      const pal = paletas[idx % paletas.length];

                      const totalCat = productosPreview.reduce((acc, p) => {
                        const cat = String(p.categoria || p.Categoria || "");
                        return cat === nombre ? acc + 1 : acc;
                      }, 0);

                      return (
                        <button
                          key={c.Cod_Categoria}
                          type="button"
                          onClick={() => navigate(`/tienda?categoria=${c.Cod_Categoria}`)}
                          className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_18px_40px_rgba(2,6,23,0.12)] hover:shadow-[0_22px_55px_rgba(2,6,23,0.16)] transition text-left"
                        >
                          <div className="h-[92px] relative" style={{ background: pal.top }}>
                            <div className="absolute left-4 top-4 w-10 h-10 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-center">
                              <span className="text-xl" aria-hidden="true">{emoji}</span>
                            </div>
                          </div>

                          <div className="px-5 py-4 bg-slate-900">
                            <div className="text-[11px] tracking-[0.35em] uppercase font-bold" style={{ color: "rgba(226,232,240,0.55)" }}>
                              CATEGORÍA
                            </div>
                            <div className="mt-1 text-lg font-extrabold text-white leading-tight">{nombre}</div>
                            <div className="mt-1 text-sm" style={{ color: "rgba(226,232,240,0.72)" }}>
                              {totalCat || 0} producto{(totalCat || 0) === 1 ? "" : "s"}
                            </div>

                            <div className="mt-4">
                              <span
                                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl py-2.5 text-sm font-bold text-white"
                                style={{ backgroundColor: pal.accent }}
                              >
                                Ver categoría
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                  <path d="M5 12h12" />
                                  <path d="m13 6 6 6-6 6" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-6 mb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Popular Items</h3>
                    <div className="flex items-center gap-2 text-slate-300 select-none">
                      <span className="w-7 h-7 rounded-full border border-gray-100 bg-white grid place-items-center">‹</span>
                      <span className="w-7 h-7 rounded-full border border-gray-100 bg-white grid place-items-center">›</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {populares.map((p) => {
                      const img = resolverImagen(p.Imagen_url || p.imagen_url);
                      return (
                        <button
                          key={p.Cod_Producto}
                          type="button"
                          onClick={() => navigate("/tienda")}
                          className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden text-left"
                        >
                          <div className="relative h-24 flex items-center justify-center bg-slate-50">
                            {img ? (
                              <img src={img} alt={p.Nombre} className="h-full w-full object-contain p-2" loading="lazy" />
                            ) : (
                              <div className="text-3xl text-slate-300">□</div>
                            )}
                            <span className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-slate-800 text-white grid place-items-center shadow">
                              +
                            </span>
                          </div>
                          <div className="p-3">
                            <div className="text-xs font-bold text-slate-700 line-clamp-2 min-h-[32px]">{p.Nombre}</div>
                            <div className="mt-2 text-sm font-extrabold text-slate-900">
                              ${Number(p.Precio || 0).toLocaleString("es-CO")}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
