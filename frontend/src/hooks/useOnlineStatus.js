// frontend/src/hooks/useOnlineStatus.js
import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [enLinea, setEnLinea] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const marcarOnline = () => setEnLinea(true);
    const marcarOffline = () => setEnLinea(false);
    window.addEventListener("online", marcarOnline);
    window.addEventListener("offline", marcarOffline);
    return () => {
      window.removeEventListener("online", marcarOnline);
      window.removeEventListener("offline", marcarOffline);
    };
  }, []);

  return enLinea;
}
