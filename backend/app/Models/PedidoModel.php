<?php
// backend/app/Models/PedidoModel.php

require_once __DIR__ . '/../../config/Database.php';

class PedidoModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getMisPedidos(int $numDocumento): array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    c.Cantidad_articulos,
                    c.Total AS Total_Carrito,
                    pa.Metodo_Pago,
                    pa.Estado_Pago,
                    pa.Monto_Pago,
                    pa.mp_payment_id,
                    pa.mp_status,
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio
                FROM pedido p
                INNER JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                INNER JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE up.Num_Documento = :doc
                ORDER BY p.Fecha_Pedido DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $numDocumento]);
        return $stmt->fetchAll();
    }

    public function getAll(): array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    c.Cantidad_articulos,
                    c.Total AS Total_Carrito,
                    pa.Metodo_Pago,
                    pa.Estado_Pago,
                    pa.Monto_Pago,
                    pa.mp_payment_id,
                    pa.mp_status,
                    per.Nombre,
                    per.Apellido,
                    per.Num_Documento,
                    d.Estado AS Estado_Domicilio
                FROM pedido p
                INNER JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                INNER JOIN persona per ON per.Num_Documento = up.Num_Documento
                INNER JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                ORDER BY p.Fecha_Pedido DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById(int $codPedido): ?array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    c.Cod_Carrito,
                    c.Cantidad_articulos,
                    c.Total AS Total_Carrito,
                    pa.Metodo_Pago,
                    pa.Estado_Pago,
                    pa.Monto_Pago,
                    per.Nombre,
                    per.Apellido,
                    per.Num_Documento,
                    per.Telefono,
                    per.Direccion,
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio
                FROM pedido p
                INNER JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                INNER JOIN persona per ON per.Num_Documento = up.Num_Documento
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE p.Cod_Pedido = :id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $codPedido]);
        $row = $stmt->fetch();

        if (!$row) return null;

        // Detalle items
        $stmt2 = $this->db->prepare(
            "SELECT dp.Cantidad, dp.Precio_unitario, dp.Subtotal, pr.Nombre AS Producto
             FROM detalle_pedido dp
             INNER JOIN producto pr ON pr.Cod_Producto = dp.Cod_Producto
             WHERE dp.Cod_Pedido = :id"
        );
        $stmt2->execute([':id' => $codPedido]);
        $row['items'] = $stmt2->fetchAll();

        return $row;
    }

    /**
     * Crea un pedido desde los items del carrito del frontend (localStorage).
     * Guarda el snapshot en DB: carrito_item, pedido, usuario_pedido, pago, detalle_pedido.
     */
    public function crear(int $numDocumento, array $items, string $metodoPago, int $montoTotal): int {
        $this->db->beginTransaction();
        try {
            // 1. Obtener (o crear) el carrito del usuario
            $stmt = $this->db->prepare("SELECT Cod_Carrito FROM carrito WHERE Num_Documento = :doc LIMIT 1");
            $stmt->execute([':doc' => $numDocumento]);
            $codCarrito = (int)($stmt->fetchColumn() ?: 0);

            if ($codCarrito <= 0) {
                $stmt = $this->db->prepare(
                    "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
                     VALUES (NOW(), NOW(), 0, 0, :doc)"
                );
                $stmt->execute([':doc' => $numDocumento]);
                $codCarrito = (int)$this->db->lastInsertId();
            }

            // 2. Limpiar items previos y resetear totales
            $this->db->prepare("DELETE FROM carrito_item WHERE Cod_carrito = :c")->execute([':c' => $codCarrito]);
            $this->db->prepare(
                "UPDATE carrito SET Cantidad_articulos = 0, Total = 0, Fecha_modificacion = NOW() WHERE Cod_Carrito = :c"
            )->execute([':c' => $codCarrito]);

            // 3. Insertar nuevos items (el trigger tr_actualizar_carrito recalcula totales)
            $stmtItem = $this->db->prepare(
                "INSERT INTO carrito_item (Cantidad, Precio, Cod_producto, Cod_carrito)
                 VALUES (:qty, :precio, :prod, :carrito)"
            );
            foreach ($items as $item) {
                $qty    = max(1, (int)($item['cantidad'] ?? 1));
                $precio = (int)($item['precio'] ?? 0);
                $stmtItem->execute([
                    ':qty'     => $qty,
                    ':precio'  => $precio * $qty,   // Precio total de la línea
                    ':prod'    => (int)($item['id'] ?? 0),
                    ':carrito' => $codCarrito,
                ]);
            }

            // 4. Crear pedido
            $stmt = $this->db->prepare(
                "INSERT INTO pedido (Fecha_Pedido, Estado_Pedido, Cod_Carrito)
                 VALUES (NOW(), 'Pendiente', :carrito)"
            );
            $stmt->execute([':carrito' => $codCarrito]);
            $codPedido = (int)$this->db->lastInsertId();

            // 5. Crear usuario_pedido
            $stmt = $this->db->prepare(
                "INSERT INTO usuario_pedido (Cod_pedido, Num_Documento) VALUES (:pedido, :doc)"
            );
            $stmt->execute([':pedido' => $codPedido, ':doc' => $numDocumento]);

            // 6. Crear pago
            $stmt = $this->db->prepare(
                "INSERT INTO pago (Cod_pedido, Metodo_Pago, Monto_Pago, Estado_Pago)
                 VALUES (:pedido, :metodo, :monto, 'Pending')"
            );
            $stmt->execute([':pedido' => $codPedido, ':metodo' => $metodoPago, ':monto' => $montoTotal]);

            // 7. Validar stock disponible antes de insertar el detalle
            // LEFT JOIN: si el producto no tiene fila en inventario se omite la validación.
            $stmtChk = $this->db->prepare(
                "SELECT p.Nombre, i.Stock
                 FROM producto p
                 LEFT JOIN inventario i ON i.Cod_Producto = p.Cod_Producto
                 WHERE p.Cod_Producto = :prod"
            );
            $agotados = [];
            foreach ($items as $item) {
                $stmtChk->execute([':prod' => (int)($item['id'] ?? 0)]);
                $row = $stmtChk->fetch(PDO::FETCH_ASSOC);
                if (!$row) continue; // producto inexistente, el INSERT fallará solo
                $qty  = max(1, (int)($item['cantidad'] ?? 1));
                // Solo bloquear si existe registro en inventario Y el stock es insuficiente
                if ($row['Stock'] !== null && (int)$row['Stock'] < $qty) {
                    $nombre     = $row['Nombre'];
                    $disponible = (int)$row['Stock'];
                    $agotados[] = $disponible <= 0
                        ? "$nombre (agotado)"
                        : "$nombre (solo $disponible disponibles, pediste $qty)";
                }
            }
            if (!empty($agotados)) {
                throw new RuntimeException('Sin stock suficiente: ' . implode('; ', $agotados));
            }

            // 8. Crear detalle_pedido (el trigger tr_bajar_inventario descuenta el stock)
            $stmtDet = $this->db->prepare(
                "INSERT INTO detalle_pedido (Cantidad, Precio_unitario, Subtotal, Cod_Pedido, Cod_Producto)
                 VALUES (:qty, :precio, :subtotal, :pedido, :prod)"
            );
            $idsProductos = [];
            foreach ($items as $item) {
                $qty     = max(1, (int)($item['cantidad'] ?? 1));
                $precio  = (int)($item['precio'] ?? 0);
                $stmtDet->execute([
                    ':qty'     => $qty,
                    ':precio'  => $precio,
                    ':subtotal'=> $precio * $qty,
                    ':pedido'  => $codPedido,
                    ':prod'    => (int)($item['id'] ?? 0),
                ]);
                $idsProductos[] = (int)($item['id'] ?? 0);
            }

            // 9. Sincronizar producto.Cantidad con inventario.Stock (el trigger solo toca inventario)
            if (!empty($idsProductos)) {
                $placeholders = implode(',', array_fill(0, count($idsProductos), '?'));
                $this->db->prepare(
                    "UPDATE producto p
                     INNER JOIN inventario i ON i.Cod_Producto = p.Cod_Producto
                     SET p.Cantidad = i.Stock
                     WHERE p.Cod_Producto IN ($placeholders)"
                )->execute($idsProductos);
            }

            $this->db->commit();
            return $codPedido;
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    public function cambiarEstado(int $codPedido, string $estado): bool {
        $estadosValidos = ['Pendiente', 'Confirmado', 'En preparacion', 'En camino', 'Entregado', 'Cancelado'];
        if (!in_array($estado, $estadosValidos, true)) {
            throw new InvalidArgumentException("Estado invalido: $estado");
        }
        $stmt = $this->db->prepare("UPDATE pedido SET Estado_Pedido = :estado WHERE Cod_Pedido = :id");
        $stmt->execute([':estado' => $estado, ':id' => $codPedido]);
        return $stmt->rowCount() > 0;
    }
}
