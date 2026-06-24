// frontend/src/components/errors/errorCatalog.js
import {
  FileWarning,
  Lock,
  ShieldAlert,
  SearchX,
  ServerCrash,
  DatabaseZap,
  AlertTriangle,
  WifiOff,
} from "lucide-react";

// Cada entrada define cómo se ve y se comporta una categoría de error en <ErrorPage>.
// "acciones" es la lista de botones disponibles para ese tipo (ErrorPage decide cuáles
// renderizar según el contexto: sesión, rol, si hay un retry, etc).
export const ERROR_CATALOG = {
  BAD_REQUEST: {
    codigo: "400",
    Icono: FileWarning,
    titulo: "Datos inválidos",
    mensaje: "Los datos enviados no son válidos. Verifica la información e inténtalo nuevamente.",
    acciones: ["volver", "reintentar"],
  },
  UNAUTHORIZED: {
    codigo: "401",
    Icono: Lock,
    titulo: "Inicia sesión para continuar",
    mensaje: "Debes iniciar sesión para acceder a este recurso.",
    acciones: ["iniciarSesion", "inicio"],
  },
  FORBIDDEN: {
    codigo: "403",
    Icono: ShieldAlert,
    titulo: "No tienes permisos",
    mensaje: "No tienes permisos para acceder a esta sección.",
    acciones: ["inicio", "volver"],
  },
  NOT_FOUND: {
    codigo: "404",
    Icono: SearchX,
    titulo: "Página no encontrada",
    mensaje: "No pudimos encontrar la página que estás buscando.",
    acciones: ["inicio", "volver"],
  },
  SERVER_ERROR: {
    codigo: "500",
    Icono: ServerCrash,
    titulo: "Error interno del servidor",
    mensaje: "Ha ocurrido un error interno en el servidor. Intenta nuevamente más tarde.",
    acciones: ["reintentar", "soporte"],
  },
  DB_CONNECTION_ERROR: {
    codigo: "BD",
    Icono: DatabaseZap,
    titulo: "Sin conexión con la base de datos",
    mensaje: "El sistema no puede conectarse a la base de datos en este momento.",
    acciones: ["reintentar", "soporte"],
    critico: true,
  },
  SERVICE_UNAVAILABLE: {
    codigo: "503",
    Icono: AlertTriangle,
    titulo: "Servicio no disponible",
    mensaje: "Uno de nuestros servicios externos está temporalmente indisponible. Intenta más tarde.",
    acciones: ["reintentar", "soporte"],
  },
  NETWORK_ERROR: {
    codigo: "SIN RED",
    Icono: WifiOff,
    titulo: "Sin conexión a internet",
    mensaje: "No detectamos conexión a internet. Revisa tu red e inténtalo de nuevo.",
    acciones: ["reintentar"],
  },
};

// Convierte un status HTTP en un tipo del catálogo cuando el backend no envía "code".
export function tipoDesdeStatus(status) {
  switch (status) {
    case 400: return "BAD_REQUEST";
    case 401: return "UNAUTHORIZED";
    case 403: return "FORBIDDEN";
    case 404: return "NOT_FOUND";
    default: return "SERVER_ERROR";
  }
}

export function resolverTipo(codigoBackend, status) {
  if (codigoBackend && ERROR_CATALOG[codigoBackend]) return codigoBackend;
  return tipoDesdeStatus(status);
}
