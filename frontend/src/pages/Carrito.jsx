import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resolverImagen, pedidoService } from "../services/api";
import { useCart } from "../context/CartContext";

const METODOS_PAGO = ["Nequi", "Daviplata"];

export default function Carrito() {
  const { items, updateQty, removeItem, clearCart, itemsCount, subtotal } = useCart();
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const envio = subtotal > 70000 || items.length === 0 ? 0 : 7900;
  const total = subtotal + envio;

  async function handleFinalizarCompra() {
    setError("");
    if (!metodoPago) {
      setError("Debes seleccionar un método de pago para continuar.");
      return;
    }
    setProcesando(true);
    try {
      const res = await pedidoService.crear({
        items: items.map((it) => ({ id: it.id, nombre: it.nombre, precio: it.precio, cantidad: it.cantidad })),
        metodo_pago: metodoPago,
        monto_total: total,
      });
      setMostrarModal(false);
      navigate(`/pago/qr?pedido=${res.cod_pedido}&metodo=${metodoPago}`);
    } catch (e) {
      setError(e.message || "No se pudo procesar el pedido.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Carrito de compras</h1>
            <p className="text-sm text-gray-500 mt-1">{itemsCount} articulos</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-6xl mb-3">🛒</div>
            <h2 className="text-xl font-bold text-gray-800">Tu carrito esta vacio</h2>
            <p className="text-sm text-gray-500 mt-2">Agrega productos desde la tienda para comenzar.</p>
            <Link
              to="/tienda"
              className="inline-block mt-5 text-white font-semibold px-6 py-3 rounded-xl"
              style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
            >
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {items.map((it) => (
                <div key={it.id} className="p-4 border-b last:border-b-0 border-gray-100">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {it.imagen ? (
                        <img src={resolverImagen(it.imagen)} alt={it.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500">{it.categoria || "Producto"}</p>
                        <h3 className="font-bold text-gray-800 truncate">{it.nombre}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-extrabold text-indigo-600">${Number(it.precio).toLocaleString("es-CO")}</span>
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
                          <p className="font-bold text-gray-800">${Number(it.precio * it.cantidad).toLocaleString("es-CO")}</p>
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(subtotal).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span>{envio === 0 ? "Gratis" : `$${Number(envio).toLocaleString("es-CO")}`}</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between text-base font-extrabold text-gray-800">
                  <span>Total</span>
                  <span>${Number(total).toLocaleString("es-CO")}</span>
                </div>
              </div>

              <button
                onClick={() => setMostrarModal(true)}
                className="w-full mt-5 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                Finalizar compra
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

      {/* Modal de metodo de pago */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-1">Confirmar pedido</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona el metodo de pago</p>

            {error && (
              <div className="mb-3 px-3 py-2 rounded-xl text-xs border" style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
                {error}
              </div>
            )}

            <div className="space-y-2 mb-5">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition"
                  style={metodoPago === m
                    ? { borderColor: "#6B8E4E", backgroundColor: "rgba(107,142,78,0.1)" }
                    : { borderColor: "#f1f5f9", backgroundColor: "white" }
                  }
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    value={m}
                    checked={metodoPago === m}
                    onChange={() => setMetodoPago(m)}
                    className="accent-green-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-700">{m}</span>
                    <span className="ml-2 text-xs text-indigo-600 font-semibold">Pago con QR</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-gray-800 mb-5">
              <span>Total a pagar</span>
              <span>${Number(total).toLocaleString("es-CO")}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setMostrarModal(false); setError(""); }}
                disabled={procesando}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarCompra}
                disabled={procesando}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                {procesando ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
