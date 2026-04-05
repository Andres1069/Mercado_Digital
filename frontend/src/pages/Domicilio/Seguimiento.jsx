import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { domicilioService } from "../../services/api";

const PASOS = [
  { clave: "Pendiente",       label: "Pedido recibido" },
  { clave: "Confirmado",      label: "Confirmado" },
  { clave: "En preparacion",  label: "En preparacion" },
  { clave: "En camino",       label: "En camino" },
  { clave: "Entregado",       label: "Entregado" },
];

function indicePaso(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("entregado") || e.includes("completado")) return 4;
  if (e.includes("camino"))    return 3;
  if (e.includes("prepar"))    return 2;
  if (e.includes("confirmado")) return 1;
  return 0;
}

function formatFecha(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function Seguimiento() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  useEffect(() => {
    if (!pedidoId) {
      setError("No se especifico el numero de pedido.");
      setCargando(false);
      return;
    }
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await domicilioService.seguimiento(pedidoId);
        setData(res);
        setUltimaActualizacion(new Date());
      } catch (e) {
        setError(e.message || "No se pudo cargar el seguimiento.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [pedidoId]);

  const estadoActual = data?.pedido?.Estado_Pedido || data?.domicilio?.Estado_Domicilio || "";
  const pasoActual   = indicePaso(estadoActual);
  const cancelado    = estadoActual.toLowerCase().includes("cancel");
  const esTerminal   = estadoActual.toLowerCase().includes("entregado") || cancelado;

  // Auto-refresh cada 30s mientras el pedido no está en estado terminal
  useEffect(() => {
    if (!pedidoId || esTerminal) return;
    const id = setInterval(async () => {
      try {
        const res = await domicilioService.seguimiento(pedidoId);
        setData(res);
        setUltimaActualizacion(new Date());
      } catch {
        // Ignorar: se reintenta en el siguiente intervalo.
      }
    }, 30000);
    return () => clearInterval(id);
  }, [pedidoId, esTerminal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/domicilio/historial" className="text-sm text-gray-500 hover:text-gray-700">
            Mis envios
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-semibold">
            Seguimiento {pedidoId ? `#${pedidoId}` : ""}
          </span>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm" style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Info pedido */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-lg font-extrabold text-gray-800">
                  Pedido #{data.pedido?.Cod_Pedido}
                </h1>
                {!esTerminal && (
                  <span className="text-xs text-gray-400 shrink-0">
                    Actualiza automáticamente
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fecha</p>
                  <p className="text-gray-700">{formatFecha(data.pedido?.Fecha_Pedido)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Estado pedido</p>
                  <p className="font-semibold text-gray-800">{data.pedido?.Estado_Pedido || "-"}</p>
                </div>
                {data.domicilio?.Cod_Domicilio && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Estado envio</p>
                      <p className="font-semibold text-gray-800">{data.domicilio.Estado_Domicilio || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fecha envio</p>
                      <p className="text-gray-700">{formatFecha(data.domicilio.Fecha_Domicilio)}</p>
                    </div>
                  </>
                )}
              </div>
              {ultimaActualizacion && (
                <p className="text-xs text-gray-400 mt-3">
                  Última actualización: {ultimaActualizacion.toLocaleTimeString("es-CO", { timeStyle: "short" })}
                </p>
              )}
            </div>

            {/* Banner En camino */}
            {estadoActual.toLowerCase().includes("camino") && (
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: "linear-gradient(135deg, #3C5148, #1B2727)", color: "white" }}
              >
                <p className="text-3xl mb-1">🛵</p>
                <p className="font-extrabold text-lg">¡Tu pedido está en camino!</p>
                <p className="text-sm text-white/80 mt-1">El domiciliario ya salió hacia tu dirección.</p>
              </div>
            )}

            {/* Barra de progreso */}
            {!cancelado && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-700 mb-5">Progreso del pedido</h2>
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-4 h-1 bg-gray-100 z-0" />
                  <div
                    className="absolute left-0 top-4 h-1 bg-green-400 z-0 transition-all duration-700"
                    style={{ width: `${pasoActual === 0 ? 0 : (pasoActual / (PASOS.length - 1)) * 100}%` }}
                  />
                  {PASOS.map((paso, idx) => {
                    const completado = idx <= pasoActual;
                    const activo     = idx === pasoActual;
                    return (
                      <div key={paso.clave} className="relative z-10 flex flex-col items-center gap-2" style={{ flex: 1 }}>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                          style={{
                            backgroundColor: completado ? "#6B8E4E" : "#e5e7eb",
                            color: completado ? "white" : "#9ca3af",
                            boxShadow: activo ? "0 0 0 3px #a7f3d0" : "none",
                          }}
                        >
                          {completado ? "✓" : idx + 1}
                        </div>
                        <p className="text-xs text-center leading-tight font-medium"
                          style={{ maxWidth: 60, color: activo ? "#059669" : "#9ca3af" }}>
                          {paso.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cancelado && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-semibold text-center">
                ❌ Este pedido fue cancelado.
              </div>
            )}

            {estadoActual.toLowerCase().includes("entregado") && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-3xl mb-1">🎉</p>
                <p className="text-sm font-bold text-green-800">¡Pedido entregado! Gracias por tu compra.</p>
              </div>
            )}

            {/* Historial si existe */}
            {data.historial && data.historial.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-700 mb-4">Historial de estados</h2>
                <div className="space-y-3">
                  {data.historial.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{h.Estado}</p>
                        <p className="text-xs text-gray-400">{formatFecha(h.Fecha)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-gray-400">No se encontro informacion para este pedido.</p>
          </div>
        )}
      </div>
    </div>
  );
}
