import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", style = {}, iconOnly = false, hideLabelOnMobile = false }) {
  const { esOscuro, alternarTema } = useTheme();
  const label = esOscuro ? "Modo claro" : "Modo oscuro";

  return (
    <button
      type="button"
      onClick={alternarTema}
      className={`inline-flex items-center justify-center gap-2 transition ${className}`}
      style={style}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{esOscuro ? "☀️" : "🌙"}</span>
      {!iconOnly && (
        <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>
          {label}
        </span>
      )}
    </button>
  );
}
