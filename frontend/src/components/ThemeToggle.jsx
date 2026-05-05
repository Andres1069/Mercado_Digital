import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", style = {} }) {
  const { esOscuro, alternarTema } = useTheme();

  return (
    <button
      type="button"
      onClick={alternarTema}
      className={className}
      style={style}
    >
      {esOscuro ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
