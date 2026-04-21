<?php
// backend/app/Models/PagoModel.php

class PagoModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureColumns();
    }

    // ── Migración de columnas ─────────────────────────────────────────────
    private function ensureColumns(): void {
        // Agregar columnas de MercadoPago si no existen
        $nuevas = [
            'mp_preference_id'  => "VARCHAR(100) DEFAULT NULL",
            'mp_payment_id'     => "VARCHAR(50)  DEFAULT NULL",
            'mp_status'         => "VARCHAR(50)  DEFAULT NULL",
            'mp_payment_method' => "VARCHAR(50)  DEFAULT NULL",
        ];
        foreach ($nuevas as $col => $def) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() === 0) {
                $this->db->exec("ALTER TABLE pago ADD COLUMN `$col` $def");
            }
        }

        // Eliminar columnas del sistema manual de comprobantes si aún existen
        $viejas = ['comprobante_url', 'monto_comprobante', 'verificacion', 'notas_verificacion'];
        foreach ($viejas as $col) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() > 0) {
                $this->db->exec("ALTER TABLE pago DROP COLUMN `$col`");
            }
        }

        // Eliminar tabla de configuración de métodos de pago manual (ya no se usa)
        $this->db->exec("DROP TABLE IF EXISTS `metodo_pago_config`");
    }

    // ── Consultas ─────────────────────────────────────────────────────────

    public function getByPedido(int $pedidoId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM pago WHERE Cod_pedido = ? LIMIT 1");
        $stmt->execute([$pedidoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Todos los pagos con datos del cliente (para el admin) */
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

    /** Guarda el ID de preferencia de MercadoPago y marca el pago como Pendiente */
    public function guardarPreferencia(int $pedidoId, string $preferenceId): bool {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET mp_preference_id = ?,
                   Estado_Pago      = 'Pendiente'
             WHERE Cod_pedido = ?
        ");
        return $stmt->execute([$preferenceId, $pedidoId]);
    }

    /** Actualiza el estado del pago con la respuesta real de MercadoPago */
    public function procesarPago(int $pedidoId, string $paymentId, string $status, string $paymentMethod): bool {
        $estadoPago = match($status) {
            'approved' => 'Completado',
            'rejected' => 'Fallido',
            default    => 'Pendiente',
        };

        $stmt = $this->db->prepare("
            UPDATE pago
               SET mp_payment_id     = ?,
                   mp_status         = ?,
                   mp_payment_method = ?,
                   Estado_Pago       = ?,
                   Fecha_Pago        = NOW()
             WHERE Cod_pedido = ?
        ");
        return $stmt->execute([$paymentId, $status, $paymentMethod, $estadoPago, $pedidoId]);
    }
}
