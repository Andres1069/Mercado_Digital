<?php
// backend/app/Models/PagoModel.php

class PagoModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureColumns();
    }

    // ——— Migración de columnas ———
    private function ensureColumns(): void {
        // Agrega columnas si no existen. No eliminamos nada para no perder datos.
        $nuevas = [
            // MercadoPago
            'mp_preference_id'   => "VARCHAR(100) DEFAULT NULL",
            'mp_payment_id'      => "VARCHAR(50)  DEFAULT NULL",
            'mp_status'          => "VARCHAR(50)  DEFAULT NULL",
            'mp_payment_method'  => "VARCHAR(50)  DEFAULT NULL",

            // Pagos manuales/simulados
            'comprobante_url'    => "VARCHAR(255) DEFAULT NULL",
            'monto_comprobante'  => "INT          DEFAULT NULL",
            'verificacion'       => "VARCHAR(20)  DEFAULT NULL",
            'notas_verificacion' => "VARCHAR(255) DEFAULT NULL",

            // Stripe checkout
            'stripe_reference'          => "VARCHAR(120) DEFAULT NULL",
            'stripe_session_id'         => "VARCHAR(120) DEFAULT NULL",
            'stripe_payment_intent_id'  => "VARCHAR(120) DEFAULT NULL",
            'stripe_session_status'     => "VARCHAR(40)  DEFAULT NULL",
            'stripe_payment_status'     => "VARCHAR(40)  DEFAULT NULL",
            'stripe_updated_at'         => "DATETIME     DEFAULT NULL",
        ];

        foreach ($nuevas as $col => $def) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() === 0) {
                $this->db->exec("ALTER TABLE pago ADD COLUMN `$col` $def");
            }
        }
    }

    // ——— Consultas ———

    public function getByPedido(int $pedidoId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM pago WHERE Cod_pedido = ? LIMIT 1");
        $stmt->execute([$pedidoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Datos mínimos de checkout para validar que el pedido pertenece al usuario.
     * Usado por el simulador de pago.
     */
    public function getCheckoutData(int $pedidoId, int $numDocumento): ?array {
        $stmt = $this->db->prepare("
            SELECT pa.*
            FROM pago pa
            INNER JOIN usuario_pedido up ON up.Cod_pedido = pa.Cod_pedido
            WHERE pa.Cod_pedido = ? AND up.Num_Documento = ?
            LIMIT 1
        ");
        $stmt->execute([$pedidoId, $numDocumento]);
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

        $estadoPago   = $paymentStatus === 'paid' ? 'Completado' : ($sessionStatus === 'expired' ? 'Fallido' : 'Pendiente');
        $verificacion = $paymentStatus === 'paid' ? 'aprobado'   : ($sessionStatus === 'expired' ? 'rechazado' : 'pendiente');
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
            'success'           => true,
            'session_id'        => $sessionId,
            'payment_intent_id' => $paymentIntentId,
            'status'            => $sessionStatus,
            'payment_status'    => $paymentStatus,
            'estado_pago'       => $estadoPago,
            'verificacion'      => $verificacion,
            'mensaje'           => $nota,
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
        };
        if ($estadoPago === null) return false;

        $stmt = $this->db->prepare("
            UPDATE pago
               SET verificacion       = ?,
                   notas_verificacion = ?,
                   Estado_Pago        = ?,
                   Fecha_Pago         = NOW()
             WHERE Cod_Pago = ?
        ");
        return $stmt->execute([$estado, $notas, $estadoPago, $pagoId]);
    }
}

