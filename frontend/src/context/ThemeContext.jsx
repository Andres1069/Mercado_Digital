/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "md_theme"; // "dark" | "light"
const DARK_CLASS = "theme-dark";

function getInitialIsDark() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function ThemeProvider({ children }) {
  const [esOscuro, setEsOscuro] = useState(getInitialIsDark);

  useEffect(() => {
    const root = document.documentElement;
    if (esOscuro) root.classList.add(DARK_CLASS);
    else root.classList.remove(DARK_CLASS);
    localStorage.setItem(STORAGE_KEY, esOscuro ? "dark" : "light");
  }, [esOscuro]);

  const value = useMemo(() => ({
    esOscuro,
    setEsOscuro,
    toggleTema: () => setEsOscuro((v) => !v),
  }), [esOscuro]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

