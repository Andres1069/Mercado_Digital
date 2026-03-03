import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resolverImagen } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Carrito() {
  const { items, updateQty, removeItem, clearCart, itemsCount, subtotal } = useCart();

  const envio = subtotal > 70000 || items.length === 0 ? 0 : 7900;
  const total = subtotal + envio;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-3 mb-6">
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
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {items.map((it) => (
                <div key={it.id} className="p-4 border-b last:border-b-0 border-gray-100 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    {it.imagen ? (
                      <img src={resolverImagen(it.imagen)} alt={it.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500">{it.categoria || "Producto"}</p>
                    <h3 className="font-bold text-gray-800 truncate">{it.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-indigo-600">${Number(it.precio).toLocaleString("es-CO")}</span>
                      {it.precioOriginal > it.precio && (
                        <span className="text-xs text-gray-400 line-through">
                          ${Number(it.precioOriginal).toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(it.id, it.cantidad - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      value={it.cantidad}
                      onChange={(e) => updateQty(it.id, e.target.value)}
                      className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm"
                    />
                    <button
                      onClick={() => updateQty(it.id, it.cantidad + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-800">${Number(it.precio * it.cantidad).toLocaleString("es-CO")}</p>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      Quitar
                    </button>
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
                className="w-full mt-5 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#10b981,#14b8a6)" }}
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
    </div>
  );
}
