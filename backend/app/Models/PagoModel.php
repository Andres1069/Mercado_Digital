<?php
// backend/app/Models/PagoModel.php

require_once __DIR__ . '/../../config/Database.php';

class PagoModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureColumns();
    }

    private function ensureColumns(): void {
        $nuevas = [
            'mp_preference_id'       => "VARCHAR(100) DEFAULT NULL",
            'mp_payment_id'          => "VARCHAR(50) DEFAULT NULL",
            'mp_status'              => "VARCHAR(50) DEFAULT NULL",
            'mp_payment_method'      => "VARCHAR(50) DEFAULT NULL",
            'comprobante_url'        => "VARCHAR(255) DEFAULT NULL",
            'monto_comprobante'      => "INT DEFAULT NULL",
            'verificacion'           => "VARCHAR(30) DEFAULT NULL",
            'notas_verificacion'     => "TEXT DEFAULT NULL",
            'stripe_reference'       => "VARCHAR(120) DEFAULT NULL",
            'stripe_session_id'      => "VARCHAR(120) DEFAULT NULL",
            'stripe_payment_intent_id'=> "VARCHAR(120) DEFAULT NULL",
            'stripe_session_status'  => "VARCHAR(40) DEFAULT NULL",
            'stripe_payment_status'  => "VARCHAR(40) DEFAULT NULL",
            'stripe_updated_at'      => "DATETIME DEFAULT NULL",
        ];

        foreach ($nuevas as $col => $def) {
            if (!$this->columnaExiste('pago', $col)) {
                $this->db->exec("ALTER TABLE pago ADD COLUMN `$col` $def");
            }
        }

        if (!$this->columnaExiste('pedido', 'Tipo_Entrega')) {
            $this->db->exec("ALTER TABLE pedido ADD COLUMN `Tipo_Entrega` VARCHAR(20) NOT NULL DEFAULT 'Domicilio'");
        }

        if (!$this->columnaExiste('pedido', 'Canal_Venta')) {
            $this->db->exec("ALTER TABLE pedido ADD COLUMN `Canal_Venta` VARCHAR(20) NOT NULL DEFAULT 'Online'");
        }
    }

    private function columnaExiste(string $tabla, string $columna): bool {
        $stmt = $this->db->prepare("
            SELECT 1 FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tabla AND COLUMN_NAME = :columna
        ");
        $stmt->execute([':tabla' => $tabla, ':columna' => $columna]);
        return (bool)$stmt->fetch();
    }

    public function getByPedido(int $pedidoId): ?array {
        $stmt = $this->db->prepare("
            SELECT pa.*, p.Tipo_Entrega, p.Canal_Venta
            FROM pago pa
            INNER JOIN pedido p ON p.Cod_Pedido = pa.Cod_pedido
            WHERE pa.Cod_pedido = :pedido
            LIMIT 1
        ");
        $stmt->execute([':pedido' => $pedidoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getCheckoutData(int $pedidoId, int $doc): ?array {
        $stmt = $this->db->prepare("
            SELECT pa.*, p.Cod_Pedido
            FROM pago pa
            INNER JOIN pedido p ON p.Cod_Pedido = pa.Cod_pedido
            INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
            WHERE p.Cod_Pedido = :pedido AND up.Num_Documento = :doc
            LIMIT 1
        ");
        $stmt->execute([':pedido' => $pedidoId, ':doc' => $doc]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAll(): array {
        $stmt = $this->db->prepare("
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
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function guardarPreferencia(int $pedidoId, string $preferenceId): bool {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET mp_preference_id = :preferencia,
                   Estado_Pago      = 'Pendiente'
             WHERE Cod_pedido = :pedido
        ");
        return $stmt->execute([':preferencia' => $preferenceId, ':pedido' => $pedidoId]);
    }

    public function procesarPago(int $pedidoId, string $paymentId, string $status, string $paymentMethod): bool {
        $estadoPago = match($status) {
            'approved' => 'Completado',
            'rejected' => 'Fallido',
            default    => 'Pendiente',
        };

        $stmt = $this->db->prepare("
            UPDATE pago
               SET mp_payment_id     = :payment_id,
                   mp_status         = :status,
                   mp_payment_method = :metodo,
                   Estado_Pago       = :estado,
                   Fecha_Pago        = NOW()
             WHERE Cod_pedido = :pedido
        ");
        return $stmt->execute([
            ':payment_id' => $paymentId,
            ':status' => $status,
            ':metodo' => $paymentMethod,
            ':estado' => $estadoPago,
            ':pedido' => $pedidoId,
        ]);
    }

    public function registrarSimulado(int $pedidoId, string $metodo, string $verificacion, string $estadoPago, string $nota): bool {
        $stmt = $this->db->prepare("
            UPDATE pago
               SET Metodo_Pago        = :metodo,
                   verificacion       = :verificacion,
                   notas_verificacion = :nota,
                   Estado_Pago        = :estado,
                   Fecha_Pago         = NOW()
             WHERE Cod_pedido = :pedido
        ");
        return $stmt->execute([
            ':metodo' => $metodo,
            ':verificacion' => $verificacion,
            ':nota' => $nota,
            ':estado' => $estadoPago,
            ':pedido' => $pedidoId,
        ]);
    }

    public function verificar(int $pagoId, string $estado, ?string $notas): bool {
        $estadoPago = match($estado) {
            'aprobado'  => 'Completado',
            'rechazado' => 'Fallido',
            default     => null,
        };
        if ($estadoPago === null) return false;

        $stmt = $this->db->prepare("
            UPDATE pago
               SET verificacion       = :verificacion,
                   notas_verificacion = :notas,
                   Estado_Pago        = :estado,
                   Fecha_Pago         = NOW()
             WHERE Cod_Pago = :pago
        ");
        return $stmt->execute([
            ':verificacion' => $estado,
            ':notas' => $notas,
            ':estado' => $estadoPago,
            ':pago' => $pagoId,
        ]);
    }
}
