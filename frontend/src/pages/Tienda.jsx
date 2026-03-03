import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductoCard from "../components/ProductoCard";
import { productoService, ofertaService, categoriaService } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Tienda() {
  const [searchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [catActiva, setCatActiva] = useState(null);
  const [verOfertas, setVerOfertas] = useState(searchParams.get("ofertas") === "1");
  const [notif, setNotif] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    cargarDatos();
  }, [catActiva, buscar]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats, ofrs] = await Promise.all([
        productoService.listar({ categoria: catActiva, buscar }),
        categoriaService.listar(),
        ofertaService.listar(),
      ]);

      const listaProductos = prods.productos || [];
      const listaOfertas = ofrs.ofertas || [];

      const ofertasPorProducto = new Map(
        listaOfertas
          .filter((o) => o.Cod_Producto)
          .map((o) => [Number(o.Cod_Producto), o])
      );

      const productosConOferta = listaProductos.map((p) => {
        const oferta = ofertasPorProducto.get(Number(p.Cod_Producto));
        if (!oferta) return p;
        return {
          ...p,
          Porcentaje_Descuento: Number(oferta.Porcentaje_Descuento || 0),
          precio_oferta: Number(oferta.precio_oferta || p.Precio),
          imagen_url: oferta.imagen_url || p.Imagen_url || "",
        };
      });

      setProductos(productosConOferta);
      setCategorias(cats.categorias || []);
      setOfertas(listaOfertas);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    addItem(producto);
    setNotif("Producto agregado: " + producto.Nombre);
    setTimeout(() => setNotif(""), 2200);
  };

  const productosFiltrados = verOfertas ? productos.filter((p) => p.Porcentaje_Descuento) : productos;
  const coloresCat = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#10b981", "#ef4444", "#3b82f6"];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {notif && (
        <div
          className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {notif}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {ofertas.length > 0 && !verOfertas && (
          <div
            className="relative overflow-hidden rounded-3xl mb-8 p-8 text-white shadow-2xl"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)" }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 bg-white" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 bg-white" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-widest">
                  Ofertas especiales
                </span>
                <h2 className="text-3xl font-extrabold leading-tight mb-1">
                  Hasta {Math.max(...ofertas.map((o) => Number(o.Porcentaje_Descuento)))}% de descuento
                </h2>
                <p className="text-white/80 text-sm">{ofertas.length} promociones activas por tiempo limitado</p>
              </div>
              <button
                onClick={() => setVerOfertas(true)}
                className="shrink-0 bg-white font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform text-sm shadow-lg"
                style={{ color: "#ec4899" }}
              >
                Ver ofertas
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">Q</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setCatActiva(null);
              }}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-400 bg-gray-50 transition text-sm"
            />
          </div>
          {verOfertas && (
            <button
              onClick={() => setVerOfertas(false)}
              className="px-5 py-2 border-2 border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Todos
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <button
            onClick={() => {
              setCatActiva(null);
              setVerOfertas(false);
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border-2"
            style={
              !catActiva && !verOfertas
                ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", borderColor: "transparent" }
                : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }
            }
          >
            Todos
          </button>
          <button
            onClick={() => {
              setVerOfertas(true);
              setCatActiva(null);
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border-2"
            style={
              verOfertas
                ? { background: "linear-gradient(135deg,#f97316,#ec4899)", color: "white", borderColor: "transparent" }
                : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }
            }
          >
            En oferta
          </button>
          {categorias.map((cat, i) => (
            <button
              key={cat.Cod_Categoria}
              onClick={() => {
                setCatActiva(cat.Cod_Categoria);
                setVerOfertas(false);
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border-2"
              style={
                catActiva === cat.Cod_Categoria
                  ? { backgroundColor: coloresCat[i % coloresCat.length], color: "white", borderColor: "transparent" }
                  : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }
              }
            >
              {cat.Nombre}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-gray-800">
            {verOfertas
              ? "Productos en oferta"
              : catActiva
              ? categorias.find((c) => c.Cod_Categoria === catActiva)?.Nombre
              : "Todos los productos"}
          </h2>
          <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{productosFiltrados.length} productos</span>
        </div>

        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100">
                <div className="bg-gray-100 h-44 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="bg-gray-100 h-3 rounded-full w-1/2" />
                  <div className="bg-gray-100 h-4 rounded-full" />
                  <div className="bg-gray-100 h-8 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">:(</div>
            <p className="text-lg font-semibold text-gray-600">No se encontraron productos</p>
            <p className="text-sm mt-1">Intenta con otra busqueda o categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((p) => (
              <ProductoCard key={p.Cod_Producto} producto={p} onAgregar={agregarAlCarrito} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
