// frontend/src/components/ProductoCard.jsx
import { resolverImagen } from "../services/api";

export default function ProductoCard({ producto, onAgregar }) {
  const tieneOferta  = !!producto.Porcentaje_Descuento;
  const precioFinal  = tieneOferta ? producto.precio_oferta : producto.Precio;
  const sinStock     = Number(producto.Cantidad ?? producto.Stock ?? 0) <= 0;
  const tieneBanner  = tieneOferta && !!producto.oferta_banner;
  const imagen       = resolverImagen(tieneBanner ? producto.oferta_banner : (producto.imagen_url || producto.Imagen_url));
  const imagenZoom   = tieneBanner ? 1 : Number(producto.imagen_zoom ?? producto.Imagen_zoom ?? 1);
  const imagenPosX   = tieneBanner ? 50 : Number(producto.imagen_pos_x ?? producto.Imagen_pos_x ?? 50);
  const imagenPosY   = tieneBanner ? 50 : Number(producto.imagen_pos_y ?? producto.Imagen_pos_y ?? 50);

  const emojiCategoria = {
    "Aseo Personal":"🧴","Lacteos":"🥛","Panaderia":"🍞","Bebidas":"🥤",
    "Granos":"🌾","Snacks":"🍿","Cereales":"🥣","Aceites":"🫙","Dulces":"🍬","Productos Hogar":"🏠",
  };
  const emoji = emojiCategoria[producto.categoria] || "🛒";

  const fondos = {
    "Aseo Personal":"#F5F7F5","Lacteos":"rgba(107,142,78,0.08)","Panaderia":"#F5F7F5",
    "Bebidas":"#F5F7F5","Granos":"rgba(107,142,78,0.08)","Snacks":"#F5F7F5",
    "Cereales":"#F5F7F5","Aceites":"#F5F7F5","Dulces":"#F5F7F5","Productos Hogar":"rgba(178,197,178,0.15)",
  };
  const fondoImg = fondos[producto.categoria] || "#f9fafb";

  return (
    <div className={"bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 " + (sinStock ? "opacity-60" : "hover:-translate-y-1")}>
      <div className="relative h-36 sm:h-48 flex items-center justify-center overflow-hidden" style={{ backgroundColor: fondoImg }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.85), transparent 55%)" }}
        />
        {imagen
          ? <img
              src={imagen}
              alt={producto.Nombre}
              className="relative z-10 h-full w-full object-cover p-1 drop-shadow-sm"
              loading="lazy"
              style={{
                transform: `scale(${imagenZoom})`,
                transformOrigin: `${imagenPosX}% ${imagenPosY}%`,
              }}
            />
          : <span className="text-6xl">{emoji}</span>
        }
        {tieneOferta && (
          <>
            <span className="absolute top-2 left-2 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow"
              style={{ background: "linear-gradient(135deg,#6B8E4E,#3C5148)" }}>
              -{producto.Porcentaje_Descuento}%
            </span>
            <span className="absolute top-2 right-2 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow"
              style={{ background: "linear-gradient(135deg,#f87171,#3C5148)" }}>
              FLASH
            </span>
          </>
        )}
        {sinStock && (
          <span className="absolute top-2 right-2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">Agotado</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {producto.oferta_titulo
          ? <span className="text-xs font-extrabold mb-1 truncate" style={{ color: "#6B8E4E" }}>{producto.oferta_titulo}</span>
          : <span className="text-xs font-bold mb-1" style={{ color: "#3C5148" }}>{producto.categoria}</span>
        }
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 leading-snug text-sm">{producto.Nombre}</h3>
        {(producto.oferta_descripcion || producto.Descripcion) && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{producto.oferta_descripcion || producto.Descripcion}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold" style={{ color: "#6B8E4E" }}>
              ${Number(precioFinal).toLocaleString("es-CO")}
            </span>
            {tieneOferta && (
              <span className="text-xs text-gray-400 line-through">${Number(producto.Precio).toLocaleString("es-CO")}</span>
            )}
          </div>
          <button onClick={() => onAgregar && onAgregar(producto)} disabled={sinStock}
            className="w-full text-white font-semibold py-2.5 rounded-xl transition text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
            style={{ background: sinStock ? "#d1d5db" : "linear-gradient(135deg,#6B8E4E,#3C5148)" }}>
            {sinStock ? "Sin stock" : "+ Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
