import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { esOscuro } = useTheme();

  return (
    <footer className="w-full py-6 mt-8" style={{ background: esOscuro ? "transparent" : "transparent" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-5 text-center" style={{ color: esOscuro ? "#94a3b8" : "#475569" }}>
        <p className="text-sm">&copy; {new Date().getFullYear()} Mercado Digital. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
