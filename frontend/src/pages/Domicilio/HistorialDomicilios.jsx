import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { domicilioService } from "../../services/api";

function badgeColor(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado") || e.includes("completado")) return { bg: "rgba(107,142,78,0.12)", text: "#1B2727" };
  if (e.includes("cancel") || e.includes("fallido"))       return { bg: "#fee2e2", text: "#991b1b" };
  if (e.includes("camino") || e.includes("prepar") || e.includes("confirmado")) return { bg: "rgba(60,81,72,0.12)", text: "#3C5148" };
  return { bg: "#F5F7F5", text: "#3C5148" };
}

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function HistorialDomicilios() {
  const [domicilios, setDomicilios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await domicilioService.misEnvios();
        setDomicilios(res.domicilios || []);
      } catch (e) {
        setError(e.message || "No se pudieron cargar tus envios.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Mis envios</h1>
            <p className="text-sm text-gray-500 mt-1">{domicilios.length} envios registrados</p>
          </div>
          <Link
            to="/mis-pedidos"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Ver todos mis pedidos
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm" style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : domicilios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-5xl mb-3">🛵</div>
            <h2 className="text-lg font-bold text-gray-800">Sin envios registrados</h2>
            <p className="text-sm text-gray-500 mt-1">Cuando realices un pedido aparecera aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domicilios.map((d) => {
              const cPedido  = badgeColor(d.Estado_Pedido);
              const cDomicilio = badgeColor(d.Estado_Domicilio);
              return (
                <div
                  key={d.Cod_Pedido}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-gray-800">Pedido #{d.Cod_Pedido}</p>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: cPedido.bg, color: cPedido.text }}
                      >
                        {d.Estado_Pedido}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pedido: {formatFecha(d.Fecha_Pedido)}
                    </p>
                    {d.Direccion_entrega && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Entrega: {d.Direccion_entrega}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {d.Estado_Domicilio && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: cDomicilio.bg, color: cDomicilio.text }}
                      >
                        Envio: {d.Estado_Domicilio}
                      </span>
                    )}
                    <Link
                      to={`/domicilio/seguimiento?pedido=${d.Cod_Pedido}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      Ver seguimiento
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
