<?php
// backend/app/Models/InventarioModel.php

require_once __DIR__ . '/../../config/Database.php';

class InventarioModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll(): array {
        $sql = "SELECT
                    i.Cod_Inventario,
                    i.Stock,
                    i.Registrar_Entradas,
                    i.Registrar_Salidas,
                    p.Cod_Producto,
                    p.Nombre AS Producto,
                    p.Precio,
                    p.Cantidad AS Stock_Producto,
                    p.Imagen_url,
                    c.Nombre AS Categoria
                FROM inventario i
                INNER JOIN producto p ON p.Cod_Producto = i.Cod_Producto
                LEFT JOIN categoria c ON c.Cod_Categoria = p.Cod_Categoria
                ORDER BY p.Nombre ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getStockBajo(int $umbral = 10): array {
        $stmt = $this->db->prepare(
            "SELECT i.Cod_Inventario, i.Stock, p.Cod_Producto, p.Nombre AS Producto, c.Nombre AS Categoria
             FROM inventario i
             INNER JOIN producto p ON p.Cod_Producto = i.Cod_Producto
             LEFT JOIN categoria c ON c.Cod_Categoria = p.Cod_Categoria
             WHERE i.Stock <= :umbral
             ORDER BY i.Stock ASC"
        );
        $stmt->execute([':umbral' => $umbral]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizar(int $codInventario, int $stock, ?int $entradas = null, ?int $salidas = null): bool {
        $params = [':stock' => $stock, ':id' => $codInventario];
        $sets = ['Stock = :stock'];

        if ($entradas !== null) {
            $sets[] = 'Registrar_Entradas = :entradas';
            $params[':entradas'] = $entradas;
        }
        if ($salidas !== null) {
            $sets[] = 'Registrar_Salidas = :salidas';
            $params[':salidas'] = $salidas;
        }

        $stmt = $this->db->prepare(
            "UPDATE inventario SET " . implode(', ', $sets) . " WHERE Cod_Inventario = :id"
        );
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            // Sincronizar cantidad en tabla producto
            $this->db->prepare(
                "UPDATE producto SET Cantidad = :stock WHERE Cod_Producto = (SELECT Cod_Producto FROM inventario WHERE Cod_Inventario = :id)"
            )->execute([':stock' => $stock, ':id' => $codInventario]);
        }

        return $stmt->rowCount() > 0;
    }
}
