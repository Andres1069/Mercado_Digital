import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Mercado Digital";

const TITULOS = {
  // Públicas
  "/":                        "Inicio",
  "/login":                   "Iniciar sesión",
  "/registro":                "Registro",

  // Cliente
  "/tienda":                  "Tienda",
  "/carrito":                 "Carrito de compras",
  "/mis-pedidos":             "Mis pedidos",
  "/perfil":                  "Mi perfil",

  // Pago
  "/pago/simulado":           "Pasarela de pago",
  "/pago/qr":                 "Pago con MercadoPago",
  "/pago/resultado":          "Resultado del pago",

  // Domicilio
  "/domicilio/crear":         "Registrar domicilio",
  "/domicilio/historial":     "Historial de domicilios",
  "/domicilio/seguimiento":   "Seguimiento de entrega",

  // Admin
  "/admin/dashboard":         "Admin · Dashboard",
  "/admin/productos":         "Admin · Productos",
  "/admin/ofertas":           "Admin · Ofertas",
  "/admin/pedidos":           "Admin · Pedidos",
  "/admin/ventas":            "Admin · Ventas",
  "/admin/inventario":        "Admin · Inventario",
  "/admin/domicilios":        "Admin · Domicilios",
  "/admin/reportes":          "Admin · Reportes",
  "/admin/pagos":             "Admin · Pagos",
  "/admin/usuarios":          "Admin · Usuarios",
  "/admin/categorias":        "Admin · Categorías",
  "/admin/proveedores":       "Admin · Proveedores",

  // Empleado
  "/empleado/dashboard":      "Panel del empleado",
  "/empleado/productos":      "Empleado · Productos",
  "/empleado/pedidos":        "Empleado · Pedidos",
  "/empleado/ventas":         "Empleado · Ventas",
  "/empleado/inventario":     "Empleado · Inventario",
  "/empleado/domicilios":     "Empleado · Domicilios",
  "/empleado/reportes":       "Empleado · Reportes",
};

function tituloPorRuta(pathname) {
  if (TITULOS[pathname]) return TITULOS[pathname];
  if (pathname.startsWith("/admin/"))    return "Admin";
  if (pathname.startsWith("/empleado/")) return "Empleado";
  if (pathname.startsWith("/pago/"))     return "Pago";
  if (pathname.startsWith("/domicilio/")) return "Domicilio";
  return "";
}

export default function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = tituloPorRuta(pathname);
    // Muestra solo la sección actual en la pestaña para evitar un título repetitivo.
    document.title = page ? `${page} — ${APP_NAME}` : APP_NAME;
  }, [pathname]);

  return null;
}
