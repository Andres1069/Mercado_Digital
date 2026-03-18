export function aplicarOfertas(productos = [], ofertas = []) {
  const ofertasPorProducto = new Map(
    (ofertas || [])
      .filter((o) => o?.Cod_Producto)
      .map((o) => [Number(o.Cod_Producto), o])
  );

  return (productos || []).map((p) => {
    const oferta = ofertasPorProducto.get(Number(p?.Cod_Producto));
    if (!oferta) return p;
    return {
      ...p,
      Porcentaje_Descuento: Number(oferta.Porcentaje_Descuento || 0),
      precio_oferta: Number(oferta.precio_oferta || p.Precio),
      imagen_url: oferta.imagen_url || p.Imagen_url || "",
    };
  });
}

