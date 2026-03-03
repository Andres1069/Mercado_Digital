<?php
// backend/app/Models/OfertaModel.php

require_once __DIR__ . '/../../config/Database.php';

class OfertaModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->ensureTable();
    }

    private function ensureTable(): void {
        $sql = "CREATE TABLE IF NOT EXISTS oferta (
                    Cod_Oferta INT NOT NULL AUTO_INCREMENT,
                    Titulo VARCHAR(120) NOT NULL,
                    Descripcion VARCHAR(255) DEFAULT NULL,
                    Porcentaje_Descuento INT NOT NULL,
                    Fecha_Inicio DATETIME NOT NULL,
                    Fecha_Fin DATETIME NOT NULL,
                    activo TINYINT(1) NOT NULL DEFAULT 1,
                    Cod_Producto INT DEFAULT NULL,
                    imagen_banner VARCHAR(255) DEFAULT NULL,
                    PRIMARY KEY (Cod_Oferta),
                    KEY idx_oferta_producto (Cod_Producto),
                    CONSTRAINT fk_oferta_producto
                      FOREIGN KEY (Cod_Producto) REFERENCES producto (Cod_Producto)
                      ON DELETE SET NULL ON UPDATE CASCADE
                )";
        $this->db->exec($sql);
    }

    public function getActivas(): array {
        $sql = "SELECT o.*, p.Nombre AS nombre_producto, p.imagen_url, p.Precio AS precio_original,
                    ROUND(p.Precio - (p.Precio * o.Porcentaje_Descuento / 100)) AS precio_oferta
                FROM oferta o
                LEFT JOIN producto p ON p.Cod_Producto = o.Cod_Producto
                WHERE o.activo = 1 AND NOW() BETWEEN o.Fecha_Inicio AND o.Fecha_Fin
                ORDER BY o.Porcentaje_Descuento DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getAll(): array {
        $sql = "SELECT o.*, p.Nombre AS nombre_producto
                FROM oferta o
                LEFT JOIN producto p ON p.Cod_Producto = o.Cod_Producto
                ORDER BY o.Fecha_Fin DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function crear(array $d): int {
        $stmt = $this->db->prepare(
            "INSERT INTO oferta (Titulo, Descripcion, Porcentaje_Descuento, Fecha_Inicio, Fecha_Fin, activo, Cod_Producto, imagen_banner)
             VALUES (:titulo, :desc, :pct, :inicio, :fin, 1, :prod, :banner)"
        );
        $stmt->execute([
            ':titulo'  => $d['titulo'],
            ':desc'    => $d['descripcion'] ?? null,
            ':pct'     => $d['porcentaje_descuento'],
            ':inicio'  => $d['fecha_inicio'],
            ':fin'     => $d['fecha_fin'],
            ':prod'    => $d['cod_producto'] ?? null,
            ':banner'  => $d['imagen_banner'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function actualizar(int $id, array $d): bool {
        $stmt = $this->db->prepare(
            "UPDATE oferta SET Titulo=:titulo, Descripcion=:desc, Porcentaje_Descuento=:pct,
             Fecha_Inicio=:inicio, Fecha_Fin=:fin, activo=:activo, Cod_Producto=:prod
             WHERE Cod_Oferta=:id"
        );
        return $stmt->execute([
            ':titulo'  => $d['titulo'],
            ':desc'    => $d['descripcion'] ?? null,
            ':pct'     => $d['porcentaje_descuento'],
            ':inicio'  => $d['fecha_inicio'],
            ':fin'     => $d['fecha_fin'],
            ':activo'  => $d['activo'] ?? 1,
            ':prod'    => $d['cod_producto'] ?? null,
            ':id'      => $id,
        ]);
    }

    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("UPDATE oferta SET activo = 0 WHERE Cod_Oferta = :id");
        return $stmt->execute([':id' => $id]);
    }
}
