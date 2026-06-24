// frontend/src/context/ErrorContext.jsx
// Punto único donde aterrizan los errores "en caliente" (cualquier petición HTTP
// fallida no marcada como silenciosa) y los reportados manualmente desde una página.
// Cuando hay un error activo, reemplaza el contenido de la app por <ErrorPage>.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ErrorPage from "../components/errors/ErrorPage";
import { useErrorActions } from "../components/errors/ErrorActions";
import { setGlobalErrorHandler } from "../services/api";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const ErrorContext = createContext(null);

export function GlobalErrorProvider({ children }) {
  const [error, setError] = useState(null); // { tipo, detalle, retry }
  const { inicioHref, onVolver, onIniciarSesion } = useErrorActions();
  const enLinea = useOnlineStatus();
  const erroresPreviosARed = useRef(null);

  const reportError = useCallback((info) => {
    setError(info);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    setGlobalErrorHandler(reportError);
    return () => setGlobalErrorHandler(null);
  }, [reportError]);

  // Sin red: cubre el caso completo, no solo el de una petición fallida.
  useEffect(() => {
    if (!enLinea) {
      erroresPreviosARed.current = error;
      setError({ tipo: "NETWORK_ERROR" });
    } else if (erroresPreviosARed.current !== null || error?.tipo === "NETWORK_ERROR") {
      setError(erroresPreviosARed.current ?? null);
      erroresPreviosARed.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enLinea]);

  const value = useMemo(() => ({ reportError, clearError }), [reportError, clearError]);

  if (error) {
    return (
      <ErrorContext.Provider value={value}>
        <ErrorPage
          tipo={error.tipo}
          detalleTecnico={error.detalle}
          inicioHref={inicioHref}
          onVolver={() => {
            clearError();
            onVolver();
          }}
          onIniciarSesion={() => {
            clearError();
            onIniciarSesion();
          }}
          onRetry={
            error.retry
              ? async () => {
                  // Si vuelve a fallar, request() ya reportó el nuevo error vía
                  // setGlobalErrorHandler antes de lanzar; no hace falta capturarlo aquí.
                  await error.retry();
                  clearError();
                }
              : () => window.location.reload()
          }
        />
      </ErrorContext.Provider>
    );
  }

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useGlobalError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useGlobalError debe usarse dentro de <GlobalErrorProvider>");
  return ctx;
}
