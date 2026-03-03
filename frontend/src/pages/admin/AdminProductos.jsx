import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import {
  productoService,
  categoriaService,
  proveedorService,
  resolverImagen,
} from "../../services/api";

const VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  cantidad: "",
  fecha_vencimiento: "",
  imagen_url: "",
  imagen_zoom: 1,
  imagen_pos_x: 50,
  imagen_pos_y: 50,
  cod_categoria: "",
  cod_proveedor: "",
};

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmar, setConfirmar] = useState(null);
  const [notif, setNotif] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats, provs] = await Promise.all([
        productoService.listar(),
        categoriaService.listar(),
        proveedorService.listar(),
      ]);
      setProductos(prods.productos || []);
      setCategorias(cats.categorias || []);
      setProveedores(provs.proveedores || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(VACIO);
    setError("");
    setModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      nombre: p.Nombre || "",
      descripcion: p.Descripcion || "",
      precio: p.Precio || "",
      cantidad: p.Cantidad || "",
      fecha_vencimiento: p.Fecha_vencimiento || "",
      imagen_url: p.Imagen_url || "",
      imagen_zoom: p.Imagen_zoom ?? 1,
      imagen_pos_x: p.Imagen_pos_x ?? 50,
      imagen_pos_y: p.Imagen_pos_y ?? 50,
      cod_categoria: p.Cod_Categoria || "",
      cod_proveedor: p.Cod_Proveedor || "",
    });
    setError("");
    setModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre || !form.precio || !form.cantidad) {
      setError("Nombre, precio y cantidad son obligatorios.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        ...form,
        precio: Number(form.precio),
        cantidad: Number(form.cantidad),
        imagen_zoom: Number(form.imagen_zoom || 1),
        imagen_pos_x: Number(form.imagen_pos_x || 50),
        imagen_pos_y: Number(form.imagen_pos_y || 50),
        cod_categoria: form.cod_categoria ? Number(form.cod_categoria) : null,
        cod_proveedor: form.cod_proveedor ? Number(form.cod_proveedor) : null,
      };

      if (editando) {
        await productoService.actualizar(editando.Cod_Producto, payload);
        mostrarNotif("Producto actualizado");
      } else {
        await productoService.crear(payload);
        mostrarNotif("Producto creado");
      }

      setModal(false);
      await cargarDatos();
    } catch (e) {
      setError(e.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await productoService.eliminar(id);
      setConfirmar(null);
      mostrarNotif("Producto eliminado");
      await cargarDatos();
    } catch (e) {
      setError(e.message || "No se pudo eliminar el producto.");
    }
  };

  const mostrarNotif = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  const productosFiltrados = productos.filter((p) =>
    p.Nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.categoria || "").toLowerCase().includes(buscar.toLowerCase()) ||
    (p.proveedor || "").toLowerCase().includes(buscar.toLowerCase())
  );

  const preview = resolverImagen(form.imagen_url);

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Gestion de Productos</h1>
            <p className="text-sm text-gray-400 mt-1">{productos.length} productos en total</p>
          </div>
          <button
            onClick={abrirCrear}
            className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow"
            style={{ backgroundColor: "#74B495" }}
          >
            + Nuevo producto
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
            placeholder="Buscar por nombre, categoria o proveedor..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-white shadow-sm text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#A8C898" }} className="text-white">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Producto</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Proveedor</th>
                <th className="px-4 py-3 text-right font-semibold">Precio</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Cantidad</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p, i) => (
                  <tr key={p.Cod_Producto} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: "#f0f7f4" }}
                        >
                          {p.Imagen_url ? (
                            <img src={resolverImagen(p.Imagen_url)} alt={p.Nombre} className="w-full h-full object-cover rounded-xl" />
                          ) : "IMG"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.Nombre}</p>
                          {p.Descripcion && <p className="text-xs text-gray-400 truncate max-w-40">{p.Descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{p.categoria || "-"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{p.proveedor || "-"}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: "#74B495" }}>
                      ${Number(p.Precio).toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{p.Cantidad}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEditar(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                          style={{ backgroundColor: "#877FD7" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmar(p.Cod_Producto)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                          style={{ backgroundColor: "#E1A7CA" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: "#A8C898" }}>
              <h2 className="text-lg font-bold text-white">{editando ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setModal(false)} className="text-white/80 hover:text-white text-xl font-bold">x</button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={form.fecha_vencimiento}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                  <select
                    name="cod_categoria"
                    value={form.cod_categoria}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map((c) => (
                      <option key={c.Cod_Categoria} value={c.Cod_Categoria}>{c.Nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Proveedor</label>
                <select
                  name="cod_proveedor"
                  value={form.cod_proveedor}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {proveedores.map((p) => (
                    <option key={p.Cod_Proveedor} value={p.Cod_Proveedor}>{p.Nombre_proveedor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen (URL o archivo relativo)</label>
                <input
                  type="text"
                  name="imagen_url"
                  value={form.imagen_url}
                  onChange={handleChange}
                  placeholder="Ej: uploads/leche.jpg o https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
                />
              </div>

              {preview && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Vista previa</p>
                  <div className="w-full h-44 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${Number(form.imagen_zoom || 1)})`,
                        transformOrigin: `${Number(form.imagen_pos_x || 50)}% ${Number(form.imagen_pos_y || 50)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Zoom ({Number(form.imagen_zoom || 1).toFixed(2)}x)
                  </label>
                  <input
                    type="range"
                    name="imagen_zoom"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={form.imagen_zoom}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Posicion X ({Number(form.imagen_pos_x || 50).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    name="imagen_pos_x"
                    min="0"
                    max="100"
                    step="1"
                    value={form.imagen_pos_x}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Posicion Y ({Number(form.imagen_pos_y || 50).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    name="imagen_pos_y"
                    min="0"
                    max="100"
                    step="1"
                    value={form.imagen_pos_y}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

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
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar producto?</h3>
            <p className="text-sm text-gray-400 mb-6">Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmar)}
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
