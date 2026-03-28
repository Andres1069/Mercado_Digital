import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { ofertaService, productoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const VACIO = {
  titulo: "",
  descripcion: "",
  porcentaje_descuento: "",
  fecha_inicio_fecha: "",
  fecha_inicio_hora: "",
  fecha_fin_fecha: "",
  fecha_fin_hora: "",
  cod_producto: "",
  imagen_banner: "",
  activo: 1,
};

const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const LABEL = { color: "#3C5148" };

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function estadoOferta(oferta) {
  if (!Number(oferta.activo)) return "Inactiva";
  const ahora = new Date();
  const ini = new Date(String(oferta.Fecha_Inicio).replace(" ", "T"));
  const fin = new Date(String(oferta.Fecha_Fin).replace(" ", "T"));
  if (Number.isNaN(ini.getTime()) || Number.isNaN(fin.getTime())) return "Activa";
  if (ahora < ini) return "Programada";
  if (ahora > fin) return "Vencida";
  return "Activa";
}

function colorEstado(estado) {
  if (estado === "Activa")     return { bg: "rgba(107,142,78,0.2)",  text: "#6B8E4E" };
  if (estado === "Programada") return { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24" };
  if (estado === "Vencida")    return { bg: "rgba(239,68,68,0.15)",   text: "#f87171" };
  return                              { bg: "rgba(100,116,139,0.15)", text: "#3C5148" };
}

function getLocalNowParts() {
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  const offset = ahora.getTimezoneOffset();
  const local = new Date(ahora.getTime() - offset * 60000);
  const iso = local.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

function addMinutes(fecha, hora, minutos) {
  const base = new Date(`${fecha}T${hora}:00`);
  const next = new Date(base.getTime() + minutos * 60000);
  const offset = next.getTimezoneOffset();
  const local = new Date(next.getTime() - offset * 60000);
  const iso = local.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

function splitDateTime(value) {
  if (!value) return { fecha: "", hora: "" };
  const normalizado = String(value).replace(" ", "T");
  return { fecha: normalizado.slice(0, 10), hora: normalizado.slice(11, 16) };
}

function joinDateTime(fecha, hora) {
  if (!fecha || !hora) return "";
  return `${fecha} ${hora}:00`;
}

export default function AdminOfertas() {
  const { esAdmin } = useAuth();
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmar, setConfirmar] = useState(null);
  const [notif, setNotif] = useState("");

  const ahora = getLocalNowParts();
  const inicioActual = joinDateTime(form.fecha_inicio_fecha, form.fecha_inicio_hora);
  const finActual = joinDateTime(form.fecha_fin_fecha, form.fecha_fin_hora);

  const productoSeleccionado = useMemo(
    () => productos.find((p) => String(p.Cod_Producto) === String(form.cod_producto)),
    [productos, form.cod_producto]
  );
  const precioOriginalPreview = productoSeleccionado ? Number(productoSeleccionado.Precio) : null;
  const pctPreview = Number(form.porcentaje_descuento);
  const precioOfertaPreview =
    precioOriginalPreview && pctPreview > 0 && pctPreview <= 100
      ? Math.round(precioOriginalPreview - (precioOriginalPreview * pctPreview) / 100)
      : null;

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const [ofertasRes, productosRes] = await Promise.allSettled([
        ofertaService.listarTodas(),
        productoService.listar(),
      ]);
      if (ofertasRes.status === "fulfilled") setOfertas(ofertasRes.value.ofertas || []);
      else { setOfertas([]); setError(ofertasRes.reason?.message || "No se pudieron cargar las ofertas."); }
      if (productosRes.status === "fulfilled") setProductos(productosRes.value.productos || []);
      else setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const mostrarNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(""), 3000); };

  const abrirCrear = () => {
    const inicio = getLocalNowParts();
    const fin = addMinutes(inicio.fecha, inicio.hora, 10);
    setEditando(null);
    setError("");
    setForm({ ...VACIO, fecha_inicio_fecha: inicio.fecha, fecha_inicio_hora: inicio.hora, fecha_fin_fecha: fin.fecha, fecha_fin_hora: fin.hora });
    setModal(true);
  };

  const abrirEditar = (oferta) => {
    const inicio = splitDateTime(oferta.Fecha_Inicio);
    const fin = splitDateTime(oferta.Fecha_Fin);
    setEditando(oferta);
    setError("");
    setForm({
      titulo: oferta.Titulo || "",
      descripcion: oferta.Descripcion || "",
      porcentaje_descuento: oferta.Porcentaje_Descuento || "",
      fecha_inicio_fecha: inicio.fecha,
      fecha_inicio_hora: inicio.hora,
      fecha_fin_fecha: fin.fecha,
      fecha_fin_hora: fin.hora,
      cod_producto: oferta.Cod_Producto || "",
      imagen_banner: oferta.imagen_banner || "",
      activo: Number(oferta.activo ?? 1),
    });
    setModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!form.titulo.trim()) return "El titulo es obligatorio.";
    const pct = Number(form.porcentaje_descuento);
    if (!pct || pct <= 0 || pct > 100) return "El descuento debe estar entre 1 y 100.";
    if (!form.fecha_inicio_fecha || !form.fecha_inicio_hora || !form.fecha_fin_fecha || !form.fecha_fin_hora)
      return "Debes seleccionar fecha y hora de inicio y fin.";
    if (!editando && inicioActual < joinDateTime(ahora.fecha, ahora.hora))
      return "La fecha de inicio no puede estar en el pasado.";
    if (finActual < joinDateTime(ahora.fecha, ahora.hora))
      return "La fecha fin no puede estar en el pasado.";
    if (finActual <= inicioActual)
      return "La fecha fin debe ser mayor que la fecha inicio.";
    return "";
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validar();
    if (msg) { setError(msg); return; }
    setGuardando(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        porcentaje_descuento: Number(form.porcentaje_descuento),
        fecha_inicio: joinDateTime(form.fecha_inicio_fecha, form.fecha_inicio_hora),
        fecha_fin: joinDateTime(form.fecha_fin_fecha, form.fecha_fin_hora),
        cod_producto: form.cod_producto ? Number(form.cod_producto) : null,
        imagen_banner: form.imagen_banner,
        activo: Number(form.activo),
      };
      if (editando) {
        await ofertaService.actualizar(editando.Cod_Oferta, payload);
        mostrarNotif("Oferta actualizada");
      } else {
        await ofertaService.crear(payload);
        mostrarNotif("Oferta creada");
      }
      setModal(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar la oferta.");
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await ofertaService.eliminar(id);
      setConfirmar(null);
      mostrarNotif("Oferta eliminada");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la oferta.");
    }
  };

  const ofertasFiltradas = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return ofertas;
    return ofertas.filter((o) =>
      (o.Titulo || "").toLowerCase().includes(q) ||
      (o.nombre_producto || "").toLowerCase().includes(q)
    );
  }, [ofertas, buscar]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

        {notif && (
          <div className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-semibold"
            style={{ backgroundColor: "#6B8E4E" }}>
            {notif}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Ofertas</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{ofertas.length} ofertas registradas</p>
            </div>
            {esAdmin() && (
              <button onClick={abrirCrear}
                className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm"
                style={{ backgroundColor: "#6B8E4E" }}>
                + Nueva oferta
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
            <input type="text" value={buscar} onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por titulo o producto..."
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#6B8E4E" }}>Oferta</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell" style={{ color: "#6B8E4E" }}>Producto</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "#6B8E4E" }}>Descuento</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell" style={{ color: "#6B8E4E" }}>Vigencia</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: "#6B8E4E" }}>Estado</th>
                  {esAdmin() && <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: "#6B8E4E" }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={esAdmin() ? 6 : 5} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : ofertasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={esAdmin() ? 6 : 5} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No hay ofertas para mostrar
                    </td>
                  </tr>
                ) : (
                  ofertasFiltradas.map((o) => {
                    const estado = estadoOferta(o);
                    const color = colorEstado(estado);
                    return (
                      <tr key={o.Cod_Oferta} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: "#1B2727" }}>{o.Titulo}</p>
                          {o.Descripcion && <p className="text-xs" style={{ color: "#6B8E4E" }}>{o.Descripcion}</p>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "#3C5148" }}>
                          {o.nombre_producto || "Sin producto"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold" style={{ color: "#6B8E4E" }}>{Number(o.Porcentaje_Descuento || 0)}%</span>
                          {o.precio_oferta != null && o.precio_original != null && (
                            <div className="text-xs mt-0.5">
                              <span className="line-through" style={{ color: "#6B8E4E" }}>${Number(o.precio_original).toLocaleString("es-CO")}</span>
                              {" → "}
                              <span className="font-semibold" style={{ color: "#6B8E4E" }}>${Number(o.precio_oferta).toLocaleString("es-CO")}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "#6B8E4E" }}>
                          <div>Inicio: {formatDateTime(o.Fecha_Inicio)}</div>
                          <div>Fin: {formatDateTime(o.Fecha_Fin)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: color.bg, color: color.text }}>
                            {estado}
                          </span>
                        </td>
                        {esAdmin() && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => abrirEditar(o)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                                Editar
                              </button>
                              <button onClick={() => setConfirmar(o.Cod_Oferta)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        )}
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
              style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}>
              <div className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                <div>
                  <h2 className="text-xl font-black" style={{ color: "#1B2727" }}>
                    {editando ? "Editar oferta" : "Nueva oferta"}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
                    Define una vigencia clara sin usar fechas vencidas.
                  </p>
                </div>
                <button onClick={() => setModal(false)}
                  className="text-3xl font-bold leading-none transition"
                  style={{ color: "#6B8E4E" }}>×</button>
              </div>

              <form onSubmit={handleGuardar} className="p-6 space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Titulo *</label>
                  <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Descripcion</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none" style={INPUT_STYLE} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Descuento (%) *</label>
                    <input type="number" name="porcentaje_descuento" value={form.porcentaje_descuento}
                      onChange={handleChange} min="1" max="100" required
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Producto</label>
                    <select name="cod_producto" value={form.cod_producto} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                      <option value="">Sin producto</option>
                      {productos.map((p) => (
                        <option key={p.Cod_Producto} value={p.Cod_Producto}>{p.Nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {precioOfertaPreview !== null && (
                  <div className="rounded-xl px-4 py-3 flex items-center gap-4"
                    style={{ backgroundColor: "rgba(107,142,78,0.12)", border: "1px solid rgba(107,142,78,0.2)" }}>
                    <div className="text-sm" style={{ color: "#3C5148" }}>
                      Precio original: <span className="font-semibold" style={{ color: "#1B2727" }}>${precioOriginalPreview.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "#6B8E4E" }}>
                      → ${precioOfertaPreview.toLocaleString("es-CO")}
                    </div>
                    <div className="text-xs ml-auto" style={{ color: "#6B8E4E" }}>(-{pctPreview}%)</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4"
                    style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.15)" }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: "#3C5148" }}>Inicio de la oferta</p>
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),140px] gap-3">
                      <input type="date" name="fecha_inicio_fecha" value={form.fecha_inicio_fecha}
                        min={editando ? undefined : ahora.fecha} onChange={handleChange} required
                        className="w-full min-w-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                      <input type="time" name="fecha_inicio_hora" value={form.fecha_inicio_hora}
                        onChange={handleChange} required
                        className="w-full min-w-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                    </div>
                  </div>

                  <div className="rounded-xl p-4"
                    style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.15)" }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: "#3C5148" }}>Fin de la oferta</p>
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),140px] gap-3">
                      <input type="date" name="fecha_fin_fecha" value={form.fecha_fin_fecha}
                        min={ahora.fecha} onChange={handleChange} required
                        className="w-full min-w-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                      <input type="time" name="fecha_fin_hora" value={form.fecha_fin_hora}
                        onChange={handleChange} required
                        className="w-full min-w-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl px-4 py-3 text-xs"
                  style={{ backgroundColor: "rgba(107,142,78,0.1)", border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  La oferta puede empezar desde ahora y debe terminar despues de la fecha de inicio.
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={LABEL}>Imagen banner</label>
                  <input type="text" name="imagen_banner" value={form.imagen_banner} onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
                </div>

                {editando && (
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={LABEL}>Estado</label>
                    <select name="activo" value={form.activo} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                      <option value={1}>Activa</option>
                      <option value={0}>Inactiva</option>
                    </select>
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
                    {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear oferta"}
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
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1B2727" }}>Eliminar oferta?</h3>
              <p className="text-sm mb-6" style={{ color: "#6B8E4E" }}>La oferta se eliminara por completo.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmar(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Cancelar
                </button>
                <button onClick={() => handleDesactivar(confirmar)}
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
