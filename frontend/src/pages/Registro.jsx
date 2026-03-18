import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

export default function Registro() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get("next") || "";
  const next =
    nextRaw &&
    nextRaw.startsWith("/") &&
    !nextRaw.startsWith("//") &&
    !nextRaw.toLowerCase().startsWith("/\\")
      ? nextRaw
      : "";

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
      navigate(next || "/tienda");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr,0.95fr] rounded-[2rem] overflow-hidden md-surface">
        <div className="p-7 md:p-10 bg-[var(--md-surface)]">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Registro</p>
            <h1 className="text-4xl font-black md-title-serif mt-2">
              <span className="md-accent-text">Crear cuenta</span>
            </h1>
            <p className="text-slate-500 mt-3">Empieza con una experiencia más clara y coherente.</p>
          </div>

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
              <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="Contrasena" className="md-input" />
              <input type="password" name="confirmar" value={form.confirmar} onChange={handleChange} required placeholder="Confirmar contrasena" className="md-input" />
            </div>

            <button type="submit" disabled={cargando} className="w-full md-btn-primary font-semibold py-3.5 rounded-2xl transition disabled:opacity-60">
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold md-accent-text">
              Inicia sesion
            </Link>
          </p>
        </div>

        <div className="hidden lg:flex text-white p-10 xl:p-12 flex-col justify-between" style={{ backgroundColor: "#877FD7" }}>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Nueva cuenta</p>
            <h2 className="md-title-serif text-5xl font-black leading-tight mt-6">
              Entra a una tienda con menos ruido y mejor flujo.
            </h2>
          </div>
          <div className="grid gap-3">
            {["Registro rapido", "Perfil editable", "Acceso a pedidos y carrito"].map((item) => (
              <div key={item} className="rounded-2xl px-4 py-3 border border-white/15" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
