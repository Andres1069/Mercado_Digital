import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { categoriaService } from "../../services/api";

const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState("");
  const [buscar,     setBuscar]     = useState("");

  const [nuevoNombre,  setNuevoNombre]  = useState("");
  const [creando,      setCreando]      = useState(false);
  const [errCrear,     setErrCrear]     = useState("");

  const [editandoId,   setEditandoId]   = useState(null);
  const [editNombre,   setEditNombre]   = useState("");
  const [guardando,    setGuardando]    = useState(false);
  const [errEditar,    setErrEditar]    = useState("");

  const [eliminandoId, setEliminandoId] = useState(null);
  const [msgEliminar,  setMsgEliminar]  = useState("");

  async function cargar() {
    setCargando(true); setError("");
    try {
      const res = await categoriaService.listar();
      setCategorias(res.categorias || []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setErrCrear("");
    const nombre = nuevoNombre.trim();
    if (!nombre) { setErrCrear("Escribe el nombre de la categoria."); return; }
    setCreando(true);
    try {
      await categoriaService.crear({ nombre });
      setNuevoNombre("");
      cargar();
    } catch (e) { setErrCrear(e.message); }
    finally { setCreando(false); }
  }

  function iniciarEdicion(cat) {
    setEditandoId(cat.Cod_Categoria);
    setEditNombre(cat.Nombre);
    setErrEditar("");
  }

  async function handleGuardar(id) {
    setErrEditar("");
    const nombre = editNombre.trim();
    if (!nombre) { setErrEditar("El nombre no puede estar vacio."); return; }
    setGuardando(true);
    try {
      await categoriaService.actualizar(id, { nombre });
      setEditandoId(null);
      cargar();
    } catch (e) { setErrEditar(e.message); }
    finally { setGuardando(false); }
  }

  async function handleEliminar(id) {
    setMsgEliminar("");
    setEliminandoId(id);
    try {
      await categoriaService.eliminar(id);
      cargar();
    } catch (e) {
      setMsgEliminar(e.message);
    } finally {
      setEliminandoId(null);
    }
  }

  const filtradas = categorias.filter((c) =>
    c.Nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 py-8">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Categorias</h1>
            <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
              Gestiona las categorias de productos del supermercado
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr,1.6fr] gap-6">

            {/* Panel crear */}
            <div className="rounded-2xl p-6 h-fit" style={CARD}>
              <h2 className="text-base font-extrabold mb-4" style={{ color: "#1B2727" }}>Nueva categoria</h2>
              <form onSubmit={handleCrear} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#6B8E4E" }}>
                    Nombre <span className="normal-case" style={{ color: "#1B2727" }}>(max. 30 caracteres)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Ej: Frutas y Verduras"
                    value={nuevoNombre}
                    onChange={(e) => { setNuevoNombre(e.target.value); setErrCrear(""); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={INPUT_STYLE}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: "#1B2727" }}>{nuevoNombre.length}/30</p>
                </div>

                {errCrear && (
                  <p className="text-xs font-semibold" style={{ color: "#f87171" }}>{errCrear}</p>
                )}

                <button
                  type="submit"
                  disabled={creando}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition"
                  style={{ backgroundColor: "#6B8E4E" }}
                >
                  {creando ? "Creando..." : "Crear categoria"}
                </button>
              </form>

              <div className="mt-5 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(107,142,78,0.12)", border: "1px solid rgba(107,142,78,0.18)" }}>
                <p className="text-xs" style={{ color: "#6B8E4E" }}>Total de categorias</p>
                <p className="text-3xl font-black mt-0.5" style={{ color: "#3C5148" }}>{categorias.length}</p>
              </div>
            </div>

            {/* Lista */}
            <div className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-sm focus:outline-none"
                  style={INPUT_STYLE}
                />
              </div>

              {msgEliminar && (
                <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl text-xs"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  {msgEliminar}
                </div>
              )}

              {cargando ? (
                <div className="py-16 text-center text-sm" style={{ color: "#6B8E4E" }}>Cargando categorias...</div>
              ) : filtradas.length === 0 ? (
                <div className="py-16 text-center text-sm" style={{ color: "#6B8E4E" }}>
                  {buscar ? "Ninguna categoria coincide con la busqueda." : "No hay categorias registradas."}
                </div>
              ) : (
                <ul>
                  {filtradas.map((cat) => {
                    const editando = editandoId === cat.Cod_Categoria;
                    return (
                      <li key={cat.Cod_Categoria} className="px-5 py-3.5"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                        {editando ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              maxLength={30}
                              value={editNombre}
                              onChange={(e) => { setEditNombre(e.target.value); setErrEditar(""); }}
                              autoFocus
                              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                              style={INPUT_STYLE}
                            />
                            {errEditar && (
                              <p className="text-xs" style={{ color: "#f87171" }}>{errEditar}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleGuardar(cat.Cod_Categoria)}
                                disabled={guardando}
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                                style={{ backgroundColor: "#6B8E4E" }}
                              >
                                {guardando ? "Guardando..." : "Guardar"}
                              </button>
                              <button
                                onClick={() => { setEditandoId(null); setErrEditar(""); }}
                                className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition"
                                style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                              style={{ backgroundColor: "rgba(107,142,78,0.18)", color: "#3C5148" }}
                            >
                              {cat.Cod_Categoria}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate" style={{ color: "#1B2727" }}>{cat.Nombre}</p>
                              <p className="text-xs" style={{ color: "#6B8E4E" }}>
                                {cat.total_productos === "0" || cat.total_productos === 0
                                  ? "Sin productos"
                                  : `${cat.total_productos} producto(s)`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => iniciarEdicion(cat)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => { setMsgEliminar(""); handleEliminar(cat.Cod_Categoria); }}
                                disabled={eliminandoId === cat.Cod_Categoria}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
                                style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
                              >
                                {eliminandoId === cat.Cod_Categoria ? "..." : "Eliminar"}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
