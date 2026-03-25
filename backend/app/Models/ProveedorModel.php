<?php

require_once __DIR__ . '/../../config/Database.php';

class ProveedorModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT
                p.Cod_Proveedor,
                p.Nombre_proveedor,
                p.Telefono_proveedor,
                p.Correo_proveedor,
                COUNT(DISTINCT pr.Cod_Producto) AS total_productos,
                SUM(CASE WHEN COALESCE(i.Stock, pr.Cantidad) <= 10 THEN 1 ELSE 0 END) AS productos_bajo_stock
            FROM proveedor p
            LEFT JOIN producto pr ON pr.Cod_Proveedor = p.Cod_Proveedor
            LEFT JOIN inventario i ON i.Cod_Producto = pr.Cod_Producto
            GROUP BY p.Cod_Proveedor, p.Nombre_proveedor, p.Telefono_proveedor, p.Correo_proveedor
            ORDER BY p.Nombre_proveedor ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM proveedor WHERE Cod_Proveedor = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getProductosBajoStock(int $id): array {
        $stmt = $this->db->prepare("
            SELECT pr.Cod_Producto, pr.Nombre, COALESCE(i.Stock, pr.Cantidad) AS Stock
            FROM producto pr
            LEFT JOIN inventario i ON i.Cod_Producto = pr.Cod_Producto
            WHERE pr.Cod_Proveedor = ?
              AND COALESCE(i.Stock, pr.Cantidad) <= 10
            ORDER BY COALESCE(i.Stock, pr.Cantidad) ASC
        ");
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear(array $d): int {
        $stmt = $this->db->prepare(
            "INSERT INTO proveedor (Nombre_proveedor, Telefono_proveedor, Correo_proveedor)
             VALUES (?, ?, ?)"
        );
        $stmt->execute([trim($d['nombre']), trim($d['telefono']), trim($d['correo'])]);
        return (int) $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $d): bool {
        $stmt = $this->db->prepare(
            "UPDATE proveedor
             SET Nombre_proveedor=?, Telefono_proveedor=?, Correo_proveedor=?
             WHERE Cod_Proveedor=?"
        );
        return $stmt->execute([trim($d['nombre']), trim($d['telefono']), trim($d['correo']), $id]);
    }

    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM proveedor WHERE Cod_Proveedor = ?");
        return $stmt->execute([$id]);
    }
}
