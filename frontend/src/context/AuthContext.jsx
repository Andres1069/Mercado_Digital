// frontend/src/context/AuthContext.jsx
// Contexto global de autenticación
// Guarda el usuario y token en localStorage (compartido entre pestanas del mismo navegador)
// Comportamiento:
//   - Una sola sesion por dispositivo: si otra pestana inicia sesion con otra cuenta,
//     esta pestana se sincroniza automaticamente (misma cuenta activa en todo el navegador).
//   - Una sola sesion por cuenta entre dispositivos: el backend invalida el token anterior
//     via SesionId. El heartbeat detecta el 401 y cierra la sesion aqui.
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al arrancar: carga la sesion guardada en localStorage y la valida contra el backend.
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
        // Valida el token contra el backend. Si el SesionId cambio (inicio en otro
        // dispositivo) o la cuenta fue desactivada, el backend retorna 401/403
        // y api.js limpia el localStorage y redirige al login automaticamente.
        const res = await authService.me();
        const u = res.usuario || null;
        if (!cancelado) {
          setUsuario(u);
          localStorage.setItem("md_usuario", JSON.stringify(u));
        }
      } catch {
        // El error 401 ya fue manejado en api.js (limpia storage y redirige).
        // Aqui solo limpiamos el estado de React por si acaso.
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

  // Sincronizacion entre pestanas del MISMO navegador (mismo dispositivo).
  // El evento "storage" solo se dispara en las OTRAS pestanas cuando localStorage cambia.
  // Asi: si la pestana A inicia sesion como admin, la pestana B (cuenta de usuario) lo detecta
  // y adopta la nueva sesion — garantizando una sola cuenta activa por dispositivo.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "md_token") {
        if (!e.newValue) {
          // Otra pestana cerro sesion: cerrar aqui tambien.
          setToken(null);
          setUsuario(null);
        } else {
          // Otra pestana inicio una nueva sesion: adoptar esa sesion en esta pestana.
          const nuevoUsuario = localStorage.getItem("md_usuario");
          setToken(e.newValue);
          setUsuario(nuevoUsuario ? JSON.parse(nuevoUsuario) : null);
        }
      }
      if (e.key === "md_usuario" && e.newValue) {
        try {
          setUsuario(JSON.parse(e.newValue));
        } catch { /* silent */ }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Heartbeat: valida la sesion cada 45 s para detectar si el SesionId cambio en el backend.
  // Esto expulsa al usuario si la MISMA cuenta inicio sesion en otro dispositivo diferente.
  useEffect(() => {
    if (!token) return;

    const id = setInterval(async () => {
      try {
        const res = await authService.me();
        const u = res.usuario || null;
        setUsuario(u);
        localStorage.setItem("md_usuario", JSON.stringify(u));
      } catch {
        // api.js ya limpio localStorage y redirige al login con reason=session.
        setToken(null);
        setUsuario(null);
      }
    }, 45000);

    return () => clearInterval(id);
  }, [token]);

  // Guardar sesion tras login exitoso.
  // Al escribir en localStorage las otras pestanas del mismo navegador reciben
  // el evento "storage" y sincronizan su estado automaticamente.
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

  // Cerrar sesion: limpia estado y localStorage.
  // Las otras pestanas del mismo navegador reciben el evento "storage" y cierran tambien.
  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("md_token");
    localStorage.removeItem("md_usuario");
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
