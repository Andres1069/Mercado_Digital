import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { de: "bot", texto: "¡Hola! Soy tu asistente virtual de Mercado Digital 🛒. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [paso, setPaso] = useState("inicio"); // inicio, pedir_id, pedir_email, email_nombre, email_correo, email_telefono, email_mensaje
  const [inputValor, setInputValor] = useState("");
  const [datosPedido, setDatosPedido] = useState({ id: "", email: "" });
  const [datosEmail, setDatosEmail] = useState({ nombre: "", correo: "", telefono: "", mensaje: "" });
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  const cerrarYResetearChat = () => {
    setAbierto(false);
    setTimeout(() => {
      setPaso("inicio");
      setMensajes([{ de: "bot", texto: "¡Hola! Soy tu asistente virtual de Mercado Digital 🛒. ¿En qué te puedo ayudar hoy?" }]);
      setInputValor("");
      setDatosPedido({ id: "", email: "" });
      setDatosEmail({ nombre: "", correo: "", telefono: "", mensaje: "" });
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (abierto && chatContainerRef.current && !chatContainerRef.current.contains(e.target)) {
        if (paso === "inicio" && !mostrarConfirmacion) {
          cerrarYResetearChat();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [abierto, paso, mostrarConfirmacion]);

  const intentarCerrar = () => {
    if (paso === "inicio") {
      cerrarYResetearChat();
    } else {
      setMostrarConfirmacion(true);
    }
  };

  const confirmarCierre = (cerrar) => {
    if (cerrar) {
      setMostrarConfirmacion(false);
      cerrarYResetearChat();
    } else {
      setMostrarConfirmacion(false);
    }
  };

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = async (texto, hidden = false) => {
    if (!hidden) {
      setMensajes(prev => [...prev, { de: "user", texto }]);
    }
    
    if (paso === "pedir_id") {
      const id = texto.trim();
      setDatosPedido(prev => ({ ...prev, id }));
      setTimeout(() => {
        setMensajes(prev => [...prev, { de: "bot", texto: "Perfecto. Ahora, por seguridad, ingresa el correo electrónico asociado:" }]);
        setPaso("pedir_email");
      }, 500);
      return;
    }

    if (paso === "email_nombre") {
      const nombre = texto.trim();
      setDatosEmail(prev => ({ ...prev, nombre }));
      setTimeout(() => {
        setMensajes(prev => [...prev, { de: "bot", texto: `Mucho gusto, ${nombre}. Ahora por favor, indícame tu correo electrónico:` }]);
        setPaso("email_correo");
      }, 500);
      return;
    }

    if (paso === "email_correo") {
      const correo = texto.trim();
      setDatosEmail(prev => ({ ...prev, correo }));
      setTimeout(() => {
        setMensajes(prev => [...prev, { de: "bot", texto: "Perfecto. ¿Me regalas un número de teléfono? (Opcional, si no deseas escribe 'no')" }]);
        setPaso("email_telefono");
      }, 500);
      return;
    }

    if (paso === "email_telefono") {
      const telefono = texto.trim() === 'no' ? '' : texto.trim();
      setDatosEmail(prev => ({ ...prev, telefono }));
      setTimeout(() => {
        setMensajes(prev => [...prev, { de: "bot", texto: "¡Casi listos! Por último, ¿cuál es tu duda o mensaje?" }]);
        setPaso("email_mensaje");
      }, 500);
      return;
    }

    if (paso === "email_mensaje") {
      const mensajeFinal = texto.trim();
      setDatosEmail(prev => ({ ...prev, mensaje: mensajeFinal }));
      setCargando(true);
      try {
        const response = await fetch("http://localhost/mercado_digital/backend/public/?ruta=contacto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: datosEmail.nombre,
            email: datosEmail.correo,
            telefono: datosEmail.telefono,
            mensaje: mensajeFinal
          })
        });
        const data = await response.json();
        
        if (data.success) {
          setMensajes(prev => [...prev, { de: "bot", texto: "¡Tu mensaje ha sido enviado con éxito! 🚀\nNos comunicaremos contigo muy pronto." }]);
        } else {
          setMensajes(prev => [...prev, { de: "bot", texto: `❌ Hubo un error: ${data.message}` }]);
        }
      } catch (e) {
        setMensajes(prev => [...prev, { de: "bot", texto: "Hubo un error de conexión al enviar tu mensaje. Intenta de nuevo más tarde." }]);
      } finally {
        setCargando(false);
        setTimeout(() => {
          setMensajes(prev => [...prev, { de: "bot", texto: "Si necesitas realizar otra consulta, elige una opción:" }]);
          setPaso("inicio");
        }, 1000);
      }
      return;
    }

    if (paso === "pedir_email") {
      const email = texto.trim();
      setDatosPedido(prev => ({ ...prev, email }));
      setCargando(true);
      
      try {
        const response = await fetch("http://localhost/mercado_digital/backend/public/?ruta=chatbot/consultar-pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: datosPedido.id, email })
        });
        const data = await response.json();
        
        if (data.success) {
          const primerNombre = data.nombre ? data.nombre.split(' ')[0] : 'Cliente';
          
          if (data.tipo === 'unico') {
             const msjEstado = `¡Hola **${primerNombre}**! 👋\nHe revisado tu compra.\n\nTu pedido **#${datosPedido.id}** actualmente está: **${data.estado}**.\n\nEl total fue de $${Number(data.total).toLocaleString('es-CO')} y fue creado el ${data.fecha.split(' ')[0]}.`;
             setMensajes(prev => [...prev, { de: "bot", texto: msjEstado }]);
          } else if (data.tipo === 'multiple') {
             if (data.pedidos && data.pedidos.length > 0) {
                // Mostrar un resumen de los últimos 3 pedidos maximo
                const pedidosRecientes = data.pedidos.slice(0, 3);
                let msjMulti = `¡Hola **${primerNombre}**! 👋\nHe buscado con tu documento y encontré **${data.pedidos.length}** pedidos registrados.\n\nAquí tienes los más recientes:\n\n`;
                
                pedidosRecientes.forEach(p => {
                   msjMulti += `📦 **Pedido #${p.Cod_Pedido}**: ${p.Estado_Pedido} ($${Number(p.Total_Carrito).toLocaleString('es-CO')})\n`;
                });
                
                setMensajes(prev => [...prev, { de: "bot", texto: msjMulti }]);
             } else {
                setMensajes(prev => [...prev, { de: "bot", texto: `¡Hola **${primerNombre}**! 👋\nActualmente no tienes ningún pedido registrado con nosotros.` }]);
             }
          }
        } else {
          setMensajes(prev => [...prev, { de: "bot", texto: `❌ ${data.message}` }]);
        }
      } catch (e) {
        setMensajes(prev => [...prev, { de: "bot", texto: "Hubo un error de conexión. Intenta de nuevo más tarde." }]);
      } finally {
        setCargando(false);
        setTimeout(() => {
          setMensajes(prev => [...prev, { de: "bot", texto: "Si necesitas realizar otra consulta, elige una opción:" }]);
          setPaso("inicio");
        }, 1000);
      }
      return;
    }
  };

  const resetChat = () => {
    setPaso("inicio");
    setMensajes(prev => [...prev, { de: "bot", texto: "¿En qué más te puedo ayudar?" }]);
  };

  const handleOpcion = async (opcion) => {
    switch (opcion) {
      case "consultar":
        enviarMensaje("Consultar mis pedidos");
        setTimeout(() => {
          setMensajes(prev => [...prev, { de: "bot", texto: "Por favor, ingresa tu Número de Pedido (ID) o tu Documento de Identidad:" }]);
          setPaso("pedir_id");
        }, 500);
        break;
      case "ofertas":
        enviarMensaje("Ver ofertas de hoy");
        setCargando(true);
        try {
          const response = await fetch("http://localhost/mercado_digital/backend/public/?ruta=chatbot/ofertas");
          const data = await response.json();
          if (data.success && data.ofertas && data.ofertas.length > 0) {
             let msj = "¡Aquí tienes las ofertas activas hoy! 🏷️\n\n";
             data.ofertas.forEach(o => {
                msj += `🔥 **${o.Titulo}**\n${o.nombre_producto} a solo $${Number(o.precio_oferta).toLocaleString('es-CO')} (-${o.Porcentaje_Descuento}%)\n\n`;
             });
             setMensajes(prev => [...prev, { de: "bot", texto: msj.trim() }]);
          } else {
             setMensajes(prev => [...prev, { de: "bot", texto: "Actualmente no tenemos ofertas activas. ¡Vuelve pronto!" }]);
          }
        } catch(e) {
          setMensajes(prev => [...prev, { de: "bot", texto: "Hubo un error al buscar las ofertas. Intenta más tarde." }]);
        } finally {
          setCargando(false);
          setTimeout(() => {
            setMensajes(prev => [...prev, { de: "bot", texto: "Si necesitas realizar otra consulta, elige una opción:" }]);
            setPaso("inicio");
          }, 1000);
        }
        break;
      case "soporte":
        enviarMensaje("Hablar con soporte");
        setTimeout(() => {
          setMensajes(prev => [...prev, { de: "bot", texto: "¡Perfecto! Te pondré en contacto con uno de nuestros asesores por WhatsApp para brindarte una atención mucho más personalizada. 💬", linkWhatsapp: true }]);
          setPaso("inicio");
        }, 500);
        break;
      case "email":
        enviarMensaje("Enviar un correo");
        setTimeout(() => {
          setMensajes(prev => [...prev, { de: "bot", texto: "Con gusto. Para empezar, ¿me indicas tu nombre completo?" }]);
          setPaso("email_nombre");
        }, 500);
        break;
      default:
        break;
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValor.trim()) return;
    const txt = inputValor;
    setInputValor("");
    enviarMensaje(txt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" ref={chatContainerRef}>
      {abierto && (
        <div className="w-[340px] h-[480px] max-h-[75vh] max-w-[90vw] bg-[#eceee9] dark:bg-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-[#c3ccc5] dark:border-zinc-700 relative">
          
          {/* Capa de confirmación de cierre */}
          {mostrarConfirmacion && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-xl w-full text-center">
                <h4 className="font-bold text-[#1a2e22] dark:text-green-300 text-[15px] mb-2">¿Seguro que quieres cerrar?</h4>
                <p className="text-[13px] text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                  Estás en medio de una consulta. Si cierras ahora, el progreso no se guardará.
                </p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => confirmarCierre(false)} className="flex-1 py-2 px-3 text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 rounded-xl transition">
                    Cancelar
                  </button>
                  <button onClick={() => confirmarCierre(true)} className="flex-1 py-2 px-3 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition">
                    Sí, cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-[#1a2e22] text-white p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img src="/chat/chatsito.png" alt="Bot" className="w-14 h-14 object-contain drop-shadow-md" />
              <div>
                <h3 className="font-bold leading-tight text-[16px]">Asistente Virtual</h3>
                <p className="text-[12px] text-[#8fba67] font-semibold mt-0.5">● En línea</p>
              </div>
            </div>
            <button onClick={intentarCerrar} className="text-white/70 hover:text-white text-2xl leading-none transition">&times;</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 relative z-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.de === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div 
                  className={`px-4 py-2.5 max-w-[85%] text-[14px] shadow-sm
                    ${m.de === 'user' 
                      ? 'bg-[#1a2e22] text-white rounded-2xl rounded-br-sm' 
                      : 'bg-white dark:bg-zinc-700 text-[#24352c] dark:text-gray-200 rounded-2xl rounded-bl-sm border border-[#e0e8e2] dark:border-zinc-600'
                    }`}
                >
                  {m.texto.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      {idx !== m.texto.split('\n').length - 1 && <br/>}
                    </span>
                  ))}
                  {m.linkWhatsapp && (
                    <a href="https://wa.me/573244314271" target="_blank" rel="noreferrer" className="block text-center mt-3 mb-1 px-4 py-2 bg-[#25D366] text-white rounded-xl font-bold hover:scale-[1.02] transition shadow-sm">
                      Abrir WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            {paso === "inicio" && (
              <div className="flex flex-col gap-2 mt-2 animate-fade-in pl-1">
                <button onClick={() => handleOpcion("consultar")} className="text-left px-4 py-2.5 text-[13px] font-semibold bg-white dark:bg-zinc-700 border border-[#8fba67]/40 text-[#1a2e22] dark:text-green-300 rounded-2xl hover:bg-[#f2f5f2] hover:border-[#8fba67] transition shadow-sm w-fit">📦 Consultar mis pedidos</button>
                <button onClick={() => handleOpcion("ofertas")} className="text-left px-4 py-2.5 text-[13px] font-semibold bg-white dark:bg-zinc-700 border border-[#8fba67]/40 text-[#1a2e22] dark:text-green-300 rounded-2xl hover:bg-[#f2f5f2] hover:border-[#8fba67] transition shadow-sm w-fit">🏷️ Ver ofertas de hoy</button>
                <button onClick={() => handleOpcion("soporte")} className="text-left px-4 py-2.5 text-[13px] font-semibold bg-white dark:bg-zinc-700 border border-[#8fba67]/40 text-[#1a2e22] dark:text-green-300 rounded-2xl hover:bg-[#f2f5f2] hover:border-[#8fba67] transition shadow-sm w-fit">💬 Hablar con soporte</button>
                <button onClick={() => handleOpcion("email")} className="text-left px-4 py-2.5 text-[13px] font-semibold bg-white dark:bg-zinc-700 border border-[#8fba67]/40 text-[#1a2e22] dark:text-green-300 rounded-2xl hover:bg-[#f2f5f2] hover:border-[#8fba67] transition shadow-sm w-fit">📧 Enviar un correo</button>
              </div>
            )}
            
            {cargando && (
               <div className="flex justify-start animate-fade-in">
                  <div className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-700 rounded-bl-sm shadow-sm flex items-center gap-1 border border-[#e0e8e2] dark:border-zinc-600">
                    <div className="w-1.5 h-1.5 bg-[#8fba67] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-[#8fba67] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-[#8fba67] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {paso !== "inicio" && paso !== "fin" && (
            <form onSubmit={handleInputSubmit} className="p-3 bg-white dark:bg-zinc-900 border-t border-[#e0e8e2] dark:border-zinc-700 flex gap-2 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10">
              <input 
                type={paso === "pedir_email" || paso === "email_correo" ? "email" : "text"}
                value={inputValor}
                onChange={e => setInputValor(e.target.value)}
                placeholder={paso === "pedir_id" ? "Ej. 124 o Cédula" : (paso.includes('correo') || paso.includes('email') ? "tu@correo.com" : "Escribe aquí...")}
                className="flex-1 px-4 py-2 bg-[#f8f9f8] border border-[#d4ddd6] rounded-full text-sm outline-none focus:border-[#1a2e22] focus:bg-white transition dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:focus:border-green-500"
                autoFocus
              />
              <button type="submit" disabled={!inputValor.trim() || cargando} className="bg-[#1a2e22] text-white w-10 h-10 flex items-center justify-center rounded-full disabled:opacity-50 hover:bg-[#24402f] transition shadow-md shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform -rotate-90 translate-y-[-1px] translate-x-[1px]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          )}
          
          {paso === "inicio" && (
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-[#e0e8e2] dark:border-zinc-700 flex justify-between items-center text-[11px] font-semibold text-[#8b9b90] shrink-0 z-10">
               <span>Elige una opción arriba</span>
            </div>
          )}
        </div>
      )}

      <div className="relative flex flex-col items-end">
        <button
          onClick={abierto ? intentarCerrar : () => setAbierto(true)}
          className={`w-14 h-14 shrink-0 rounded-full shadow-[0_8px_30px_rgba(26,46,34,0.3)] hover:scale-110 transition-all duration-300 flex items-center justify-center ${abierto ? 'bg-[#1a2e22]' : 'bg-[#1a2e22]'}`}
        >
          {abierto ? (
             <span className="text-white font-bold text-2xl leading-none flex items-center justify-center">&times;</span>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
               <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
             </svg>
          )}
        </button>
      </div>
    </div>
  );
}
