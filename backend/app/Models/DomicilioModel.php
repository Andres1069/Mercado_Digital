<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/Database.php';

class DomicilioModel {
    private PDO $db;
    private array $domicilioCols = [];
    private array $pagoCols = [];
    private bool $tieneHistorial = false;
    private array $historialCols = [];

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureComprobanteColumns();
        $this->detectarSchema();
    }

    private function ensureComprobanteColumns(): void {
        try {
            $this->db->exec("ALTER TABLE domicilio ADD COLUMN IF NOT EXISTS Comprobante_Entrega MEDIUMTEXT DEFAULT NULL");
            $this->db->exec("ALTER TABLE domicilio ADD COLUMN IF NOT EXISTS Recibido_Por VARCHAR(120) DEFAULT NULL");
            $this->db->exec("ALTER TABLE domicilio ADD COLUMN IF NOT EXISTS Documento_Recibe VARCHAR(40) DEFAULT NULL");
            $this->db->exec("ALTER TABLE domicilio ADD COLUMN IF NOT EXISTS Observaciones_Entrega VARCHAR(255) DEFAULT NULL");
            $this->db->exec("ALTER TABLE domicilio ADD COLUMN IF NOT EXISTS Fecha_Entrega DATETIME DEFAULT NULL");
        } catch (Throwable) {
            error_log('[DomicilioModel] No se pudo sincronizar columnas de comprobante: ' . $e->getMessage());
        }
    }

    private function detectarSchema(): void {
        try {
            $stmt = $this->db->prepare(
                "SELECT COLUMN_NAME
                 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'domicilio'"
            );
            $stmt->execute();
            $this->domicilioCols = array_values(array_map(
                static fn($r) => (string)$r['COLUMN_NAME'],
                $stmt->fetchAll() ?: []
            ));
        } catch (Throwable) {
            $this->domicilioCols = [];
        }

        try {
            $stmt = $this->db->prepare(
                "SELECT COLUMN_NAME
                 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'pago'"
            );
            $stmt->execute();
            $this->pagoCols = array_values(array_map(
                static fn($r) => (string)$r['COLUMN_NAME'],
                $stmt->fetchAll() ?: []
            ));
        } catch (Throwable) {
            $this->pagoCols = [];
        }

        // Tabla opcional: historial_estado_pedido 
        try {
            $stmt = $this->db->prepare(
                "SELECT COUNT(*)
                 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'historial_estado_pedido'"
            );
            $stmt->execute();
            $this->tieneHistorial = (int)$stmt->fetchColumn() > 0;
        } catch (Throwable) {
            $this->tieneHistorial = false;
        }

        if ($this->tieneHistorial) {
            try {
                $stmt = $this->db->prepare(
                    "SELECT COLUMN_NAME
                     FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE()
                       AND TABLE_NAME = 'historial_estado_pedido'"
                );
                $stmt->execute();
                $this->historialCols = array_values(array_map(
                    static fn($r) => (string)$r['COLUMN_NAME'],
                    $stmt->fetchAll() ?: []
                ));
            } catch (Throwable) {
                $this->historialCols = [];
            }
        }
    }

    private function hasDomicilioCol(string $col): bool {
        if (!$this->domicilioCols) return false;
        foreach ($this->domicilioCols as $c) {
            if (strcasecmp($c, $col) === 0) return true;
        }
        return false;
    }

    private function hasPagoCol(string $col): bool {
        if (!$this->pagoCols) return false;
        foreach ($this->pagoCols as $c) {
            if (strcasecmp($c, $col) === 0) return true;
        }
        return false;
    }

    private function hasHistorialCol(string $col): bool {
        if (!$this->historialCols) return false;
        foreach ($this->historialCols as $c) {
            if (strcasecmp($c, $col) === 0) return true;
        }
        return false;
    }

    /**
     * Lista domicilios del usuario (por documento) con info del pedido.
     */
    public function listarPorDocumento(int $numDocumento): array {
        $extra = [];
        if ($this->hasDomicilioCol('Direccion_entrega')) $extra[] = 'd.Direccion_entrega';
        if ($this->hasDomicilioCol('Telefono'))          $extra[] = 'd.Telefono';
        if ($this->hasDomicilioCol('Notas'))             $extra[] = 'd.Notas';
        if ($this->hasDomicilioCol('Costo_envio'))       $extra[] = 'd.Costo_envio';
        if ($this->hasDomicilioCol('Comprobante_Entrega')) $extra[] = 'd.Comprobante_Entrega';
        if ($this->hasDomicilioCol('Recibido_Por'))        $extra[] = 'd.Recibido_Por';
        if ($this->hasDomicilioCol('Documento_Recibe'))    $extra[] = 'd.Documento_Recibe';
        if ($this->hasDomicilioCol('Observaciones_Entrega')) $extra[] = 'd.Observaciones_Entrega';
        if ($this->hasDomicilioCol('Fecha_Entrega'))       $extra[] = 'd.Fecha_Entrega';
        if ($this->hasDomicilioCol('Distancia_km'))      $extra[] = 'd.Distancia_km';
        if ($this->hasDomicilioCol('Tiempo_estimado'))   $extra[] = 'd.Tiempo_estimado';
        if ($this->hasDomicilioCol('Cod_pedido'))        $extra[] = 'd.Cod_pedido';

        $selectExtra = $extra ? ",\n                    " . implode(",\n                    ", $extra) : '';

        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    d.Cod_Domicilio,
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio
                    $selectExtra
                FROM usuario_pedido up
                INNER JOIN pedido p ON p.Cod_Pedido = up.Cod_pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE up.Num_Documento = :doc
                ORDER BY p.Fecha_Pedido DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $numDocumento]);
        return $stmt->fetchAll();
    }

    /**
     * Obtiene detalle de un pedido del usuario con su domicilio (si existe).
     */
    public function detallePorDocumento(int $numDocumento, int $pedidoId): ?array {
        $extra = [];
        if ($this->hasDomicilioCol('Direccion_entrega')) $extra[] = 'd.Direccion_entrega';
        if ($this->hasDomicilioCol('Telefono'))          $extra[] = 'd.Telefono';
        if ($this->hasDomicilioCol('Notas'))             $extra[] = 'd.Notas';
        if ($this->hasDomicilioCol('Costo_envio'))       $extra[] = 'd.Costo_envio';
        if ($this->hasDomicilioCol('Distancia_km'))      $extra[] = 'd.Distancia_km';
        if ($this->hasDomicilioCol('Tiempo_estimado'))   $extra[] = 'd.Tiempo_estimado';
        if ($this->hasDomicilioCol('Cod_pedido'))        $extra[] = 'd.Cod_pedido';

        $selectExtra = $extra ? ",\n                    " . implode(",\n                    ", $extra) : '';

        $sql = "SELECT
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    d.Cod_Domicilio,
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio
                    $selectExtra
                FROM usuario_pedido up
                INNER JOIN pedido p ON p.Cod_Pedido = up.Cod_pedido
                LEFT JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                WHERE up.Num_Documento = :doc
                  AND p.Cod_Pedido = :pedido
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $numDocumento, ':pedido' => $pedidoId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Crea (si no existe) el domicilio para un pedido del usuario.
     * Es idempotente: si ya hay domicilio, no crea otro.
     */
    public function crearParaPedido(int $numDocumento, int $pedidoId, string $estado = 'Pendiente', array $extra = []): array {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                "SELECT Cod_usuario_pedido
                 FROM usuario_pedido
                 WHERE Num_Documento = :doc AND Cod_pedido = :pedido
                 LIMIT 1"
            );
            $stmt->execute([':doc' => $numDocumento, ':pedido' => $pedidoId]);
            $usuarioPedidoId = (int)($stmt->fetchColumn() ?: 0);
            if ($usuarioPedidoId <= 0) {
                $this->db->rollBack();
                throw new RuntimeException('No se encontro el pedido para este usuario.');
            }

            $stmt = $this->db->prepare(
                "SELECT Cod_Domicilio, Fecha, Estado
                 FROM domicilio
                 WHERE Cod_Usuario_Pedido = :up
                 LIMIT 1"
            );
            $stmt->execute([':up' => $usuarioPedidoId]);
            $existente = $stmt->fetch();
            if ($existente) {
                $this->db->commit();
                return ['created' => false, 'domicilio' => $existente];
            }

            $cols = ['Fecha', 'Estado', 'Cod_Usuario_Pedido'];
            $vals = ['NOW()', ':estado', ':up'];
            $params = [':estado' => $estado, ':up' => $usuarioPedidoId];

            // Campos opcionales según tu BD actual (si existen, los usamos).
            $map = [
                'Direccion_entrega' => 'direccion',
                'Telefono' => 'telefono',
                'Notas' => 'notas',
                'Costo_envio' => 'costo_envio',
                'Distancia_km' => 'distancia',
                'Tiempo_estimado' => 'tiempo',
                'Cod_pedido' => 'pedido',
            ];

            foreach ($map as $colDb => $keyBody) {
                if (!$this->hasDomicilioCol($colDb)) continue;
                if (!array_key_exists($keyBody, $extra)) continue;
                $cols[] = $colDb;
                $ph = ':' . $keyBody;
                $vals[] = $ph;
                $params[$ph] = $extra[$keyBody];
            }

            $sql = "INSERT INTO domicilio (" . implode(', ', $cols) . ")
                    VALUES (" . implode(', ', $vals) . ")";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $domicilio = [
                'Cod_Domicilio' => (int)$this->db->lastInsertId(),
                'Fecha' => date('Y-m-d H:i:s'),
                'Estado' => $estado,
            ];

            // Si existe una tabla de historial, guardamos el evento inicial.
            if ($this->tieneHistorial && $this->hasHistorialCol('Cod_pedido') && $this->hasHistorialCol('Estado') && $this->hasHistorialCol('Fecha')) {
                $this->db->prepare(
                    "INSERT INTO historial_estado_pedido (Cod_pedido, Estado, Fecha)
                     VALUES (:pedido, :estado, NOW())"
                )->execute([':pedido' => $pedidoId, ':estado' => $estado]);
            }

            $this->db->commit();
            return ['created' => true, 'domicilio' => $domicilio];
        } catch (Throwable) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Cancela el pedido (si pertenece al usuario) y marca el domicilio como Cancelado (si existe).
     */
    public function cancelarPedido(int $numDocumento, int $pedidoId): bool {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                "UPDATE pedido p
                 INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                 SET p.Estado_Pedido = 'Cancelado'
                 WHERE p.Cod_Pedido = :pedido
                   AND up.Num_Documento = :doc"
            );
            $stmt->execute([':pedido' => $pedidoId, ':doc' => $numDocumento]);
            $ok = $stmt->rowCount() > 0;

            // Si hay domicilio, también lo cancelamos.
            $stmt = $this->db->prepare(
                "UPDATE domicilio d
                 INNER JOIN usuario_pedido up ON up.Cod_usuario_pedido = d.Cod_Usuario_Pedido
                 SET d.Estado = 'Cancelado'
                 WHERE up.Cod_pedido = :pedido
                   AND up.Num_Documento = :doc"
            );
            $stmt->execute([':pedido' => $pedidoId, ':doc' => $numDocumento]);

            if ($ok && $this->tieneHistorial && $this->hasHistorialCol('Cod_pedido') && $this->hasHistorialCol('Estado') && $this->hasHistorialCol('Fecha')) {
                $this->db->prepare(
                    "INSERT INTO historial_estado_pedido (Cod_pedido, Estado, Fecha)
                     VALUES (:pedido, 'Cancelado', NOW())"
                )->execute([':pedido' => $pedidoId]);
            }

            $this->db->commit();
            return $ok;
        } catch (Throwable) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Seguimiento: como el esquema actual no tiene tabla de historial, devolvemos el estado actual.
     */
    public function seguimiento(int $numDocumento, int $pedidoId): array {
        // Si existe la tabla de historial, devolvemos la línea de tiempo.
        if ($this->tieneHistorial && $this->hasHistorialCol('Cod_pedido') && $this->hasHistorialCol('Estado') && $this->hasHistorialCol('Fecha')) {
            $detalle = $this->detallePorDocumento($numDocumento, $pedidoId);
            if (!$detalle) {
                throw new RuntimeException('Pedido no encontrado.');
            }

            $stmt = $this->db->prepare(
                "SELECT Estado, Fecha
                 FROM historial_estado_pedido
                 WHERE Cod_pedido = :pedido
                 ORDER BY Fecha ASC"
            );
            $stmt->execute([':pedido' => $pedidoId]);
            $hist = $stmt->fetchAll();

            return [
                'pedido' => [
                    'Cod_Pedido' => $detalle['Cod_Pedido'],
                    'Fecha_Pedido' => $detalle['Fecha_Pedido'],
                    'Estado_Pedido' => $detalle['Estado_Pedido'],
                ],
                'domicilio' => [
                    'Cod_Domicilio' => $detalle['Cod_Domicilio'] ?? null,
                    'Fecha_Domicilio' => $detalle['Fecha_Domicilio'] ?? null,
                    'Estado_Domicilio' => $detalle['Estado_Domicilio'] ?? null,
                ],
                'historial' => $hist,
            ];
        }

        $detalle = $this->detallePorDocumento($numDocumento, $pedidoId);
        if (!$detalle) {
            throw new RuntimeException('Pedido no encontrado.');
        }

        return [
            'pedido' => [
                'Cod_Pedido' => $detalle['Cod_Pedido'],
                'Fecha_Pedido' => $detalle['Fecha_Pedido'],
                'Estado_Pedido' => $detalle['Estado_Pedido'],
            ],
            'domicilio' => [
                'Cod_Domicilio' => $detalle['Cod_Domicilio'] ?? null,
                'Fecha_Domicilio' => $detalle['Fecha_Domicilio'] ?? null,
                'Estado_Domicilio' => $detalle['Estado_Domicilio'] ?? null,
            ],
        ];
    }

    /**
     * Lista todos los domicilios con info del cliente y pedido (para admin).
     */
    public function getAll(int $pagina = 0, int $limite = 0): array {
        $extra = [];
        if ($this->hasDomicilioCol('Direccion_entrega')) $extra[] = 'd.Direccion_entrega';
        if ($this->hasDomicilioCol('Telefono'))          $extra[] = 'd.Telefono AS Telefono_entrega';
        if ($this->hasDomicilioCol('Notas'))             $extra[] = 'd.Notas';
        if ($this->hasDomicilioCol('Costo_envio'))       $extra[] = 'd.Costo_envio';
        if ($this->hasDomicilioCol('Comprobante_Entrega')) $extra[] = 'd.Comprobante_Entrega';
        if ($this->hasDomicilioCol('Recibido_Por'))        $extra[] = 'd.Recibido_Por';
        if ($this->hasDomicilioCol('Documento_Recibe'))    $extra[] = 'd.Documento_Recibe';
        if ($this->hasDomicilioCol('Observaciones_Entrega')) $extra[] = 'd.Observaciones_Entrega';
        if ($this->hasDomicilioCol('Fecha_Entrega'))       $extra[] = 'd.Fecha_Entrega';

        $selectExtra = $extra ? ",\n                    " . implode(",\n                    ", $extra) : '';

        $sql = "SELECT
                    d.Cod_Domicilio,
                    d.Estado AS Estado_Domicilio,
                    d.Fecha  AS Fecha_Domicilio,
                    p.Cod_Pedido,
                    p.Fecha_Pedido,
                    p.Estado_Pedido,
                    pa.Metodo_Pago,
                    " . ($this->hasPagoCol('mp_status') ? 'pa.mp_status' : 'NULL') . " AS verificacion,
                    per.Nombre,
                    per.Apellido,
                    per.Num_Documento,
                    per.Telefono AS Telefono_cliente
                    $selectExtra
                FROM domicilio d
                INNER JOIN usuario_pedido up  ON up.Cod_usuario_pedido = d.Cod_Usuario_Pedido
                INNER JOIN pedido p           ON p.Cod_Pedido           = up.Cod_pedido
                INNER JOIN persona per        ON per.Num_Documento      = up.Num_Documento
                LEFT  JOIN pago pa            ON pa.Cod_pedido          = p.Cod_Pedido
                ORDER BY d.Fecha DESC";

        if ($pagina > 0 && $limite > 0) {
            $cntStmt = $this->db->prepare("SELECT COUNT(*) FROM ($sql) AS _c");
            $cntStmt->execute();
            $total  = (int)$cntStmt->fetchColumn();
            $offset = ($pagina - 1) * $limite;
            $stmt   = $this->db->prepare($sql . " LIMIT $limite OFFSET $offset");
            $stmt->execute();
            return [
                'datos'   => $stmt->fetchAll(PDO::FETCH_ASSOC),
                'total'   => $total,
                'pagina'  => $pagina,
                'paginas' => max(1, (int)ceil($total / $limite)),
            ];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Actualiza el estado del domicilio y sincroniza el estado del pedido.
     */
    public function actualizarEstado(int $codDomicilio, string $estado, array $comprobante = []): bool {
        $this->db->beginTransaction();
        try {
            // Actualizar domicilio
            $sets = ['Estado = :estado'];
            $params = [':estado' => $estado, ':id' => $codDomicilio];

            $map = [
                'Comprobante_Entrega' => 'comprobante_entrega',
                'Recibido_Por' => 'recibido_por',
                'Documento_Recibe' => 'documento_recibe',
                'Observaciones_Entrega' => 'observaciones_entrega',
            ];

            foreach ($map as $col => $key) {
                if (!$this->hasDomicilioCol($col) || !array_key_exists($key, $comprobante)) continue;
                $sets[] = "$col = :$key";
                $params[":$key"] = $comprobante[$key];
            }

            if ($estado === 'Entregado' && $this->hasDomicilioCol('Fecha_Entrega')) {
                $sets[] = "Fecha_Entrega = COALESCE(Fecha_Entrega, NOW())";
            }

            $this->db->prepare(
                "UPDATE domicilio SET " . implode(', ', $sets) . " WHERE Cod_Domicilio = :id"
            )->execute($params);

            // Sincronizar Estado_Pedido
            $this->db->prepare(
                "UPDATE pedido p
                 INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                 INNER JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                 SET p.Estado_Pedido = :estado
                 WHERE d.Cod_Domicilio = :id"
            )->execute([':estado' => $estado, ':id' => $codDomicilio]);

            // Registrar historial si existe la tabla
            if ($this->tieneHistorial && $this->hasHistorialCol('Cod_pedido') && $this->hasHistorialCol('Estado') && $this->hasHistorialCol('Fecha')) {
                $stmtPedido = $this->db->prepare(
                    "SELECT p.Cod_Pedido FROM pedido p
                     INNER JOIN usuario_pedido up ON up.Cod_pedido = p.Cod_Pedido
                     INNER JOIN domicilio d ON d.Cod_Usuario_Pedido = up.Cod_usuario_pedido
                     WHERE d.Cod_Domicilio = :id LIMIT 1"
                );
                $stmtPedido->execute([':id' => $codDomicilio]);
                $codPedido = $stmtPedido->fetchColumn();
                if ($codPedido) {
                    $this->db->prepare(
                        "INSERT INTO historial_estado_pedido (Cod_pedido, Estado, Fecha) VALUES (:pedido, :estado, NOW())"
                    )->execute([':pedido' => $codPedido, ':estado' => $estado]);
                }
            }

            $this->db->commit();
            return true;
        } catch (Throwable) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }
    }

    /**
     * Obtiene los datos del cliente (correo, nombre) y el pedido asociado a un domicilio.
     */
    public function getContactoPorDomicilio(int $codDomicilio): array {
        $sql = "SELECT 
                    per.Correo, 
                    per.Nombre, 
                    per.Apellido, 
                    p.Cod_Pedido
                FROM domicilio d
                INNER JOIN usuario_pedido up ON up.Cod_usuario_pedido = d.Cod_Usuario_Pedido
                INNER JOIN persona per ON per.Num_Documento = up.Num_Documento
                INNER JOIN pedido p ON p.Cod_Pedido = up.Cod_pedido
                WHERE d.Cod_Domicilio = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $codDomicilio]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }
}
