<?php
// backend/config/Database.php
// Clase de conexión a MySQL usando PDO (más seguro que mysqli)

class Database {
    // ⚠️ Cambia estos valores si los tuyos son diferentes
    private string $host     = 'localhost';
    private string $db_name  = 'mercado_digital';
    private string $username = 'root';
    private string $password = '';           // XAMPP por defecto no tiene password
    private string $charset  = 'utf8mb4';

    private ?PDO $connection = null;

    /**
     * Retorna la conexión PDO (Singleton básico)
     */
    public function getConnection(): PDO {
        if ($this->connection === null) {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error de conexión a la base de datos: ' . $e->getMessage()
                ]);
                exit;
            }
        }
        return $this->connection;
    }
}
