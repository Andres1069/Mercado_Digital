<?php
// backend/app/Models/MetodoPagoConfigModel.php

class MetodoPagoConfigModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureTable();
    }

    // â”€â”€ Garantiza que la tabla existe y tiene los dos mÃ©todos sembrados â”€â”€â”€â”€
    private function ensureTable(): void {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS `metodo_pago_config` (
              `id`         INT(11)      NOT NULL AUTO_INCREMENT,
              `metodo`     VARCHAR(50)  NOT NULL,
              `numero`     VARCHAR(20)  DEFAULT NULL,
              `qr_url`     VARCHAR(500) DEFAULT NULL,
              `activo`     TINYINT(1)   NOT NULL DEFAULT 1,
              `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              UNIQUE KEY `uq_metodo` (`metodo`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
        $this->db->exec("INSERT IGNORE INTO `metodo_pago_config` (`metodo`) VALUES ('Nequi'), ('Daviplata')");
    }

    public function getAll(): array {
        $stmt = $this->db->prepare("SELECT * FROM metodo_pago_config ORDER BY id");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByMetodo(string $metodo): ?array {
        $stmt = $this->db->prepare("SELECT * FROM metodo_pago_config WHERE metodo = :metodo");
        $stmt->execute([':metodo' => $metodo]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM metodo_pago_config WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function updateNumero(int $id, ?string $numero): bool {
        $stmt = $this->db->prepare("UPDATE metodo_pago_config SET numero = :numero, updated_at = NOW() WHERE id = :id");
        return $stmt->execute([':numero' => $numero, ':id' => $id]);
    }

    public function updateQR(int $id, string $qrUrl): bool {
        $stmt = $this->db->prepare("UPDATE metodo_pago_config SET qr_url = :qr_url, updated_at = NOW() WHERE id = :id");
        return $stmt->execute([':qr_url' => $qrUrl, ':id' => $id]);
    }
}
