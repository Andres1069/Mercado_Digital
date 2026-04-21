// frontend/src/context/AuthContext.jsx
// Contexto global de autenticación
// Guarda el usuario y token en sessionStorage (aislado por pestaña del navegador).
// Cada pestaña mantiene su propia sesion independiente, permitiendo tener
// admin, empleado y cliente abiertos en simultaneo sin conflictos.
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al arrancar: carga la sesion guardada en sessionStorage (exclusiva de esta pestana)
  // y la valida contra el backend.
  useEffect(() => {
    let cancelado = false;

    const inicializar = async () => {
      const tokenGuardado   = sessionStorage.getItem("md_token");
      const usuarioGuardado = sessionStorage.getItem("md_usuario");

      if (!tokenGuardado || !usuarioGuardado) {
        if (!cancelado) setCargando(false);
        return;
      }

      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));

      try {
        // Valida el token contra el backend. Si la cuenta fue desactivada o el
        // token expiro, el backend retorna 401 y api.js limpia sessionStorage
        // y redirige al login automaticamente.
        const res = await authService.me();
        const u = res.usuario || null;
        if (!cancelado) {
          setUsuario(u);
          sessionStorage.setItem("md_usuario", JSON.stringify(u));
        }
      } catch {
        // El error 401 ya fue manejado en api.js.
        if (!cancelado) {
          setToken(null);
          setUsuario(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    inicializar();
    return () => { cancelado = true; };
  }, []);

  // Heartbeat: valida la sesion cada 45 s para detectar tokens expirados o
  // cuentas desactivadas desde el backend.
  useEffect(() => {
    if (!token) return;

    const id = setInterval(async () => {
      try {
        const res = await authService.me();
        const u = res.usuario || null;
        setUsuario(u);
        sessionStorage.setItem("md_usuario", JSON.stringify(u));
      } catch {
        // api.js ya limpio sessionStorage y redirige al login con reason=session.
        setToken(null);
        setUsuario(null);
      }
    }, 45000);

    return () => clearInterval(id);
  }, [token]);

  // Guardar sesion tras login exitoso en sessionStorage (solo esta pestana).
  const iniciarSesion = (nuevoToken, nuevoUsuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    sessionStorage.setItem("md_token", nuevoToken);
    sessionStorage.setItem("md_usuario", JSON.stringify(nuevoUsuario));
  };

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    sessionStorage.setItem("md_usuario", JSON.stringify(nuevoUsuario));
  };

  // Cerrar sesion: limpia estado y sessionStorage solo de esta pestana.
  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    sessionStorage.removeItem("md_token");
    sessionStorage.removeItem("md_usuario");
  };

  // Helpers de rol
  const esAdmin     = () => usuario?.rol === "Administrador";
  const esCliente   = () => usuario?.rol === "Cliente";
  const esEmpleado  = () => usuario?.rol === "Empleado";
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
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
