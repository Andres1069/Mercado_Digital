import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { validarDireccionCobertura, DEFAULT_MAX_DELIVERY_DISTANCE_KM } from "../utils/addressValidation";
import { calcularCostoEnvio, DEFAULT_SHIPPING_RULES } from "../utils/shipping";
import { useCart } from "../context/CartContext";

const STORAGE_KEY = "md_checkout_delivery_address";

export default function AddressConfirmationModal({ open, onClose, onConfirm }) {
  const { usuario } = useAuth();
  const { items, subtotal } = useCart();
  const barrio = usuario?.Barrio || "Bosa Brasil";
  const direccionCuenta = usuario?.Direccion || "";
  const telefonoCuenta = usuario?.Telefono || "";

  const [usarGuardada, setUsarGuardada] = useState(true);
  const [direccion, setDireccion] = useState(direccionCuenta);
  const [barrioEditable] = useState(barrio);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [okInfo, setOkInfo] = useState(null);
  const [detalleEnvio, setDetalleEnvio] = useState(null);

  const sameAsAccount = useMemo(
    () => direccion.trim() === direccionCuenta.trim(),
    [direccion, direccionCuenta]
  );

  useEffect(() => {
    if (!open) return;
    setUsarGuardada(true);
    setDireccion(direccionCuenta);
    setError("");
    setOkInfo(null);
    setDetalleEnvio(null);
  }, [open, direccionCuenta]);

  if (!open) return null;

  async function handleConfirmar() {
    setError("");
    setOkInfo(null);
    setCargando(true);
    try {
      const validacion = await validarDireccionCobertura({
        direccion: usarGuardada ? direccionCuenta : direccion,
        barrio: barrioEditable,
        barrioPermitido: barrio,
        maxDistanciaKm: DEFAULT_MAX_DELIVERY_DISTANCE_KM,
      });

      const payload = {
        direccion: usarGuardada ? direccionCuenta.trim() : validacion.direccionNormalizada,
        barrio,
        telefono: telefonoCuenta || "",
        distanciaKm: validacion.distanciaKm,
        lat: validacion.lat,
        lng: validacion.lng,
        confirmadaDesdeCuenta: usarGuardada || sameAsAccount,
      };

      const calculo = calcularCostoEnvio(items, validacion.distanciaKm, DEFAULT_SHIPPING_RULES);
      if (calculo.fueraDeCobertura) {
        throw new Error("La ubicación se encuentra fuera de la zona de cobertura.");
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      sessionStorage.setItem("md_checkout_shipping_quote", JSON.stringify({
        subtotal: calculo.subtotal,
        costoEnvio: calculo.costoEnvio,
        total: calculo.total,
        envioGratis: calculo.envioGratis,
        distanciaKm: calculo.distanciaKm,
      }));
      setDetalleEnvio(calculo);
      setOkInfo(`Dirección validada dentro del rango permitido (${validacion.distanciaKm} km).`);
      onConfirm?.(payload);
      onClose?.();
    } catch (e) {
      setError(e.message || "No se pudo validar la dirección.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6B8E4E]">Confirma tu dirección</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Antes de continuar con el pago</h2>
          <p className="mt-2 text-sm text-slate-500">
            Revisa si usaremos la dirección registrada en tu cuenta o si quieres cambiarla.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setUsarGuardada(true)}
            className="w-full rounded-2xl border p-4 text-left transition"
            style={{
              borderColor: usarGuardada ? "#6B8E4E" : "#e5e7eb",
              backgroundColor: usarGuardada ? "rgba(107,142,78,0.08)" : "#fff",
            }}
          >
            <p className="text-sm font-extrabold text-slate-800">Usar la dirección de mi cuenta</p>
            <p className="mt-1 text-xs text-slate-500 break-words">
              {direccionCuenta || "No hay dirección registrada."}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUsarGuardada(false)}
            className="w-full rounded-2xl border p-4 text-left transition"
            style={{
              borderColor: !usarGuardada ? "#6B8E4E" : "#e5e7eb",
              backgroundColor: !usarGuardada ? "rgba(107,142,78,0.08)" : "#fff",
            }}
          >
            <p className="text-sm font-extrabold text-slate-800">Cambiar dirección</p>
            <p className="mt-1 text-xs text-slate-500">
              Solo se permite dentro de {barrio} y hasta {DEFAULT_MAX_DELIVERY_DISTANCE_KM} km.
            </p>
          </button>
        </div>

        {!usarGuardada && (
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Barrio permitido
              </label>
              <input
                type="text"
                value={barrioEditable}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Nueva dirección
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle / carrera / referencia"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#6B8E4E]"
              />
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Resumen de envío</p>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(subtotal || 0).toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Distancia</span>
              <span>{detalleEnvio ? `${detalleEnvio.distanciaKm.toFixed(2)} km` : "Pendiente"}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Domicilio</span>
              <span>
                {detalleEnvio
                  ? (detalleEnvio.envioGratis ? "Gratis" : `$${detalleEnvio.costoEnvio.toLocaleString("es-CO")}`)
                  : "Pendiente"}
              </span>
            </div>
            {detalleEnvio?.envioGratis && (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 font-semibold">
                🎉 ¡Tu envío es gratis!
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {okInfo && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {okInfo}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={cargando}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-black text-white transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}
          >
            {cargando ? "Validando..." : "Confirmar dirección"}
          </button>
        </div>
      </div>
    </div>
  );
}
