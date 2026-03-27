import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

const VACIO = {
  num_documento: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  barrio: "",
  direccion: "",
  rol: "",
};

export default function Perfil() {
  const { usuario, actualizarUsuario, esEmpleado, esAdmin } = useAuth();
  const usaSidebar = esAdmin() || esEmpleado();
  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPerfil = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await authService.me();
      const u = res.usuario || {};
      setForm({
        num_documento: u.Num_Documento || "",
        nombre: u.Nombre || "",
        apellido: u.Apellido || "",
        correo: u.Correo || "",
        telefono: u.Telefono || "",
        barrio: u.Barrio || "",
        direccion: u.Direccion || "",
        rol: u.rol || "",
      });
      actualizarUsuario(u);
    } catch (err) {
      setError(err.message || "No se pudo cargar el perfil.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      const res = await authService.actualizarPerfil({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        barrio: form.barrio.trim(),
        direccion: form.direccion.trim(),
      });

      const u = res.usuario || {};
      setForm({
        num_documento: u.Num_Documento || "",
        nombre: u.Nombre || "",
        apellido: u.Apellido || "",
        correo: u.Correo || "",
        telefono: u.Telefono || "",
        barrio: u.Barrio || "",
        direccion: u.Direccion || "",
        rol: u.rol || "",
      });
      actualizarUsuario(u);
      setMensaje(res.message || "Perfil actualizado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  const contenido = (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-black md-title-serif" style={{ color: "var(--md-text)" }}>Mi perfil</h1>
        <p className="text-sm mt-2" style={{ color: "var(--md-text-soft)" }}>
          Revisa y actualiza tu informacion personal.
        </p>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm border"
          style={{ backgroundColor: "rgba(178,197,178,0.15)", borderColor: "#f8d37b", color: "#8a6b1a" }}
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm border"
          style={{ backgroundColor: "rgba(107,142,78,0.08)", borderColor: "#6B8E4E", color: "#1B2727" }}
        >
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <div className="md-surface rounded-[1.75rem] p-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold text-white mb-4"
            style={{ background: "linear-gradient(135deg, #3C5148, #6B8E4E)" }}
          >
            {(usuario?.Nombre || form.nombre || "U").slice(0, 1).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {form.nombre || "Usuario"} {form.apellido || ""}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--md-text-soft)" }}>{form.rol || "Sin rol"}</p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl md-soft-card px-4 py-3">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--md-text-soft)" }}>Documento</p>
              <p className="font-semibold" style={{ color: "var(--md-text)" }}>{form.num_documento || "-"}</p>
            </div>
            <div className="rounded-2xl md-soft-card px-4 py-3">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--md-text-soft)" }}>Correo</p>
              <p className="font-semibold break-all" style={{ color: "var(--md-text)" }}>{form.correo || "-"}</p>
            </div>
          </div>
        </div>

        <div className="md-surface rounded-[1.75rem] p-6">
          {cargando ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Nombre</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="md-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Apellido</label>
                  <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required className="md-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Correo</label>
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} required className="md-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Telefono</label>
                  <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className="md-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Barrio</label>
                  <input type="text" name="barrio" value={form.barrio} onChange={handleChange} className="md-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Direccion</label>
                  <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="md-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Documento</label>
                  <input type="text" value={form.num_documento} disabled className="md-input" style={{ backgroundColor: "var(--md-surface-soft)", color: "var(--md-text-soft)" }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--md-text-soft)" }}>Rol</label>
                  <input type="text" value={form.rol} disabled className="md-input" style={{ backgroundColor: "var(--md-surface-soft)", color: "var(--md-text-soft)" }} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="md-btn-primary font-semibold px-5 py-3 rounded-2xl transition text-sm shadow disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (usaSidebar) {
    return (
      <div className="flex min-h-screen md-app-bg">
        <Sidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
          {contenido}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md-app-bg">
      <Navbar />
      {contenido}
    </div>
  );
}
