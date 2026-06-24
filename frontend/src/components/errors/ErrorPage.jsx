// frontend/src/components/errors/ErrorPage.jsx
// Pantalla de error reutilizable, on-brand, sin dependencias de router/auth para
// poder usarse en cualquier contexto (incluido el fallback de ErrorBoundary,
// donde esos providers pueden no existir si toda la app se cayó).
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Home, LogIn, RefreshCw, MessageCircle } from "lucide-react";
import { ERROR_CATALOG } from "./errorCatalog";

const ICONOS_ACCION = {
  volver: ArrowLeft,
  inicio: Home,
  iniciarSesion: LogIn,
  reintentar: RefreshCw,
  soporte: MessageCircle,
};

const ETIQUETAS_ACCION = {
  volver: "Volver atrás",
  inicio: "Ir al inicio",
  iniciarSesion: "Iniciar sesión",
  reintentar: "Reintentar",
  soporte: "Contactar soporte",
};

function BotonAccion({ tipo, variant, onClick, href }) {
  const Icon = ICONOS_ACCION[tipo];
  const className =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60 " +
    (variant === "primary" ? "md-btn-primary" : "md-btn-secondary border");

  if (href) {
    const externo = /^https?:\/\//.test(href);
    return (
      <a href={href} className={className} {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}>
        <Icon size={18} />
        {ETIQUETAS_ACCION[tipo]}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon size={18} />
      {ETIQUETAS_ACCION[tipo]}
    </button>
  );
}

/**
 * Props:
 * - tipo: clave de ERROR_CATALOG (BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND,
 *   SERVER_ERROR, DB_CONNECTION_ERROR, SERVICE_UNAVAILABLE, NETWORK_ERROR)
 * - titulo / mensaje: sobrescriben el texto por defecto del catálogo
 * - inicioHref: a dónde navega "Ir al inicio" (default "/")
 * - onVolver: handler de "Volver atrás" (default window.history.back())
 * - onIniciarSesion: handler de "Iniciar sesión" (default navega a /login)
 * - onRetry: handler de "Reintentar"; si no se pasa, recarga la página.
 *   Recibe (signal) y puede ser async; mientras se ejecuta el botón queda en "Reintentando...".
 * - detalleTecnico: texto opcional (solo se muestra si window.location tiene ?debug=1)
 */
export default function ErrorPage({
  tipo = "SERVER_ERROR",
  titulo,
  mensaje,
  inicioHref = "/",
  onVolver,
  onIniciarSesion,
  onRetry,
  detalleTecnico,
}) {
  const entrada = ERROR_CATALOG[tipo] || ERROR_CATALOG.SERVER_ERROR;
  const { Icono, codigo, acciones } = entrada;
  const [reintentando, setReintentando] = useState(false);
  const tituloRef = useRef(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, [tipo]);

  const handleVolver = onVolver || (() => window.history.back());
  const handleIniciarSesion = onIniciarSesion || (() => window.location.assign("/login"));
  const handleRetry = async () => {
    if (!onRetry) {
      window.location.reload();
      return;
    }
    setReintentando(true);
    try {
      await onRetry();
    } catch {
      // si falla de nuevo, quien provee onRetry ya actualizó el estado de error.
    } finally {
      setReintentando(false);
    }
  };

  const debug = typeof window !== "undefined" && window.location.search.includes("debug=1");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen md-app-bg flex items-center justify-center p-4 md:p-6"
    >
      <div className="w-full max-w-lg md-surface rounded-[2rem] shadow-lg p-8 md:p-12 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full md-soft-card"
          style={{ color: "var(--md-aqua)" }}
        >
          <Icono size={38} aria-hidden="true" />
        </div>

        <p className="md-accent-text text-6xl md:text-7xl font-black tracking-tight leading-none">
          {codigo}
        </p>

        <h1
          ref={tituloRef}
          tabIndex={-1}
          className="mt-4 text-xl md:text-2xl font-bold outline-none"
          style={{ color: "var(--md-text)" }}
        >
          {titulo || entrada.titulo}
        </h1>

        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--md-text-soft)" }}>
          {mensaje || entrada.mensaje}
        </p>

        {debug && detalleTecnico && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-black/5 p-3 text-left text-xs text-slate-500">
            {detalleTecnico}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {acciones.includes("reintentar") && (
            <BotonAccion
              tipo="reintentar"
              variant="primary"
              onClick={reintentando ? undefined : handleRetry}
            />
          )}
          {acciones.includes("iniciarSesion") && (
            <BotonAccion tipo="iniciarSesion" variant="primary" onClick={handleIniciarSesion} />
          )}
          {acciones.includes("inicio") && (
            <BotonAccion tipo="inicio" variant={acciones.includes("reintentar") || acciones.includes("iniciarSesion") ? "secondary" : "primary"} href={inicioHref} />
          )}
          {acciones.includes("volver") && (
            <BotonAccion tipo="volver" variant="secondary" onClick={handleVolver} />
          )}
          {acciones.includes("soporte") && (
            <BotonAccion
              tipo="soporte"
              variant="secondary"
              href="https://wa.me/573000000000?text=Necesito%20ayuda%20con%20Mercado%20Digital"
            />
          )}
        </div>
      </div>
    </div>
  );
}
