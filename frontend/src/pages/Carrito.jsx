import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resolverImagen } from "../services/api";
import { useCart } from "../context/CartContext";
import { pedidoService } from "../services/api";
import { useState } from "react";

export default function Carrito() {
  const { items, updateQty, removeItem, clearCart, itemsCount, subtotal } = useCart();
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [venta, setVenta] = useState(null);

  const formatMoney = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;
  const calcularAhorro = (ventaActual) => {
    if (!ventaActual?.items?.length) return 0;
    return ventaActual.items.reduce((acc, it) => {
      const original = Number(it.Precio_original || 0);
      const unit = Number(it.Precio_unitario || 0);
      if (!original || original <= unit) return acc;
      return acc + (original - unit) * Number(it.Cantidad || 0);
    }, 0);
  };

  const envio = subtotal > 70000 || items.length === 0 ? 0 : 7900;
  const total = subtotal + envio;

  const finalizarCompra = async () => {
    if (items.length === 0) return;
    setCargando(true);
    setError("");
    try {
      const payload = {
        metodo_pago: metodoPago,
        items: items.map((it) => ({ id: it.id, cantidad: it.cantidad })),
      };
      const res = await pedidoService.crear(payload);
      setVenta(res.venta);
      clearCart();
    } catch (e) {
      setError(e.message || "No se pudo registrar la venta.");
    } finally {
      setCargando(false);
    }
  };

  const imprimirFactura = () => {
    if (!venta) return;
    const filas = (venta.items || [])
      .map(
        (it) => {
          const original = Number(it.Precio_original || 0);
          const unit = Number(it.Precio_unitario || 0);
          const tieneDesc = original > unit;
          const porcentaje = Number(it.Porcentaje_Descuento || 0);
          const precioHtml = tieneDesc
            ? `<div>$${unit.toLocaleString("es-CO")}</div><div style="text-decoration:line-through;color:#9ca3af;font-size:11px;">$${original.toLocaleString("es-CO")}</div>`
            : `$${unit.toLocaleString("es-CO")}`;
          const descHtml = tieneDesc ? `${porcentaje || Math.round((1 - unit / original) * 100)}%` : "-";
          return `
        <tr>
          <td>${it.Nombre}</td>
          <td style="text-align:center;">${it.Cantidad}</td>
          <td style="text-align:right;">${precioHtml}</td>
          <td style="text-align:center;">${descHtml}</td>
          <td style="text-align:right;">$${Number(it.Subtotal).toLocaleString("es-CO")}</td>
        </tr>`;
        }
      )
      .join("");

    const ahorro = calcularAhorro(venta);
    const html = `
      <html>
        <head>
          <title>Factura #${venta.pedido_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1 { font-size: 22px; margin: 0 0 8px; }
            .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; vertical-align: top; }
            th { background: #a8c898; color: white; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 12px; }
            .ahorro { text-align: right; color: #059669; font-size: 12px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <h1>Factura de venta</h1>
          <div class="meta">Pedido: #${venta.pedido_id} | Fecha: ${new Date(venta.fecha).toLocaleString("es-CO")}</div>
          <div class="meta">Metodo de pago: ${venta.metodo_pago}</div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <div class="total">Total: $${Number(venta.total).toLocaleString("es-CO")}</div>
          ${ahorro > 0 ? `<div class="ahorro">Ahorro total: $${ahorro.toLocaleString("es-CO")}</div>` : ""}
        </body>
      </html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {cargando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-center border" style={{ borderColor: "#A8C898" }}>
            <div
              className="mx-auto w-14 h-14 rounded-full border-4 animate-spin"
              style={{ borderColor: "#A8C898", borderTopColor: "#74B495" }}
            />
            <h3 className="mt-4 text-lg font-bold text-gray-800">Procesando tu compra</h3>
            <p className="text-sm text-gray-500 mt-1">Estamos confirmando el pago y generando tu factura.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#74B495" }} />
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:120ms]" style={{ backgroundColor: "#877FD7" }} />
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:240ms]" style={{ backgroundColor: "#A8C898" }} />
            </div>
          </div>
        </div>
      )}

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

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Metodo de pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                </select>
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={finalizarCompra}
                disabled={cargando}
                className="w-full mt-5 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#74B495,#877FD7)" }}
              >
                {cargando ? "Procesando..." : "Finalizar compra"}
              </button>
              <Link
                to="/tienda"
                className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Seguir comprando
              </Link>

              {venta && (
                <div className="mt-5 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Venta registrada</p>
                  <p className="text-xs text-gray-500">Pedido #{venta.pedido_id}</p>
                  <p className="text-sm font-bold text-gray-800 mt-2">
                    Total: {formatMoney(venta.total)}
                  </p>
                  <button
                    onClick={imprimirFactura}
                    className="mt-3 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Imprimir factura
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {venta && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Factura digital</h2>
                <p className="text-sm text-gray-500">Pedido #{venta.pedido_id}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(venta.fecha).toLocaleString("es-CO")}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Metodo de pago</p>
                <p className="font-semibold text-gray-800">{venta.metodo_pago}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold text-gray-800">{formatMoney(venta.total)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#F2F7F1" }}>
                <p className="text-xs" style={{ color: "#74B495" }}>Ahorro</p>
                <p className="font-semibold" style={{ color: "#74B495" }}>
                  {formatMoney(calcularAhorro(venta))}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b" style={{ color: "#ffffff", backgroundColor: "#A8C898" }}>
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-center">Cantidad</th>
                    <th className="py-2 text-right">Precio</th>
                    <th className="py-2 text-center">Descuento</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(venta.items || []).map((it) => {
                    const original = Number(it.Precio_original || 0);
                    const unit = Number(it.Precio_unitario || 0);
                    const tieneDesc = original > unit;
                    const porcentaje = Number(it.Porcentaje_Descuento || 0);
                    return (
                      <tr key={`${it.Producto_id}-${it.Nombre}`} className="border-b last:border-b-0">
                        <td className="py-3">
                          <div className="font-semibold text-gray-800">{it.Nombre}</div>
                        </td>
                        <td className="py-3 text-center">{it.Cantidad}</td>
                        <td className="py-3 text-right">
                          <div className="font-semibold text-gray-800">{formatMoney(unit)}</div>
                          {tieneDesc && (
                            <div className="text-xs text-gray-400 line-through">
                              {formatMoney(original)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {tieneDesc ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E6F1EA", color: "#74B495" }}>
                              {porcentaje || Math.round((1 - unit / original) * 100)}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-800">
                          {formatMoney(it.Subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-extrabold text-gray-800">{formatMoney(venta.total)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
