<?php
// backend/app/Helpers/AuditLog.php

require_once __DIR__ . '/../../config/Database.php';

class AuditLog {
    private static ?PDO $db = null;
    private static bool $tableReady = false;

    private static function db(): PDO {
        if (!self::$db) {
            self::$db = (new Database())->getConnection();
        }
        return self::$db;
    }

    private static function ensureTable(): void {
        if (self::$tableReady) return;
        self::db()->exec("CREATE TABLE IF NOT EXISTS audit_log (
            id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            usuario     INT          NULL,
            accion      VARCHAR(20)  NOT NULL,
            entidad     VARCHAR(50)  NOT NULL,
            entidad_id  VARCHAR(50)  NULL,
            ip          VARCHAR(45)  NOT NULL,
            detalle     TEXT         NULL,
            creado_en   DATETIME     NOT NULL DEFAULT NOW(),
            INDEX (accion),
            INDEX (entidad),
            INDEX (creado_en)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        self::$tableReady = true;
    }

    /**
     * @param string      $accion    crear | editar | eliminar | cambiar_estado | cambiar_rol
     * @param string      $entidad   producto | usuario | pedido | categoria | oferta | proveedor | inventario | domicilio
     * @param int|string|null $entidadId  PK del registro afectado
     * @param int|null    $usuario   Num_Documento del admin/empleado
     * @param string|null $detalle   Información adicional (nombre del item, valor anterior, etc.)
     */
    public static function registrar(
        string $accion,
        string $entidad,
        int|string|null $entidadId = null,
        ?int $usuario = null,
        ?string $detalle = null
    ): void {
        try {
            self::ensureTable();
            $stmt = self::db()->prepare(
                "INSERT INTO audit_log (usuario, accion, entidad, entidad_id, ip, detalle, creado_en)
                 VALUES (:usuario, :accion, :entidad, :entidad_id, :ip, :detalle, NOW())"
            );
            $stmt->execute([
                ':usuario'    => $usuario,
                ':accion'     => $accion,
                ':entidad'    => $entidad,
                ':entidad_id' => $entidadId !== null ? (string)$entidadId : null,
                ':ip'         => self::getIp(),
                ':detalle'    => $detalle,
            ]);
        } catch (Throwable) {
            // Fallos del log de auditoría son no fatales
        }
    }

    private static function getIp(): string {
        foreach (['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'] as $key) {
            $val = trim($_SERVER[$key] ?? '');
            if ($val !== '') return explode(',', $val)[0];
        }
        return 'unknown';
    }
}
