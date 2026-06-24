import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { resolverImagen, pedidoService } from "../services/api";
import { useCart } from "../context/CartContext";
import { calcularCostoEnvio, DEFAULT_SHIPPING_RULES } from "../utils/shipping";

const OPCIONES_ENTREGA = [
  {
    id: "Domicilio",
    titulo: "Envío a domicilio",
    descripcion: "Recibe tu pedido en la dirección que registres",
    icono: "🛵",
  },
  {
    id: "Recoger_Tienda",
    titulo: "Recoger en tienda",
    descripcion: "Pasa a recoger tu pedido en nuestro punto de venta",
    icono: "🏪",
  },
];

const HORARIO_PEDIDOS = "Los pedidos se realizan de lunes a viernes de 10 AM a 5 PM. Fines de semana de 10 AM a 4 PM.";

export default function Carrito() {
  const { items, updateQty, removeItem, clearCart, itemsCount, subtotal } = useCart();
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoEntrega, setTipoEntrega]   = useState("");
  const [procesando, setProcesando]     = useState(false);
  const [error, setError]               = useState("");
  const enviandoRef = useRef(false);
  const distanciaKm = 0;

  const reglasEnvio = {
    ...DEFAULT_SHIPPING_RULES,
  };

  const resumenEnvio = calcularCostoEnvio(items, distanciaKm, reglasEnvio);
  const envio = items.length === 0 ? 0 : resumenEnvio.costoEnvio;
  const total = items.length === 0 ? 0 : resumenEnvio.total;
  const envioGratis = resumenEnvio.envioGratis;

  function abrirModal() {
    setTipoEntrega("");
    setError("");
    setMostrarModal(true);
  }

  function cerrarModal() {
    if (procesando) return;
    setMostrarModal(false);
    setError("");
  }

  async function handleConfirmar() {
    if (enviandoRef.current) return;

    setError("");
    enviandoRef.current = true;
    setProcesando(true);

    try {
      const res = await pedidoService.crear({
        items: items.map((it) => ({
          id: it.id,
          nombre: it.nombre,
          precio: it.precio,
          cantidad: it.cantidad,
        })),
        metodo_pago: "Simulado",
        monto_total: total,
      });
      setMostrarModal(false);
      navigate(`/pago/simulado?pedido=${res.cod_pedido}&entrega=${encodeURIComponent(tipoEntrega)}`);
    } catch (e) {
      setError(e.message || "No se pudo procesar el pedido.");
    } finally {
      setProcesando(false);
      enviandoRef.current = false;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 mb-16 flex-1 w-full">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Carrito de compras</h1>
            <p className="text-sm text-gray-500 mt-1">{itemsCount} artículos</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
               Vaciar bolsa
            </button>
          )}
        </div>

        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {HORARIO_PEDIDOS}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty-modern bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-14 text-center">
            <div
              className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center shadow-sm mb-4"
              style={{ background: "rgba(107,142,78,0.14)", color: "#6B8E4E" }}
            >
              <i className="fa-solid fa-cart-shopping text-4xl" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-800">Tu carrito está vacío</h2>
            <p className="mt-2 text-gray-500 text-sm">Agrega productos desde la tienda para continuar.</p>
            <Link
              to="/tienda"
              className="inline-block mt-6 text-white font-semibold px-6 py-3 rounded-xl transition hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
            >
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Lista de productos */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {items.map((it) => (
                <div key={it.id} className="p-4 border-b last:border-b-0 border-gray-100">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {it.imagen ? (
                        <img src={resolverImagen(it.imagen)} alt={it.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          <i className="fa-solid fa-box" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500">{it.categoria || "Producto"}</p>
                        <h3 className="font-bold text-gray-800 truncate">{it.nombre}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-extrabold" style={{ color: "#6B8E4E" }}>
                            ${Number(it.precio).toLocaleString("es-CO")}
                          </span>
                          {it.precioOriginal > it.precio && (
                            <span className="text-xs text-gray-400 line-through">
                              ${Number(it.precioOriginal).toLocaleString("es-CO")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-normal sm:gap-4 mt-2 sm:mt-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => updateQty(it.id, it.cantidad - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                          <input
                            value={it.cantidad}
                            onChange={(e) => updateQty(it.id, e.target.value)}
                            className="w-10 sm:w-12 text-center border border-gray-200 rounded-lg py-1 text-sm"
                          />
                          <button
                            onClick={() => updateQty(it.id, it.cantidad + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right sm:shrink-0">
                          <p className="font-bold text-gray-800">
                            ${Number(it.precio * it.cantidad).toLocaleString("es-CO")}
                          </p>
                          <button
                            onClick={() => removeItem(it.id)}
                            className="text-xs text-red-500 hover:underline mt-0.5 sm:mt-1"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen</h3>
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-3 py-3 text-xs font-semibold leading-relaxed text-green-800">
                {HORARIO_PEDIDOS}
              </div>
              <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-xs font-semibold leading-relaxed text-sky-800">
                Compra mínima para envío gratis: $20.000 COP. Si tu carrito baja de ese valor, se cobrará domicilio según la distancia.
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(subtotal).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{envio === 0 ? "Gratis" : `$${Number(envio).toLocaleString("es-CO")}`}</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between text-base font-extrabold text-gray-800">
                  <span>Total</span>
                  <span>${Number(total).toLocaleString("es-CO")}</span>
                </div>
              </div>
              {envioGratis && (
                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  🎉 ¡Tu envío es gratis!
                </div>
              )}

              {error && (
                <div
                  className="mt-4 px-3 py-2 rounded-xl text-xs border"
                  style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={abrirModal}
                disabled={procesando}
                className="w-full mt-5 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                {procesando ? "Procesando..." : "Finalizar compra →"}
              </button>
              <Link
                to="/tienda"
                className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer compact={true} />

      {/* ── Modal de checkout ── */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

            <h2 className="text-lg font-extrabold text-gray-800 mb-1">¿Cómo recibes tu pedido?</h2>
            <p className="text-sm text-gray-500 mb-5">Selecciona una opción para continuar.</p>

            <div className="space-y-3 mb-6">
              {OPCIONES_ENTREGA.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setTipoEntrega(op.id)}
                  disabled={procesando}
                  className="w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-50"
                  style={
                    tipoEntrega === op.id
                      ? { borderColor: "#6B8E4E", backgroundColor: "rgba(107,142,78,0.06)" }
                      : { borderColor: "#e5e7eb", backgroundColor: "white" }
                  }
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={
                      tipoEntrega === op.id
                        ? { background: "linear-gradient(135deg,#3C5148,#6B8E4E)", color: "white" }
                        : { backgroundColor: "#f3f4f6" }
                    }
                  >
                    {op.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{op.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{op.id === "Recoger_Tienda" ? "No requiere dirección" : op.descripcion}</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-2 shrink-0"
                    style={{
                      borderColor: tipoEntrega === op.id ? "#6B8E4E" : "#d1d5db",
                      backgroundColor: tipoEntrega === op.id ? "#6B8E4E" : "transparent",
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-gray-800 mb-5">
              <span>Total a pagar</span>
              <span>${Number(total).toLocaleString("es-CO")}</span>
            </div>
            <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-xs font-semibold leading-relaxed text-sky-800">
              Compra mínima para envío gratis: $20.000 COP. Si tu carrito baja de ese valor, se cobrará domicilio según la distancia.
            </div>

            {error && (
              <div
                className="mb-4 px-3 py-2 rounded-xl text-xs border"
                style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}
              >
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cerrarModal}
                disabled={procesando}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!tipoEntrega || procesando}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                {procesando ? "Procesando..." : "Confirmar pedido →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
