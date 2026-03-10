import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { reporteService } from "../../services/api";

function Card({ titulo, valor, detalle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{titulo}</p>
      <p className="text-3xl font-extrabold text-gray-800 mt-2">{valor}</p>
      <p className="text-sm text-gray-500 mt-1">{detalle}</p>
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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [periodo, setPeriodo] = useState("mes");
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
      const [ventasRes, productosRes, estadosRes, ingresosRes, registrosRes] = await Promise.all([
        reporteService.ventas(),
        reporteService.productosMasVendidos(),
        reporteService.pedidosPorEstado(),
        reporteService.ingresos(periodoActivo),
        reporteService.registros(),
      ]);

      setData({
        ventas: ventasRes.ventas || {},
        productos: productosRes.productos || [],
        estados: estadosRes.estados || [],
        ingresos: ingresosRes.ingresos || [],
        reportes: registrosRes.reportes || [],
        resumen: registrosRes.resumen || [],
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

  const exportarExcel = () => {
    const filas = [
      ["Resumen de ventas"],
      ["Pedidos", Number(data.ventas.total_pedidos || 0)],
      ["Ingresos", Number(data.ventas.total_ingresos || 0)],
      ["Ticket promedio", Number(data.ventas.ticket_promedio || 0)],
      [],
      ["Comparativo"],
      ["Tipo", "Registrados", "Base", "Estado"],
      ...comparativo.map((item) => [
        item.etiqueta,
        Number(item.registrados || 0),
        Number(item.base || 0),
        item.base === item.registrados || item.base === 0 ? "Validado" : "Revisar",
      ]),
      [],
      ["Pedidos por estado"],
      ["Estado", "Total"],
      ...data.estados.map((item) => [item.estado, Number(item.total || 0)]),
      [],
      ["Productos mas vendidos"],
      ["Producto", "Total vendido", "Ingresos"],
      ...data.productos.map((item) => [
        item.Nombre,
        Number(item.total_vendido || 0),
        Number(item.ingresos_generados || 0),
      ]),
      [],
      ["Registros en tabla reporte"],
      ["Codigo", "Fecha", "Tipo", "Usuario", "Documento", "Descripcion", "Detalles"],
      ...data.reportes.map((item) => [
        item.Cod_Reporte,
        formatDate(item.Fecha_Reporte),
        item.Tipo_reporte,
        item.nombre_usuario,
        item.Num_Documento,
        item.Descripcion,
        Number(item.total_detalles || 0),
      ]),
    ];

    const contenido = filas
      .map((fila) => fila.map((celda) => `"${String(celda ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${contenido}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reportes-mercado-digital-${periodo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    const html = `
      <html>
        <head>
          <title>Reportes Mercado Digital</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1, h2 { margin: 0 0 12px; }
            h1 { font-size: 24px; }
            h2 { font-size: 16px; margin-top: 28px; }
            p { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
            th { background: #a8c898; color: white; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
            .muted { color: #6b7280; font-size: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Reportes y Validacion</h1>
          <p class="muted">Periodo de ingresos: ${escapeHtml(periodo)}</p>
          <p class="muted">Generado: ${escapeHtml(new Date().toLocaleString("es-CO"))}</p>

          <div class="grid">
            <div class="card"><strong>Pedidos</strong><br/>${escapeHtml(data.ventas.total_pedidos || 0)}</div>
            <div class="card"><strong>Ingresos</strong><br/>${escapeHtml(formatMoney(data.ventas.total_ingresos))}</div>
            <div class="card"><strong>Reportes</strong><br/>${escapeHtml(data.reportes.length)}</div>
            <div class="card"><strong>Ultimo reporte</strong><br/>${escapeHtml(ultimoReporte ? formatDate(ultimoReporte) : "Sin registros")}</div>
          </div>

          <h2>Comparativo de validacion</h2>
          <table>
            <thead><tr><th>Tipo</th><th>Registrados</th><th>Base</th><th>Estado</th></tr></thead>
            <tbody>
              ${comparativo.map((item) => `
                <tr>
                  <td>${escapeHtml(item.etiqueta)}</td>
                  <td>${escapeHtml(item.registrados)}</td>
                  <td>${escapeHtml(item.base)}</td>
                  <td>${escapeHtml(item.base === item.registrados || item.base === 0 ? "Validado" : "Revisar")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Pedidos por estado</h2>
          <table>
            <thead><tr><th>Estado</th><th>Total</th></tr></thead>
            <tbody>
              ${data.estados.map((item) => `
                <tr><td>${escapeHtml(item.estado)}</td><td>${escapeHtml(item.total)}</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Productos mas vendidos</h2>
          <table>
            <thead><tr><th>Producto</th><th>Total vendido</th><th>Ingresos</th></tr></thead>
            <tbody>
              ${data.productos.map((item) => `
                <tr>
                  <td>${escapeHtml(item.Nombre)}</td>
                  <td>${escapeHtml(item.total_vendido)}</td>
                  <td>${escapeHtml(formatMoney(item.ingresos_generados))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Registros en tabla reporte</h2>
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Descripcion</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              ${data.reportes.map((item) => `
                <tr>
                  <td>${escapeHtml(item.Cod_Reporte)}</td>
                  <td>${escapeHtml(formatDate(item.Fecha_Reporte))}</td>
                  <td>${escapeHtml(item.Tipo_reporte)}</td>
                  <td>${escapeHtml(item.nombre_usuario)}<br/><span class="muted">${escapeHtml(item.Num_Documento)}</span></td>
                  <td>${escapeHtml(item.Descripcion)}</td>
                  <td>${escapeHtml(item.total_detalles)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=1200,height=800");
    if (!ventana) {
      setError("El navegador bloqueo la ventana para exportar PDF.");
      return;
    }

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Reportes y Validacion</h1>
            <p className="text-sm text-gray-500 mt-1">
              Consulta los registros almacenados y compáralos con los datos reales de la base.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm"
            >
              <option value="mes">Ingresos por mes</option>
              <option value="dia">Ingresos por dia</option>
            </select>
            <button
              onClick={() => cargarDatos(periodo)}
              disabled={cargando}
              className="text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60"
              style={{ backgroundColor: "#74B495" }}
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              onClick={exportarExcel}
              disabled={cargando}
              className="font-semibold px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white text-gray-700 disabled:opacity-60"
            >
              Excel
            </button>
            <button
              onClick={exportarPDF}
              disabled={cargando}
              className="font-semibold px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white text-gray-700 disabled:opacity-60"
            >
              PDF
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl border text-sm"
            style={{ backgroundColor: "#fff8e8", borderColor: "#f8d37b", color: "#8a6b1a" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <Card titulo="Pedidos" valor={data.ventas.total_pedidos || 0} detalle="Pedidos detectados en la base" />
          <Card titulo="Ingresos" valor={formatMoney(data.ventas.total_ingresos)} detalle="Pagos completados" />
          <Card titulo="Reportes" valor={totalRegistros} detalle={`${totalTipos} tipos registrados`} />
          <Card titulo="Ultimo Reporte" valor={ultimoReporte ? "OK" : "-"} detalle={ultimoReporte ? formatDate(ultimoReporte) : "Sin registros"} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Comparativo de validacion</h2>
            <div className="space-y-3">
              {comparativo.map((item) => {
                const coincide = item.base === item.registrados || item.base === 0;
                return (
                  <div key={item.etiqueta} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800">{item.etiqueta}</p>
                      <p className="text-xs text-gray-500">Registrados: {item.registrados} | Base: {item.base}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: coincide ? "#dcfce7" : "#fee2e2",
                        color: coincide ? "#166534" : "#991b1b",
                      }}
                    >
                      {coincide ? "Validado" : "Revisar"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ingresos por periodo</h2>
            <div className="space-y-3">
              {cargando ? (
                [...Array(5)].map((_, i) => <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />)
              ) : data.ingresos.length === 0 ? (
                <p className="text-sm text-gray-400">No hay ingresos para mostrar.</p>
              ) : (
                data.ingresos.map((item) => (
                  <div key={item.etiqueta} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">{item.etiqueta}</span>
                    <span className="text-sm font-bold" style={{ color: "#74B495" }}>{formatMoney(item.total)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pedidos por estado</h2>
            <div className="space-y-3">
              {data.estados.map((item) => (
                <div key={item.estado} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-700">{item.estado}</span>
                  <span className="text-sm font-bold text-gray-800">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Productos mas vendidos</h2>
            <div className="space-y-3">
              {data.productos.map((item) => (
                <div key={item.Cod_Producto} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.Nombre}</p>
                    <p className="text-xs text-gray-500">Ingresos: {formatMoney(item.ingresos_generados)}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#74B495" }}>{item.total_vendido}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Registros en tabla reporte</h2>
            <p className="text-sm text-gray-500 mt-1">Estos son los reportes guardados en la base de datos.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#A8C898" }} className="text-white">
                  <th className="px-4 py-3 text-left font-semibold">Codigo</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Descripcion</th>
                  <th className="px-4 py-3 text-center font-semibold">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : data.reportes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No hay reportes registrados
                    </td>
                  </tr>
                ) : (
                  data.reportes.map((item) => (
                    <tr key={item.Cod_Reporte} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-700">{item.Cod_Reporte}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.Fecha_Reporte)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#eefbf3", color: "#2f6f56" }}>
                          {item.Tipo_reporte || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{item.nombre_usuario || "Sin usuario"}</div>
                        <div className="text-xs text-gray-400">{item.Num_Documento || "-"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.Descripcion || "-"}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">{item.total_detalles}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
