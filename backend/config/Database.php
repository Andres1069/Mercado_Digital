<?php
// backend/config/Database.php

require_once __DIR__ . '/../app/Exceptions/DatabaseConnectionException.php';
require_once __DIR__ . '/../app/Helpers/Logger.php';

class Database {
    private string $host;
    private int    $port;
    private string $db_name;
    private string $username;
    private string $password;
    private string $charset  = 'utf8mb4';

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'mysql-2325ba37-raulandresgonzalezcifuentes-4571.l.aivencloud.com';
        $this->port = (int)(getenv('DB_PORT') ?: 17755);
        $this->db_name = getenv('DB_NAME') ?: 'defaultdb';
        $this->username = getenv('DB_USER') ?: 'avnadmin';
        $this->password = getenv('DB_PASS') ?: 'PON_TU_CONTRASEÑA_AQUI_PARA_LOCAL';
    }

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
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false, // Necesario para Aiven si no usamos el archivo .pem
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
