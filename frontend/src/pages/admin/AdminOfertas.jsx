import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
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
  if (estado === "Activa") return { bg: "#dcfce7", text: "#166534" };
  if (estado === "Programada") return { bg: "#fef3c7", text: "#92400e" };
  if (estado === "Vencida") return { bg: "#fee2e2", text: "#991b1b" };
  return { bg: "#e5e7eb", text: "#374151" };
}

function getLocalNowParts() {
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  const offset = ahora.getTimezoneOffset();
  const local = new Date(ahora.getTime() - offset * 60000);
  const iso = local.toISOString();
  return {
    fecha: iso.slice(0, 10),
    hora: iso.slice(11, 16),
  };
}

function addMinutes(fecha, hora, minutos) {
  const base = new Date(`${fecha}T${hora}:00`);
  const next = new Date(base.getTime() + minutos * 60000);
  const offset = next.getTimezoneOffset();
  const local = new Date(next.getTime() - offset * 60000);
  const iso = local.toISOString();
  return {
    fecha: iso.slice(0, 10),
    hora: iso.slice(11, 16),
  };
}

function splitDateTime(value) {
  if (!value) return { fecha: "", hora: "" };
  const normalizado = String(value).replace(" ", "T");
  return {
    fecha: normalizado.slice(0, 10),
    hora: normalizado.slice(11, 16),
  };
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

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const [ofertasRes, productosRes] = await Promise.allSettled([
        ofertaService.listarTodas(),
        productoService.listar(),
      ]);

      if (ofertasRes.status === "fulfilled") {
        setOfertas(ofertasRes.value.ofertas || []);
      } else {
        setOfertas([]);
        setError(ofertasRes.reason?.message || "No se pudieron cargar las ofertas.");
      }

      if (productosRes.status === "fulfilled") {
        setProductos(productosRes.value.productos || []);
      } else {
        setProductos([]);
        setError((prev) => prev || productosRes.reason?.message || "No se pudieron cargar los productos.");
      }
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
    const inicio = getLocalNowParts();
    const fin = addMinutes(inicio.fecha, inicio.hora, 10);
    setEditando(null);
    setError("");
    setForm({
      ...VACIO,
      fecha_inicio_fecha: inicio.fecha,
      fecha_inicio_hora: inicio.hora,
      fecha_fin_fecha: fin.fecha,
      fecha_fin_hora: fin.hora,
    });
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
    if (!pct || pct <= 0 || pct > 100) {
      return "El descuento debe estar entre 1 y 100.";
    }

    if (!form.fecha_inicio_fecha || !form.fecha_inicio_hora || !form.fecha_fin_fecha || !form.fecha_fin_hora) {
      return "Debes seleccionar fecha y hora de inicio y fin.";
    }

    if (!editando && inicioActual < joinDateTime(ahora.fecha, ahora.hora)) {
      return "La fecha de inicio no puede estar en el pasado.";
    }

    if (finActual < joinDateTime(ahora.fecha, ahora.hora)) {
      return "La fecha fin no puede estar en el pasado.";
    }

    if (finActual <= inicioActual) {
      return "La fecha fin debe ser mayor que la fecha inicio.";
    }

    return "";
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {notif && (
        <div
          className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-semibold"
          style={{ backgroundColor: "#74B495" }}
        >
          {notif}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Gestion de Ofertas</h1>
            <p className="text-sm text-gray-500 mt-1">{ofertas.length} ofertas registradas</p>
          </div>
          {esAdmin() && (
            <button
              onClick={abrirCrear}
              className="text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow"
              style={{ backgroundColor: "#74B495" }}
            >
              + Nueva oferta
            </button>
          )}
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
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por titulo o producto..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white shadow-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#A8C898" }} className="text-white">
                <th className="px-4 py-3 text-left font-semibold">Oferta</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Producto</th>
                <th className="px-4 py-3 text-right font-semibold">Descuento</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Vigencia</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                {esAdmin() && <th className="px-4 py-3 text-center font-semibold">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={esAdmin() ? 6 : 5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : ofertasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={esAdmin() ? 6 : 5} className="px-4 py-12 text-center text-gray-400">
                    No hay ofertas para mostrar
                  </td>
                </tr>
              ) : (
                ofertasFiltradas.map((o) => {
                  const estado = estadoOferta(o);
                  const color = colorEstado(estado);
                  return (
                    <tr key={o.Cod_Oferta} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{o.Titulo}</p>
                        {o.Descripcion && <p className="text-xs text-gray-500">{o.Descripcion}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">{o.nombre_producto || "Sin producto"}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: "#74B495" }}>
                        {Number(o.Porcentaje_Descuento || 0)}%
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        <div className="leading-5">
                          <div className="truncate">Inicio: {formatDateTime(o.Fecha_Inicio)}</div>
                          <div className="truncate">Fin: {formatDateTime(o.Fecha_Fin)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>
                          {estado}
                        </span>
                      </td>
                      {esAdmin() && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirEditar(o)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                              style={{ backgroundColor: "#877FD7" }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setConfirmar(o.Cod_Oferta)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
                              style={{ backgroundColor: "#E1A7CA" }}
                            >
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ backgroundColor: "#A8C898" }}>
              <div>
                <h2 className="text-2xl font-black text-white">{editando ? "Editar oferta" : "Nueva oferta"}</h2>
                <p className="text-sm text-white/80 mt-1">Define una vigencia clara sin usar fechas vencidas.</p>
              </div>
              <button onClick={() => setModal(false)} className="text-white/80 hover:text-white text-3xl leading-none font-bold">x</button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-2xl text-sm border" style={{ backgroundColor: "#fdf0f5", borderColor: "#E1A7CA", color: "#9b5b7a" }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titulo *</label>
                <input
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descuento (%) *</label>
                  <input
                    type="number"
                    name="porcentaje_descuento"
                    value={form.porcentaje_descuento}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Producto</label>
                  <select
                    name="cod_producto"
                    value={form.cod_producto}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition bg-white"
                  >
                    <option value="">Sin producto</option>
                    {productos.map((p) => (
                      <option key={p.Cod_Producto} value={p.Cod_Producto}>{p.Nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50/70">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Inicio de la oferta</p>
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),140px] gap-3">
                    <input
                      type="date"
                      name="fecha_inicio_fecha"
                      value={form.fecha_inicio_fecha}
                      min={editando ? undefined : ahora.fecha}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-green-400 transition"
                    />
                    <input
                      type="time"
                      name="fecha_inicio_hora"
                      value={form.fecha_inicio_hora}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-green-400 transition"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50/70">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Fin de la oferta</p>
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),140px] gap-3">
                    <input
                      type="date"
                      name="fecha_fin_fecha"
                      value={form.fecha_fin_fecha}
                      min={ahora.fecha}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-green-400 transition"
                    />
                    <input
                      type="time"
                      name="fecha_fin_hora"
                      value={form.fecha_fin_hora}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-green-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                La oferta puede empezar desde ahora y debe terminar despues de la fecha de inicio.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen banner</label>
                <input
                  type="text"
                  name="imagen_banner"
                  value={form.imagen_banner}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition"
                />
              </div>

              {editando && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                  <select
                    name="activo"
                    value={form.activo}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition bg-white"
                  >
                    <option value={1}>Activa</option>
                    <option value={0}>Inactiva</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                  style={{ backgroundColor: "#74B495" }}
                >
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar oferta?</h3>
            <p className="text-sm text-gray-500 mb-6">La oferta se eliminara por completo.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDesactivar(confirmar)}
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
