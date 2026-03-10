import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { usuarioService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

export default function AdminUsuarios() {
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
    } catch (err) {
      setError(err.message || "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarNotif = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const abrirCrear = () => {
    setEditando(null);
    setError("");
    setForm({
      ...VACIO,
      rol_id: String(roles[0]?.Id_rol || ""),
    });
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validar = () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.rol_id) {
      return "Nombre, apellido, correo y rol son obligatorios.";
    }

    if (!editando) {
      if (!form.num_documento.trim() || !form.contrasena) {
        return "Documento y contrasena son obligatorios para crear el usuario.";
      }
      if (form.contrasena.length < 6) {
        return "La contrasena debe tener al menos 6 caracteres.";
      }
      if (form.contrasena !== form.confirmar) {
        return "Las contrasenas no coinciden.";
      }
    }

    return "";
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");

    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }

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
        await usuarioService.crear({
          ...payload,
          num_documento: Number(form.num_documento),
          contrasena: form.contrasena,
        });
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

    if (!nuevoRol || !actual || Number(actual.Id_rol) === nuevoRol) {
      return;
    }

    try {
      await usuarioService.cambiarRol(doc, nuevoRol);
      mostrarNotif("Rol actualizado");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el rol.");
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
      (item.rol || "").toLowerCase().includes(q)
    );
  }, [buscar, usuarios]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {notif && (
        <div
          className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-xl z-50 font-semibold text-sm"
          style={{ backgroundColor: "#74B495" }}
        >
          {notif}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Gestion de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuarios registrados</p>
          </div>
          <button
            onClick={abrirCrear}
            className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow"
            style={{ backgroundColor: "#74B495" }}
          >
            + Nuevo usuario
          </button>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm border"
            style={{ backgroundColor: "#fff8e8", borderColor: "#f8d37b", color: "#8a6b1a" }}
          >
            {error}
          </div>
        )}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por documento, nombre, correo o rol..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-white shadow-sm text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#A8C898" }} className="text-white">
                <th className="px-4 py-3 text-left font-semibold">Documento</th>
                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Contacto</th>
                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((item) => {
                  const esPropioUsuario = Number(item.Num_Documento) === Number(usuario?.Num_Documento);
                  return (
                    <tr key={item.Num_Documento} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-700">{item.Num_Documento}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{item.Nombre} {item.Apellido}</p>
                        <p className="text-xs text-gray-500 md:hidden">{item.Correo}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-gray-700">{item.Correo}</p>
                        <p className="text-xs text-gray-500">{item.Telefono || "Sin telefono"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={rolesPendientes[item.Num_Documento] || ""}
                            disabled={esPropioUsuario}
                            onChange={(e) =>
                              setRolesPendientes((prev) => ({
                                ...prev,
                                [item.Num_Documento]: e.target.value,
                              }))
                            }
                            className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm"
                          >
                            {roles.map((rol) => (
                              <option key={rol.Id_rol} value={rol.Id_rol}>
                                {rol.nombre_rol}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleCambioRol(item.Num_Documento)}
                            disabled={esPropioUsuario || String(item.Id_rol) === String(rolesPendientes[item.Num_Documento])}
                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: "#877FD7" }}
                          >
                            Guardar
                          </button>
                        </div>
                        {esPropioUsuario && <p className="text-xs text-gray-400 mt-1">Tu rol no se puede cambiar aqui.</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirEditar(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                            style={{ backgroundColor: "#74B495" }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmar(item)}
                            disabled={esPropioUsuario}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                            style={{ backgroundColor: "#E1A7CA" }}
                          >
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: "#A8C898" }}>
              <h2 className="text-lg font-bold text-white">{editando ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button onClick={() => setModal(false)} className="text-white/80 hover:text-white text-xl font-bold">x</button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Documento *</label>
                  <input
                    type="number"
                    name="num_documento"
                    value={form.num_documento}
                    onChange={handleChange}
                    disabled={!!editando}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rol *</label>
                  <select
                    name="rol_id"
                    value={form.rol_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {roles.map((rol) => (
                      <option key={rol.Id_rol} value={rol.Id_rol}>
                        {rol.nombre_rol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo *</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Barrio</label>
                  <input
                    type="text"
                    name="barrio"
                    value={form.barrio}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Direccion</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
              </div>

              {!editando && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contrasena *</label>
                    <input
                      type="password"
                      name="contrasena"
                      value={form.contrasena}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar contrasena *</label>
                    <input
                      type="password"
                      name="confirmar"
                      value={form.confirmar}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                  style={{ backgroundColor: "#74B495" }}
                >
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar usuario?</h3>
            <p className="text-sm text-gray-500 mb-2">
              Se eliminara a {confirmar.Nombre} {confirmar.Apellido}.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Si el usuario tiene pedidos, reportes o historial asociado, el sistema bloqueara la eliminacion.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmar.Num_Documento)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: "#E1A7CA" }}
              >
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
