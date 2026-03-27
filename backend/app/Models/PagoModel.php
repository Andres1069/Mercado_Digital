<?php
// backend/app/Models/PagoModel.php

class PagoModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureColumns();
    }

    // ── Agrega las columnas del módulo de comprobantes si no existen ──────
    private function ensureColumns(): void {
        $columnas = [
            'comprobante_url'    => "VARCHAR(500) DEFAULT NULL",
            'monto_comprobante'  => "INT DEFAULT NULL",
            'verificacion'       => "ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente'",
            'notas_verificacion' => "VARCHAR(255) DEFAULT NULL",
        ];
        foreach ($columnas as $col => $def) {
            $chk = $this->db->query("SHOW COLUMNS FROM pago LIKE '$col'");
            if ($chk->rowCount() === 0) {
                $this->db->exec("ALTER TABLE pago ADD COLUMN `$col` $def");
            }
        }
    }

    // ── Consultas ─────────────────────────────────────────────────────────

    public function getByPedido(int $pedidoId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM pago WHERE Cod_pedido = ? LIMIT 1");
        $stmt->execute([$pedidoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Todos los pagos con datos del cliente (para el admin).
     *  Solo muestra pagos donde el cliente ya subió el comprobante. */
    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT
                p.*,
                per.Nombre        AS cliente_nombre,
                per.Apellido      AS cliente_apellido,
                per.Num_Documento AS cliente_documento,
                per.Correo        AS cliente_correo
            FROM pago p
            INNER JOIN pedido        pd  ON pd.Cod_Pedido      = p.Cod_pedido
            INNER JOIN usuario_pedido up ON up.Cod_pedido      = pd.Cod_Pedido
            INNER JOIN persona        per ON per.Num_Documento = up.Num_Documento
            WHERE p.comprobante_url IS NOT NULL
            ORDER BY p.Cod_Pago DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Guarda el comprobante, valida el monto y retorna el resultado de la verificación.
     * - Si el monto coincide exactamente → aprobado automático.
     * - Si no coincide → pendiente (el admin revisa manualmente).
     */
    public function subirComprobante(int $pedidoId, string $comprobanteUrl, int $montoComprobante): array {
        $pago = $this->getByPedido($pedidoId);
        if (!$pago) {
            return ['success' => false, 'message' => 'No se encontró el registro de pago para este pedido.'];
        }

        $montoEsperado = (int)$pago['Monto_Pago'];

        // Si el monto no coincide, se rechaza antes de guardar nada
        if ($montoComprobante !== $montoEsperado) {
            return [
                'success'           => false,
                'es_correcto'       => false,
                'monto_esperado'    => $montoEsperado,
                'monto_comprobante' => $montoComprobante,
                'message'           => 'El monto del comprobante no coincide con el total del pedido.',
            ];
        }

        // Monto correcto → guardar comprobante como PENDIENTE de revisión por el administrador
        $stmt = $this->db->prepare("
            UPDATE pago
               SET comprobante_url    = ?,
                   monto_comprobante  = ?,
                   verificacion       = 'pendiente',
                   notas_verificacion = 'Comprobante recibido. Pendiente de revisión por administrador.'
             WHERE Cod_pedido = ?
        ");
        $stmt->execute([$comprobanteUrl, $montoComprobante, $pedidoId]);

        return [
            'success'           => true,
            'es_correcto'       => true,
            'verificacion'      => 'pendiente',
            'monto_esperado'    => $montoEsperado,
            'monto_comprobante' => $montoComprobante,
            'mensaje'           => 'Comprobante recibido correctamente.',
        ];
    }

    /** Admin aprueba o rechaza manualmente un pago */
    public function verificar(int $pagoId, string $estado, ?string $notas): bool {
        $estadoPago = match($estado) {
            'aprobado'  => 'Completado',
            'rechazado' => 'Fallido',
            default     => null,
        };

        if ($estadoPago !== null) {
            $stmt = $this->db->prepare("
                UPDATE pago
                   SET verificacion = ?, notas_verificacion = ?, Estado_Pago = ?
                 WHERE Cod_Pago = ?
            ");
            return $stmt->execute([$estado, $notas, $estadoPago, $pagoId]);
        }

        $stmt = $this->db->prepare("
            UPDATE pago SET verificacion = ?, notas_verificacion = ? WHERE Cod_Pago = ?
        ");
        return $stmt->execute([$estado, $notas, $pagoId]);
    }
}
