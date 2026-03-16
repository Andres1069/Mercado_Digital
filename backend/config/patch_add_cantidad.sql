-- Aplica este parche en tu BD Mercado_Digital si aparece:
-- SQLSTATE[42S22]: Column not found: 1054 Unknown column 'Cantidad'

-- 1) Verifica columnas actuales
DESCRIBE producto;
DESCRIBE carrito_item;
DESCRIBE detalle_pedido;

-- 2) Agrega columnas faltantes (ejecuta solo si no existen)
ALTER TABLE producto ADD COLUMN Cantidad INT NOT NULL DEFAULT 0;
ALTER TABLE carrito_item ADD COLUMN Cantidad INT NOT NULL DEFAULT 1;
ALTER TABLE detalle_pedido ADD COLUMN Cantidad INT NOT NULL DEFAULT 1;

-- 3) (Opcional) Validar
SELECT Cantidad FROM producto LIMIT 1;
SELECT Cantidad FROM carrito_item LIMIT 1;
SELECT Cantidad FROM detalle_pedido LIMIT 1;
