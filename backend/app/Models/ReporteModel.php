<?php

require_once __DIR__ . '/../../config/Database.php';

class ReporteModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureVentaColumns();
    }

    private function ensureVentaColumns(): void {
        try {
        try { $this->db->exec("ALTER TABLE pedido ADD COLUMN Canal_Venta VARCHAR(20) NOT NULL DEFAULT 'Online'"); } catch (PDOException $e) {}
        try { $this->db->exec("ALTER TABLE pedido ADD COLUMN Num_Documento_Vendedor INT DEFAULT NULL"); } catch (PDOException $e) {}
        try { $this->db->exec("ALTER TABLE pedido ADD COLUMN Observaciones_Venta VARCHAR(255) DEFAULT NULL"); } catch (PDOException $e) {}
        } catch (Throwable $e) {
            error_log('[ReporteModel] No se pudo sincronizar columnas de venta: ' . $e->getMessage());
        }
    }

    private function rangoFechasSql(string $campo, ?string $desde, ?string $hasta, string $prefijo = 'WHERE'): array {
        $condiciones = [];
        $params = [];

        if ($desde) {
            $condiciones[] = "DATE($campo) >= :desde";
            $params[':desde'] = $desde;
        }

        if ($hasta) {
            $condiciones[] = "DATE($campo) <= :hasta";
            $params[':hasta'] = $hasta;
        }

        return [
            $condiciones ? ' ' . $prefijo . ' ' . implode(' AND ', $condiciones) : '',
            $params,
        ];
    }

    public function getRegistrosReporte(?string $desde = null, ?string $hasta = null): array {
        [$where, $params] = $this->rangoFechasSql('r.Fecha_Reporte', $desde, $hasta);
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
                $where
                GROUP BY r.Cod_Reporte, r.Fecha_Reporte, r.Tipo_reporte, r.Descripcion, r.Num_Documento, nombre_usuario
                ORDER BY r.Fecha_Reporte DESC, r.Cod_Reporte DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getResumenReportes(?string $desde = null, ?string $hasta = null): array {
        [$where, $params] = $this->rangoFechasSql('Fecha_Reporte', $desde, $hasta);
        $sql = "SELECT
                    Tipo_reporte,
                    COUNT(*) AS total,
                    MAX(Fecha_Reporte) AS ultima_fecha
                FROM reporte
                $where
                GROUP BY Tipo_reporte
                ORDER BY total DESC, Tipo_reporte ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getVentasResumen(?string $desde = null, ?string $hasta = null): array {
        [$where, $params] = $this->rangoFechasSql('p.Fecha_Pedido', $desde, $hasta);
        $sql = "SELECT
                    COUNT(DISTINCT p.Cod_Pedido) AS total_pedidos,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total_ingresos,
                    COALESCE(AVG(pa.Monto_Pago), 0) AS ticket_promedio,
                    COALESCE(SUM(c.Total), 0) AS total_carritos,
                    COUNT(DISTINCT CASE WHEN p.Canal_Venta = 'Online' THEN p.Cod_Pedido END) AS pedidos_online,
                    COUNT(DISTINCT CASE WHEN p.Canal_Venta = 'Tienda' THEN p.Cod_Pedido END) AS pedidos_tienda,
                    COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Online' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos_online,
                    COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Tienda' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos_tienda
                FROM pedido p
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido AND LOWER(pa.Estado_Pago) = 'completado'
                LEFT JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                $where";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: [];
    }

    public function getProductosMasVendidos(int $limit = 5, ?string $desde = null, ?string $hasta = null): array {
        [$whereRango, $params] = $this->rangoFechasSql('p.Fecha_Pedido', $desde, $hasta, 'AND');
        $sql = "SELECT
                    pr.Cod_Producto,
                    pr.Nombre,
                    COALESCE(p.Canal_Venta, 'Online') AS canal_venta,
                    COALESCE(SUM(dp.Cantidad), 0) AS total_vendido,
                    COALESCE(SUM(dp.Subtotal), 0) AS ingresos_generados
                FROM producto pr
                LEFT JOIN detalle_pedido dp ON dp.Cod_Producto = pr.Cod_Producto
                LEFT JOIN pedido p ON p.Cod_Pedido = dp.Cod_Pedido
                WHERE p.Cod_Pedido IS NOT NULL
                $whereRango
                GROUP BY pr.Cod_Producto, pr.Nombre, canal_venta
                ORDER BY total_vendido DESC, ingresos_generados DESC, pr.Nombre ASC
                LIMIT :limite";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limite', $limit, PDO::PARAM_INT);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getPedidosPorEstado(?string $desde = null, ?string $hasta = null): array {
        [$where, $params] = $this->rangoFechasSql('Fecha_Pedido', $desde, $hasta);
        $sql = "SELECT
                    Estado_Pedido AS estado,
                    COUNT(*) AS total
                FROM pedido
                $where
                GROUP BY Estado_Pedido
                ORDER BY total DESC, Estado_Pedido ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getVentasPorCanal(?string $desde = null, ?string $hasta = null): array {
        [$where, $params] = $this->rangoFechasSql('p.Fecha_Pedido', $desde, $hasta);
        $sql = "SELECT
                    COALESCE(p.Canal_Venta, 'Online') AS canal,
                    COUNT(DISTINCT p.Cod_Pedido) AS pedidos,
                    COALESCE(SUM(CASE WHEN LOWER(pa.Estado_Pago) = 'completado' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos,
                    COALESCE(SUM(c.Cantidad_articulos), 0) AS articulos
                FROM pedido p
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                $where
                GROUP BY canal
                ORDER BY canal";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getIngresosPorPeriodo(string $periodo = 'mes', ?string $desde = null, ?string $hasta = null): array {
        [$whereRango, $params] = $this->rangoFechasSql('COALESCE(pa.Fecha_Pago, p.Fecha_Pedido)', $desde, $hasta, 'AND');
        if ($periodo === 'dia') {
            $sql = "SELECT
                        DATE(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido)) AS etiqueta,
                        COALESCE(SUM(pa.Monto_Pago), 0) AS total,
                        COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Tienda' THEN pa.Monto_Pago ELSE 0 END), 0) AS tienda,
                        COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Online' THEN pa.Monto_Pago ELSE 0 END), 0) AS online,
                        COUNT(DISTINCT p.Cod_Pedido) AS pedidos
                    FROM pedido p
                    INNER JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                    WHERE LOWER(pa.Estado_Pago) = 'completado'
                    $whereRango
                    GROUP BY DATE(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido))
                    ORDER BY DATE(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido)) DESC
                    LIMIT 7";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return array_reverse($stmt->fetchAll());
        }

        $sql = "SELECT
                    DATE_FORMAT(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido), '%Y-%m') AS etiqueta,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total,
                    COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Tienda' THEN pa.Monto_Pago ELSE 0 END), 0) AS tienda,
                    COALESCE(SUM(CASE WHEN COALESCE(p.Canal_Venta, 'Online') = 'Online' THEN pa.Monto_Pago ELSE 0 END), 0) AS online,
                    COUNT(DISTINCT p.Cod_Pedido) AS pedidos
                FROM pedido p
                INNER JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                WHERE LOWER(pa.Estado_Pago) = 'completado'
                $whereRango
                GROUP BY DATE_FORMAT(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido), '%Y-%m')
                ORDER BY DATE_FORMAT(COALESCE(pa.Fecha_Pago, p.Fecha_Pedido), '%Y-%m') DESC
                LIMIT 12";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return array_reverse($stmt->fetchAll());
    }
}
