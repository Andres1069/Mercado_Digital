<?php
// backend/app/Models/ProductoModel.php

require_once __DIR__ . '/../../config/Database.php';

class ProductoModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureImageAdjustColumns();
    }

    private function ensureImageAdjustColumns(): void {
        $this->db->exec("ALTER TABLE producto ADD COLUMN IF NOT EXISTS Imagen_zoom DECIMAL(4,2) NOT NULL DEFAULT 1.00");
        $this->db->exec("ALTER TABLE producto ADD COLUMN IF NOT EXISTS Imagen_pos_x DECIMAL(5,2) NOT NULL DEFAULT 50.00");
        $this->db->exec("ALTER TABLE producto ADD COLUMN IF NOT EXISTS Imagen_pos_y DECIMAL(5,2) NOT NULL DEFAULT 50.00");
    }

    public function getAll(array $filtros = []): array {
        $where  = [];
        $params = [];

        if (!empty($filtros['categoria'])) {
            $where[]              = 'p.Cod_Categoria = :categoria';
            $params[':categoria'] = $filtros['categoria'];
        }
        if (!empty($filtros['buscar'])) {
            $where[]          = '(p.Nombre LIKE :buscar OR p.Descripcion LIKE :buscar)';
            $params[':buscar'] = '%' . $filtros['buscar'] . '%';
        }

        $whereSQL = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT 
                    p.Cod_Producto,
                    p.Nombre,
                    p.Descripcion,
                    p.Precio,
                    p.Imagen_url,
                    p.Imagen_zoom,
                    p.Imagen_pos_x,
                    p.Imagen_pos_y,
                    p.Cantidad,
                    p.Fecha_vencimiento,
                    p.Cod_Proveedor,
                    c.Nombre AS categoria,
                    c.Cod_Categoria,
                    pr.Nombre_proveedor AS proveedor
                FROM producto p
                LEFT JOIN categoria c ON c.Cod_Categoria = p.Cod_Categoria
                LEFT JOIN proveedor pr ON pr.Cod_Proveedor = p.Cod_Proveedor
                $whereSQL
                ORDER BY p.Nombre";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT 
                    p.Cod_Producto,
                    p.Nombre,
                    p.Descripcion,
                    p.Precio,
                    p.Imagen_url,
                    p.Imagen_zoom,
                    p.Imagen_pos_x,
                    p.Imagen_pos_y,
                    p.Cantidad,
                    p.Fecha_vencimiento,
                    c.Nombre AS categoria,
                    c.Cod_Categoria,
                    pr.Nombre AS proveedor
                FROM producto p
                LEFT JOIN categoria c  ON c.Cod_Categoria   = p.Cod_Categoria
                LEFT JOIN proveedor pr ON pr.Cod_Proveedor  = p.Cod_Proveedor
                WHERE p.Cod_Producto = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function crear(array $d): int {
        $stmt = $this->db->prepare(
            "INSERT INTO producto (
                Nombre, Descripcion, Precio, Imagen_url, Imagen_zoom, Imagen_pos_x, Imagen_pos_y,
                Cantidad, Fecha_vencimiento, Cod_Categoria, Cod_Proveedor
            )
             VALUES (:nombre, :desc, :precio, :img, :img_zoom, :img_pos_x, :img_pos_y, :cantidad, :vence, :cat, :prov)"
        );
        $cantidad = (int)($d['cantidad'] ?? 0);
        $stmt->execute([
            ':nombre'   => $d['nombre'],
            ':desc'     => $d['descripcion']      ?? null,
            ':precio'   => $d['precio'],
            ':img'      => $d['imagen_url']        ?? null,
            ':img_zoom' => $d['imagen_zoom']       ?? 1,
            ':img_pos_x'=> $d['imagen_pos_x']      ?? 50,
            ':img_pos_y'=> $d['imagen_pos_y']      ?? 50,
            ':cantidad' => $cantidad,
            ':vence'    => $d['fecha_vencimiento'] ?? null,
            ':cat'      => $d['cod_categoria']     ?? null,
            ':prov'     => $d['cod_proveedor']     ?? null,
        ]);
        $codProducto = (int)$this->db->lastInsertId();

        // Crear fila en inventario automáticamente con el stock inicial
        $this->db->prepare(
            "INSERT INTO inventario (Stock, Registrar_Entradas, Registrar_Salidas, Fecha_Actualizacion, Novedades, Cod_Producto)
             VALUES (:stock, :stock, 0, NOW(), 'Stock inicial', :prod)"
        )->execute([':stock' => $cantidad, ':prod' => $codProducto]);

        return $codProducto;
    }

    public function actualizar(int $id, array $d): bool {
        $cantidad = (int)($d['cantidad'] ?? 0);
        $stmt = $this->db->prepare(
            "UPDATE producto SET
                Nombre            = :nombre,
                Descripcion       = :desc,
                Precio            = :precio,
                Imagen_url        = :img,
                Imagen_zoom       = :img_zoom,
                Imagen_pos_x      = :img_pos_x,
                Imagen_pos_y      = :img_pos_y,
                Cantidad          = :cantidad,
                Fecha_vencimiento = :vence,
                Cod_Categoria     = :cat,
                Cod_Proveedor     = :prov
             WHERE Cod_Producto = :id"
        );
        $ok = $stmt->execute([
            ':nombre'   => $d['nombre'],
            ':desc'     => $d['descripcion']      ?? null,
            ':precio'   => $d['precio'],
            ':img'      => $d['imagen_url']        ?? null,
            ':img_zoom' => $d['imagen_zoom']       ?? 1,
            ':img_pos_x'=> $d['imagen_pos_x']      ?? 50,
            ':img_pos_y'=> $d['imagen_pos_y']      ?? 50,
            ':cantidad' => $cantidad,
            ':vence'    => $d['fecha_vencimiento'] ?? null,
            ':cat'      => $d['cod_categoria']     ?? null,
            ':prov'     => $d['cod_proveedor']     ?? null,
            ':id'       => $id,
        ]);

        // Sincronizar inventario: actualizar si existe, crear si no existe
        $chk = $this->db->prepare("SELECT Cod_Inventario FROM inventario WHERE Cod_Producto = :prod");
        $chk->execute([':prod' => $id]);
        $codInv = $chk->fetchColumn();

        if ($codInv) {
            $this->db->prepare(
                "UPDATE inventario SET Stock = :stock, Fecha_Actualizacion = NOW(), Novedades = 'Actualizado desde productos'
                 WHERE Cod_Inventario = :inv"
            )->execute([':stock' => $cantidad, ':inv' => (int)$codInv]);
        } else {
            $this->db->prepare(
                "INSERT INTO inventario (Stock, Registrar_Entradas, Registrar_Salidas, Fecha_Actualizacion, Novedades, Cod_Producto)
                 VALUES (:stock, :stock, 0, NOW(), 'Creado desde productos', :prod)"
            )->execute([':stock' => $cantidad, ':prod' => $id]);
        }

        return $ok;
    }

    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM producto WHERE Cod_Producto = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function getCategorias(): array {
        return $this->db->query("SELECT * FROM categoria ORDER BY Nombre")->fetchAll();
    }

    public function getProveedores(): array {
        return $this->db->query("SELECT Cod_Proveedor, Nombre_proveedor FROM proveedor ORDER BY Nombre_proveedor")->fetchAll();
    }

    public function getMasVendidos(): array {
        return $this->db->query("SELECT * FROM vista_productos_mas_vendidos LIMIT 5")->fetchAll();
    }
}
