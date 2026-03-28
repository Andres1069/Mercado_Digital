import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
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

const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const LABEL = { color: "#3C5148" };

export default function AdminProductos() {
  const { esAdmin } = useAuth();
  const soloAdmin = esAdmin();
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

  useEffect(() => { cargarDatos(); }, []);

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

  const abrirCrear = () => { setEditando(null); setForm(VACIO); setError(""); setModal(true); };

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const mostrarNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(""), 3000); };

  const productosFiltrados = productos.filter((p) =>
    p.Nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.categoria || "").toLowerCase().includes(buscar.toLowerCase()) ||
    (p.proveedor || "").toLowerCase().includes(buscar.toLowerCase())
  );

  const preview = resolverImagen(form.imagen_url);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

        {notif && (
          <div className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-xl z-50 font-semibold text-sm"
            style={{ backgroundColor: "#6B8E4E" }}>
            {notif}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Productos</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{productos.length} productos en total</p>
            </div>
            {soloAdmin && (
              <button onClick={abrirCrear}
                className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm"
                style={{ backgroundColor: "#6B8E4E" }}>
                + Nuevo producto
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {error}
            </div>
          )}

          <div className="mb-5">
            <input type="text" placeholder="Buscar por nombre, categoria o proveedor..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["#", "Producto", "Categoria", "Proveedor", "Precio", "Cantidad", "Acciones"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${i === 2 ? "hidden md:table-cell text-left" : ""} ${i === 3 ? "hidden lg:table-cell text-left" : ""} ${i === 5 ? "hidden md:table-cell text-right" : ""} ${i === 4 ? "text-right" : ""} ${i === 6 ? "text-center" : ""} ${i <= 1 ? "text-left" : ""}`}
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
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((p, i) => (
                    <tr key={p.Cod_Producto} className="transition"
                      style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6B8E4E" }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: "rgba(107,142,78,0.18)" }}>
                            {p.Imagen_url ? (
                              <img src={resolverImagen(p.Imagen_url)} alt={p.Nombre} className="w-full h-full object-cover rounded-xl" />
                            ) : "📦"}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: "#1B2727" }}>{p.Nombre}</p>
                            {p.Descripcion && <p className="text-xs truncate max-w-40" style={{ color: "#6B8E4E" }}>{p.Descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "#3C5148" }}>{p.categoria || "-"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "#3C5148" }}>{p.proveedor || "-"}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: "#6B8E4E" }}>
                        ${Number(p.Precio).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell" style={{ color: "#3C5148" }}>{p.Cantidad}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => abrirEditar(p)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                            Editar
                          </button>
                          {soloAdmin && (
                            <button onClick={() => setConfirmar(p.Cod_Producto)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>
                              Eliminar
                            </button>
                          )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
            <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}>
              <div className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                <h2 className="text-lg font-bold" style={{ color: "#1B2727" }}>
                  {editando ? "Editar producto" : "Nuevo producto"}
                </h2>
                <button onClick={() => setModal(false)}
                  className="text-2xl font-bold leading-none transition"
                  style={{ color: "#6B8E4E" }}>×</button>
              </div>

              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Nombre *</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Descripcion</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none" style={INPUT_STYLE} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Precio *</label>
                    <input type="number" name="precio" value={form.precio} onChange={handleChange} required min="0"
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>
                      Cantidad * <span className="text-xs font-normal" style={{ color: "#3C5148" }}>(sincroniza inventario)</span>
                    </label>
                    <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} required min="0"
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Fecha vencimiento</label>
                    <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Categoria</label>
                    <select name="cod_categoria" value={form.cod_categoria} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                      <option value="">Seleccionar...</option>
                      {categorias.map((c) => (
                        <option key={c.Cod_Categoria} value={c.Cod_Categoria}>{c.Nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Proveedor</label>
                  <select name="cod_proveedor" value={form.cod_proveedor} onChange={handleChange}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                    <option value="">Seleccionar...</option>
                    {proveedores.map((p) => (
                      <option key={p.Cod_Proveedor} value={p.Cod_Proveedor}>{p.Nombre_proveedor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Imagen (URL o archivo relativo)</label>
                  <input type="text" name="imagen_url" value={form.imagen_url} onChange={handleChange}
                    placeholder="Ej: uploads/leche.jpg o https://..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                </div>

                {preview && (
                  <div>
                    <p className="text-xs mb-2" style={{ color: "#6B8E4E" }}>Vista previa</p>
                    <div className="w-full h-44 rounded-xl overflow-hidden"
                      style={{ backgroundColor: "rgba(107,142,78,0.12)", border: "1px solid rgba(107,142,78,0.12)" }}>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${Number(form.imagen_zoom || 1)})`,
                          transformOrigin: `${Number(form.imagen_pos_x || 50)}% ${Number(form.imagen_pos_y || 50)}%`,
                        }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={LABEL}>
                      Zoom ({Number(form.imagen_zoom || 1).toFixed(2)}x)
                    </label>
                    <input type="range" name="imagen_zoom" min="1" max="2.5" step="0.05"
                      value={form.imagen_zoom} onChange={handleChange} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={LABEL}>
                      Posicion X ({Number(form.imagen_pos_x || 50).toFixed(0)}%)
                    </label>
                    <input type="range" name="imagen_pos_x" min="0" max="100" step="1"
                      value={form.imagen_pos_x} onChange={handleChange} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={LABEL}>
                      Posicion Y ({Number(form.imagen_pos_y || 50).toFixed(0)}%)
                    </label>
                    <input type="range" name="imagen_pos_y" min="0" max="100" step="1"
                      value={form.imagen_pos_y} onChange={handleChange} className="w-full" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                    style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60"
                    style={{ backgroundColor: "#6B8E4E" }}>
                    {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
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
              style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1B2727" }}>Eliminar producto?</h3>
              <p className="text-sm mb-6" style={{ color: "#6B8E4E" }}>Esta accion no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmar(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Cancelar
                </button>
                <button onClick={() => handleEliminar(confirmar)}
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
