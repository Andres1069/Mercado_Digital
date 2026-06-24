const fs = require('fs');
const path = 'C:/xampp/htdocs/Mercado_Digital/frontend/src/components/Navbar.jsx';
let s = fs.readFileSync(path, 'latin1');
const start = s.indexOf('{bolsaPreviewAbierta && (');
const end = s.indexOf('              )}', start);
if (start < 0 || end < 0) throw new Error('markers not found');
let repl = `__START__
                <div
                  className={\`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[330px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
                    bolsaPreviewExpandida ? "max-h-[560px]" : "max-h-[330px]"
                  }\`}
                  style={{
                    backgroundColor: esOscuro ? "#142018" : "#ffffff",
                    border: \`1px solid ${
                      esOscuro ? "rgba(79,106,75,0.18)" : "#e5e7eb"
                    }\`,
                  }}
                >
                  <div className="p-3" style={{ color: esOscuro ? "#e5e7eb" : "#111827" }}>
                    {items?.length ? (
                      <div className="space-y-2">
                        {items.slice(0, bolsaPreviewExpandida ? 6 : 3).map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center gap-3 rounded-xl px-2.5 py-2"
                            style={{
                              background: esOscuro
                                ? "rgba(107,142,78,0.08)"
                                : "rgba(15,23,42,0.03)",
                            }}
                          >
                            <div
                              className="w-6 text-center text-sm font-semibold opacity-80 flex-shrink-0"
                              title="Cantidad"
                            >
                              {it.cantidad}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold truncate">
                                {it.nombre || "Producto"}
                              </div>
                              <div className="text-xs opacity-70 mt-0.5">
                                {formatMoney(it.precio)}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg leading-none flex-shrink-0"
                              aria-label="Quitar del carrito"
                              title="Quitar"
                              style={{
                                color: esOscuro ? "#e5e7eb" : "#111827",
                                background: esOscuro
                                  ? "rgba(107,142,78,0.10)"
                                  : "rgba(15,23,42,0.05)",
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeItem(it.id);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        <div
                          className="flex items-center justify-between pt-2 mt-1 border-t text-sm font-semibold"
                          style={{
                            borderColor: esOscuro
                              ? "rgba(79,106,75,0.18)"
                              : "#e5e7eb",
                          }}
                        >
                          <span style={{ opacity: 0.8 }}>Total:</span>
                          <span>{formatMoney(subtotal)}</span>
                        </div>

                        {items.length > 3 && (
                          <button
                            type="button"
                            className="pt-1 text-xs font-semibold opacity-75 transition hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setBolsaPreviewExpandida((prev) => !prev);
                            }}
                          >
                            {bolsaPreviewExpandida ? "Ver menos" : __MORE__}
                          </button>
                        )}

                        <Link
                          to="/carrito"
                          className="mt-2 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                          style={{
                            backgroundColor: esOscuro
                              ? "rgba(107,142,78,0.18)"
                              : "rgba(93,124,74,0.12)",
                            color: esOscuro ? "#f8fafc" : "#35512a",
                          }}
                          onClick={() => setBolsaPreviewAbierta(false)}
                        >
                          Ver carrito completo
                        </Link>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm opacity-70">
                        Tu carrito está vacío
                      </div>
                    )}
                  </div>
                </div>
              )}
`;
repl = repl.replace('__START__', '{bolsaPreviewAbierta && (');
repl = repl.replace('__MORE__', '`+' + '${items.length - 3}' + ' producto(s) más`');
s = s.slice(0, start) + repl + s.slice(end);
fs.writeFileSync(path, s, 'utf8');
