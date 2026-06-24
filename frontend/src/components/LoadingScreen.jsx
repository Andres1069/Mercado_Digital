// frontend/src/components/LoadingScreen.jsx
// Sustituye los "return null" que dejaban la pantalla en blanco mientras se
// valida la sesión (AuthContext.cargando). On-brand con el resto del sitio.
export default function LoadingScreen({ mensaje = "Cargando..." }) {
  return (
    <div className="min-h-screen md-app-bg flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--md-aqua)", borderTopColor: "transparent" }}
          aria-hidden="true"
        />
        <p className="text-sm font-medium" style={{ color: "var(--md-text-soft)" }}>
          {mensaje}
        </p>
      </div>
    </div>
  );
}
