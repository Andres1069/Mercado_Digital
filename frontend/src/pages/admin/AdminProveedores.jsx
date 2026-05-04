import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { proveedorService } from "../../services/api";

const VACIO = { nombre: "", telefono: "", correo: "" };
const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" };
const INPUT_STYLE = { backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" };
const LABEL = { color: "#3C5148" };

function Badge({ n }) {
  if (!n || Number(n) === 0) return <span className="text-xs" style={{ color: "#1B2727" }}>—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171" }}>
      ⚠ {n} bajo stock
    </span>
  );
}

function Modal({ proveedor, onGuardar, onCerrar, guardando, error }) {
  const [form, setForm] = useState(proveedor || VACIO);
  const set = (campo, val) => setForm((f) => ({ ...f, [campo]: val }));
  const handleSubmit = (e) => { e.preventDefault(); onGuardar(form); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
        <div className="px-6 py-5 text-white" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">
            {proveedor ? "Editar" : "Nuevo"} proveedor
          </p>
          <h2 className="text-xl font-black mt-1">{proveedor ? proveedor.Nombre_proveedor : "Agregar proveedor"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={LABEL}>Nombre</label>
            <input required value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Alqueria Colombia S.A.S"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={LABEL}>Telefono</label>
            <input required value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
              placeholder="Ej: 6017458900"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={LABEL}>Correo electronico</label>
            <input required type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)}
              placeholder="Ej: contacto@proveedor.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={INPUT_STYLE} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCerrar}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition"
              style={{ backgroundColor: "#6B8E4E" }}>
              {guardando ? "Guardando..." : proveedor ? "Guardar cambios" : "Crear proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PanelBajoStock({ proveedor, productos, onCerrar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
        <div className="px-6 py-5"
          style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.15))", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#f87171" }}>Alerta de inventario</p>
          <h2 className="text-xl font-black mt-1" style={{ color: "#1B2727" }}>{proveedor.Nombre_proveedor}</h2>
          <p className="text-sm mt-1" style={{ color: "#3C5148" }}>
            {productos.length} producto{productos.length !== 1 ? "s" : ""} con stock critico — considera contactar al proveedor.
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-2 mb-6">
            {productos.map((p) => (
              <div key={p.Cod_Producto} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.05)" }}>
                <span className="text-sm font-medium" style={{ color: "#1B2727" }}>{p.Nombre}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: Number(p.Stock) === 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)",
                    color: Number(p.Stock) === 0 ? "#f87171" : "#fbbf24",
                  }}>
                  {Number(p.Stock) === 0 ? "Agotado" : `${p.Stock} unidades`}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-5 space-y-2"
            style={{ border: "1px solid rgba(107,142,78,0.12)", backgroundColor: "rgba(107,142,78,0.06)" }}>
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#6B8E4E" }}>Datos de contacto</p>
            <p className="text-sm font-semibold" style={{ color: "#1B2727" }}>{proveedor.Nombre_proveedor}</p>
            <a href={`tel:${proveedor.Telefono_proveedor}`} className="flex items-center gap-2 text-sm hover:underline" style={{ color: "#3C5148" }}>
              📞 {proveedor.Telefono_proveedor}
            </a>
            <a href={`mailto:${proveedor.Correo_proveedor}`} className="flex items-center gap-2 text-sm hover:underline" style={{ color: "#3C5148" }}>
              ✉ {proveedor.Correo_proveedor}
            </a>
          </div>

          <div className="flex gap-3">
            <button onClick={onCerrar}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
              Cerrar
            </button>
            <a
              href={`mailto:${proveedor.Correo_proveedor}?subject=Solicitud de reposicion de inventario&body=Estimados,%0A%0ANecesitamos reponer los siguientes productos:%0A${productos.map((p) => `- ${p.Nombre} (Stock actual: ${p.Stock})`).join("%0A")}%0A%0AQuedamos atentos.`}
              className="flex-1 py-2.5 rounded-xl text-center text-white text-sm font-semibold transition"
              style={{ backgroundColor: "#6B8E4E" }}>
              Enviar correo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState("");
  const [buscar, setBuscar]           = useState("");
  const [modal, setModal]             = useState(null);
  const [errorModal, setErrorModal]   = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [confirmar, setConfirmar]     = useState(null);
  const [panelStock, setPanelStock]   = useState(null);
  const [cargandoStock, setCargandoStock] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await proveedorService.listar();
      setProveedores(res.proveedores || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los proveedores.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo  = () => { setModal({ proveedor: null }); setErrorModal(""); };
  const abrirEditar = (p) => { setModal({ proveedor: { ...p, nombre: p.Nombre_proveedor, telefono: p.Telefono_proveedor, correo: p.Correo_proveedor } }); setErrorModal(""); };
  const cerrarModal = () => setModal(null);

  const guardar = async (form) => {
    setGuardando(true);
    setErrorModal("");
    try {
      if (modal.proveedor?.Cod_Proveedor) {
        await proveedorService.actualizar(modal.proveedor.Cod_Proveedor, form);
      } else {
        await proveedorService.crear(form);
      }
      cerrarModal();
      cargar();
    } catch (e) {
      setErrorModal(e.message || "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id) => {
    try {
      await proveedorService.eliminar(id);
      setConfirmar(null);
      cargar();
    } catch (e) {
      setError(e.message || "Error al eliminar.");
      setConfirmar(null);
    }
  };

  const verBajoStock = async (p) => {
    if (Number(p.productos_bajo_stock) === 0) return;
    setCargandoStock(true);
    try {
      const res = await proveedorService.obtener(p.Cod_Proveedor);
      setPanelStock({ proveedor: p, productos: res.productos_bajo_stock || [] });
    } catch { /* silencioso */ }
    finally { setCargandoStock(false); }
  };

  const filtrados = proveedores.filter((p) =>
    p.Nombre_proveedor.toLowerCase().includes(buscar.toLowerCase()) ||
    p.Correo_proveedor.toLowerCase().includes(buscar.toLowerCase())
  );

  const totalAlertas = proveedores.filter((p) => Number(p.productos_bajo_stock) > 0).length;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#D5DDDF" }}>
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">

        {modal && <Modal proveedor={modal.proveedor} onGuardar={guardar} onCerrar={cerrarModal} guardando={guardando} error={errorModal} />}
        {panelStock && <PanelBajoStock proveedor={panelStock.proveedor} productos={panelStock.productos} onCerrar={() => setPanelStock(null)} />}

        {confirmar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2" }}>
              <h2 className="text-lg font-black mb-2" style={{ color: "#1B2727" }}>Eliminar proveedor</h2>
              <p className="text-sm mb-6" style={{ color: "#6B8E4E" }}>Esta accion no se puede deshacer. Los productos vinculados quedaran sin proveedor asignado.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmar(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(107,142,78,0.18)", color: "#3C5148" }}>
                  Cancelar
                </button>
                <button onClick={() => eliminar(confirmar)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                  style={{ backgroundColor: "rgba(239,68,68,0.8)" }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero header */}
          <div className="rounded-2xl px-7 py-6 text-white mb-7 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #3C5148 0%, #6B8E4E 100%)" }}>
            <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Panel administrativo</p>
            <h1 className="text-3xl font-black mt-2">Gestion de proveedores</h1>
            <p className="text-white/75 mt-2 text-sm max-w-xl">
              Administra los proveedores de tus productos. Puedes contactarlos directamente cuando el stock este bajo.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {[
                { label: "Total proveedores", val: proveedores.length },
                { label: "Con stock critico",  val: totalAlertas },
                { label: "Estado",             val: totalAlertas > 0 ? "Requiere atencion" : "Sin alertas" },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-2xl px-4 py-3 border border-white/20 bg-white/10">
                  <p className="text-xs uppercase tracking-wider text-white/70">{label}</p>
                  <p className="text-xl font-black mt-1">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas */}
          {totalAlertas > 0 && (
            <div className="mb-5 px-5 py-4 rounded-2xl flex items-start gap-3"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <span className="text-xl">⚠</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                  {totalAlertas} proveedor{totalAlertas !== 1 ? "es tienen" : " tiene"} productos con stock bajo o agotado.
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#d97706" }}>
                  Haz clic en la alerta roja de cada proveedor para ver los productos y enviar un correo de reposicion.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <input value={buscar} onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar proveedor o correo..."
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ backgroundColor: "#F8FAF9", border: "1px solid #B2C5B2", color: "#1B2727" }} />
            <button onClick={cargar} disabled={cargando}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: "#B2C5B2", border: "1px solid #B2C5B2", color: "#1B2727" }}>
              {cargando ? "Cargando..." : "Actualizar"}
            </button>
            <button onClick={abrirNuevo}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{ backgroundColor: "#6B8E4E" }}>
              + Nuevo proveedor
            </button>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2C5B2", boxShadow: "0 2px 8px rgba(27,39,39,0.06)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(107,142,78,0.12)" }}>
                  {["Proveedor", "Telefono", "Correo", "Productos", "Stock critico", "Acciones"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#6B8E4E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}>
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(107,142,78,0.1)" }} />
                      </td>
                    </tr>
                  ))
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center" style={{ color: "#6B8E4E" }}>
                      {buscar ? "No se encontraron proveedores." : "No hay proveedores registrados."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.Cod_Proveedor} className="transition"
                      style={{ borderTop: "1px solid rgba(107,142,78,0.08)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,142,78,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                      <td className="px-5 py-4">
                        <p className="font-semibold" style={{ color: "#1B2727" }}>{p.Nombre_proveedor}</p>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`tel:${p.Telefono_proveedor}`} className="hover:underline" style={{ color: "#3C5148" }}>
                          {p.Telefono_proveedor}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`mailto:${p.Correo_proveedor}`} className="hover:underline" style={{ color: "#3C5148" }}>
                          {p.Correo_proveedor}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold" style={{ color: "#3C5148" }}>
                        {p.total_productos || 0}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {Number(p.productos_bajo_stock) > 0 ? (
                          <button onClick={() => verBajoStock(p)} disabled={cargandoStock}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition hover:opacity-80"
                            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                            ⚠ {p.productos_bajo_stock} productos
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "#1B2727" }}>Sin alertas</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a href={`mailto:${p.Correo_proveedor}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                            style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}
                            title="Contactar por correo">
                            Contactar
                          </a>
                          <button onClick={() => abrirEditar(p)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                            style={{ border: "1px solid rgba(107,142,78,0.4)", color: "#3C5148" }}>
                            Editar
                          </button>
                          <button onClick={() => setConfirmar(p.Cod_Proveedor)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                            style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
