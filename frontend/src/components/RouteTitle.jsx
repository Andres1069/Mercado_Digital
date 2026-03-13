import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Mercado Digital";

function tituloPorRuta(pathname) {
  if (pathname === "/") return "Inicio";
  if (pathname === "/login") return "Iniciar sesion";
  if (pathname === "/registro") return "Registro";

  if (pathname === "/tienda") return "Tienda";
  if (pathname === "/carrito") return "Carrito";
  if (pathname === "/mis-pedidos") return "Mis pedidos";
  if (pathname === "/perfil") return "Mi perfil";

  if (pathname === "/admin/dashboard") return "Admin · Dashboard";
  if (pathname === "/admin/productos") return "Admin · Productos";
  if (pathname === "/admin/ofertas") return "Admin · Ofertas";
  if (pathname === "/admin/pedidos") return "Admin · Pedidos";
  if (pathname === "/admin/inventario") return "Admin · Inventario";
  if (pathname === "/admin/reportes") return "Admin · Reportes";
  if (pathname === "/admin/usuarios") return "Admin · Usuarios";

  if (pathname.startsWith("/admin/")) return "Admin";

  return "";
}

export default function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = tituloPorRuta(pathname);
    // Muestra solo la seccion actual en la pestaña para evitar un titulo repetitivo.
    document.title = page || APP_NAME;
  }, [pathname]);

  return null;
}
