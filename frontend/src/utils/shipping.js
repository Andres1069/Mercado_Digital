export const DEFAULT_SHIPPING_RULES = {
  umbralEnvioGratis: 20000,
  maxDistanciaKm: 3,
  tarifasPorRangoKm: [
    { maxKm: 0.5, costo: 1000 },
    { maxKm: 1, costo: 1500 },
    { maxKm: 2, costo: 2000 },
    { maxKm: 3, costo: 3000 },
  ],
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function calcularCostoEnvio(carrito = [], distanciaKm = 0, reglas = DEFAULT_SHIPPING_RULES) {
  const subtotal = carrito.reduce((acc, item) => {
    const precio = toNumber(item?.precio);
    const cantidad = toNumber(item?.cantidad, 1);
    return acc + precio * cantidad;
  }, 0);
  const envioGratis = subtotal >= toNumber(reglas.umbralEnvioGratis, 20000);

  let costoEnvio = 0;
  if (!envioGratis) {
    const distancia = toNumber(distanciaKm);
    const rango = (reglas.tarifasPorRangoKm || []).find((item) => distancia <= toNumber(item.maxKm));
    costoEnvio = rango ? toNumber(rango.costo) : 0;
  }

  const distanciaMaxima = toNumber(reglas.maxDistanciaKm, 3);
  const fueraDeCobertura = toNumber(distanciaKm) > distanciaMaxima;
  const total = Math.round(subtotal + costoEnvio);

  return {
    subtotal: Math.round(subtotal),
    costoEnvio,
    total,
    envioGratis,
    fueraDeCobertura,
    distanciaKm: toNumber(distanciaKm),
  };
}
