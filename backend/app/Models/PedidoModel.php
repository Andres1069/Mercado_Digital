<?php
// backend/app/Models/PedidoModel.php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/PagoModel.php';

class PedidoModel {
    private PDO $db;
    private array $pagoCols = [];
    private array $domicilioCols = [];

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureVentaColumns();
        try {
            new PagoModel(); // Si puede, actualiza columnas de MercadoPago; si no, usamos selects compatibles.
        } catch (Throwable $e) {
            error_log('[PedidoModel] No se pudo sincronizar columnas de pago: ' . $e->getMessage());
        }
        $this->detectarSchema();
    }

    private function ensureVentaColumns(): void {
        try {
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Canal_Venta VARCHAR(20) NOT NULL DEFAULT 'Online'");
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Tipo_Entrega VARCHAR(20) NOT NULL DEFAULT 'Domicilio'");
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Num_Documento_Vendedor INT DEFAULT NULL");
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Observaciones_Venta VARCHAR(255) DEFAULT NULL");
        } catch (Throwable $e) {
            error_log('[PedidoModel] No se pudo sincronizar columnas de venta: ' . $e->getMessage());
        }
    }

    private function detectarSchema(): void {
        $this->pagoCols = $this->columnasTabla('pago');
        $this->domicilioCols = $this->columnasTabla('domicilio');
    }

    private function columnasTabla(string $tabla): array {
        try {
            $stmt = $this->db->prepare(
                "SELECT COLUMN_NAME
                 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = :tabla"
            );
            $stmt->execute([':tabla' => $tabla]);
            return array_map(static fn($r) => (string)$r['COLUMN_NAME'], $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        } catch (Throwable) {
            return [];
        }
    }

    private function hasCol(array $cols, string $col): bool {
        foreach ($cols as $c) {
            if (strcasecmp($c, $col) === 0) return true;
        }
        return false;
    }

    private function selectPago(string $col, string $alias = ''): string {
        $salida = $alias !== '' ? $alias : $col;
        return $this->hasCol($this->pagoCols, $col)
            ? "pa.$col AS $salida"
            : "NULL AS $salida";
    }

    private function selectDomicilio(string $col, string $alias = ''): string {
        $salida = $alias !== '' ? $alias : $col;
        return $this->hasCol($this->domicilioCols, $col)
            ? "d.$col AS $salida"
            : "NULL AS $salida";
    }

    public function getMisPedidos(int $numDocumento): array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    p.Canal_Venta,
                    p.Tipo_Entrega,
                    p.Num_Documento_Vendedor,
                    p.Observaciones_Venta,
                    c.Cantidad_articulos,
                    c.Total AS Total_Carrito,
                    pa.Metodo_Pago,
                    pa.Estado_Pago,
                    pa.Monto_Pago,
                    " . $this->selectPago('mp_payment_id') . ",
                    " . $this->selectPago('mp_status') . ",
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

    public function getAll(int $pagina = 0, int $limite = 0): array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    p.Canal_Venta,
                    p.Tipo_Entrega,
                    p.Num_Documento_Vendedor,
                    p.Observaciones_Venta,
                    c.Cantidad_articulos,
                    c.Total AS Total_Carrito,
                    pa.Metodo_Pago,
                    pa.Estado_Pago,
                    pa.Monto_Pago,
                    " . $this->selectPago('mp_payment_id') . ",
                    " . $this->selectPago('mp_status') . ",
                    per.Nombre,
                    per.Apellido,
                    per.Num_Documento,
                    per.Correo,
                    per.Telefono AS Telefono_Cliente,
                    per.Direccion AS Direccion_Cliente,
                    d.Cod_Domicilio,
                    d.Estado AS Estado_Domicilio
                    ,
                    " . $this->selectDomicilio('Direccion_entrega') . ",
                    " . $this->selectDomicilio('Telefono', 'Telefono_entrega') . ",
                    " . $this->selectDomicilio('Notas') . "
                FROM pedido p
                INNER JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                INNER JOIN persona per ON per.Num_Documento = up.Num_Documento
                INNER JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                ORDER BY p.Fecha_Pedido DESC";

        if ($pagina > 0 && $limite > 0) {
            $cntStmt = $this->db->prepare("SELECT COUNT(*) FROM ($sql) AS _c");
            $cntStmt->execute();
            $total  = (int)$cntStmt->fetchColumn();
            $offset = ($pagina - 1) * $limite;
            $stmt   = $this->db->prepare($sql . " LIMIT $limite OFFSET $offset");
            $stmt->execute();
            return [
                'datos'   => $stmt->fetchAll(),
                'total'   => $total,
                'pagina'  => $pagina,
                'paginas' => max(1, (int)ceil($total / $limite)),
            ];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getContactoPedido(int $codPedido): ?array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    per.Nombre,
                    per.Apellido,
                    per.Correo,
                    per.Telefono,
                    per.Direccion AS Direccion_Cliente,
                    d.Cod_Domicilio,
                    d.Estado AS Estado_Domicilio,
                    " . $this->selectDomicilio('Direccion_entrega') . ",
                    " . $this->selectDomicilio('Telefono', 'Telefono_entrega') . "
                FROM pedido p
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                INNER JOIN persona per ON per.Num_Documento = up.Num_Documento
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE p.Cod_Pedido = :id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $codPedido]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getById(int $codPedido): ?array {
        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    p.Canal_Venta,
                    p.Tipo_Entrega,
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
    /**
     * Verifica stock de todos los ítems antes de abrir la transacción.
     * Lanza RuntimeException con los productos problemáticos si alguno falla.
     */
    private function verificarStock(array $items): void {
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
            if (!$row) continue; // producto inexistente, lo detecta el FK del INSERT
            $qty = max(1, (int)($item['cantidad'] ?? 1));
            if ($row['Stock'] !== null && (int)$row['Stock'] < $qty) {
                $disponible = (int)$row['Stock'];
                $agotados[] = $disponible <= 0
                    ? "{$row['Nombre']} (agotado)"
                    : "{$row['Nombre']} (solo $disponible disponibles, pediste $qty)";
            }
        }
        if (!empty($agotados)) {
            throw new RuntimeException('Sin stock suficiente: ' . implode('; ', $agotados));
        }
    }

    public function crear(int $numDocumento, array $items, string $metodoPago, int $montoTotal, array $extra = []): int {
        // Validar stock ANTES de abrir la transacción para no hacer rollback innecesario
        $this->verificarStock($items);

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

            $canalVenta = trim((string)($extra['canal_venta'] ?? 'Online'));
            $canalVenta = in_array($canalVenta, ['Online', 'Tienda'], true) ? $canalVenta : 'Online';
            $tipoEntrega = trim((string)($extra['tipo_entrega'] ?? 'Domicilio'));
            $tipoEntrega = in_array($tipoEntrega, ['Domicilio', 'Recoger_Tienda'], true) ? $tipoEntrega : 'Domicilio';
            $estadoPedido = trim((string)($extra['estado_pedido'] ?? 'Pendiente'));
            $vendedor = isset($extra['vendedor']) ? (int)$extra['vendedor'] : null;
            $observaciones = $extra['observaciones'] ?? null;

            // 4. Crear pedido
            $stmt = $this->db->prepare(
                "INSERT INTO pedido (Fecha_Pedido, Estado_Pedido, Cod_Carrito, Canal_Venta, Tipo_Entrega, Num_Documento_Vendedor, Observaciones_Venta)
                 VALUES (NOW(), :estado, :carrito, :canal, :tipo_entrega, :vendedor, :observaciones)"
            );
            $stmt->execute([
                ':estado' => $estadoPedido,
                ':carrito' => $codCarrito,
                ':canal' => $canalVenta,
                ':tipo_entrega' => $tipoEntrega,
                ':vendedor' => $vendedor,
                ':observaciones' => $observaciones,
            ]);
            $codPedido = (int)$this->db->lastInsertId();

            // 5. Crear usuario_pedido
            $stmt = $this->db->prepare(
                "INSERT INTO usuario_pedido (Cod_pedido, Num_Documento) VALUES (:pedido, :doc)"
            );
            $stmt->execute([':pedido' => $codPedido, ':doc' => $numDocumento]);

            $estadoPago = trim((string)($extra['estado_pago'] ?? 'Pendiente'));
            // 6. Crear pago
            $stmt = $this->db->prepare(
                "INSERT INTO pago (Cod_pedido, Metodo_Pago, Monto_Pago, Estado_Pago, Fecha_Pago)
                 VALUES (:pedido, :metodo, :monto, :estado_pago, NOW())"
            );
            $stmt->execute([':pedido' => $codPedido, ':metodo' => $metodoPago, ':monto' => $montoTotal, ':estado_pago' => $estadoPago]);

            // 7. Crear detalle_pedido (el trigger tr_bajar_inventario descuenta el stock)
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

    public function actualizarTipoEntrega(int $codPedido, int $numDocumento, string $tipoEntrega): bool {
        $tipoEntrega = in_array($tipoEntrega, ['Domicilio', 'Recoger_Tienda'], true) ? $tipoEntrega : 'Domicilio';
        $stmt = $this->db->prepare(
            "UPDATE pedido p
             INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
             SET p.Tipo_Entrega = :tipo
             WHERE p.Cod_Pedido = :pedido
               AND up.Num_Documento = :doc"
        );
        $stmt->execute([':tipo' => $tipoEntrega, ':pedido' => $codPedido, ':doc' => $numDocumento]);
        if ($stmt->rowCount() > 0) return true;

        $chk = $this->db->prepare(
            "SELECT 1
             FROM pedido p
             INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
             WHERE p.Cod_Pedido = :pedido
               AND up.Num_Documento = :doc
             LIMIT 1"
        );
        $chk->execute([':pedido' => $codPedido, ':doc' => $numDocumento]);
        return (bool)$chk->fetchColumn();
    }
}
