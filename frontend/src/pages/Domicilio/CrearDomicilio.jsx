import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { domicilioService } from "../../services/api";

export default function CrearDomicilio() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const direccionRegistrada = usuario?.Direccion || "";
  const telefonoRegistrado = usuario?.Telefono || "";

  const [form, setForm] = useState({
    direccion: direccionRegistrada,
    telefono: telefonoRegistrado,
    notas: "",
  });
  const [confirmacionMostrada, setConfirmacionMostrada] = useState(!!direccionRegistrada);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pedidoId) {
      setError("No se encontro el numero de pedido. Vuelve al carrito.");
      return;
    }
    if (!form.direccion.trim()) {
      setError("La direccion es obligatoria.");
      return;
    }

    setCargando(true);
    setError("");
    try {
      await domicilioService.crear({
        pedido: parseInt(pedidoId, 10),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim() || null,
        notas: form.notas.trim() || null,
        costo_envio: 7900,
      });
      navigate("/mis-pedidos");
    } catch (e) {
      setError(e.message || "No se pudo registrar el domicilio.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-extrabold text-gray-800 mb-1">Datos de entrega</h1>
          <p className="text-sm text-gray-500 mb-6">
            {pedidoId ? `Pedido #${pedidoId}` : "Confirma tu direccion para el domicilio."}
          </p>

          {/* Panel de confirmación de dirección registrada */}
          {direccionRegistrada && confirmacionMostrada && (
            <div className="mb-5 rounded-2xl border p-4" style={{ backgroundColor: "rgba(107,142,78,0.08)", borderColor: "#B2C5B2" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">📍</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-800 mb-1">¿Es esta tu dirección de entrega?</p>
                  <p className="text-sm text-green-700 font-medium break-words">{direccionRegistrada}</p>
                  {telefonoRegistrado && (
                    <p className="text-xs text-green-600 mt-1">Tel: {telefonoRegistrado}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, direccion: direccionRegistrada, telefono: telefonoRegistrado }));
                        setConfirmacionMostrada(false);
                      }}
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                    >
                      Sí, usar esta dirección
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, direccion: "", telefono: "" }));
                        setConfirmacionMostrada(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                      Usar otra dirección
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border text-sm" style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Direccion de entrega <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle 45 # 12-34, Barrio El Centro"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Telefono de contacto
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notas para el domiciliario
              </label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleChange}
                placeholder="Ej: Timbre roto, llamar al llegar..."
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                {cargando ? "Registrando..." : "Confirmar pedido"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
