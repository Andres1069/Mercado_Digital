// frontend/src/components/errors/ErrorActions.jsx
// Hook con las acciones "inteligentes" (dependen de router/auth) que alimentan
// las props de <ErrorPage> cuando el error se reporta vía ErrorContext.
// No se usa desde ErrorBoundary: ese fallback puede montarse fuera de
// BrowserRouter/AuthProvider si toda la app se cae, así que usa navegación nativa.
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function rutaInicioPorRol(usuario) {
  if (!usuario) return "/";
  if (usuario.rol === "Administrador") return "/admin/dashboard";
  if (usuario.rol === "Empleado") return "/empleado/dashboard";
  return "/tienda";
}

export function useErrorActions() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  return {
    inicioHref: rutaInicioPorRol(usuario),
    onVolver: () => navigate(-1),
    onIniciarSesion: () => {
      cerrarSesion?.();
      navigate("/login");
    },
  };
}
