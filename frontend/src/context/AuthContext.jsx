// frontend/src/context/AuthContext.jsx
// Contexto global de autenticación
// Guarda el usuario y token en memoria + localStorage

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(null);
  const [cargando, setCargando] = useState(true); // Mientras verifica sesión guardada

  // Al arrancar la app:
  // 1) Carga sesion local (localStorage)
  // 2) Valida el token contra la API (/auth/me) para evitar "sesiones fantasma"
  //    (por ejemplo, si el backend invalida la sesion por inicio en otro dispositivo).
  useEffect(() => {
    let cancelado = false;

    const inicializar = async () => {
      const tokenGuardado   = localStorage.getItem("md_token");
      const usuarioGuardado = localStorage.getItem("md_usuario");

      if (!tokenGuardado || !usuarioGuardado) {
        if (!cancelado) setCargando(false);
        return;
      }

      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));

      try {
        const res = await authService.me();
        const u = res.usuario || null;
        if (!cancelado) {
          setUsuario(u);
          localStorage.setItem("md_usuario", JSON.stringify(u));
        }
      } catch {
        if (!cancelado) {
          setToken(null);
          setUsuario(null);
          localStorage.removeItem("md_token");
          localStorage.removeItem("md_usuario");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    inicializar();
    return () => { cancelado = true; };
  }, []);

  // Heartbeat: valida periodicamente la sesion para expulsar al usuario si inicia sesion en otro dispositivo.
  useEffect(() => {
    if (!token) return;

    const id = setInterval(async () => {
      try {
        const res = await authService.me();
        const u = res.usuario || null;
        setUsuario(u);
        localStorage.setItem("md_usuario", JSON.stringify(u));
      } catch {
        setToken(null);
        setUsuario(null);
        localStorage.removeItem("md_token");
        localStorage.removeItem("md_usuario");
      }
    }, 45000);

    return () => clearInterval(id);
  }, [token]);

  // Guardar sesión tras login exitoso
  const iniciarSesion = (nuevoToken, nuevoUsuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem("md_token", nuevoToken);
    localStorage.setItem("md_usuario", JSON.stringify(nuevoUsuario));
  };

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    localStorage.setItem("md_usuario", JSON.stringify(nuevoUsuario));
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("md_token");
    localStorage.removeItem("md_usuario");
  };

  // Helpers de rol
  const esAdmin    = () => usuario?.rol === "Administrador";
  const esCliente  = () => usuario?.rol === "Cliente";
  const esEmpleado = () => usuario?.rol === "Empleado";
  const esProveedor = () => usuario?.rol === "Proveedor";
  const estaLogueado = () => !!usuario;

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      cargando,
      iniciarSesion,
      actualizarUsuario,
      cerrarSesion,
      esAdmin,
      esCliente,
      esEmpleado,
      esProveedor,
      estaLogueado,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
