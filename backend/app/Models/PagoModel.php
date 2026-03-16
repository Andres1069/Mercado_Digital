<?php
// backend/app/Models/PagoModel.php

require_once __DIR__ . '/../../config/Database.php';

class PagoModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function listar(array $filtros = []): array {
        $where = [];
        $params = [];

        if (!empty($filtros['estado'])) {
            $where[] = 'pa.Estado_Pago = :estado';
            $params[':estado'] = $filtros['estado'];
        }

        if (!empty($filtros['desde'])) {
            $where[] = 'pa.Fecha_Pago >= :desde';
            $params[':desde'] = $filtros['desde'] . ' 00:00:00';
        }

        if (!empty($filtros['hasta'])) {
            $where[] = 'pa.Fecha_Pago <= :hasta';
            $params[':hasta'] = $filtros['hasta'] . ' 23:59:59';
        }

        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $sql = "SELECT
                    pa.Cod_Pago,
                    pa.Metodo_Pago,
                    pa.Fecha_Pago,
                    pa.Monto_Pago,
                    pa.Estado_Pago,
                    pa.Cod_pedido,
                    p.Estado_Pedido,
                    p.Fecha_Pedido,
                    up.Num_Documento,
                    CONCAT(per.Nombre, ' ', per.Apellido) AS cliente
                FROM pago pa
                LEFT JOIN pedido p ON p.Cod_Pedido = pa.Cod_pedido
                LEFT JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                LEFT JOIN persona per ON per.Num_Documento = up.Num_Documento
                $whereSql
                ORDER BY pa.Fecha_Pago DESC, pa.Cod_Pago DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function actualizarEstado(int $id, string $estado): bool {
        $stmt = $this->db->prepare("UPDATE pago SET Estado_Pago = :estado WHERE Cod_Pago = :id");
        return $stmt->execute([':estado' => $estado, ':id' => $id]);
    }
}

