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
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio
                FROM pedido p
                INNER JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE up.Num_Documento = :doc
                ORDER BY p.Fecha_Pedido DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $numDocumento]);
        return $stmt->fetchAll();
    }

    public function crearVenta(int $numDocumento, array $items, string $metodoPago): array {
        if (empty($items)) {
            throw new RuntimeException('El carrito esta vacio.');
        }

        $this->db->beginTransaction();

        try {
            // Asegura carrito
            $carritoId = $this->obtenerCarritoId($numDocumento);

            // Limpia items actuales y recrea desde el front (fuente de verdad).
            $this->db->prepare("DELETE FROM carrito_item WHERE Cod_carrito = :c")->execute([':c' => $carritoId]);

            $detalle = [];
            $total = 0;
            $cantidadArticulos = 0;

            $stmtProducto = $this->db->prepare(
                "SELECT Cod_Producto, Nombre, Precio, Cantidad, Imagen_url
                 FROM producto WHERE Cod_Producto = :id"
            );
            $stmtOferta = $this->db->prepare(
                "SELECT Porcentaje_Descuento
                 FROM oferta
                 WHERE Cod_Producto = :id AND activo = 1
                   AND NOW() BETWEEN Fecha_Inicio AND Fecha_Fin
                 ORDER BY Porcentaje_Descuento DESC
                 LIMIT 1"
            );
            $insertItem = $this->db->prepare(
                "INSERT INTO carrito_item (Cantidad, Precio, Cod_producto, Cod_carrito)
                 VALUES (:cant, :precio, :prod, :carrito)"
            );

            foreach ($items as $it) {
                $prodId = (int)($it['id'] ?? $it['Cod_Producto'] ?? 0);
                $cant = (int)($it['cantidad'] ?? 0);
                if ($prodId <= 0 || $cant <= 0) {
                    throw new RuntimeException('Producto invalido en carrito.');
                }

                $stmtProducto->execute([':id' => $prodId]);
                $p = $stmtProducto->fetch();
                if (!$p) {
                    throw new RuntimeException('Producto no encontrado.');
                }

                $stock = (int)($p['Cantidad'] ?? 0);
                if ($stock > 0 && $cant > $stock) {
                    throw new RuntimeException('No hay stock suficiente para ' . $p['Nombre'] . '.');
                }

                $precioBase = (int)($p['Precio'] ?? 0);
                $precioUnit = $precioBase;
                $descuentoPct = 0;

                $stmtOferta->execute([':id' => $prodId]);
                $oferta = $stmtOferta->fetch();
                if ($oferta && isset($oferta['Porcentaje_Descuento'])) {
                    $descuentoPct = (int)$oferta['Porcentaje_Descuento'];
                    if ($descuentoPct > 0) {
                        $precioUnit = (int)round($precioBase - ($precioBase * $descuentoPct / 100));
                    }
                }
                $sub = $precioUnit * $cant;

                $insertItem->execute([
                    ':cant' => $cant,
                    ':precio' => $sub,
                    ':prod' => $prodId,
                    ':carrito' => $carritoId,
                ]);

                $detalle[] = [
                    'Cod_Producto' => (int)$p['Cod_Producto'],
                    'Nombre' => $p['Nombre'],
                    'Cantidad' => $cant,
                    'Precio_unitario' => $precioUnit,
                    'Precio_original' => $precioBase,
                    'Porcentaje_Descuento' => $descuentoPct,
                    'Subtotal' => $sub,
                    'Imagen_url' => $p['Imagen_url'] ?? '',
                ];
                $total += $sub;
                $cantidadArticulos += $cant;
            }

            // Actualiza totales del carrito
            $this->db->prepare(
                "UPDATE carrito
                 SET Cantidad_articulos = :cant, Total = :total, Fecha_modificacion = NOW()
                 WHERE Cod_Carrito = :c"
            )->execute([':cant' => $cantidadArticulos, ':total' => $total, ':c' => $carritoId]);

            // Pedido
            $this->db->prepare(
                "INSERT INTO pedido (Fecha_Pedido, Estado_Pedido, Cod_Carrito)
                 VALUES (NOW(), 'Confirmado', :carrito)"
            )->execute([':carrito' => $carritoId]);
            $pedidoId = (int)$this->db->lastInsertId();

            // Usuario_pedido
            $this->db->prepare(
                "INSERT INTO usuario_pedido (Num_Documento, Cod_pedido)
                 VALUES (:doc, :pedido)"
            )->execute([':doc' => $numDocumento, ':pedido' => $pedidoId]);
            $usuarioPedidoId = (int)$this->db->lastInsertId();

            // Detalle pedido
            $insDetalle = $this->db->prepare(
                "INSERT INTO detalle_pedido (Cantidad, Precio_unitario, Subtotal, Cod_Pedido, Cod_Producto)
                 VALUES (:cant, :precio, :sub, :pedido, :prod)"
            );
            foreach ($detalle as $d) {
                $insDetalle->execute([
                    ':cant' => $d['Cantidad'],
                    ':precio' => $d['Precio_unitario'],
                    ':sub' => $d['Subtotal'],
                    ':pedido' => $pedidoId,
                    ':prod' => $d['Cod_Producto'],
                ]);
            }

            // Pago
            $metodo = $metodoPago !== '' ? $metodoPago : 'Efectivo';
            $this->db->prepare(
                "INSERT INTO pago (Metodo_Pago, Fecha_Pago, Monto_Pago, Cod_pedido, Estado_Pago)
                 VALUES (:metodo, NOW(), :monto, :pedido, 'Completado')"
            )->execute([':metodo' => $metodo, ':monto' => $total, ':pedido' => $pedidoId]);

            // Domicilio (opcional)
            $this->db->prepare(
                "INSERT INTO domicilio (Fecha, Estado, Cod_Usuario_Pedido)
                 VALUES (NOW(), 'Pendiente', :usuario_pedido)"
            )->execute([':usuario_pedido' => $usuarioPedidoId]);

            // Limpia carrito para nueva compra
            $this->db->prepare("DELETE FROM carrito_item WHERE Cod_carrito = :c")->execute([':c' => $carritoId]);
            $this->db->prepare(
                "UPDATE carrito
                 SET Cantidad_articulos = 0, Total = 0, Fecha_modificacion = NOW()
                 WHERE Cod_Carrito = :c"
            )->execute([':c' => $carritoId]);

            $this->db->commit();

            return [
                'pedido_id' => $pedidoId,
                'total' => $total,
                'items' => $detalle,
                'metodo_pago' => $metodo,
                'fecha' => date('c'),
            ];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function obtenerCarritoId(int $doc): int {
        $stmt = $this->db->prepare("SELECT Cod_Carrito FROM carrito WHERE Num_Documento = :doc LIMIT 1");
        $stmt->execute([':doc' => $doc]);
        $id = $stmt->fetchColumn();
        if ($id) return (int)$id;

        $this->db->prepare(
            "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
             VALUES (NOW(), NOW(), 0, 0, :doc)"
        )->execute([':doc' => $doc]);

        return (int)$this->db->lastInsertId();
    }
}
