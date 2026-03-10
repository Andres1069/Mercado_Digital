// frontend/src/context/AuthContext.jsx
// Contexto global de autenticación
// Guarda el usuario y token en memoria + localStorage

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(null);
  const [cargando, setCargando] = useState(true); // Mientras verifica sesión guardada

  // Al arrancar la app, revisar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado   = localStorage.getItem("md_token");
    const usuarioGuardado = localStorage.getItem("md_usuario");

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

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
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
