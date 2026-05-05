import { useEffect, useState } from "react";

const PASSWORD_REQUISITOS = [
  { texto: "Minimo 8 caracteres.", cumple: (valor) => valor.length >= 8, icon: "📏" },
  { texto: "Debe incluir al menos 1 letra mayuscula.", cumple: (valor) => /[A-Z]/.test(valor), icon: "🔤" },
  { texto: "Debe incluir al menos 1 letra minuscula.", cumple: (valor) => /[a-z]/.test(valor), icon: "🔡" },
  { texto: "Debe incluir al menos 1 numero.", cumple: (valor) => /\d/.test(valor), icon: "🔢" },
];

export default function PasswordRequirements({ contrasena, mostrar, onClose }) {
  const [requisitos, setRequisitos] = useState([]);
  const [todoCumple, setTodoCumple] = useState(false);

  useEffect(() => {
    const nuevosRequisitos = PASSWORD_REQUISITOS.map((item) => ({
      ...item,
      ok: item.cumple(contrasena),
    }));
    setRequisitos(nuevosRequisitos);
    setTodoCumple(nuevosRequisitos.every((r) => r.ok));
  }, [contrasena]);

  if (!mostrar) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-end justify-center p-4 md:items-center md:justify-end md:p-6 md:pb-20 z-50"
      onClick={onClose}
    >
      <div
        className="pointer-events-auto w-full max-w-sm rounded-2xl shadow-2xl border backdrop-blur-md p-6 animate-slide-up"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,249,0.98) 100%)",
          borderColor: todoCumple ? "#16a34a" : "#dbeafe",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{todoCumple ? "✅" : "🔐"}</span>
            <h3 className="font-bold text-slate-900">
              {todoCumple ? "¡Contraseña fuerte!" : "Requisitos de seguridad"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Requisitos */}
        <div className="space-y-3">
          {requisitos.map((item) => (
            <div
              key={item.texto}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                item.ok
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <span className="text-lg flex-shrink-0">
                {item.ok ? "✓" : item.icon}
              </span>
              <span
                className={`text-sm font-medium ${
                  item.ok ? "text-emerald-700" : "text-slate-600"
                }`}
              >
                {item.texto}
              </span>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Progreso</span>
            <span className="text-xs font-bold text-slate-900">
              {requisitos.filter((r) => r.ok).length}/{requisitos.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                todoCumple ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{
                width: `${(requisitos.filter((r) => r.ok).length / requisitos.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Mensaje final */}
        {todoCumple && (
          <p className="mt-4 text-xs text-emerald-700 font-semibold text-center">
            ¡Listo para registrarte! Continúa rellenando el formulario.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
