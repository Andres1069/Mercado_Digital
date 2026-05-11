import { useState } from "react";

function WhatsAppButton() {
  const [abierto, setAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const numeroWhatsApp = "573244314271";

  const mensajeDefault =
    "Hola, me gustaría obtener más información.";

  // =========================
  // ABRIR WHATSAPP
  // =========================
  const abrirWhatsApp = () => {
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensajeDefault
    )}`;

    window.open(urlWhatsApp, "_blank");
    setAbierto(false);
  };

  // =========================
  // ABRIR FORMULARIO
  // =========================
  const abrirFormularioEmail = () => {
    setMostrarFormulario(true);
    setAbierto(false);
  };

  // =========================
  // CERRAR FORMULARIO
  // =========================
  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      mensaje: "",
    });
  };

  // =========================
  // INPUTS
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // ENVIAR SOLICITUD
  // =========================
  const enviarSolicitud = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.email.trim()) {
      setNotificacion("Por favor completa nombre y correo");

      setTimeout(() => {
        setNotificacion("");
      }, 3000);

      return;
    }

    setCargando(true);

    try {
      const response = await fetch(
  "http://localhost/mercado_digital/backend/public/?ruta=contacto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotificacion(
          "¡Solicitud enviada correctamente!"
        );

        cerrarFormulario();
      } else {
        setNotificacion(
          data.message || "Error al enviar"
        );
      }
    } catch (error) {
      console.error(error);

      setNotificacion(
        "Error de conexión con el servidor"
      );
    } finally {
      setCargando(false);

      setTimeout(() => {
        setNotificacion("");
      }, 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* =========================
          NOTIFICACIÓN
      ========================= */}
      {notificacion && (
        <div className="px-4 py-3 rounded-xl shadow-xl text-sm font-semibold bg-green-500 text-white animate-fade-in">
          {notificacion}
        </div>
      )}

      {/* =========================
          MODAL FORMULARIO
      ========================= */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-fade-in">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Contáctanos
              </h2>

              <button
                onClick={cerrarFormulario}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ×
              </button>
            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={enviarSolicitud}
              className="space-y-4"
            >
              {/* NOMBRE */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* TELÉFONO */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>

                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+57 300..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* MENSAJE */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mensaje
                </label>

                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="¿Cómo podemos ayudarte?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                style={{
                  backgroundColor: "#25D366",
                }}
              >
                {cargando
                  ? "Enviando..."
                  : "Enviar Solicitud"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          OPCIONES
      ========================= */}
      {abierto && (
        <div className="flex flex-col gap-3 animate-fade-in">

          {/* EMAIL */}
          <button
            onClick={abrirFormularioEmail}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl hover:scale-105 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-gray-700 dark:text-white"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
              />

              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>

            <span className="text-sm font-semibold text-gray-700 dark:text-white">
              Email
            </span>
          </button>

          {/* WHATSAPP */}
          <button
            onClick={abrirWhatsApp}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-300"
            style={{
              backgroundColor: "#25D366",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-5 h-5"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>

            <span className="text-sm font-semibold text-white">
              WhatsApp
            </span>
          </button>
        </div>
      )}

      {/* =========================
          BOTÓN PRINCIPAL
      ========================= */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
        style={{
          backgroundColor: "#25D366",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="w-7 h-7"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
}

export default WhatsAppButton;