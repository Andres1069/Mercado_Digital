import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "md-theme";

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado === "dark" || guardado === "light") return guardado;
    } catch {
      // ignore
    }
    return "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("theme-dark", tema === "dark");
    html.classList.toggle("theme-light", tema === "light");
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      // ignore
    }
  }, [tema]);

  const alternarTema = () => setTema((t) => (t === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({ tema, esOscuro: tema === "dark", setTema, alternarTema }),
    [tema]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}

