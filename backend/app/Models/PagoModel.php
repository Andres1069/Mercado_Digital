<?php
// backend/app/Models/PagoModel.php

class PagoModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureColumns();
    }

    private function ensureColumns(): void {
        // Eliminar columnas obsoletas del sistema manual de comprobantes si aún existen
        $obsoletas = ['comprobante_url', 'monto_comprobante'];
        foreach ($obsoletas as $col) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() > 0) {
                $this->db->exec("ALTER TABLE pago DROP COLUMN `$col`");
            }
        }

        // Asegurar columnas requeridas por el simulador y la verificación admin
        $requeridas = [
            'verificacion'       => "VARCHAR(20) DEFAULT NULL",
            'notas_verificacion' => "TEXT DEFAULT NULL",
        ];
        foreach ($requeridas as $col => $def) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() === 0) {
                $this->db->exec("ALTER TABLE pago ADD COLUMN `$col` $def");
            }
        }
    }

    public function getByPedido(int $pedidoId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM pago WHERE Cod_pedido = ? LIMIT 1");
        $stmt->execute([$pedidoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT
                p.*,
                per.Nombre        AS cliente_nombre,
                per.Apellido      AS cliente_apellido,
                per.Num_Documento AS cliente_documento,
                per.Correo        AS cliente_correo
            FROM pago p
            INNER JOIN pedido         pd  ON pd.Cod_Pedido      = p.Cod_pedido
            INNER JOIN usuario_pedido up  ON up.Cod_pedido      = pd.Cod_Pedido
            INNER JOIN persona        per ON per.Num_Documento  = up.Num_Documento
            ORDER BY p.Cod_Pago DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function registrarSimulado(int $pedidoId, string $metodo, string $verificacion, string $estadoPago, string $nota): bool {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET Metodo_Pago        = ?,
                   verificacion       = ?,
                   notas_verificacion = ?,
                   Estado_Pago        = ?
             WHERE Cod_pedido = ?
        ");
        return $stmt->execute([$metodo, $verificacion, $nota, $estadoPago, $pedidoId]);
    }

    public function verificar(int $pagoId, string $estado, ?string $notas): bool {
        $estadoPago = match($estado) {
            'aprobado'  => 'Completado',
            'rechazado' => 'Fallido',
            default     => null,
        };

        $stmt = $this->db->prepare("
            UPDATE pago
               SET verificacion       = ?,
                   notas_verificacion = ?,
                   Estado_Pago        = COALESCE(?, Estado_Pago)
             WHERE Cod_Pago = ?
        ");
        return $stmt->execute([$estado, $notas, $estadoPago, $pagoId]);
    }
}
