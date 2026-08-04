<?php
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM producto");
    $count = $stmt->fetchColumn();
    
    echo "OK: $count productos";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
