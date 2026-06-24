<?php
// backend/config/Database.php

require_once __DIR__ . '/../app/Exceptions/DatabaseConnectionException.php';
require_once __DIR__ . '/../app/Helpers/Logger.php';

class Database {
    private string $host     = 'localhost';
    private int    $port     = 3306;
    private string $db_name  = 'mercado_digital';
    private string $username = 'root';
    private string $password = '';
    private string $charset  = 'utf8mb4';

    private ?PDO $connection = null;

    /**
     * Retorna la conexión PDO (Singleton básico)
     */
    public function getConnection(): PDO {
        if ($this->connection === null) {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                Logger::error('No se pudo conectar a la base de datos', ['detalle' => $e->getMessage()]);
                throw new DatabaseConnectionException();
            }
        }
        return $this->connection;
    }
}
