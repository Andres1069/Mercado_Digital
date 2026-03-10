<?php

require_once __DIR__ . '/../Models/UsuarioModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class UsuarioController {
    private UsuarioModel $model;

    public function __construct() {
        $this->model = new UsuarioModel();
    }

    public function listar(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok(['usuarios' => $this->model->getAll()]);
    }

    public function roles(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok(['roles' => $this->model->getRoles()]);
    }

    public function crear(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();

        $requeridos = ['num_documento', 'nombre', 'apellido', 'correo', 'contrasena', 'rol_id'];
        foreach ($requeridos as $campo) {
            if (empty($body[$campo])) {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato valido.', 400);
        }

        if (strlen($body['contrasena']) < 6) {
            $this->error('La contrasena debe tener al menos 6 caracteres.', 400);
        }

        if (!$this->model->rolExiste((int)$body['rol_id'])) {
            $this->error('El rol seleccionado no existe.', 400);
        }

        if ($this->model->correoExiste($body['correo'])) {
            $this->error('Este correo ya esta registrado.', 409);
        }

        if ($this->model->documentoExiste((int)$body['num_documento'])) {
            $this->error('Este numero de documento ya esta registrado.', 409);
        }

        $doc = $this->model->crearDesdeAdmin($body);
        $usuario = $this->model->findByDocumento($doc);
        $this->ok(['usuario' => $usuario], 'Usuario creado correctamente.', 201);
    }

    public function actualizar(int $doc): void {
        $payload = AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();

        if ((int)$payload['num_documento'] === $doc && !empty($body['rol_id'])) {
            $usuarioActual = $this->model->findByDocumento($doc);
            if ($usuarioActual && (int)$usuarioActual['Id_rol'] !== (int)$body['rol_id']) {
                $this->error('No puedes cambiar tu propio rol desde esta pantalla.', 409);
            }
        }

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        $requeridos = ['nombre', 'apellido', 'correo', 'rol_id'];
        foreach ($requeridos as $campo) {
            if (!isset($body[$campo]) || $body[$campo] === '') {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato valido.', 400);
        }

        if ($this->model->correoExisteEnOtroUsuario($body['correo'], $doc)) {
            $this->error('Ya existe otro usuario con ese correo.', 409);
        }

        if (!$this->model->rolExiste((int)$body['rol_id'])) {
            $this->error('El rol seleccionado no existe.', 400);
        }

        $this->model->actualizarDesdeAdmin($doc, $body);
        $this->ok(['usuario' => $this->model->findByDocumento($doc)], 'Usuario actualizado correctamente.');
    }

    public function cambiarRol(int $doc): void {
        $payload = AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();

        if (empty($body['rol_id'])) {
            $this->error('El rol es requerido.', 400);
        }

        if (!$this->model->rolExiste((int)$body['rol_id'])) {
            $this->error('El rol seleccionado no existe.', 400);
        }

        if ((int)$payload['num_documento'] === $doc) {
            $this->error('No puedes cambiar tu propio rol mientras tienes la sesion activa.', 409);
        }

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        $this->model->actualizarRol($doc, (int)$body['rol_id']);
        $this->ok(['usuario' => $this->model->findByDocumento($doc)], 'Rol actualizado correctamente.');
    }

    public function eliminar(int $doc): void {
        $payload = AuthMiddleware::requireRole(['Administrador']);

        if ((int)$payload['num_documento'] === $doc) {
            $this->error('No puedes eliminar tu propio usuario.', 409);
        }

        $resultado = $this->model->eliminarDesdeAdmin($doc);
        if (!$resultado['ok']) {
            $this->error($resultado['message'], 409);
        }

        $this->ok([], 'Usuario eliminado correctamente.');
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(['success' => true, 'message' => $msg, ...$data]);
        exit;
    }

    private function error(string $msg, int $code = 400): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}
