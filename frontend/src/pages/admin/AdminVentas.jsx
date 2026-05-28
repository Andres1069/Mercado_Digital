import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { productoService, ventaService } from "../../services/api";

const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const METODOS = ["Efectivo", "Nequi", "Daviplata", "Tarjeta", "Transferencia"];

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

export default function AdminVentas() {
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarProductos() {
    setCargando(true);
    setError("");
    try {
      const res = await productoService.listar();
      setProductos(res.productos || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargarProductos(); }, []);

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return productos
      .filter((p) => !q || String(p.Nombre || "").toLowerCase().includes(q) || String(p.categoria || "").toLowerCase().includes(q))
      .slice(0, 24);
  }, [productos, buscar]);

  const total = carrito.reduce((acc, item) => acc + Number(item.precio || 0) * Number(item.cantidad || 0), 0);
  const totalItems = carrito.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

  function agregar(producto) {
    const stock = Number(producto.Cantidad || 0);
    if (stock <= 0) return;

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.Cod_Producto);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.Cod_Producto
            ? { ...item, cantidad: Math.min(item.cantidad + 1, stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: producto.Cod_Producto,
          nombre: producto.Nombre,
          precio: Number(producto.Precio || 0),
          cantidad: 1,
          stock,
        },
      ];
    });
  }

  function actualizarCantidad(id, cantidad) {
    setCarrito((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, cantidad: Math.max(1, Math.min(Number(cantidad || 1), item.stock)) } : item)
        .filter((item) => item.cantidad > 0)
    );
  }

  function quitar(id) {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  }

  async function registrarVenta() {
    setError("");
    setMensaje("");
    if (carrito.length === 0) {
      setError("Agrega productos antes de registrar la venta.");
      return;
    }

    setGuardando(true);
    try {
      const res = await ventaService.crearPresencial({
        metodo_pago: metodoPago,
        monto_total: total,
        observaciones,
        items: carrito.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
        })),
      });
      setMensaje(`Venta presencial #${res.cod_pedido} registrada correctamente.`);
      setCarrito([]);
      setObservaciones("");
      await cargarProductos();
    } catch (e) {
      setError(e.message || "No se pudo registrar la venta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Ventas en tienda</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
                Registra ventas presenciales, descuenta inventario y separa el reporte por canal.
              </p>
            </div>
            <button onClick={cargarProductos} disabled={cargando}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              {cargando ? "Cargando..." : "Actualizar stock"}
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#b91c1c" }}>
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(107,142,78,0.12)", border: "1px solid rgba(107,142,78,0.25)", color: "#3C5148" }}>
              {mensaje}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <section className="rounded-2xl p-5" style={CARD}>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  placeholder="Buscar producto por nombre o categoria..."
                  className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  style={INPUT}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtrados.map((producto) => {
                  const stock = Number(producto.Cantidad || 0);
                  return (
                    <button
                      key={producto.Cod_Producto}
                      type="button"
                      onClick={() => agregar(producto)}
                      disabled={stock <= 0}
                      className="text-left rounded-2xl p-4 transition disabled:opacity-50"
                      style={{ border: "1px solid rgba(107,142,78,0.16)", backgroundColor: "rgba(107,142,78,0.05)" }}
                    >
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold truncate" style={{ color: "#1B2727" }}>{producto.Nombre}</p>
                          <p className="text-xs mt-1" style={{ color: "#6B8E4E" }}>{producto.categoria || "Producto"}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full h-fit"
                          style={{ backgroundColor: stock > 0 ? "rgba(107,142,78,0.16)" : "rgba(239,68,68,0.12)", color: stock > 0 ? "#3C5148" : "#b91c1c" }}>
                          Stock {stock}
                        </span>
                      </div>
                      <p className="text-lg font-black mt-3" style={{ color: "#6B8E4E" }}>{formatMoney(producto.Precio)}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-2xl p-5 h-fit xl:sticky xl:top-5" style={CARD}>
              <h2 className="text-lg font-black mb-1" style={{ color: "#1B2727" }}>Resumen de venta</h2>
              <p className="text-sm mb-4" style={{ color: "#3C5148" }}>{totalItems} articulos</p>

              <div className="space-y-3 mb-5">
                {carrito.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "#6B8E4E" }}>Selecciona productos para iniciar.</p>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="rounded-xl p-3" style={{ border: "1px solid rgba(107,142,78,0.14)" }}>
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate" style={{ color: "#1B2727" }}>{item.nombre}</p>
                          <p className="text-xs" style={{ color: "#6B8E4E" }}>{formatMoney(item.precio)} c/u</p>
                        </div>
                        <button onClick={() => quitar(item.id)} className="text-xs font-bold" style={{ color: "#b91c1c" }}>Quitar</button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                          className="w-20 rounded-lg px-3 py-2 text-sm focus:outline-none"
                          style={INPUT}
                        />
                        <span className="font-black" style={{ color: "#1B2727" }}>{formatMoney(item.precio * item.cantidad)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none mb-3"
                style={INPUT}>
                {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Observaciones opcionales"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none mb-4"
                style={INPUT}
              />

              <div className="flex items-center justify-between border-t pt-4 mb-4" style={{ borderColor: "rgba(107,142,78,0.2)" }}>
                <span className="font-bold" style={{ color: "#3C5148" }}>Total</span>
                <span className="text-2xl font-black" style={{ color: "#1B2727" }}>{formatMoney(total)}</span>
              </div>

              <button
                onClick={registrarVenta}
                disabled={guardando || carrito.length === 0}
                className="w-full rounded-xl py-3 text-white font-black transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
              >
                {guardando ? "Registrando..." : "Registrar venta"}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
