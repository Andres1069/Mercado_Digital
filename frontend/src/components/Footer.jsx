import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { esOscuro } = useTheme();

  return (
    <footer
      className="border-t shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] transition-all"
      style={{
        backgroundColor: esOscuro ? "#0f172a" : "#ffffff",
        borderColor: esOscuro
          ? "rgba(148,163,184,0.12)"
          : "#e5e7eb",
        color: esOscuro ? "#f8fafc" : "#111827",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* SECCIÓN SUPERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12">
          {/* BRANDING */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-block overflow-hidden">
              <img
                src={esOscuro ? "/Logo-Mercado-Digital-Blanco.png" : "/Logo-Mercado-Digital.png"}
                alt="Mercado Digital Logo"
                className="h-12 scale-2 origin-left"
              />
            </Link>

            <p
              className="max-w-sm text-sm leading-relaxed"
              style={{
                color: esOscuro ? "#cbd5e1" : "#475569",
              }}
            >
              Transformando la experiencia de compra online con
              seguridad y rapidez. Únete a nuestra comunidad para
              recibir ofertas exclusivas.
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <div className="md:col-span-3 space-y-5">
            <h3
              className="text-[10px] uppercase tracking-[0.3em] font-bold"
              style={{
                color: esOscuro ? "#94a3b8" : "#64748b",
              }}
            >
              Navegación
            </h3>

            <ul className="space-y-3 text-sm font-medium">
              {[
                ["Inicio", "/"],
                ["Tienda", "/tienda"],
                ["Ofertas", "/ofertas"],
                ["Mi Cuenta", "/perfil"],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="transition-colors duration-200"
                    style={{
                      color: esOscuro
                        ? "#cbd5e1"
                        : "#475569",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#6B8E4E";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = esOscuro
                        ? "#cbd5e1"
                        : "#475569";
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="md:col-span-4 space-y-5">
            <h3
              className="text-[10px] uppercase tracking-[0.3em] font-bold"
              style={{
                color: esOscuro ? "#94a3b8" : "#64748b",
              }}
            >
              Contacto
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-2xl"
                  style={{
                    background: esOscuro
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  📧
                </span>

                <a
                  href="mailto:hola@mercadodigital.com"
                  className="transition-colors"
                  style={{
                    color: esOscuro
                      ? "#cbd5e1"
                      : "#475569",
                  }}
                >
                  hola@mercadodigital.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-2xl"
                  style={{
                    background: esOscuro
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  📞
                </span>

                <span
                  style={{
                    color: esOscuro
                      ? "#cbd5e1"
                      : "#475569",
                  }}
                >
                  +57 300 000 0000
                </span>
              </li>

              <li className="flex gap-4 pt-2">
                <a
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all text-xl"
                  style={{
                    background: esOscuro
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  𝕏
                </a>

                <a
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all text-xl"
                  style={{
                    background: esOscuro
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.05)",
                  }}
                >
                  📸
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* SECCIÓN INFERIOR */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6"
          style={{
            borderColor: esOscuro
              ? "rgba(148,163,184,0.12)"
              : "#e5e7eb",
          }}
        >
          <p
            className="text-[11px] font-medium"
            style={{
              color: esOscuro ? "#94a3b8" : "#64748b",
            }}
          >
            © {currentYear} Mercado Digital S.A.S. Todos los derechos
            reservados.
          </p>

          <div
            className="flex gap-8 text-[11px] font-bold tracking-wider uppercase"
            style={{
              color: esOscuro ? "#94a3b8" : "#64748b",
            }}
          >
            <Link
              to="/privacidad"
              className="transition-colors"
            >
              Privacidad
            </Link>

            <Link
              to="/terminos"
              className="transition-colors"
            >
              Términos
            </Link>

            <Link
              to="/cookies"
              className="transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}