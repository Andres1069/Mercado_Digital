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
  const [buscarDebounced, setBuscarDebounced] = useState("");
  const [catActiva, setCatActiva] = useState(null);
  const [verOfertas, setVerOfertas] = useState(searchParams.get("ofertas") === "1");
  const [notif, setNotif] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    const t = setTimeout(() => setBuscarDebounced(buscar), 400);
    return () => clearTimeout(t);
  }, [buscar]);

  useEffect(() => {
    cargarDatos();
  }, [catActiva, buscarDebounced]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats, ofrs] = await Promise.all([
        productoService.listar({ categoria: catActiva, buscar: buscarDebounced }),
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
          imagen_url: oferta.imagen_banner || oferta.imagen_url || p.Imagen_url || "",
          oferta_titulo: oferta.Titulo || "",
          oferta_descripcion: oferta.Descripcion || "",
          oferta_banner: oferta.imagen_banner || "",
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

  const productosFiltrados = (() => {
    let lista = verOfertas ? productos.filter((p) => p.Porcentaje_Descuento) : productos;
    if (buscar.trim()) {
      const q = buscar.trim().toLowerCase();
      lista = lista.filter((p) =>
        p.Nombre.toLowerCase().includes(q) ||
        (p.Descripcion || "").toLowerCase().includes(q) ||
        (p.categoria || "").toLowerCase().includes(q)
      );
    }
    return lista;
  })();
  const coloresCat = ["#6B8E4E", "#06b6d4", "#3C5148", "#6B8E4E", "#3C5148", "#f59e0b", "#6B8E4E", "#6B8E4E", "#ef4444", "#3C5148"];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {notif && (
        <div
          className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6B8E4E, #3C5148)" }}
        >
          {notif}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Banner de ofertas */}
        {ofertas.length > 0 && !verOfertas && (
          <div
            className="relative overflow-hidden rounded-3xl mb-8 p-7 text-white shadow-xl"
            style={{ background: "linear-gradient(135deg, #6B8E4E 0%, #3C5148 50%, #1B2727 100%)" }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 bg-white" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 bg-white" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-widest">
                  Ofertas especiales
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-1">
                  Hasta {Math.max(...ofertas.map((o) => Number(o.Porcentaje_Descuento)))}% de descuento
                </h2>
                <p className="text-white/80 text-sm">{ofertas.length} promociones activas por tiempo limitado</p>
              </div>
              <button
                onClick={() => setVerOfertas(true)}
                className="shrink-0 bg-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl hover:scale-105 transition-transform text-sm shadow-lg"
                style={{ color: "#6B8E4E" }}
              >
                Ver ofertas
              </button>
            </div>
          </div>
        )}

        {/* Layout principal: sidebar + productos */}
        <div className="flex gap-6 items-start">

          {/* Sidebar izquierdo */}
          <aside className="hidden md:flex flex-col gap-4 w-56 flex-shrink-0 sticky top-4">

            {/* Barra de búsqueda */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={buscar}
                onChange={(e) => {
                  setBuscar(e.target.value);
                  setCatActiva(null);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-400 bg-white text-sm shadow-sm transition"
              />
            </div>

            {/* Panel de categorías */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Categorías</p>
              </div>
              <div
                className="p-2 flex flex-col gap-0.5 max-h-[420px] overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
              >
                <button
                  onClick={() => { setCatActiva(null); setVerOfertas(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition"
                  style={
                    !catActiva && !verOfertas
                      ? { backgroundColor: "rgba(99,102,241,0.1)", color: "#4f46e5" }
                      : { color: "#374151" }
                  }
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: !catActiva && !verOfertas ? "#6B8E4E" : "#d1d5db" }} />
                  Todos
                </button>

                {ofertas.length > 0 && (
                  <button
                    onClick={() => { setVerOfertas(true); setCatActiva(null); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition"
                    style={
                      verOfertas
                        ? { backgroundColor: "rgba(249,115,22,0.1)", color: "#ea580c" }
                        : { color: "#374151" }
                    }
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: verOfertas ? "#6B8E4E" : "#d1d5db" }} />
                    En oferta
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "#ea580c" }}>
                      {ofertas.length}
                    </span>
                  </button>
                )}

                <div className="my-1 border-t border-gray-100" />

                {categorias.map((cat, i) => {
                  const activa = catActiva === cat.Cod_Categoria;
                  const color = coloresCat[i % coloresCat.length];
                  return (
                    <button
                      key={cat.Cod_Categoria}
                      onClick={() => { setCatActiva(cat.Cod_Categoria); setVerOfertas(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition"
                      style={
                        activa
                          ? { backgroundColor: color + "18", color }
                          : { color: "#374151" }
                      }
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activa ? color : "#d1d5db" }} />
                      {cat.Nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">

            {/* Búsqueda móvil */}
            <div className="md:hidden relative mb-4">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); setCatActiva(null); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-400 bg-white text-sm shadow-sm"
              />
            </div>

            {/* Categorías móvil (scroll horizontal) */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
              <button
                onClick={() => { setCatActiva(null); setVerOfertas(false); }}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border-2 transition flex-shrink-0"
                style={!catActiva && !verOfertas ? { background: "linear-gradient(135deg,#6B8E4E,#3C5148)", color: "white", borderColor: "transparent" } : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }}
              >
                Todos
              </button>
              {ofertas.length > 0 && (
                <button
                  onClick={() => { setVerOfertas(true); setCatActiva(null); }}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border-2 transition flex-shrink-0"
                  style={verOfertas ? { background: "linear-gradient(135deg,#6B8E4E,#3C5148)", color: "white", borderColor: "transparent" } : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }}
                >
                  En oferta
                </button>
              )}
              {categorias.map((cat, i) => (
                <button
                  key={cat.Cod_Categoria}
                  onClick={() => { setCatActiva(cat.Cod_Categoria); setVerOfertas(false); }}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border-2 transition flex-shrink-0"
                  style={catActiva === cat.Cod_Categoria ? { backgroundColor: coloresCat[i % coloresCat.length], color: "white", borderColor: "transparent" } : { backgroundColor: "white", color: "#666", borderColor: "#e5e7eb" }}
                >
                  {cat.Nombre}
                </button>
              ))}
            </div>

            {/* Encabezado resultados */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-gray-800">
                {verOfertas ? "Productos en oferta" : catActiva ? categorias.find((c) => c.Cod_Categoria === catActiva)?.Nombre : "Todos los productos"}
              </h2>
              <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{productosFiltrados.length} productos</span>
            </div>

            {/* Grid de productos */}
            {cargando ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productosFiltrados.map((p) => (
                  <ProductoCard key={p.Cod_Producto} producto={p} onAgregar={agregarAlCarrito} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
