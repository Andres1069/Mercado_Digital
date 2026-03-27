<?php

require_once __DIR__ . '/../../config/Database.php';

class ReporteModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getRegistrosReporte(): array {
        $sql = "SELECT
                    r.Cod_Reporte,
                    r.Fecha_Reporte,
                    r.Tipo_reporte,
                    r.Descripcion,
                    r.Num_Documento,
                    CONCAT(p.Nombre, ' ', p.Apellido) AS nombre_usuario,
                    COUNT(dr.Id_Detalle) AS total_detalles
                FROM reporte r
                LEFT JOIN persona p ON p.Num_Documento = r.Num_Documento
                LEFT JOIN detalle_reporte dr ON dr.Cod_Reporte = r.Cod_Reporte
                GROUP BY r.Cod_Reporte, r.Fecha_Reporte, r.Tipo_reporte, r.Descripcion, r.Num_Documento, nombre_usuario
                ORDER BY r.Fecha_Reporte DESC, r.Cod_Reporte DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getResumenReportes(): array {
        $sql = "SELECT
                    Tipo_reporte,
                    COUNT(*) AS total,
                    MAX(Fecha_Reporte) AS ultima_fecha
                FROM reporte
                GROUP BY Tipo_reporte
                ORDER BY total DESC, Tipo_reporte ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getVentasResumen(): array {
        $sql = "SELECT
                    COUNT(DISTINCT p.Cod_Pedido) AS total_pedidos,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total_ingresos,
                    COALESCE(AVG(pa.Monto_Pago), 0) AS ticket_promedio,
                    COALESCE(SUM(c.Total), 0) AS total_carritos
                FROM pedido p
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido AND pa.Estado_Pago = 'Completado'
                LEFT JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito";
        $stmt = $this->db->query($sql);
        return $stmt->fetch() ?: [];
    }

    public function getProductosMasVendidos(int $limit = 5): array {
        $sql = "SELECT
                    pr.Cod_Producto,
                    pr.Nombre,
                    COALESCE(SUM(dp.Cantidad), 0) AS total_vendido,
                    COALESCE(SUM(dp.Subtotal), 0) AS ingresos_generados
                FROM producto pr
                LEFT JOIN detalle_pedido dp ON dp.Cod_Producto = pr.Cod_Producto
                GROUP BY pr.Cod_Producto, pr.Nombre
                ORDER BY total_vendido DESC, ingresos_generados DESC, pr.Nombre ASC
                LIMIT :limite";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limite', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getPedidosPorEstado(): array {
        $sql = "SELECT
                    Estado_Pedido AS estado,
                    COUNT(*) AS total
                FROM pedido
                GROUP BY Estado_Pedido
                ORDER BY total DESC, Estado_Pedido ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getIngresosPorPeriodo(string $periodo = 'mes'): array {
        if ($periodo === 'dia') {
            $sql = "SELECT
                        DATE(pa.Fecha_Pago) AS etiqueta,
                        COALESCE(SUM(pa.Monto_Pago), 0) AS total
                    FROM pago pa
                    WHERE pa.Estado_Pago = 'Completado'
                    GROUP BY DATE(pa.Fecha_Pago)
                    ORDER BY DATE(pa.Fecha_Pago) DESC
                    LIMIT 7";
            return array_reverse($this->db->query($sql)->fetchAll());
        }

        $sql = "SELECT
                    DATE_FORMAT(pa.Fecha_Pago, '%Y-%m') AS etiqueta,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total
                FROM pago pa
                WHERE pa.Estado_Pago = 'Completado'
                GROUP BY DATE_FORMAT(pa.Fecha_Pago, '%Y-%m')
                ORDER BY DATE_FORMAT(pa.Fecha_Pago, '%Y-%m') DESC
                LIMIT 12";
        return array_reverse($this->db->query($sql)->fetchAll());
    }
}
