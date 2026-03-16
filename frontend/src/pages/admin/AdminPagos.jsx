import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { pagoService } from "../../services/api";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

const estados = ["Pendiente", "Completado", "Fallido"];

export default function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ estado: "", desde: "", hasta: "" });

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await pagoService.listar(filtros);
      setPagos(res.pagos || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const total = useMemo(
    () => pagos.reduce((acc, p) => acc + Number(p.Monto_Pago || 0), 0),
    [pagos]
  );

  const cambiarEstado = async (id, estado) => {
    try {
      await pagoService.cambiarEstado(id, estado);
      setPagos((prev) => prev.map((p) => (p.Cod_Pago === id ? { ...p, Estado_Pago: estado } : p)));
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Pagos</h1>
            <p className="text-sm text-gray-500 mt-1">Control y validacion de transacciones</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total mostrado</p>
            <p className="text-xl font-extrabold text-gray-800">{formatMoney(total)}</p>
          </div>
        </div>

        <div
          className="rounded-2xl border shadow-sm p-4 mb-5"
          style={{ backgroundColor: "#f7fbf8", borderColor: "#A8C898" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="">Todos</option>
                {estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={cargar}
                className="w-full text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "#74B495" }}
              >
                Aplicar filtros
              </button>
            </div>
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#877FD7" }} className="text-white">
                <th className="px-4 py-3 text-left font-semibold">Pago</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Pedido</th>
                <th className="px-4 py-3 text-right font-semibold">Monto</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                pagos.map((p) => (
                  <tr key={p.Cod_Pago} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">Pago #{p.Cod_Pago}</p>
                      <p className="text-xs text-gray-500">{p.Metodo_Pago} · {formatDate(p.Fecha_Pago)}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      <div>{p.cliente || "Sin cliente"}</div>
                      <div className="text-xs text-gray-400">{p.Num_Documento || "-"}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      <div>Pedido #{p.Cod_pedido || "-"}</div>
                      <div className="text-xs text-gray-400">{p.Estado_Pedido || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: "#74B495" }}>
                      {formatMoney(p.Monto_Pago)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.Estado_Pago || "Pendiente"}
                        onChange={(e) => cambiarEstado(p.Cod_Pago, e.target.value)}
                        className="border rounded-xl px-2 py-1 text-xs bg-white"
                        style={{ borderColor: "#A8C898" }}
                      >
                        {estados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
