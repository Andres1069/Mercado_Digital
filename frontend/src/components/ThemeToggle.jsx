import { useTheme } from "../context/ThemeContext";

function IconSun({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z" />
    </svg>
  );
}

export default function ThemeToggle({
  className = "",
  style = {},
  iconOnly = false,
  hideLabelOnMobile = false,
}) {
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
      {esOscuro ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
      {!iconOnly && (
        <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>{label}</span>
      )}
    </button>
  );
}
