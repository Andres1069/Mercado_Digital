import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resolverImagen, pedidoService } from "../services/api";
import { useCart } from "../context/CartContext";

const OPCIONES_ENTREGA = [
  {
    id: "domicilio",
    titulo: "Envío a domicilio",
    descripcion: "Recibe tu pedido en la dirección que registres",
    icono: "🛵",
  },
  {
    id: "tienda",
    titulo: "Recoger en tienda",
    descripcion: "Pasa a recoger tu pedido en nuestro punto de venta",
    icono: "🏪",
  },
];

export default function Carrito() {
  const { items, updateQty, removeItem, clearCart, itemsCount, subtotal } = useCart();
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [pasoModal, setPasoModal]       = useState(1);
  const [tipoEntrega, setTipoEntrega]   = useState("");
  const [procesando, setProcesando]     = useState(false);
  const [error, setError]               = useState("");
  const enviandoRef = useRef(false);

  const envio  = subtotal > 70000 || items.length === 0 ? 0 : 7900;
  const total  = subtotal + envio;

  function abrirModal() {
    setPasoModal(1);
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
      navigate(`/pago/simulado?pedido=${res.cod_pedido}&entrega=${tipoEntrega}`);
    } catch (e) {
      setError(e.message || "No se pudo procesar el pedido.");
      setProcesando(false);
      enviandoRef.current = false;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
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
              Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-14 text-center">
            <div
              className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center shadow-sm mb-4"
              style={{ background: "rgba(107,142,78,0.14)", color: "#6B8E4E" }}
            >
              <i className="fa-solid fa-cart-shopping text-4xl" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Tu carrito está vacío</h2>
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
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
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
                Finalizar compra →
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

      {/* ── Modal de checkout ── */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

            {/* ── Indicador de pasos ── */}
            <div className="flex items-center gap-2 mb-5">
              {[
                { n: 1, label: "Entrega" },
                { n: 2, label: "Pago" },
              ].map((paso, idx) => (
                <div key={paso.n} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={
                      pasoModal >= paso.n
                        ? { background: "linear-gradient(135deg,#6B8E4E,#3C5148)", color: "white" }
                        : { border: "1px solid #B2C5B2", color: "#3C5148", backgroundColor: "white" }
                    }
                  >
                    {paso.n}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: pasoModal >= paso.n ? "#3C5148" : "#9ca3af" }}
                  >
                    {paso.label}
                  </span>
                  {idx === 0 && (
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: pasoModal >= 2 ? "#6B8E4E" : "#B2C5B2" }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ── Paso 1: Tipo de entrega ── */}
            {pasoModal === 1 && (
              <>
                <h2 className="text-lg font-extrabold text-gray-800 mb-1">¿Cómo recibes tu pedido?</h2>
                <p className="text-sm text-gray-500 mb-5">Selecciona una opción para continuar.</p>

                <div className="space-y-3 mb-6">
                  {OPCIONES_ENTREGA.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setTipoEntrega(op.id)}
                      className="w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition"
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
                        <p className="text-xs text-gray-500 mt-0.5">{op.descripcion}</p>
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

                <div className="flex gap-3">
                  <button
                    onClick={cerrarModal}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => tipoEntrega && setPasoModal(2)}
                    disabled={!tipoEntrega}
                    className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                  >
                    Continuar →
                  </button>
                </div>
              </>
            )}

            {/* ── Paso 2: Confirmar pago ── */}
            {pasoModal === 2 && (
              <>
                <button
                  onClick={() => setPasoModal(1)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
                  disabled={procesando}
                >
                  ← Cambiar tipo de entrega
                </button>

                <h2 className="text-lg font-extrabold text-gray-800 mb-1">Confirmar pedido</h2>

                {/* Resumen de entrega elegida */}
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4"
                  style={{ backgroundColor: "rgba(107,142,78,0.08)", border: "1px solid #B2C5B2" }}
                >
                  <span className="text-lg">
                    {tipoEntrega === "domicilio" ? "🛵" : "🏪"}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#3C5148" }}>
                    {tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recojo en tienda"}
                  </span>
                </div>

                {/* Método de pago (solo Simulador) */}
                <div
                  className="flex items-center gap-3 rounded-2xl border p-3 mb-5"
                  style={{ borderColor: "#6B8E4E", backgroundColor: "rgba(107,142,78,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "linear-gradient(135deg,#3C5148,#6B8E4E)", color: "white" }}
                  >
                    🏦
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-700">Pasarela de pagos</span>
                    <span
                      className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                    >
                      Tarjeta · Nequi · Daviplata
                    </span>
                    <div className="text-[11px] text-gray-400 mt-0.5">Simulador local · Pago seguro</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-gray-800 mb-5">
                  <span>Total a pagar</span>
                  <span>${Number(total).toLocaleString("es-CO")}</span>
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
                    disabled={procesando}
                    className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
                  >
                    {procesando ? "Procesando..." : "Ir a pagar →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
