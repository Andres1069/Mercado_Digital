import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { pedidoService } from "../services/api";

function badgeColor(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado") || e.includes("completado")) return { bg: "#dcfce7", text: "#166534" };
  if (e.includes("cancel") || e.includes("fallido") || e.includes("rechaz")) return { bg: "#fee2e2", text: "#991b1b" };
  if (e.includes("camino") || e.includes("prepar")) return { bg: "#e0e7ff", text: "#3730a3" };
  return { bg: "#fef3c7", text: "#92400e" };
}

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await pedidoService.mis_pedidos();
        setPedidos(res.pedidos || []);
      } catch (e) {
        setError(e.message || "No se pudieron cargar tus pedidos.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const totalGastado = useMemo(
    () => pedidos.reduce((acc, p) => acc + Number(p.Monto_Pago || p.Total_Carrito || 0), 0),
    [pedidos]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Mis pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">{pedidos.length} pedidos registrados</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total historico</p>
            <p className="text-xl font-extrabold text-gray-800">${Number(totalGastado).toLocaleString("es-CO")}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm" style={{ backgroundColor: "#fff8e8", borderColor: "#f8d37b", color: "#8a6b1a" }}>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#A8C898" }} className="text-white">
                <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-center font-semibold hidden lg:table-cell">Pago</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
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
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Aun no tienes pedidos registrados.
                  </td>
                </tr>
              ) : (
                pedidos.map((p) => {
                  const cPedido = badgeColor(p.Estado_Pedido);
                  const cPago = badgeColor(p.Estado_Pago);
                  return (
                    <tr key={p.Cod_Pedido} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">Pedido #{p.Cod_Pedido}</p>
                        <p className="text-xs text-gray-500">{Number(p.Cantidad_articulos || 0)} articulos</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{formatFecha(p.Fecha_Pedido)}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: "#74B495" }}>
                        ${Number(p.Monto_Pago || p.Total_Carrito || 0).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">{p.Metodo_Pago || "Sin pago"}</div>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cPago.bg, color: cPago.text }}>
                            {p.Estado_Pago || "Pendiente"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cPedido.bg, color: cPedido.text }}>
                          {p.Estado_Pedido}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
