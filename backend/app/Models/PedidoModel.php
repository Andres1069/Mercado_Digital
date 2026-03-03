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
}
