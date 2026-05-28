import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import { cargarLeaflet, geocodificarDireccion, puntoEnPoligono } from "../services/openStreetMap";
import { CHICALA_SUR_CENTER, CHICALA_SUR_POLYGON } from "../config/chicalaSur";
import PasswordRequirements from "../components/PasswordRequirements";

function OjoIcon({ abierto }) {
  if (abierto) return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Registro() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    num_documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    barrio: "Chicala del Sur",
    direccion: "",
    contrasena: "",
    confirmar: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
  const [coinciden, setCoinciden] = useState(null);
  const [aceptaZona, setAceptaZona] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [estadoMapa, setEstadoMapa] = useState("Cargando OpenStreetMap...");
  const mapaRef = useRef(null);
  const leafletRef = useRef(null);
  const mapaInstanciaRef = useRef(null);
  const marcadorRef = useRef(null);
  const poligonoRef = useRef(null);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);

    if (e.target.name === "direccion") {
      setUbicacion(null);
    }
    
    // Validar coincidencia de contraseñas en tiempo real
    if (e.target.name === "confirmar" || e.target.name === "contrasena") {
      if (updated.confirmar && updated.contrasena) {
        setCoinciden(updated.contrasena === updated.confirmar);
      } else {
        setCoinciden(null);
      }
    }
  };

  const validarContrasena = (contrasena) => {
    const requisitos = [
      { texto: "Minimo 8 caracteres.", cumple: (valor) => valor.length >= 8 },
      { texto: "Debe incluir al menos 1 letra mayuscula.", cumple: (valor) => /[A-Z]/.test(valor) },
      { texto: "Debe incluir al menos 1 letra minuscula.", cumple: (valor) => /[a-z]/.test(valor) },
      { texto: "Debe incluir al menos 1 numero.", cumple: (valor) => /\d/.test(valor) },
    ];
    const pendiente = requisitos.find((item) => !item.cumple(contrasena));
    return pendiente ? `La contraseña debe cumplir: ${pendiente.texto}` : "";
  };

  const actualizarUbicacion = (punto, direccion = "") => {
    const L = leafletRef.current;
    if (!L || !mapaInstanciaRef.current) return false;

    const dentro = puntoEnPoligono(punto, CHICALA_SUR_POLYGON);
    const latLng = [punto.lat, punto.lng];

    mapaInstanciaRef.current.setView(latLng, 17);

    if (!marcadorRef.current) {
      marcadorRef.current = L.circleMarker(latLng, {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: dentro ? "#16a34a" : "#dc2626",
        fillOpacity: 1,
      }).addTo(mapaInstanciaRef.current);
    } else {
      marcadorRef.current.setLatLng(latLng);
      marcadorRef.current.setStyle({ fillColor: dentro ? "#16a34a" : "#dc2626" });
    }

    const nuevaUbicacion = { lat: punto.lat, lng: punto.lng, dentro };
    setUbicacion(nuevaUbicacion);
    if (direccion) {
      setForm((prev) => ({ ...prev, direccion }));
    }
    setEstadoMapa(dentro ? "Direccion verificada dentro de Chicala del Sur." : "La direccion seleccionada esta fuera del barrio permitido.");
    return nuevaUbicacion;
  };

  const verificarDireccion = async () => {
    if (!leafletRef.current) {
      setError("OpenStreetMap no esta disponible en este momento.");
      return false;
    }
    if (!form.direccion.trim()) {
      setError("Ingresa una direccion para verificarla en el mapa.");
      return false;
    }

    try {
      setError("");
      setEstadoMapa("Buscando direccion en OpenStreetMap...");
      const resultado = await geocodificarDireccion(form.direccion);
      if (!resultado) {
        setError("No pudimos ubicar esa direccion. Intenta escribirla con calle/carrera y numero.");
        setEstadoMapa("Direccion no encontrada.");
        return false;
      }
      const nuevaUbicacion = actualizarUbicacion(resultado, resultado.direccion);
      if (!nuevaUbicacion?.dentro) {
        setError("La direccion esta fuera de Chicala del Sur. Solo se permiten registros dentro del barrio.");
      }
      return nuevaUbicacion;
    } catch (err) {
      setError(err.message || "No se pudo verificar la direccion.");
      setEstadoMapa("No se pudo consultar OpenStreetMap.");
      return false;
    }
  };

  useEffect(() => {
    let cancelado = false;

    cargarLeaflet()
      .then((L) => {
        if (cancelado || !mapaRef.current) return;

        leafletRef.current = L;
        const bounds = L.latLngBounds(CHICALA_SUR_POLYGON.map((p) => [p.lat, p.lng]));

        const mapa = L.map(mapaRef.current, {
          center: [CHICALA_SUR_CENTER.lat, CHICALA_SUR_CENTER.lng],
          zoom: 16,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapa);

        poligonoRef.current = L.polygon(CHICALA_SUR_POLYGON.map((p) => [p.lat, p.lng]), {
          color: "#dc2626",
          weight: 2,
          opacity: 0.9,
          fillColor: "#dc2626",
          fillOpacity: 0.08,
        }).addTo(mapa);

        mapa.fitBounds(bounds);
        mapaInstanciaRef.current = mapa;
        setEstadoMapa("Escribe tu direccion y presiona Verificar.");
      })
      .catch((err) => {
        setEstadoMapa(err.message || "No se pudo cargar OpenStreetMap.");
      });

    return () => {
      cancelado = true;
      if (mapaInstanciaRef.current) {
        mapaInstanciaRef.current.remove();
        mapaInstanciaRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.contrasena !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const errorPassword = validarContrasena(form.contrasena);
    if (errorPassword) {
      setError(errorPassword);
      return;
    }
    if (!aceptaZona) {
      setError("Para registrarte debes confirmar que vives en Chicala del Sur, Bogota.");
      return;
    }
    const ubicacionValidada = ubicacion?.dentro ? ubicacion : await verificarDireccion();
    if (!ubicacionValidada?.dentro) return;

    setCargando(true);
    try {
      const res = await authService.registro({
        num_documento: form.num_documento,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        telefono: form.telefono,
        barrio: "Chicala del Sur",
        direccion: form.direccion,
        latitud: ubicacionValidada.lat,
        longitud: ubicacionValidada.lng,
        contrasena: form.contrasena,
      });
      iniciarSesion(res.token, res.usuario);
      navigate("/tienda");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md lg:max-w-6xl bg-white rounded-[1rem] shadow-lg border border-gray-100 overflow-hidden lg:grid lg:grid-cols-[1.05fr,1.1fr]">
        <div
          className="px-7 py-8 text-white lg:px-10 lg:py-12 flex flex-col justify-between"
          style={{ background: "linear-gradient(155deg, #3C5148 0%, #6B8E4E 58%, #B2C5B2 100%)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">Mercado Digital</p>
            <h1 className="text-2xl lg:text-4xl font-black mt-3 leading-tight">Crea tu cuenta</h1>
            <p className="text-white/85 text-sm lg:text-base mt-3 max-w-md">
              Registra tus datos para comprar, guardar tu perfil y recibir acceso inmediato a la tienda.
            </p>
            <div className="mt-6 rounded-[0.85rem] border border-white/25 bg-white/10 px-4 py-3 text-sm text-white/90">
              Servicio exclusivo para residentes de Chicala del Sur, Bogota. Si tu direccion esta fuera del barrio, no podremos completar el registro ni el domicilio.
            </div>
          </div>


        </div>

        <div className="p-7 lg:p-9 xl:p-10">
          {error && <div className="px-4 py-3 rounded-2xl mb-6 text-sm border border-rose-200 bg-rose-50 text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-3">
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <input type="number" name="num_documento" value={form.num_documento} onChange={handleChange} required placeholder="Numero de documento" className="md-input sm:col-span-2" />
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre" className="md-input" />
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required placeholder="Apellido" className="md-input" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="Correo electronico" className="md-input sm:col-span-2" />
              <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Telefono" className="md-input" />
              <input type="text" value="Chicala del Sur (Bogota)" disabled className="md-input bg-[var(--md-surface-soft)] text-slate-600" />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  placeholder="Direccion completa en Chicala del Sur"
                  className="md-input flex-1"
                />
                <button
                  type="button"
                  onClick={verificarDireccion}
                  className="px-4 rounded-[0.85rem] border text-sm font-bold transition hover:bg-slate-50"
                  style={{ borderColor: "#B2C5B2", color: "#3C5148" }}
                >
                  Verificar
                </button>
              </div>
              <div className="h-44 overflow-hidden rounded-[0.85rem] border border-gray-200 bg-gray-100">
                <div ref={mapaRef} className="h-full w-full" />
              </div>
              <p className={`text-xs font-semibold ${ubicacion?.dentro ? "text-emerald-700" : ubicacion ? "text-rose-700" : "text-slate-500"}`}>
                {estadoMapa}
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-[0.85rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={aceptaZona}
                onChange={(e) => setAceptaZona(e.target.checked)}
                className="mt-1 h-4 w-4"
                required
              />
              <span>
                Confirmo que vivo en Chicala del Sur, Bogota, y que mi direccion pertenece a ese barrio.
              </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-3">
              <div className="relative">
                <input 
                  type={verContrasena ? "text" : "password"} 
                  name="contrasena" 
                  value={form.contrasena} 
                  onChange={handleChange} 
                  onFocus={() => setMostrarRequisitos(true)}
                  onBlur={() => setTimeout(() => setMostrarRequisitos(false), 200)}
                  required 
                  placeholder="Contraseña" 
                  className="md-input pr-12" 
                  aria-describedby="requisitos-contrasena-registro" 
                />
                <button type="button" onClick={() => setVerContrasena((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verContrasena ? "Ocultar" : "Ver"}>
                  <OjoIcon abierto={verContrasena} />
                </button>
              </div>
              <div className="relative">
                <input 
                  type={verConfirmar ? "text" : "password"} 
                  name="confirmar" 
                  value={form.confirmar} 
                  onChange={handleChange} 
                  required 
                  placeholder="Confirmar contraseña" 
                  className={`md-input pr-12 transition-all ${
                    coinciden === true 
                      ? 'border-emerald-500' 
                      : coinciden === false 
                      ? 'border-rose-500' 
                      : ''
                  }`} 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {coinciden === true && (
                    <span className="text-emerald-500 text-xl animate-pulse">✓</span>
                  )}
                  {coinciden === false && (
                    <span className="text-rose-500 text-xl animate-bounce" style={{animationDuration: '0.5s'}}>✕</span>
                  )}
                  <button type="button" onClick={() => setVerConfirmar((v) => !v)} className="text-slate-400 hover:text-slate-600 transition p-1" tabIndex={-1} aria-label={verConfirmar ? "Ocultar" : "Ver"}>
                    <OjoIcon abierto={verConfirmar} />
                  </button>
                </div>
              </div>
            </div>
            
            {form.confirmar && (
              <div className={`text-xs font-semibold transition-all ${
                coinciden === true 
                  ? 'text-emerald-600' 
                  : 'text-rose-600'
              }`}>
                {coinciden === true ? (
                  <span className="flex items-center gap-1">
                    <span className="text-lg">✓</span> Las contraseñas coinciden perfectamente
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="text-lg">⚠</span> Las contraseñas no coinciden
                  </span>
                )}
              </div>
            )}

            <div id="requisitos-contrasena-registro" role="alert" className="hidden" />

            <button type="submit" disabled={cargando} className="w-full md-btn-primary font-semibold py-3 lg:py-3.5 rounded-[0.85rem] transition disabled:opacity-60">
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-6 lg:mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[0.85rem] border-2 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: "#3C5148", color: "#3C5148", backgroundColor: "rgba(107,142,78,0.08)" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[0.85rem] border text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              style={{ borderColor: "var(--md-border)" }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <PasswordRequirements 
        contrasena={form.contrasena} 
        mostrar={mostrarRequisitos} 
        onClose={() => setMostrarRequisitos(false)} 
      />
    </div>
  );
}
