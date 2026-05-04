<?php
// backend/app/Models/CarritoModel.php

require_once __DIR__ . '/../../config/Database.php';

class CarritoModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Obtiene el carrito activo del usuario con sus items.
     * Si no existe, lo crea vacío.
     */
    public function obtener(int $numDocumento): array {
        $stmt = $this->db->prepare("SELECT Cod_Carrito, Cantidad_articulos, Total FROM carrito WHERE Num_Documento = :doc LIMIT 1");
        $stmt->execute([':doc' => $numDocumento]);
        $carrito = $stmt->fetch();

        if (!$carrito) {
            $this->db->prepare(
                "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
                 VALUES (NOW(), NOW(), 0, 0, :doc)"
            )->execute([':doc' => $numDocumento]);
            $codCarrito = (int)$this->db->lastInsertId();
            $carrito = ['Cod_Carrito' => $codCarrito, 'Cantidad_articulos' => 0, 'Total' => 0];
        }

        $stmt = $this->db->prepare(
            "SELECT ci.Cod_carrito_item, ci.Cantidad, ci.Precio,
                    pr.Cod_Producto, pr.Nombre, pr.Imagen_url
             FROM carrito_item ci
             INNER JOIN producto pr ON pr.Cod_Producto = ci.Cod_producto
             WHERE ci.Cod_carrito = :carrito"
        );
        $stmt->execute([':carrito' => (int)$carrito['Cod_Carrito']]);
        $carrito['items'] = $stmt->fetchAll();

        return $carrito;
    }

    /**
     * Agrega o actualiza un producto en el carrito.
     */
    public function agregar(int $numDocumento, int $codProducto, int $cantidad): array {
        $carrito = $this->obtener($numDocumento);
        $codCarrito = (int)$carrito['Cod_Carrito'];

        // Precio actual del producto
        $stmt = $this->db->prepare("SELECT Precio, Cantidad AS Stock FROM producto WHERE Cod_Producto = :prod LIMIT 1");
        $stmt->execute([':prod' => $codProducto]);
        $producto = $stmt->fetch();
        if (!$producto) throw new RuntimeException('Producto no encontrado.');

        $precio = (int)$producto['Precio'];
        $stock  = (int)$producto['Stock'];
        $cantidad = max(1, min($cantidad, $stock));

        // Verificar si ya existe en el carrito
        $stmt = $this->db->prepare(
            "SELECT Cod_carrito_item FROM carrito_item WHERE Cod_carrito = :c AND Cod_producto = :p LIMIT 1"
        );
        $stmt->execute([':c' => $codCarrito, ':p' => $codProducto]);
        $existing = $stmt->fetchColumn();

        if ($existing) {
            $this->db->prepare(
                "UPDATE carrito_item SET Cantidad = :qty, Precio = :precio WHERE Cod_carrito_item = :id"
            )->execute([':qty' => $cantidad, ':precio' => $precio * $cantidad, ':id' => (int)$existing]);
            // Actualizar totales manualmente (el trigger solo es AFTER INSERT)
            $this->recalcularTotales($codCarrito);
        } else {
            $this->db->prepare(
                "INSERT INTO carrito_item (Cantidad, Precio, Cod_producto, Cod_carrito) VALUES (:qty, :precio, :prod, :carrito)"
            )->execute([':qty' => $cantidad, ':precio' => $precio * $cantidad, ':prod' => $codProducto, ':carrito' => $codCarrito]);
            // El trigger tr_actualizar_carrito recalcula automáticamente
        }

        return $this->obtener($numDocumento);
    }

    /**
     * Quita un item del carrito por su ID de ítem.
     */
    public function quitarItem(int $numDocumento, int $codCarritoItem): bool {
        $carrito = $this->obtener($numDocumento);
        $codCarrito = (int)$carrito['Cod_Carrito'];

        $stmt = $this->db->prepare(
            "DELETE FROM carrito_item WHERE Cod_carrito_item = :item AND Cod_carrito = :carrito"
        );
        $stmt->execute([':item' => $codCarritoItem, ':carrito' => $codCarrito]);
        $ok = $stmt->rowCount() > 0;

        if ($ok) $this->recalcularTotales($codCarrito);
        return $ok;
    }

    /**
     * Vacía el carrito del usuario.
     */
    public function vaciar(int $numDocumento): void {
        $stmt = $this->db->prepare("SELECT Cod_Carrito FROM carrito WHERE Num_Documento = :doc LIMIT 1");
        $stmt->execute([':doc' => $numDocumento]);
        $codCarrito = (int)($stmt->fetchColumn() ?: 0);
        if ($codCarrito <= 0) return;

        $this->db->prepare("DELETE FROM carrito_item WHERE Cod_carrito = :c")->execute([':c' => $codCarrito]);
        $this->db->prepare(
            "UPDATE carrito SET Cantidad_articulos = 0, Total = 0, Fecha_modificacion = NOW() WHERE Cod_Carrito = :c"
        )->execute([':c' => $codCarrito]);
    }

    private function recalcularTotales(int $codCarrito): void {
        $this->db->prepare(
            "UPDATE carrito
             SET Cantidad_articulos = COALESCE((SELECT SUM(ci.Cantidad) FROM carrito_item ci WHERE ci.Cod_carrito = :c), 0),
                 Total              = COALESCE((SELECT SUM(ci.Precio)   FROM carrito_item ci WHERE ci.Cod_carrito = :c2), 0),
                 Fecha_modificacion = NOW()
             WHERE Cod_Carrito = :c3"
        )->execute([':c' => $codCarrito, ':c2' => $codCarrito, ':c3' => $codCarrito]);
    }
}
