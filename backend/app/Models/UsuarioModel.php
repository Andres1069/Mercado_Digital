<?php
require_once __DIR__ . '/../../config/Database.php';

class UsuarioModel {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function findByCorreo(string $correo): ?array {
        $sql = "SELECT p.Num_Documento, p.Nombre, p.Apellido, p.Correo,
                    p.ContrasenaHash, p.Telefono, p.Barrio, p.Direccion,
                    r.nombre_rol AS rol, u.Id_usuario
                FROM persona p
                INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
                INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol
                WHERE p.Correo = :correo LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':correo' => $correo]);
        return $stmt->fetch() ?: null;
    }

    public function findByDocumento(int $doc): ?array {
        $sql = "SELECT p.Num_Documento, p.Nombre, p.Apellido, p.Correo,
                    p.Telefono, p.Barrio, p.Direccion,
                    r.nombre_rol AS rol, u.Id_usuario
                FROM persona p
                INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
                INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol
                WHERE p.Num_Documento = :doc LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $doc]);
        return $stmt->fetch() ?: null;
    }

    public function correoExiste(string $correo): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM persona WHERE Correo = :correo");
        $stmt->execute([':correo' => $correo]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function documentoExiste(int $doc): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM persona WHERE Num_Documento = :doc");
        $stmt->execute([':doc' => $doc]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function registrar(array $datos): int {
        $rolId = 2;
        $this->db->prepare("INSERT INTO usuario (Id_Rol) VALUES (:rol)")->execute([':rol' => $rolId]);
        $idUsuario = (int)$this->db->lastInsertId();
        $hash = password_hash($datos['contrasena'], PASSWORD_BCRYPT);
        $this->db->prepare(
            "INSERT INTO persona (Num_Documento, Nombre, Apellido, ContrasenaHash, Telefono, Correo, Barrio, Direccion, Id_Rol, Id_Usuario)
             VALUES (:doc, :nombre, :apellido, :hash, :telefono, :correo, :barrio, :direccion, :rol, :id_usuario)"
        )->execute([
            ':doc' => $datos['num_documento'], ':nombre' => $datos['nombre'],
            ':apellido' => $datos['apellido'], ':hash' => $hash,
            ':telefono' => $datos['telefono'] ?? '', ':correo' => $datos['correo'],
            ':barrio' => $datos['barrio'] ?? '', ':direccion' => $datos['direccion'] ?? '',
            ':rol' => $rolId, ':id_usuario' => $idUsuario,
        ]);
        $this->db->prepare(
            "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
             VALUES (NOW(), NOW(), 0, 0, :doc)"
        )->execute([':doc' => $datos['num_documento']]);
        return $datos['num_documento'];
    }

    public function actualizarPerfil(int $doc, array $datos): bool {
        $campos = []; $valores = [':doc' => $doc];
        if (!empty($datos['nombre']))    { $campos[] = 'Nombre = :nombre';       $valores[':nombre']    = $datos['nombre']; }
        if (!empty($datos['apellido']))  { $campos[] = 'Apellido = :apellido';   $valores[':apellido']  = $datos['apellido']; }
        if (!empty($datos['telefono']))  { $campos[] = 'Telefono = :telefono';   $valores[':telefono']  = $datos['telefono']; }
        if (!empty($datos['barrio']))    { $campos[] = 'Barrio = :barrio';       $valores[':barrio']    = $datos['barrio']; }
        if (!empty($datos['direccion'])) { $campos[] = 'Direccion = :direccion'; $valores[':direccion'] = $datos['direccion']; }
        if (empty($campos)) return false;
        return $this->db->prepare("UPDATE persona SET " . implode(', ', $campos) . " WHERE Num_Documento = :doc")->execute($valores);
    }

    public function cambiarPassword(int $doc, string $nueva): bool {
        return $this->db->prepare("UPDATE persona SET ContrasenaHash = :hash WHERE Num_Documento = :doc")
                        ->execute([':hash' => password_hash($nueva, PASSWORD_BCRYPT), ':doc' => $doc]);
    }

    public function getAll(): array {
        return $this->db->query(
            "SELECT p.Num_Documento, p.Nombre, p.Apellido, p.Correo,
                    p.Telefono, p.Barrio, p.Direccion, r.nombre_rol AS rol
             FROM persona p
             INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
             INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol ORDER BY p.Nombre"
        )->fetchAll();
    }
}