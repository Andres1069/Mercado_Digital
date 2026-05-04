import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { usuarioService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const VACIO = {
  num_documento: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  barrio: "",
  direccion: "",
  contrasena: "",
  confirmar: "",
  rol_id: "",
};

const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const LABEL = { color: "#3C5148" };
const SELECT_TABLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem" };

export default function AdminUsuarios() {
  const { esOscuro } = useTheme();
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [confirmar, setConfirmar] = useState(null);
  const [rolesPendientes, setRolesPendientes] = useState({});
  const [estadosPendientes, setEstadosPendientes] = useState({});

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        usuarioService.listar(),
        usuarioService.roles(),
      ]);
      const listaUsuarios = usuariosRes.usuarios || [];
      const listaRoles = rolesRes.roles || [];
      setUsuarios(listaUsuarios);
      setRoles(listaRoles);
      setRolesPendientes(
        Object.fromEntries(listaUsuarios.map((item) => [item.Num_Documento, String(item.Id_rol)]))
      );
      setEstadosPendientes(
        Object.fromEntries(listaUsuarios.map((item) => [item.Num_Documento, String(item.estado || "Activo")]))
      );
    } catch (err) {
      setError(err.message || "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const mostrarNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(""), 3000); };

  const abrirCrear = () => {
    setEditando(null);
    setError("");
    setForm({ ...VACIO, rol_id: String(roles[0]?.Id_rol || "") });
    setModal(true);
  };

  const abrirEditar = (item) => {
    setEditando(item);
    setError("");
    setForm({
      num_documento: String(item.Num_Documento || ""),
      nombre: item.Nombre || "",
      apellido: item.Apellido || "",
      correo: item.Correo || "",
      telefono: item.Telefono || "",
      barrio: item.Barrio || "",
      direccion: item.Direccion || "",
      contrasena: "",
      confirmar: "",
      rol_id: String(item.Id_rol || ""),
    });
    setModal(true);
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validar = () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.rol_id)
      return "Nombre, apellido, correo y rol son obligatorios.";
    if (!editando) {
      if (!form.num_documento.trim() || !form.contrasena)
        return "Documento y contrasena son obligatorios para crear el usuario.";
      if (form.contrasena.length < 6) return "La contrasena debe tener al menos 6 caracteres.";
      if (form.contrasena !== form.confirmar) return "Las contrasenas no coinciden.";
    }
    return "";
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    const mensaje = validar();
    if (mensaje) { setError(mensaje); return; }
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        barrio: form.barrio.trim(),
        direccion: form.direccion.trim(),
        rol_id: Number(form.rol_id),
      };
      if (editando) {
        await usuarioService.actualizar(editando.Num_Documento, payload);
        mostrarNotif("Usuario actualizado");
      } else {
        await usuarioService.crear({ ...payload, num_documento: Number(form.num_documento), contrasena: form.contrasena });
        mostrarNotif("Usuario creado");
      }
      setModal(false);
      setForm(VACIO);
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambioRol = async (doc) => {
    const nuevoRol = Number(rolesPendientes[doc]);
    const actual = usuarios.find((item) => Number(item.Num_Documento) === Number(doc));
    if (!nuevoRol || !actual || Number(actual.Id_rol) === nuevoRol) return;
    try {
      await usuarioService.cambiarRol(doc, nuevoRol);
      mostrarNotif("Rol actualizado");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el rol.");
    }
  };

  const handleCambioEstado = async (doc) => {
    const nuevoEstado = String(estadosPendientes[doc] || "").trim();
    const actual = usuarios.find((item) => Number(item.Num_Documento) === Number(doc));
    const estadoActual = String(actual?.estado || "Activo");
    if (!nuevoEstado || !actual || estadoActual === nuevoEstado) return;
    try {
      await usuarioService.cambiarEstado(doc, nuevoEstado);
      mostrarNotif("Estado actualizado");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado.");
    }
  };

  const handleEliminar = async (doc) => {
    try {
      await usuarioService.eliminar(doc);
      setConfirmar(null);
      mostrarNotif("Usuario eliminado");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el usuario.");
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((item) =>
      String(item.Num_Documento).includes(q) ||
      `${item.Nombre || ""} ${item.Apellido || ""}`.toLowerCase().includes(q) ||
      (item.Correo || "").toLowerCase().includes(q) ||
      (item.rol || "").toLowerCase().includes(q) ||
      String(item.estado || "").toLowerCase().includes(q)
    );
  }, [buscar, usuarios]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

        {notif && (
          <div className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-xl z-50 font-semibold text-sm"
            style={{ backgroundColor: "#6B8E4E" }}>
            {notif}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Usuarios</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{usuarios.length} usuarios registrados</p>
            </div>
            <button onClick={abrirCrear}
              className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm"
              style={{ backgroundColor: "#6B8E4E" }}>
              + Nuevo usuario
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {error}
            </div>
          )}

          <div className="mb-5">
            <input type="text" placeholder="Buscar por documento, nombre, correo, rol o estado..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Documento", "Usuario", "Contacto", "Rol", "Estado", "Acciones"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${i === 2 ? "hidden lg:table-cell" : ""} ${i >= 4 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((item) => {
                    const esPropioUsuario = Number(item.Num_Documento) === Number(usuario?.Num_Documento);
                    return (
                      <tr key={item.Num_Documento} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3 font-semibold" style={{ color: "#3C5148" }}>
                          {item.Num_Documento}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: "#1B2727" }}>{item.Nombre} {item.Apellido}</p>
                          <p className="text-xs md:hidden" style={{ color: "#6B8E4E" }}>{item.Correo}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p style={{ color: "#3C5148" }}>{item.Correo}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{item.Telefono || "Sin telefono"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={rolesPendientes[item.Num_Documento] || ""}
                              disabled={esPropioUsuario}
                              onChange={(e) => setRolesPendientes((prev) => ({ ...prev, [item.Num_Documento]: e.target.value }))}
                              style={SELECT_TABLE}>
                              {roles.map((rol) => (
                                <option key={rol.Id_rol} value={rol.Id_rol}>{rol.nombre_rol}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleCambioRol(item.Num_Documento)}
                              disabled={esPropioUsuario || String(item.Id_rol) === String(rolesPendientes[item.Num_Documento])}
                              className="px-2 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition"
                              style={{ backgroundColor: "#6B8E4E" }}>
                              OK
                            </button>
                          </div>
                          {esPropioUsuario && <p className="text-xs mt-1" style={{ color: "#1B2727" }}>Tu rol no se puede cambiar aqui.</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={estadosPendientes[item.Num_Documento] || "Activo"}
                              disabled={esPropioUsuario}
                              onChange={(e) => setEstadosPendientes((prev) => ({ ...prev, [item.Num_Documento]: e.target.value }))}
                              style={SELECT_TABLE}>
                              <option value="Activo">Activo</option>
                              <option value="Inactivo">Inactivo</option>
                            </select>
                            <button
                              onClick={() => handleCambioEstado(item.Num_Documento)}
                              disabled={esPropioUsuario || String(item.estado || "Activo") === String(estadosPendientes[item.Num_Documento] || "Activo")}
                              className="px-2 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition"
                              style={{ backgroundColor: "#6B8E4E" }}>
                              OK
                            </button>
                          </div>
                          {esPropioUsuario && <p className="text-xs mt-1 text-center" style={{ color: "#1B2727" }}>Tu estado no se puede cambiar aqui.</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => abrirEditar(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                              Editar
                            </button>
                            <button
                              onClick={() => setConfirmar(item)}
                              disabled={esPropioUsuario}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                              style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
            <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
              <div className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                <h2 className="text-lg font-bold" style={{ color: "#1B2727" }}>
                  {editando ? "Editar usuario" : "Nuevo usuario"}
                </h2>
                <button onClick={() => setModal(false)}
                  className="text-2xl font-bold leading-none" style={{ color: "#6B8E4E" }}>×</button>
              </div>

              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Documento *</label>
                    <input type="number" name="num_documento" value={form.num_documento} onChange={handleChange}
                      disabled={!!editando} required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
                      style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Rol *</label>
                    <select name="rol_id" value={form.rol_id} onChange={handleChange} required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                      <option value="">Seleccionar...</option>
                      {roles.map((rol) => (
                        <option key={rol.Id_rol} value={rol.Id_rol}>{rol.nombre_rol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Nombre *</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Apellido *</label>
                    <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Correo *</label>
                    <input type="email" name="correo" value={form.correo} onChange={handleChange} required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Telefono</label>
                    <input type="text" name="telefono" value={form.telefono} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Barrio</label>
                    <input type="text" name="barrio" value={form.barrio} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Direccion</label>
                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                </div>

                {!editando && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={LABEL}>Contrasena *</label>
                      <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required
                        className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={LABEL}>Confirmar contrasena *</label>
                      <input type="password" name="confirmar" value={form.confirmar} onChange={handleChange} required
                        className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                    style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60"
                    style={{ backgroundColor: "#6B8E4E" }}>
                    {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1B2727" }}>Eliminar usuario?</h3>
              <p className="text-sm mb-2" style={{ color: "#3C5148" }}>
                Se eliminara a {confirmar.Nombre} {confirmar.Apellido}.
              </p>
              <p className="text-xs mb-6" style={{ color: "#6B8E4E" }}>
                Si el usuario tiene pedidos, reportes o historial asociado, el sistema bloqueara la eliminacion.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmar(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Cancelar
                </button>
                <button onClick={() => handleEliminar(confirmar.Num_Documento)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                  style={{ backgroundColor: "rgba(239,68,68,0.8)" }}>
                  Si, eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
