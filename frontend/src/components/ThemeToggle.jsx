import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", style = {} }) {
  const { esOscuro, alternarTema } = useTheme();

  return (
    <button
      type="button"
      onClick={alternarTema}
      className={className}
      style={style}
      aria-label={esOscuro ? "Alternar tema, actualmente: oscuro" : "Alternar tema, actualmente: claro"}
      title={esOscuro ? "Modo oscuro" : "Modo claro"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-5 h-5 align-middle"
        style={{ display: "inline-block", verticalAlign: "middle" }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
