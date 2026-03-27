import { useTheme } from "../context/ThemeContext";

function SolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M4.93 4.93l1.77 1.77" />
      <path d="M17.3 17.3l1.77 1.77" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="M4.93 19.07l1.77-1.77" />
      <path d="M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function LunaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function ThemeToggle({
  className = "",
  style,
  hideLabelOnMobile = false,
}) {
  const { esOscuro, alternarTema } = useTheme();
  const label = esOscuro ? "Modo claro" : "Modo oscuro";
  const shortLabel = esOscuro ? "Claro" : "Oscuro";

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition ${className}`.trim()}
      style={style}
    >
      {esOscuro ? <SolIcon /> : <LunaIcon />}
      <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>
        {hideLabelOnMobile ? shortLabel : label}
      </span>
    </button>
  );
}
