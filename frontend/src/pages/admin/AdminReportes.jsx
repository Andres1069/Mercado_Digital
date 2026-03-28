import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  reporteService, pedidoService, pagoService, inventarioService,
  domicilioService, usuarioService, proveedorService, productoService, categoriaService,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Card({ titulo, valor, detalle }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" }}>
      <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#6B8E4E" }}>{titulo}</p>
      <p className="text-3xl font-extrabold mt-2" style={{ color: "#3C5148" }}>{valor}</p>
      <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{detalle}</p>
    </div>
  );
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function AdminReportes() {
  const { esEmpleado } = useAuth();
  const esEmp = esEmpleado();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [periodo, setPeriodo] = useState("mes");
  const [modalExport, setModalExport] = useState(false);
  const [seccionesExport, setSeccionesExport] = useState(new Set());
  const [exportando, setExportando] = useState(false);

  const SECCIONES_EXPORT = [
    { id: "pedidos",     emoji: "📋", label: "Pedidos",                desc: "Historial de todos los pedidos" },
    { id: "pagos",       emoji: "💳", label: "Pagos",                  desc: "Comprobantes y verificaciones" },
    { id: "inventario",  emoji: "📦", label: "Inventario",             desc: "Stock actual de productos" },
    { id: "domicilios",  emoji: "🚚", label: "Domicilios",             desc: "Envios y estados de entrega" },
    { id: "clientes",    emoji: "👤", label: "Clientes",               desc: "Usuarios registrados como clientes" },
    { id: "proveedores", emoji: "🏭", label: "Proveedores",            desc: "Contactos y proveedores activos" },
    { id: "productos",   emoji: "🛒", label: "Productos y Categorias", desc: "Catalogo completo con categorias" },
  ];

  const toggleSeccion = (id) => {
    setSeccionesExport((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTodo = () => {
    if (seccionesExport.size === SECCIONES_EXPORT.length) {
      setSeccionesExport(new Set());
    } else {
      setSeccionesExport(new Set(SECCIONES_EXPORT.map((s) => s.id)));
    }
  };
  const [data, setData] = useState({
    ventas: {},
    productos: [],
    estados: [],
    ingresos: [],
    reportes: [],
    resumen: [],
  });

  const cargarDatos = async (periodoActivo = periodo) => {
    setCargando(true);
    setError("");

    try {
      const llamadas = [
        reporteService.ventas(),
        reporteService.productosMasVendidos(),
        reporteService.pedidosPorEstado(),
        reporteService.ingresos(periodoActivo),
      ];
      if (!esEmp) llamadas.push(reporteService.registros());

      const [ventasRes, productosRes, estadosRes, ingresosRes, registrosRes] = await Promise.all(llamadas);

      setData({
        ventas: ventasRes.ventas || {},
        productos: productosRes.productos || [],
        estados: estadosRes.estados || [],
        ingresos: ingresosRes.ingresos || [],
        reportes: registrosRes?.reportes || [],
        resumen: registrosRes?.resumen || [],
      });
    } catch (err) {
      setError(err.message || "No se pudieron cargar los reportes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos(periodo);
  }, [periodo]);

  const totalRegistros = data.reportes.length;
  const totalTipos = data.resumen.length;
  const ultimoReporte = data.reportes[0]?.Fecha_Reporte;

  const comparativo = useMemo(() => {
    const mapa = Object.fromEntries(
      data.resumen.map((item) => [String(item.Tipo_reporte || "").toLowerCase(), Number(item.total || 0)])
    );

    return [
      { etiqueta: "Pedido", registrados: mapa.pedido || 0, base: data.estados.reduce((acc, item) => acc + Number(item.total || 0), 0) },
      { etiqueta: "Pago", registrados: mapa.pago || 0, base: Number(data.ventas.total_pedidos || 0) },
      { etiqueta: "Inventario", registrados: mapa.inventario || 0, base: 0 },
      { etiqueta: "Entrega", registrados: mapa.entrega || mapa.domicilio || 0, base: Number(mapa.entrega || mapa.domicilio || 0) },
    ];
  }, [data]);

  const exportarModulos = async () => {
    if (seccionesExport.size === 0) return;
    setExportando(true);
    try {
      const d = {};
      await Promise.all([
        seccionesExport.has("pedidos")     && pedidoService.todos().then((r)    => { d.pedidos     = r.pedidos     || []; }).catch(() => { d.pedidos     = []; }),
        seccionesExport.has("pagos")       && pagoService.todos().then((r)      => { d.pagos       = r.pagos       || []; }).catch(() => { d.pagos       = []; }),
        seccionesExport.has("inventario")  && inventarioService.listar().then((r)=> { d.inventario  = r.inventario  || []; }).catch(() => { d.inventario  = []; }),
        seccionesExport.has("domicilios")  && domicilioService.todos().then((r)  => { d.domicilios  = r.domicilios  || []; }).catch(() => { d.domicilios  = []; }),
        seccionesExport.has("clientes")    && usuarioService.listar().then((r)   => { d.clientes    = (r.usuarios   || []).filter((u) => u.rol === "Cliente"); }).catch(() => { d.clientes = []; }),
        seccionesExport.has("proveedores") && proveedorService.listar().then((r) => { d.proveedores = r.proveedores || []; }).catch(() => { d.proveedores = []; }),
        seccionesExport.has("productos")   && Promise.all([productoService.listar(), categoriaService.listar()]).then(([pr, cr]) => { d.productos = pr.productos || []; d.categorias = cr.categorias || []; }).catch(() => { d.productos = []; d.categorias = []; }),
      ].filter(Boolean));

      const seccionHTML = (titulo, filas, cabeceras) => `
        <h2>${escapeHtml(titulo)}</h2>
        <table>
          <thead><tr>${cabeceras.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>
          <tbody>${filas.length ? filas : `<tr><td colspan="${cabeceras.length}" style="text-align:center;color:#9ca3af;padding:16px">Sin registros</td></tr>`}</tbody>
        </table>`;

      const partes = [];

      if (seccionesExport.has("pedidos")) {
        partes.push(seccionHTML("Pedidos", d.pedidos.map((p) => `<tr>
          <td class="muted">${escapeHtml(p.Cod_Pedido)}</td>
          <td>${escapeHtml(formatDate(p.Fecha_Pedido))}</td>
          <td><strong>${escapeHtml(p.Nombre)} ${escapeHtml(p.Apellido)}</strong><br/><span class="muted">${escapeHtml(p.Num_Documento)}</span></td>
          <td><span class="pill estado">${escapeHtml(p.Estado_Pedido)}</span></td>
          <td style="font-weight:600;color:#2f6f56">${escapeHtml(formatMoney(p.Monto_Pago || p.Total_Carrito))}</td>
          <td>${escapeHtml(p.Metodo_Pago || "—")}</td>
        </tr>`).join(""), ["#", "Fecha", "Cliente", "Estado", "Monto", "Método pago"]));
      }

      if (seccionesExport.has("pagos")) {
        partes.push(seccionHTML("Pagos", d.pagos.map((p) => {
          const estado = p.verificacion;
          const cls = estado === "aprobado" ? "ok" : estado === "rechazado" ? "warn" : "neutral";
          return `<tr>
            <td class="muted">${escapeHtml(p.Cod_Pago)}</td>
            <td>${escapeHtml(p.Cod_pedido)}</td>
            <td><strong>${escapeHtml(p.cliente_nombre)} ${escapeHtml(p.cliente_apellido)}</strong><br/><span class="muted">${escapeHtml(p.cliente_documento)}</span></td>
            <td style="font-weight:600;color:#2f6f56">${escapeHtml(formatMoney(p.Monto_Pago))}</td>
            <td>${escapeHtml(p.Metodo_Pago || "—")}</td>
            <td><span class="pill ${cls}">${escapeHtml(estado)}</span></td>
          </tr>`;
        }).join(""), ["#", "Pedido", "Cliente", "Monto", "Método", "Verificación"]));
      }

      if (seccionesExport.has("inventario")) {
        partes.push(seccionHTML("Inventario", d.inventario.map((i) => `<tr>
          <td style="font-weight:600">${escapeHtml(i.Producto)}</td>
          <td>${escapeHtml(i.Categoria || "—")}</td>
          <td style="font-weight:700;color:${Number(i.Stock) <= 5 ? "#991b1b" : "#166534"}">${escapeHtml(i.Stock)}</td>
          <td>${escapeHtml(i.Stock_Producto ?? "—")}</td>
          <td class="muted">${escapeHtml(formatDate(i.Fecha_Actualizacion))}</td>
        </tr>`).join(""), ["Producto", "Categoría", "Stock BD", "Stock Producto", "Última actualización"]));
      }

      if (seccionesExport.has("domicilios")) {
        partes.push(seccionHTML("Domicilios", d.domicilios.map((dm) => `<tr>
          <td class="muted">${escapeHtml(dm.Cod_Domicilio)}</td>
          <td>${escapeHtml(dm.Cod_Pedido)}</td>
          <td><strong>${escapeHtml(dm.Nombre)} ${escapeHtml(dm.Apellido)}</strong><br/><span class="muted">${escapeHtml(dm.Num_Documento)}</span></td>
          <td><span class="pill ${dm.Estado_Domicilio === "Entregado" ? "ok" : "neutral"}">${escapeHtml(dm.Estado_Domicilio || "—")}</span></td>
          <td>${escapeHtml(formatDate(dm.Fecha_Pedido))}</td>
        </tr>`).join(""), ["#", "Pedido", "Cliente", "Estado envío", "Fecha pedido"]));
      }

      if (seccionesExport.has("clientes")) {
        partes.push(seccionHTML("Clientes", d.clientes.map((c) => `<tr>
          <td class="muted">${escapeHtml(c.Num_Documento)}</td>
          <td style="font-weight:600">${escapeHtml(c.Nombre)} ${escapeHtml(c.Apellido)}</td>
          <td>${escapeHtml(c.Correo)}</td>
          <td>${escapeHtml(c.Telefono || "—")}</td>
          <td>${escapeHtml(c.Barrio || "—")}</td>
        </tr>`).join(""), ["Documento", "Nombre completo", "Correo", "Teléfono", "Barrio"]));
      }

      if (seccionesExport.has("proveedores")) {
        partes.push(seccionHTML("Proveedores", d.proveedores.map((p) => `<tr>
          <td style="font-weight:600">${escapeHtml(p.Nombre_proveedor)}</td>
          <td>${escapeHtml(p.Telefono || "—")}</td>
          <td>${escapeHtml(p.Correo || "—")}</td>
          <td>${escapeHtml(p.Direccion || "—")}</td>
        </tr>`).join(""), ["Nombre", "Teléfono", "Correo", "Dirección"]));
      }

      if (seccionesExport.has("productos")) {
        partes.push(seccionHTML("Categorías", d.categorias.map((c) => `<tr>
          <td class="muted">${escapeHtml(c.Cod_Categoria)}</td>
          <td style="font-weight:600">${escapeHtml(c.Nombre)}</td>
        </tr>`).join(""), ["#", "Nombre"]));
        partes.push(seccionHTML("Productos", d.productos.map((p) => `<tr>
          <td style="font-weight:600">${escapeHtml(p.Nombre)}</td>
          <td>${escapeHtml(p.categoria || "—")}</td>
          <td style="color:#2f6f56;font-weight:600">${escapeHtml(formatMoney(p.Precio))}</td>
          <td style="font-weight:700;color:${Number(p.Cantidad) <= 5 ? "#991b1b" : "#374151"}">${escapeHtml(p.Cantidad)}</td>
          <td class="muted">${escapeHtml(p.proveedor || "—")}</td>
        </tr>`).join(""), ["Nombre", "Categoría", "Precio", "Stock", "Proveedor"]));
      }

      const seleccionadas = SECCIONES_EXPORT.filter((s) => seccionesExport.has(s.id));
      const html = `<html><head><title>Reporte Mercado Digital</title><style>
        * { box-sizing: border-box; }
        body { font-family: "Helvetica Neue", Arial, sans-serif; padding: 28px; color: #1f2937; background: #f7f8fb; }
        h1, h2 { margin: 0; }
        p { margin: 0 0 4px; }
        .header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #e5e7eb; }
        .brand { display:flex; align-items:center; gap:12px; }
        .brand-name { font-size:20px; font-weight:900; color:#1f2937; margin:2px 0 0; }
        .tag { display:inline-block; padding:3px 10px; border-radius:999px; background:rgba(116,180,149,0.18); color:#2f4d44; font-size:10px; font-weight:700; margin-bottom:4px; }
        .meta { font-size:10px; color:#6b7280; text-align:right; line-height:1.6; }
        .chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px; }
        .chip { padding:3px 10px; border-radius:999px; background:#f3f4f6; color:#374151; font-size:10px; font-weight:600; border:1px solid #e5e7eb; }
        h2 { font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#6b7280; font-weight:700; margin:22px 0 8px; padding-bottom:4px; border-bottom:1px solid #e5e7eb; }
        table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); margin-bottom:4px; }
        th { background:#74B495; color:white; padding:8px 10px; font-size:10px; font-weight:700; text-align:left; letter-spacing:0.05em; }
        td { border-bottom:1px solid #f3f4f6; padding:7px 10px; font-size:11px; vertical-align:top; color:#374151; }
        tr:last-child td { border-bottom:none; }
        tr:nth-child(even) td { background:#fafafa; }
        .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:9px; font-weight:700; }
        .ok      { background:#dcfce7; color:#166534; }
        .warn    { background:#fee2e2; color:#991b1b; }
        .neutral { background:#f3f4f6; color:#374151; }
        .estado  { background:#e0f2fe; color:#075985; }
        .muted   { color:#9ca3af; font-size:10px; }
        .footer  { margin-top:28px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:10px; color:#9ca3af; display:flex; justify-content:space-between; }
        @media print { body { background:white; padding:20px; } }
      </style></head><body>
        <div class="header">
          <div class="brand">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#74B495"/>
              <path d="M4 5H6L8.2 14.2C8.31 14.66 8.8 15 9.31 15H18.4C18.87 15 19.29 14.73 19.47 14.32L21 10.75" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 19.2C9.55 19.2 10 18.75 10 18.2C10 17.65 9.55 17.2 9 17.2C8.45 17.2 8 17.65 8 18.2C8 18.75 8.45 19.2 9 19.2Z" fill="white"/>
              <path d="M18 19.2C18.55 19.2 19 18.75 19 18.2C19 17.65 18.55 17.2 18 17.2C17.45 17.2 17 17.65 17 18.2C17 18.75 17.45 19.2 18 19.2Z" fill="white"/>
              <path d="M10 8.5H19" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <div>
              <div class="tag">Mercado Digital</div>
              <p class="brand-name">Reporte por Modulos</p>
              <p class="muted">Secciones: ${escapeHtml(seleccionadas.map((s) => s.label).join(", "))}</p>
            </div>
          </div>
          <div class="meta">
            <div style="font-weight:600;color:#374151">Generado el</div>
            <div>${escapeHtml(new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }))}</div>
          </div>
        </div>
        <div class="chips">${seleccionadas.map((s) => `<span class="chip">${escapeHtml(s.emoji)} ${escapeHtml(s.label)}</span>`).join("")}</div>
        ${partes.join("")}
        <div class="footer">
          <span>Mercado Digital &mdash; Reporte generado automaticamente</span>
          <span>${escapeHtml(new Date().toLocaleString("es-CO"))}</span>
        </div>
      </body></html>`;

      const ventana = window.open("", "_blank", "width=1200,height=800");
      if (!ventana) { setError("El navegador bloqueo la ventana para exportar PDF."); return; }
      ventana.document.open();
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => ventana.print(), 400);
      setModalExport(false);
    } catch (e) {
      setError(e.message || "No se pudo generar el PDF.");
    } finally {
      setExportando(false);
    }
  };


  const DARK_CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
  const ITEM_ROW  = { border: "1px solid rgba(107,142,78,0.12)", borderRadius: "0.75rem", padding: "0.75rem 1rem" };
  const INPUT_STYLE = { backgroundColor: "var(--md-surface-soft)", border: "1px solid var(--md-border)", color: "var(--md-text)" };

  return (
    <>
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Reportes y Validacion</h1>
            <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
              Consulta los registros almacenados y comparalos con los datos reales de la base.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!esEmp && (
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
                className="rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE}>
                <option value="mes">Ingresos por mes</option>
                <option value="dia">Ingresos por dia</option>
              </select>
            )}
            <button onClick={() => cargarDatos(periodo)} disabled={cargando}
              className="text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60 transition"
              style={{ backgroundColor: "#6B8E4E" }}>
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
            {!esEmp && (
              <button onClick={() => setModalExport(true)} disabled={cargando}
                className="font-semibold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
                Exportar PDF
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
            {error}
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${esEmp ? "lg:grid-cols-1" : "lg:grid-cols-4"} gap-4 mb-7`}>
          <Card titulo="Pedidos" valor={data.ventas.total_pedidos || 0} detalle="Pedidos detectados en la base" />
          {!esEmp && <Card titulo="Ingresos" valor={formatMoney(data.ventas.total_ingresos)} detalle="Pagos completados" />}
          {!esEmp && <Card titulo="Reportes" valor={totalRegistros} detalle={`${totalTipos} tipos registrados`} />}
          {!esEmp && <Card titulo="Ultimo Reporte" valor={ultimoReporte ? "OK" : "-"} detalle={ultimoReporte ? formatDate(ultimoReporte) : "Sin registros"} />}
        </div>

        <div className={`grid grid-cols-1 ${!esEmp ? "xl:grid-cols-2" : ""} gap-6 mb-6`}>
          <div className="rounded-2xl p-6" style={DARK_CARD}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2727" }}>Comparativo de validacion</h2>
            <div className="space-y-3">
              {comparativo.map((item) => {
                const coincide = item.base === item.registrados || item.base === 0;
                return (
                  <div key={item.etiqueta} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.12)" }}>
                    <div>
                      <p className="font-semibold" style={{ color: "#1B2727" }}>{item.etiqueta}</p>
                      <p className="text-xs" style={{ color: "#6B8E4E" }}>Registrados: {item.registrados} | Base: {item.base}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: coincide ? "rgba(107,142,78,0.2)" : "rgba(239,68,68,0.15)",
                        color: coincide ? "#6B8E4E" : "#f87171",
                      }}>
                      {coincide ? "Validado" : "Revisar"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {!esEmp && (
            <div className="rounded-2xl p-6" style={DARK_CARD}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2727" }}>Ingresos por periodo</h2>
              <div className="space-y-3">
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="h-11 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                  ))
                ) : data.ingresos.length === 0 ? (
                  <p className="text-sm" style={{ color: "#6B8E4E" }}>No hay ingresos para mostrar.</p>
                ) : (
                  data.ingresos.map((item) => (
                    <div key={item.etiqueta} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.12)" }}>
                      <span className="text-sm font-medium" style={{ color: "#3C5148" }}>{item.etiqueta}</span>
                      <span className="text-sm font-bold" style={{ color: "#6B8E4E" }}>{formatMoney(item.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl p-6" style={DARK_CARD}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2727" }}>Pedidos por estado</h2>
            <div className="space-y-3">
              {data.estados.map((item) => (
                <div key={item.estado} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.12)" }}>
                  <span className="text-sm" style={{ color: "#3C5148" }}>{item.estado}</span>
                  <span className="text-sm font-bold" style={{ color: "#1B2727" }}>{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={DARK_CARD}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2727" }}>Productos mas vendidos</h2>
            <div className="space-y-3">
              {data.productos.map((item) => (
                <div key={item.Cod_Producto} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "rgba(107,142,78,0.06)", border: "1px solid rgba(107,142,78,0.12)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1B2727" }}>{item.Nombre}</p>
                    <p className="text-xs" style={{ color: "#6B8E4E" }}>Ingresos: {formatMoney(item.ingresos_generados)}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#6B8E4E" }}>{item.total_vendido}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!esEmp && (
          <div className="rounded-2xl overflow-hidden" style={DARK_CARD}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
              <h2 className="text-lg font-bold" style={{ color: "#1B2727" }}>Registros en tabla reporte</h2>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>Estos son los reportes guardados en la base de datos.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                    {["Codigo","Fecha","Tipo","Usuario","Descripcion","Detalles"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${i === 5 ? "text-center" : "text-left"}`}
                        style={{ color: "#6B8E4E" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                        </td>
                      </tr>
                    ))
                  ) : data.reportes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                        No hay reportes registrados
                      </td>
                    </tr>
                  ) : (
                    data.reportes.map((item) => (
                      <tr key={item.Cod_Reporte} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3 font-semibold" style={{ color: "#3C5148" }}>{item.Cod_Reporte}</td>
                        <td className="px-4 py-3" style={{ color: "#6B8E4E" }}>{formatDate(item.Fecha_Reporte)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "rgba(107,142,78,0.18)", color: "#3C5148" }}>
                            {item.Tipo_reporte || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "#3C5148" }}>
                          <div>{item.nombre_usuario || "Sin usuario"}</div>
                          <div className="text-xs" style={{ color: "#6B8E4E" }}>{item.Num_Documento || "-"}</div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "#3C5148" }}>{item.Descripcion || "-"}</td>
                        <td className="px-4 py-3 text-center font-semibold" style={{ color: "#1B2727" }}>{item.total_detalles}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>

    {/* Modal exportar por módulos */}
    {modalExport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setModalExport(false); }}>
        <div className="rounded-2xl shadow-2xl w-full max-w-lg p-7"
          style={{ backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)" }}>
          <h2 className="text-xl font-black mb-1" style={{ color: "#1B2727" }}>Exportar PDF por modulos</h2>
          <p className="text-sm mb-5" style={{ color: "#6B8E4E" }}>Selecciona los modulos que deseas incluir en el reporte.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {SECCIONES_EXPORT.map((s) => {
              const activa = seccionesExport.has(s.id);
              return (
                <button key={s.id} onClick={() => toggleSeccion(s.id)}
                  className="flex items-start gap-3 rounded-xl px-4 py-3 text-left transition"
                  style={{
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: activa ? "#6B8E4E" : "rgba(107,142,78,0.15)",
                    backgroundColor: activa ? "rgba(107,142,78,0.12)" : "rgba(107,142,78,0.06)",
                  }}>
                  <span className="text-xl mt-0.5">{s.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1B2727" }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B8E4E" }}>{s.desc}</p>
                  </div>
                  <span className="ml-auto mt-1 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center text-white text-xs"
                    style={{
                      borderColor: activa ? "#6B8E4E" : "rgba(213,221,223,0.25)",
                      backgroundColor: activa ? "#6B8E4E" : "transparent",
                    }}>
                    {activa && "✓"}
                  </span>
                </button>
              );
            })}
          </div>

          <button onClick={toggleTodo}
            className="w-full text-sm font-semibold py-2.5 rounded-xl transition mb-5"
            style={{ border: "1px dashed rgba(213,221,223,0.2)", color: "#3C5148" }}>
            {seccionesExport.size === SECCIONES_EXPORT.length ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>

          <div className="flex gap-3">
            <button onClick={() => setModalExport(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
              Cancelar
            </button>
            <button onClick={exportarModulos} disabled={seccionesExport.size === 0 || exportando}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition"
              style={{ backgroundColor: "#6B8E4E" }}>
              {exportando ? "Generando..." : `Exportar PDF (${seccionesExport.size})`}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
