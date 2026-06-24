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

function limpiarDireccionParaMapa(texto) {
  let limpio = String(texto || "").trim();
  // Quitar todo después de una coma (ej: ", Torre 3, Apto 401")
  limpio = limpio.split(",")[0];
  // Quitar detalles comunes de apartamentos y casas
  limpio = limpio.replace(/\b(torre|apto|apartamento|casa|interior|int|bloque|mz|manzana|lote)\b.*$/i, "");
  // Quitar el símbolo '#' que confunde a Nominatim
  limpio = limpio.replace(/#/g, " ");
  // Quitar el guion si está separado por espacios, o reemplazarlo por espacio
  limpio = limpio.replace(/-/g, " ");
  // Limpiar espacios dobles
  return limpio.replace(/\s+/g, " ").trim();
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

  const direccionLimpia = limpiarDireccionParaMapa(dir);
  const geo = await geocodificarDireccion(direccionLimpia, barrioPermitido);
  
  // FALLBACK DEFINITIVO: Si el mapa no encuentra la dirección (falla muy común en Nominatim),
  // en lugar de bloquear la compra del usuario, confiamos en su texto y usamos las coordenadas centrales del barrio.
  if (!geo) {
    return {
      direccionNormalizada: dir, // Guardamos la que él escribió originalmente
      lat: CHICALA_SUR_CENTER.lat,
      lng: CHICALA_SUR_CENTER.lng,
      distanciaKm: 0,
    };
  }

  const punto = { lat: geo.lat, lng: geo.lng };
  const dentroDelBarrio = puntoEnPoligono(punto, CHICALA_SUR_POLYGON);
  const distancia = distanciaKm(CHICALA_SUR_CENTER, punto);

  if (!dentroDelBarrio) {
    throw new Error("La dirección calculada por el mapa queda fuera de la zona de cobertura. Por favor verifica.");
  }

  if (distancia > maxDistanciaKm) {
    throw new Error(`La dirección supera la distancia permitida de ${maxDistanciaKm} km.`);
  }

  return {
    direccionNormalizada: geo.direccion || dir,
    lat: geo.lat,
    lng: geo.lng,
    distanciaKm: Number(distancia.toFixed(2)),
  };
}
