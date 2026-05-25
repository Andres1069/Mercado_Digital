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

<<<<<<< HEAD
    /** Actualiza el estado del pago con la respuesta real de MercadoPago */
    public function procesarPago(int $pedidoId, string $paymentId, string $status, string $paymentMethod): bool {
        $estadoPago = match($status) {
            'approved' => 'Completado',
            'rejected' => 'Fallido',
            default    => 'Pendiente',
=======
    public function setStripeSession(int $pedidoId, string $sessionId, string $reference): void {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET stripe_reference  = ?,
                   stripe_session_id = ?,
                   stripe_updated_at = NOW()
             WHERE Cod_pedido = ?
        ");
        $stmt->execute([$reference, $sessionId, $pedidoId]);
    }

    public function syncStripeSession(int $pedidoId, array $session): array {
        $paymentStatus   = strtolower((string)($session['payment_status'] ?? 'unpaid'));
        $sessionStatus   = strtolower((string)($session['status']         ?? 'open'));
        $paymentIntentId = (string)($session['payment_intent'] ?? '');
        $sessionId       = (string)($session['id']             ?? '');

        $estadoPago   = $paymentStatus === 'paid'    ? 'Completado' : ($sessionStatus === 'expired' ? 'Fallido'   : 'Pending');
        $verificacion = $paymentStatus === 'paid'    ? 'aprobado'   : ($sessionStatus === 'expired' ? 'rechazado' : 'pendiente');
        $nota = $paymentStatus === 'paid'
            ? 'Pago confirmado por Stripe.'
            : ($sessionStatus === 'expired'
                ? 'La sesión de pago de Stripe expiró sin completar el pago.'
                : 'La sesión de Stripe sigue pendiente de pago.');

        $stmt = $this->db->prepare("
            UPDATE pago
               SET stripe_session_id          = ?,
                   stripe_payment_intent_id   = ?,
                   stripe_session_status      = ?,
                   stripe_payment_status      = ?,
                   stripe_updated_at          = NOW(),
                   verificacion               = ?,
                   notas_verificacion         = ?,
                   Estado_Pago                = ?
             WHERE Cod_pedido = ?
        ");
        $stmt->execute([$sessionId, $paymentIntentId ?: null, $sessionStatus, $paymentStatus, $verificacion, $nota, $estadoPago, $pedidoId]);

        return [
            'success'          => true,
            'session_id'       => $sessionId,
            'payment_intent_id'=> $paymentIntentId,
            'status'           => $sessionStatus,
            'payment_status'   => $paymentStatus,
            'estado_pago'      => $estadoPago,
            'verificacion'     => $verificacion,
            'mensaje'          => $nota,
        ];
    }

    public function subirComprobante(int $pedidoId, string $url, int $monto): array {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET comprobante_url   = ?,
                   monto_comprobante = ?,
                   verificacion      = 'pendiente',
                   Estado_Pago       = 'Pendiente'
             WHERE Cod_pedido = ?
        ");
        $ok = $stmt->execute([$url, $monto, $pedidoId]);
        return [
            'success' => $ok,
            'message' => $ok ? 'Comprobante recibido. Pendiente de verificación.' : 'No se pudo guardar el comprobante.',
        ];
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

    /** Admin aprueba o rechaza manualmente un pago */
    public function verificar(int $pagoId, string $estado, ?string $notas): bool {
        $estadoPago = match($estado) {
            'aprobado'  => 'Completado',
            'rechazado' => 'Fallido',
            default     => null,
>>>>>>> 1d86c12 (pasarela de pagos)
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
