<?php
// backend/app/Models/CategoriaModel.php

class CategoriaModel {

    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll(): array {
        return $this->db->query("
            SELECT c.Cod_Categoria, c.Nombre,
                   COUNT(p.Cod_Producto) AS total_productos
            FROM categoria c
            LEFT JOIN producto p ON p.Cod_Categoria = c.Cod_Categoria
            GROUP BY c.Cod_Categoria, c.Nombre
            ORDER BY c.Nombre
        ")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categoria WHERE Cod_Categoria = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function nombreExiste(string $nombre, int $excluirId = 0): bool {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM categoria WHERE Nombre = ? AND Cod_Categoria <> ?"
        );
        $stmt->execute([$nombre, $excluirId]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function crear(string $nombre): int {
        $stmt = $this->db->prepare("INSERT INTO categoria (Nombre) VALUES (?)");
        $stmt->execute([$nombre]);
        return (int)$this->db->lastInsertId();
    }

    public function actualizar(int $id, string $nombre): bool {
        $stmt = $this->db->prepare("UPDATE categoria SET Nombre = ? WHERE Cod_Categoria = ?");
        $stmt->execute([$nombre, $id]);
        return $stmt->rowCount() > 0;
    }

    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM categoria WHERE Cod_Categoria = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function totalProductos(int $id): int {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM producto WHERE Cod_Categoria = ?"
        );
        $stmt->execute([$id]);
        return (int)$stmt->fetchColumn();
    }
}
