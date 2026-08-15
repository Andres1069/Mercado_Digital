import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, PackageCheck, RefreshCw, Truck } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { pedidoService } from "../../services/api";

const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const ESTADOS = ["Pendiente", "Confirmado", "En preparacion", "En camino", "Entregado", "Cancelado"];

function estadoNormalizado(estado) {
  return String(estado || "Pendiente").trim().toLowerCase();
}

function esEstadoCerrado(estado) {
  const e = estadoNormalizado(estado);
  return e.includes("entregado") || e.includes("cancel") || e.includes("completado");
}

function esEstadoEntrega(estado) {
  const e = estadoNormalizado(estado);
  return e.includes("prepar") || e.includes("camino");
}

function badgeColor(estado) {
  const e = estadoNormalizado(estado);
  if (e.includes("entregado") || e.includes("completado")) return { bg: "rgba(107,142,78,0.2)", text: "#6B8E4E" };
  if (e.includes("cancel") || e.includes("fallido")) return { bg: "rgba(239,68,68,0.15)", text: "#f87171" };
  if (e.includes("camino") || e.includes("prepar") || e.includes("confirmado")) return { bg: "rgba(107,142,78,0.18)", text: "#3C5148" };
  return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" };
}

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

function resumenGrupo(pedido, faltantes) {
  if (esEstadoCerrado(pedido.Estado_Pedido)) return "cerrados";
  if (faltantes.length > 0 || !esEstadoEntrega(pedido.Estado_Pedido)) return "gestion";
  return "entrega";
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cambiando, setCambiando] = useState(null);
  const [notificando, setNotificando] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const res = await pedidoService.todos();
      setPedidos(res.pedidos || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }

  async function handleCambiarEstado(codPedido, nuevoEstado) {
    setCambiando(codPedido);
    try {
      await pedidoService.cambiarEstado(codPedido, nuevoEstado);
      setPedidos((prev) => prev.map((p) => p.Cod_Pedido === codPedido ? { ...p, Estado_Pedido: nuevoEstado } : p));
    } catch (e) {
      alert(e.message || "Error al cambiar estado.");
    } finally {
      setCambiando(null);
    }
  }

  function faltantesDomicilio(p) {
    if (p.Tipo_Entrega === "Recoger_Tienda") return [];
    const faltantes = [];
    if (!p.Cod_Domicilio) faltantes.push("domicilio");
    if (!String(p.Direccion_entrega || "").trim()) faltantes.push("direccion");
    if (!String(p.Telefono_entrega || "").trim()) faltantes.push("telefono");
    return faltantes;
  }

  async function handleNotificarDomicilio(codPedido) {
    setNotificando(codPedido);
    setError("");
    setMensaje("");
    try {
      const res = await pedidoService.notificarDomicilio(codPedido);
      if (res.enviado === false) {
        setMensaje(res.message || "No se pudo enviar automaticamente. El mensaje sugerido quedo disponible en la respuesta.");
      } else {
        setMensaje(res.message || "Notificacion enviada al cliente.");
      }
    } catch (e) {
      setError(e.message || "No se pudo enviar la notificacion.");
    } finally {
      setNotificando(null);
    }
  }

  const pedidosFiltrados = useMemo(() => pedidos.filter((p) => {
    const matchEstado = filtroEstado === "Todos" || p.Estado_Pedido === filtroEstado;
    const matchBuscar = buscar === "" || String(p.Cod_Pedido).includes(buscar) ||
      String(p.Num_Documento || "").includes(buscar) ||
      `${p.Nombre || ""} ${p.Apellido || ""}`.toLowerCase().includes(buscar.toLowerCase());
    return matchEstado && matchBuscar;
  }), [buscar, filtroEstado, pedidos]);

  const resumen = useMemo(() => {
    const base = { gestion: 0, entrega: 0, cerrados: 0, domicilio: 0 };
    pedidos.forEach((p) => {
      const faltantes = faltantesDomicilio(p);
      base[resumenGrupo(p, faltantes)] += 1;
      if (faltantes.length > 0) base.domicilio += 1;
    });
    return base;
  }, [pedidos]);

  const grupos = useMemo(() => {
    const inicial = { gestion: [], entrega: [], cerrados: [] };
    pedidosFiltrados.forEach((p) => {
      inicial[resumenGrupo(p, faltantesDomicilio(p))].push(p);
    });

    const ordenar = (items) => [...items].sort((a, b) => new Date(b.Fecha_Pedido || 0) - new Date(a.Fecha_Pedido || 0));

    return [
      {
        id: "gestion",
        titulo: "Necesitan gestion",
        detalle: "Pedidos nuevos, confirmados o con datos de domicilio pendientes.",
        icono: AlertCircle,
        color: "#92400e",
        fondo: "rgba(245,158,11,0.12)",
        pedidos: ordenar(inicial.gestion),
      },
      {
        id: "entrega",
        titulo: "Preparar y entregar",
        detalle: "Pedidos en preparacion o en camino.",
        icono: Truck,
        color: "#3C5148",
        fondo: "rgba(107,142,78,0.14)",
        pedidos: ordenar(inicial.entrega),
      },
      {
        id: "cerrados",
        titulo: "Finalizados",
        detalle: "Pedidos entregados, completados o cancelados.",
        icono: CheckCircle2,
        color: "#6B8E4E",
        fondo: "rgba(107,142,78,0.11)",
        pedidos: ordenar(inicial.cerrados),
      },
    ];
  }, [pedidosFiltrados]);

  const resumenCards = [
    { label: "Necesitan gestion", value: resumen.gestion, icono: <AlertCircle className="w-5 h-5" />, color: "#92400e", bg: "rgba(245,158,11,0.13)" },
    { label: "Preparar y entregar", value: resumen.entrega, icono: <Truck className="w-5 h-5" />, color: "#3C5148", bg: "rgba(107,142,78,0.13)" },
    { label: "Finalizados", value: resumen.cerrados, icono: <PackageCheck className="w-5 h-5" />, color: "#6B8E4E", bg: "rgba(107,142,78,0.11)" },
    { label: "Datos domicilio", value: resumen.domicilio, icono: <Clock3 className="w-5 h-5" />, color: "#b45309", bg: "rgba(245,158,11,0.12)" },
  ];

  function renderPedidoRow(p) {
    const cBadge = badgeColor(p.Estado_Pedido);
    const faltantes = faltantesDomicilio(p);
    const domicilioOk = faltantes.length === 0;

    return (
      <tr key={p.Cod_Pedido} className="transition"
        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
        <td className="px-4 py-3">
          <p className="font-semibold" style={{ color: "#1B2727" }}>#{p.Cod_Pedido}</p>
          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Cantidad_articulos} art. - {p.Canal_Venta || "Online"}</p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="font-medium" style={{ color: "#3C5148" }}>{p.Nombre} {p.Apellido}</p>
          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Num_Documento}</p>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: "#6B8E4E" }}>
          {formatFecha(p.Fecha_Pedido)}
        </td>
        <td className="px-4 py-3 text-center font-bold" style={{ color: "#6B8E4E" }}>
          ${Number(p.Monto_Pago || p.Total_Carrito || 0).toLocaleString("es-CO")}
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-center">
          <p className="text-xs" style={{ color: "#3C5148" }}>{p.Metodo_Pago || "-"}</p>
          <p className="text-xs" style={{ color: "#6B8E4E" }}>{p.Estado_Pago || "-"}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: domicilioOk ? "rgba(107,142,78,0.18)" : "rgba(245,158,11,0.15)",
              color: domicilioOk ? "#3C5148" : "#92400e"
            }}>
            {p.Tipo_Entrega === "Recoger_Tienda" ? "Recoge en tienda" : domicilioOk ? "Completo" : `Falta ${faltantes.join(", ")}`}
          </span>
          {!domicilioOk && p.Correo && (
            <p className="mt-1 text-[11px]" style={{ color: "#6B8E4E" }}>{p.Correo}</p>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: cBadge.bg, color: cBadge.text }}>
            {p.Estado_Pedido}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col items-center gap-2">
            <select value={p.Estado_Pedido} disabled={cambiando === p.Cod_Pedido}
              onChange={(e) => handleCambiarEstado(p.Cod_Pedido, e.target.value)}
              className="text-xs px-2 py-1 rounded-lg focus:outline-none disabled:opacity-50"
              style={{ backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {!domicilioOk && (
              <button type="button"
                onClick={() => handleNotificarDomicilio(p.Cod_Pedido)}
                disabled={notificando === p.Cod_Pedido || !p.Correo}
                className="text-xs px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
                style={{ backgroundColor: "#6B8E4E", color: "#FFFFFF" }}>
                {notificando === p.Cod_Pedido ? "Enviando..." : "Notificar"}
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Gestion de Pedidos</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{pedidos.length} pedidos en total</p>
            </div>
            <button onClick={cargar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {resumenCards.map(({ label, value, icono, color, bg }) => (
              <div key={label} className="rounded-2xl px-4 py-3" style={CARD}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#6B8E4E" }}>{label}</p>
                    <p className="mt-1 text-2xl font-black" style={{ color: "#1B2727" }}>{value}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color }}>
                    {icono}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-5 rounded-2xl p-3" style={CARD}>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Clock3 className="w-4 h-4" />
                </span>
                <input type="text" placeholder="Buscar por # pedido, documento o nombre..."
                  value={buscar} onChange={(e) => setBuscar(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={INPUT_STYLE} />
              </div>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full lg:w-auto px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={INPUT_STYLE}>
                <option>Todos</option>
                {ESTADOS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#b91c1c" }}>
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(107,142,78,0.12)", border: "1px solid rgba(107,142,78,0.25)", color: "#3C5148" }}>
              {mensaje}
            </div>
          )}

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Pedido", "Cliente", "Fecha", "Total", "Pago", "Domicilio", "Estado", "Acciones"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 4 ? "hidden md:table-cell" : ""} ${i === 3 || i >= 5 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {cargando ? (
                <tbody>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : pedidosFiltrados.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No hay pedidos que coincidan con los filtros.
                    </td>
                  </tr>
                </tbody>
              ) : (
                grupos.map((grupo) => {
                  const Icon = grupo.icono;
                  if (grupo.pedidos.length === 0) return null;
                  return (
                    <tbody key={grupo.id}>
                      <tr>
                        <td colSpan={8} className="px-4 py-3" style={{ backgroundColor: grupo.fondo, borderTop: "1px solid rgba(107,142,78,0.14)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70" style={{ color: grupo.color }}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <div>
                                <p className="text-sm font-black" style={{ color: "#1B2727" }}>{grupo.titulo}</p>
                                <p className="text-xs" style={{ color: "#3C5148" }}>{grupo.detalle}</p>
                              </div>
                            </div>
                            <span className="self-start sm:self-center rounded-full bg-white/80 px-3 py-1 text-xs font-bold" style={{ color: grupo.color }}>
                              {grupo.pedidos.length} {grupo.pedidos.length === 1 ? "pedido" : "pedidos"}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {grupo.pedidos.map(renderPedidoRow)}
                    </tbody>
                  );
                })
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
