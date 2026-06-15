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
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Canal_Venta VARCHAR(20) NOT NULL DEFAULT 'Online'");
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Num_Documento_Vendedor INT DEFAULT NULL");
            $this->db->exec("ALTER TABLE pedido ADD COLUMN IF NOT EXISTS Observaciones_Venta VARCHAR(255) DEFAULT NULL");
        } catch (Throwable $e) {
            error_log('[ReporteModel] No se pudo sincronizar columnas de venta: ' . $e->getMessage());
        }
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
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getResumenReportes(): array {
        $sql = "SELECT
                    Tipo_reporte,
                    COUNT(*) AS total,
                    MAX(Fecha_Reporte) AS ultima_fecha
                FROM reporte
                GROUP BY Tipo_reporte
                ORDER BY total DESC, Tipo_reporte ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getVentasResumen(): array {
        $sql = "SELECT
                    COUNT(DISTINCT p.Cod_Pedido) AS total_pedidos,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total_ingresos,
                    COALESCE(AVG(pa.Monto_Pago), 0) AS ticket_promedio,
                    COALESCE(SUM(c.Total), 0) AS total_carritos,
                    COUNT(DISTINCT CASE WHEN p.Canal_Venta = 'Online' THEN p.Cod_Pedido END) AS pedidos_online,
                    COUNT(DISTINCT CASE WHEN p.Canal_Venta = 'Tienda' THEN p.Cod_Pedido END) AS pedidos_tienda,
                    COALESCE(SUM(CASE WHEN p.Canal_Venta = 'Online' AND pa.Estado_Pago = 'Completado' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos_online,
                    COALESCE(SUM(CASE WHEN p.Canal_Venta = 'Tienda' AND pa.Estado_Pago = 'Completado' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos_tienda
                FROM pedido p
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido AND pa.Estado_Pago = 'Completado'
                LEFT JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetch() ?: [];
    }

    public function getProductosMasVendidos(int $limit = 5): array {
        $sql = "SELECT
                    pr.Cod_Producto,
                    pr.Nombre,
                    COALESCE(p.Canal_Venta, 'Online') AS canal_venta,
                    COALESCE(SUM(dp.Cantidad), 0) AS total_vendido,
                    COALESCE(SUM(dp.Subtotal), 0) AS ingresos_generados
                FROM producto pr
                LEFT JOIN detalle_pedido dp ON dp.Cod_Producto = pr.Cod_Producto
                LEFT JOIN pedido p ON p.Cod_Pedido = dp.Cod_Pedido
                GROUP BY pr.Cod_Producto, pr.Nombre, canal_venta
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
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getVentasPorCanal(): array {
        $sql = "SELECT
                    COALESCE(p.Canal_Venta, 'Online') AS canal,
                    COUNT(DISTINCT p.Cod_Pedido) AS pedidos,
                    COALESCE(SUM(CASE WHEN pa.Estado_Pago = 'Completado' THEN pa.Monto_Pago ELSE 0 END), 0) AS ingresos,
                    COALESCE(SUM(c.Cantidad_articulos), 0) AS articulos
                FROM pedido p
                LEFT JOIN pago pa ON pa.Cod_pedido = p.Cod_Pedido
                LEFT JOIN carrito c ON c.Cod_Carrito = p.Cod_Carrito
                GROUP BY canal
                ORDER BY canal";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
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
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return array_reverse($stmt->fetchAll());
        }

        $sql = "SELECT
                    DATE_FORMAT(pa.Fecha_Pago, '%Y-%m') AS etiqueta,
                    COALESCE(SUM(pa.Monto_Pago), 0) AS total
                FROM pago pa
                WHERE pa.Estado_Pago = 'Completado'
                GROUP BY DATE_FORMAT(pa.Fecha_Pago, '%Y-%m')
                ORDER BY DATE_FORMAT(pa.Fecha_Pago, '%Y-%m') DESC
                LIMIT 12";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return array_reverse($stmt->fetchAll());
    }
}
