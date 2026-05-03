import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", style = {} }) {
  const { esOscuro, toggleTema } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTema}
      className={className}
      style={style}
    >
      {esOscuro ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
