<?php
// backend/app/Models/CarritoModel.php

require_once __DIR__ . '/../../config/Database.php';

class CarritoModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function obtenerCarritoPorDocumento(int $doc): ?array {
        $carrito = $this->db->prepare("SELECT Cod_Carrito, Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total
                                       FROM carrito WHERE Num_Documento = :doc LIMIT 1");
        $carrito->execute([':doc' => $doc]);
        $c = $carrito->fetch();
        if (!$c) return null;

        $items = $this->db->prepare(
            "SELECT
                ci.Cod_carrito_item,
                ci.Cantidad,
                ci.Precio,
                ci.Cod_producto,
                p.Nombre,
                p.Imagen_url,
                p.Precio AS Precio_base,
                p.Cantidad AS Stock,
                c.Nombre AS categoria
             FROM carrito_item ci
             INNER JOIN producto p ON p.Cod_Producto = ci.Cod_producto
             LEFT JOIN categoria c ON c.Cod_Categoria = p.Cod_Categoria
             WHERE ci.Cod_carrito = :carrito
             ORDER BY ci.Cod_carrito_item DESC"
        );
        $items->execute([':carrito' => (int)$c['Cod_Carrito']]);

        $c['items'] = $items->fetchAll();
        return $c;
    }

    public function obtenerCarritoId(int $doc): int {
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

    public function agregarItem(int $doc, int $productoId, int $cantidad): void {
        $cantidad = max(1, $cantidad);
        $carritoId = $this->obtenerCarritoId($doc);

        $producto = $this->db->prepare("SELECT Cod_Producto, Precio, Cantidad FROM producto WHERE Cod_Producto = :id");
        $producto->execute([':id' => $productoId]);
        $p = $producto->fetch();
        if (!$p) {
            throw new RuntimeException('Producto no encontrado.');
        }

        $stock = (int)($p['Cantidad'] ?? 0);
        if ($stock > 0 && $cantidad > $stock) {
            throw new RuntimeException('No hay stock suficiente.');
        }

        $exist = $this->db->prepare("SELECT Cod_carrito_item, Cantidad FROM carrito_item WHERE Cod_carrito = :c AND Cod_producto = :p");
        $exist->execute([':c' => $carritoId, ':p' => $productoId]);
        $row = $exist->fetch();

        $precioUnit = (int)($p['Precio'] ?? 0);
        if ($row) {
            $nuevaCantidad = (int)$row['Cantidad'] + $cantidad;
            if ($stock > 0 && $nuevaCantidad > $stock) {
                throw new RuntimeException('No hay stock suficiente.');
            }
            $this->db->prepare(
                "UPDATE carrito_item SET Cantidad = :cant, Precio = :precio WHERE Cod_carrito_item = :id"
            )->execute([
                ':cant' => $nuevaCantidad,
                ':precio' => $precioUnit * $nuevaCantidad,
                ':id' => (int)$row['Cod_carrito_item'],
            ]);
        } else {
            $this->db->prepare(
                "INSERT INTO carrito_item (Cantidad, Precio, Cod_producto, Cod_carrito)
                 VALUES (:cant, :precio, :prod, :carrito)"
            )->execute([
                ':cant' => $cantidad,
                ':precio' => $precioUnit * $cantidad,
                ':prod' => $productoId,
                ':carrito' => $carritoId,
            ]);
        }

        $this->sincronizarTotales($carritoId);
    }

    public function eliminarItem(int $doc, int $itemId): void {
        $carritoId = $this->obtenerCarritoId($doc);
        $this->db->prepare(
            "DELETE FROM carrito_item WHERE Cod_carrito_item = :id AND Cod_carrito = :carrito"
        )->execute([':id' => $itemId, ':carrito' => $carritoId]);

        $this->sincronizarTotales($carritoId);
    }

    public function vaciar(int $doc): void {
        $carritoId = $this->obtenerCarritoId($doc);
        $this->db->prepare("DELETE FROM carrito_item WHERE Cod_carrito = :carrito")->execute([':carrito' => $carritoId]);
        $this->sincronizarTotales($carritoId);
    }

    public function sincronizarTotales(int $carritoId): void {
        $this->db->prepare(
            "UPDATE carrito c
             SET
               c.Cantidad_articulos = (SELECT COALESCE(SUM(ci.Cantidad), 0) FROM carrito_item ci WHERE ci.Cod_carrito = :carrito),
               c.Total = (SELECT COALESCE(SUM(ci.Precio), 0) FROM carrito_item ci WHERE ci.Cod_carrito = :carrito),
               c.Fecha_modificacion = NOW()
             WHERE c.Cod_Carrito = :carrito"
        )->execute([':carrito' => $carritoId]);
    }
}

