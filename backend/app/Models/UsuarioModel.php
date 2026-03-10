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
                    r.nombre_rol AS rol, r.Id_rol, u.Id_usuario
                FROM persona p
                INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
                INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol
                WHERE p.Num_Documento = :doc LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $doc]);
        return $stmt->fetch() ?: null;
    }

    public function findByCorreoYDocumento(string $correo, int $doc): ?array {
        $sql = "SELECT p.Num_Documento, p.Nombre, p.Apellido, p.Correo,
                    p.ContrasenaHash, p.Telefono, p.Barrio, p.Direccion,
                    r.nombre_rol AS rol, u.Id_usuario
                FROM persona p
                INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
                INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol
                WHERE p.Correo = :correo AND p.Num_Documento = :doc
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':correo' => $correo, ':doc' => $doc]);
        return $stmt->fetch() ?: null;
    }

    public function correoExiste(string $correo): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM persona WHERE Correo = :correo");
        $stmt->execute([':correo' => $correo]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function correoExisteEnOtroUsuario(string $correo, int $doc): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM persona WHERE Correo = :correo AND Num_Documento <> :doc");
        $stmt->execute([':correo' => $correo, ':doc' => $doc]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function documentoExiste(int $doc): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM persona WHERE Num_Documento = :doc");
        $stmt->execute([':doc' => $doc]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function rolExiste(int $rolId): bool {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM rol_usuario WHERE Id_rol = :rol");
        $stmt->execute([':rol' => $rolId]);
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
        if (!empty($datos['correo']))    { $campos[] = 'Correo = :correo';       $valores[':correo']    = $datos['correo']; }
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
                    p.Telefono, p.Barrio, p.Direccion, r.nombre_rol AS rol,
                    r.Id_rol, u.Id_usuario
             FROM persona p
             INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
             INNER JOIN rol_usuario r ON r.Id_rol = u.Id_Rol ORDER BY p.Nombre"
        )->fetchAll();
    }

    public function getRoles(): array {
        return $this->db->query(
            "SELECT Id_rol, nombre_rol
             FROM rol_usuario
             ORDER BY nombre_rol"
        )->fetchAll();
    }

    public function crearDesdeAdmin(array $datos): int {
        $rolId = (int)$datos['rol_id'];
        $this->db->beginTransaction();

        try {
            $this->db->prepare("INSERT INTO usuario (Id_Rol) VALUES (:rol)")
                ->execute([':rol' => $rolId]);

            $idUsuario = (int)$this->db->lastInsertId();
            $hash = password_hash($datos['contrasena'], PASSWORD_BCRYPT);

            $this->db->prepare(
                "INSERT INTO persona (Num_Documento, Nombre, Apellido, ContrasenaHash, Telefono, Correo, Barrio, Direccion, Id_Rol, Id_Usuario)
                 VALUES (:doc, :nombre, :apellido, :hash, :telefono, :correo, :barrio, :direccion, :rol, :id_usuario)"
            )->execute([
                ':doc' => (int)$datos['num_documento'],
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':hash' => $hash,
                ':telefono' => $datos['telefono'] ?? '',
                ':correo' => $datos['correo'],
                ':barrio' => $datos['barrio'] ?? '',
                ':direccion' => $datos['direccion'] ?? '',
                ':rol' => $rolId,
                ':id_usuario' => $idUsuario,
            ]);

            if ($rolId === 2) {
                $this->db->prepare(
                    "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
                     VALUES (NOW(), NOW(), 0, 0, :doc)"
                )->execute([':doc' => (int)$datos['num_documento']]);
            }

            $this->db->commit();
            return (int)$datos['num_documento'];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function actualizarDesdeAdmin(int $doc, array $datos): bool {
        $this->db->beginTransaction();

        try {
            $ok = $this->db->prepare(
                "UPDATE persona
                 SET Nombre = :nombre,
                     Apellido = :apellido,
                     Correo = :correo,
                     Telefono = :telefono,
                     Barrio = :barrio,
                     Direccion = :direccion
                 WHERE Num_Documento = :doc"
            )->execute([
                ':doc' => $doc,
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':correo' => $datos['correo'],
                ':telefono' => $datos['telefono'] ?? '',
                ':barrio' => $datos['barrio'] ?? '',
                ':direccion' => $datos['direccion'] ?? '',
            ]);

            if (!empty($datos['rol_id'])) {
                $this->actualizarRol($doc, (int)$datos['rol_id']);
            }

            $this->db->commit();
            return $ok;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function actualizarRol(int $doc, int $rolId): bool {
        $stmt = $this->db->prepare(
            "UPDATE persona p
             INNER JOIN usuario u ON u.Id_usuario = p.Id_Usuario
             SET p.Id_Rol = :rol_persona, u.Id_Rol = :rol_usuario
             WHERE p.Num_Documento = :doc"
        );
        $ok = $stmt->execute([
            ':rol_persona' => $rolId,
            ':rol_usuario' => $rolId,
            ':doc' => $doc,
        ]);

        if ($ok && $rolId === 2) {
            $this->asegurarCarrito($doc);
        }

        return $ok;
    }

    public function eliminarDesdeAdmin(int $doc): array {
        $dependencias = [];
        $dependencias['reportes'] = $this->contar("SELECT COUNT(*) FROM reporte WHERE Num_Documento = :doc", $doc);
        $dependencias['pedidos'] = $this->contar("SELECT COUNT(*) FROM usuario_pedido WHERE Num_Documento = :doc", $doc);
        $dependencias['carrito_items'] = $this->contar(
            "SELECT COUNT(*)
             FROM carrito_item ci
             INNER JOIN carrito c ON c.Cod_Carrito = ci.Cod_carrito
             WHERE c.Num_Documento = :doc",
            $doc
        );

        if ($dependencias['reportes'] > 0 || $dependencias['pedidos'] > 0 || $dependencias['carrito_items'] > 0) {
            return [
                'ok' => false,
                'message' => 'No se puede eliminar el usuario porque tiene historial relacionado.',
            ];
        }

        $usuario = $this->findByDocumento($doc);
        if (!$usuario) {
            return ['ok' => false, 'message' => 'Usuario no encontrado.'];
        }

        $this->db->beginTransaction();

        try {
            $this->db->prepare("DELETE FROM carrito WHERE Num_Documento = :doc")->execute([':doc' => $doc]);
            $this->db->prepare("DELETE FROM persona WHERE Num_Documento = :doc")->execute([':doc' => $doc]);
            $this->db->prepare("DELETE FROM usuario WHERE Id_usuario = :id")->execute([':id' => (int)$usuario['Id_usuario']]);
            $this->db->commit();
            return ['ok' => true];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function contar(string $sql, int $doc): int {
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':doc' => $doc]);
        return (int)$stmt->fetchColumn();
    }

    private function asegurarCarrito(int $doc): void {
        if ($this->contar("SELECT COUNT(*) FROM carrito WHERE Num_Documento = :doc", $doc) > 0) {
            return;
        }

        $this->db->prepare(
            "INSERT INTO carrito (Fecha_creacion, Fecha_modificacion, Cantidad_articulos, Total, Num_Documento)
             VALUES (NOW(), NOW(), 0, 0, :doc)"
        )->execute([':doc' => $doc]);
    }
}
