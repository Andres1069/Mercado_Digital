import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { esOscuro, toggleTema } = useTheme();

  return (
    <button
      onClick={toggleTema}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80 ${className}`}
      style={{
        backgroundColor: esOscuro ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        border: `1px solid ${esOscuro ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
      }}
    >
      <span className="text-base leading-none">{esOscuro ? "☀️" : "🌙"}</span>
    </button>
  );
}
