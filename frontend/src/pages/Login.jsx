// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ correo: "", contrasena: "" });
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await authService.login(form.correo, form.contrasena);
      iniciarSesion(res.token, res.usuario);
      const rol = res.usuario.rol;
      if (rol === "Administrador" || rol === "Empleado") {
        navigate("/admin/dashboard");
      } else {
        navigate("/tienda");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #A8C898 0%, #74B495 50%, #877FD7 100%)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-3xl font-bold" style={{ color: "#74B495" }}>Mercado Digital</h1>
          <p className="text-gray-500 mt-1">Ingresa a tu cuenta</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg mb-6 text-sm border"
            style={{ backgroundColor: "#fdf0f5", borderColor: "#E1A7CA", color: "#9b5b7a" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email" name="correo" value={form.correo}
              onChange={handleChange} required placeholder="tucorreo@ejemplo.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition"
              onFocus={e => e.target.style.borderColor = "#A8C898"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password" name="contrasena" value={form.contrasena}
              onChange={handleChange} required placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition"
              onFocus={e => e.target.style.borderColor = "#A8C898"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <button type="submit" disabled={cargando}
            className="w-full text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#74B495" }}
            onMouseEnter={e => e.target.style.backgroundColor = "#5a9d7e"}
            onMouseLeave={e => e.target.style.backgroundColor = "#74B495"}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium hover:underline" style={{ color: "#74B495" }}>
            Regístrate aquí
          </Link>
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          <Link to="/" className="hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
