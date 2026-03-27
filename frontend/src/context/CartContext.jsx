import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function parseSafe(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const { usuario } = useAuth();
  const cartKey = usuario?.Num_Documento ? `md_cart_${usuario.Num_Documento}` : null;

  const [items, setItems] = useState([]);

  // Cuando cambia el usuario (login/logout), cargar su carrito propio
  useEffect(() => {
    if (cartKey) {
      setItems(parseSafe(localStorage.getItem(cartKey), []));
    } else {
      setItems([]);
    }
  }, [cartKey]);

  // Persistir cambios solo si hay usuario autenticado
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, cartKey]);

  const addItem = (producto) => {
    const id = Number(producto.Cod_Producto);
    const precio = Number(producto.precio_oferta || producto.Precio || 0);
    const stock = Number(producto.Cantidad || 0);

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const next = [...prev];
        const nuevaCantidad = Math.min(next[idx].cantidad + 1, stock || 9999);
        next[idx] = { ...next[idx], cantidad: nuevaCantidad, precio };
        return next;
      }
      return [
        ...prev,
        {
          id,
          nombre: producto.Nombre,
          precio,
          precioOriginal: Number(producto.Precio || 0),
          imagen: producto.imagen_url || producto.Imagen_url || "",
          categoria: producto.categoria || "",
          stock,
          cantidad: 1,
        },
      ];
    });
  };

  const updateQty = (id, cantidad) => {
    const qty = Number(cantidad);
    if (!Number.isFinite(qty)) return;

    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id !== id) return it;
          const max = it.stock || 9999;
          const nueva = Math.max(1, Math.min(qty, max));
          return { ...it, cantidad: nueva };
        })
        .filter((it) => it.cantidad > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const itemsCount = items.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);
    const subtotal = items.reduce((acc, it) => acc + Number(it.precio || 0) * Number(it.cantidad || 0), 0);
    return { itemsCount, subtotal };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        itemsCount: totals.itemsCount,
        subtotal: totals.subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
