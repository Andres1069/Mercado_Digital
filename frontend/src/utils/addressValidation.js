import { geocodificarDireccion, puntoEnPoligono } from "../services/openStreetMap";
import { CHICALA_SUR_CENTER, CHICALA_SUR_POLYGON } from "../config/chicalaSur";

export const DEFAULT_MAX_DELIVERY_DISTANCE_KM = Number(import.meta.env.VITE_MAX_DELIVERY_DISTANCE_KM || 2);

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function barrioCoincide(a, b) {
  return normalizarTexto(a) === normalizarTexto(b);
}

export function distanciaKm(a, b) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function validarDireccionCobertura({ direccion, barrio, barrioPermitido, maxDistanciaKm = DEFAULT_MAX_DELIVERY_DISTANCE_KM }) {
  const dir = String(direccion || "").trim();
  if (!dir) {
    throw new Error("La direccion es obligatoria.");
  }

  if (!barrioCoincide(barrio, barrioPermitido)) {
    throw new Error(`Solo atendemos pedidos en ${barrioPermitido}.`);
  }

  const geo = await geocodificarDireccion(dir, barrioPermitido);
  if (!geo) {
    throw new Error("No pudimos ubicar esa direccion. Intenta con una direccion mas completa.");
  }

  const punto = { lat: geo.lat, lng: geo.lng };
  const dentroDelBarrio = puntoEnPoligono(punto, CHICALA_SUR_POLYGON);
  const distancia = distanciaKm(CHICALA_SUR_CENTER, punto);

  if (!dentroDelBarrio) {
    throw new Error("La direccion queda fuera del barrio permitido.");
  }

  if (distancia > maxDistanciaKm) {
    throw new Error(`La direccion supera la distancia permitida de ${maxDistanciaKm} km.`);
  }

  return {
    direccionNormalizada: geo.direccion || dir,
    lat: geo.lat,
    lng: geo.lng,
    distanciaKm: Number(distancia.toFixed(2)),
  };
}
