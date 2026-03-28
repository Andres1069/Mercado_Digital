import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { inventarioService, resolverImagen } from "../../services/api";

const CARD = { backgroundColor: "var(--md-surface)", border: "1px solid var(--md-border)", boxShadow: "var(--md-shadow)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };

function nivelStock(stock) {
  if (stock <= 0)  return { label: "Sin stock",    bg: "rgba(239,68,68,0.15)",   text: "#f87171" };
  if (stock <= 5)  return { label: "Stock bajo",   bg: "rgba(245,158,11,0.15)",  text: "#fbbf24" };
  if (stock <= 20) return { label: "Stock normal", bg: "rgba(107,142,78,0.18)",  text: "#3C5148" };
  return             { label: "Stock alto",    bg: "rgba(107,142,78,0.2)", text: "#6B8E4E" };
}

export default function AdminInventario() {
  const [inventario, setInventario] = useState([]);
  const [alertas, setAlertas]       = useState({ sin_stock: [], stock_bajo: [] });
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState("");
  const [buscar, setBuscar]         = useState("");
  const [editando, setEditando]     = useState(null);
  const [stockInput, setStockInput] = useState("");
  const [guardando, setGuardando]   = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true); setError("");
    try {
      const [resInv, resAlertas] = await Promise.all([
        inventarioService.listar(),
        inventarioService.alertas(10),
      ]);
      setInventario(resInv.inventario || []);
      setAlertas({ sin_stock: resAlertas.sin_stock || [], stock_bajo: resAlertas.stock_bajo || [] });
    } catch (e) {
      setError(e.message || "No se pudo cargar el inventario.");
    } finally { setCargando(false); }
  }

  function iniciarEdicion(item) { setEditando(item.Cod_Inventario); setStockInput(String(item.Stock)); }
  function cancelarEdicion()    { setEditando(null); setStockInput(""); }

  async function guardarStock(item) {
    const nuevoStock = parseInt(stockInput, 10);
    if (isNaN(nuevoStock) || nuevoStock < 0) { alert("El stock debe ser un numero mayor o igual a 0."); return; }
    setGuardando(true);
    try {
      await inventarioService.actualizar(item.Cod_Inventario, { stock: nuevoStock });
      setInventario((prev) => prev.map((i) =>
        i.Cod_Inventario === item.Cod_Inventario ? { ...i, Stock: nuevoStock, Stock_Producto: nuevoStock } : i
      ));
      setEditando(null);
    } catch (e) { alert(e.message || "Error al actualizar el stock."); }
    finally { setGuardando(false); }
  }

  const filtrado = inventario.filter((i) =>
    buscar === "" ||
    i.Producto.toLowerCase().includes(buscar.toLowerCase()) ||
    i.Categoria?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8">

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#1B2727" }}>Inventario</h1>
              <p className="text-sm mt-1" style={{ color: "#3C5148" }}>{inventario.length} productos en inventario</p>
            </div>
            <button onClick={cargar} className="px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              Actualizar
            </button>
          </div>

          {alertas.sin_stock.length > 0 && (
            <div className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#f87171" }}>
                🚨 {alertas.sin_stock.length} producto{alertas.sin_stock.length > 1 ? "s" : ""} agotado{alertas.sin_stock.length > 1 ? "s" : ""} — contacta al proveedor
              </p>
              <div className="flex flex-wrap gap-2">
                {alertas.sin_stock.map((p) => (
                  <span key={p.Cod_Producto} className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                    {p.Producto} · 0 uds
                  </span>
                ))}
              </div>
            </div>
          )}
          {alertas.stock_bajo.length > 0 && (
            <div className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#fbbf24" }}>
                ⚠️ {alertas.stock_bajo.length} producto{alertas.stock_bajo.length > 1 ? "s" : ""} con stock bajo
              </p>
              <div className="flex flex-wrap gap-2">
                {alertas.stock_bajo.map((p) => (
                  <span key={p.Cod_Producto} className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                    {p.Producto} · {p.Stock} uds
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <input type="text" placeholder="Buscar por producto o categoria..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={INPUT_STYLE} />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {error}
            </div>
          )}

          <div className="rounded-2xl overflow-x-auto" style={CARD}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Producto","Categoria","Precio","Stock","Nivel","Accion"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden lg:table-cell text-right" : ""} ${i === 3 || i === 4 || i === 5 ? "text-center" : ""}`}
                      style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : filtrado.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  filtrado.map((item) => {
                    const nivel = nivelStock(Number(item.Stock));
                    const esEditando = editando === item.Cod_Inventario;
                    return (
                      <tr key={item.Cod_Inventario} className="transition"
                        style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                              style={{ backgroundColor: "rgba(107,142,78,0.18)" }}>
                              {item.Imagen_url ? (
                                <img src={resolverImagen(item.Imagen_url)} alt={item.Producto} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: "#1B2727" }}>{item.Producto}</p>
                              <p className="text-xs" style={{ color: "#6B8E4E" }}>ID: {item.Cod_Producto}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "#3C5148" }}>{item.Categoria || "-"}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-right font-medium" style={{ color: "#6B8E4E" }}>
                          ${Number(item.Precio || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {esEditando ? (
                            <input type="number" min="0" value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="w-20 text-center rounded-lg py-1 text-sm focus:outline-none"
                              style={{ backgroundColor: "#1B2727", border: "1px solid #6366f1", color: "#1B2727" }} />
                          ) : (
                            <span className="font-bold" style={{ color: "#1B2727" }}>{item.Stock}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: nivel.bg, color: nivel.text }}>
                            {nivel.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {esEditando ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => guardarStock(item)} disabled={guardando}
                                className="px-3 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition"
                                style={{ backgroundColor: "#6B8E4E" }}>
                                Guardar
                              </button>
                              <button onClick={cancelarEdicion}
                                className="px-3 py-1 rounded-lg text-xs font-semibold transition"
                                style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => iniciarEdicion(item)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold transition"
                              style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                              Editar stock
                            </button>
                          )}
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
    </div>
  );
}
