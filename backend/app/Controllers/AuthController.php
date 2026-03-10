<?php
// backend/app/Controllers/AuthController.php

require_once __DIR__ . '/../Models/UsuarioModel.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class AuthController {
    private UsuarioModel $model;

    public function __construct() {
        $this->model = new UsuarioModel();
    }

    // POST /auth/login
    public function login(): void {
        $body = $this->body();

        if (empty($body['correo']) || empty($body['contrasena'])) {
            $this->error('Correo y contraseña son requeridos.', 400);
        }

        $usuario = $this->model->findByCorreo($body['correo']);

        if (!$usuario) {
            $this->error('Correo o contraseña incorrectos.', 401);
        }

        if (!password_verify($body['contrasena'], $usuario['ContrasenaHash'])) {
            $this->error('Correo o contraseña incorrectos.', 401);
        }

        unset($usuario['ContrasenaHash']);

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol'           => $usuario['rol'],
        ]);

        $this->ok(['token' => $token, 'usuario' => $usuario], 'Login exitoso.');
    }

    // POST /auth/registro
    public function registro(): void {
        $body = $this->body();

        $requeridos = ['num_documento', 'nombre', 'apellido', 'correo', 'contrasena'];
        foreach ($requeridos as $campo) {
            if (empty($body[$campo])) {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato válido.', 400);
        }

        if (strlen($body['contrasena']) < 6) {
            $this->error('La contraseña debe tener al menos 6 caracteres.', 400);
        }

        if ($this->model->correoExiste($body['correo'])) {
            $this->error('Este correo ya está registrado.', 409);
        }

        if ($this->model->documentoExiste((int)$body['num_documento'])) {
            $this->error('Este número de documento ya está registrado.', 409);
        }

        $numDoc = $this->model->registrar($body);
        $usuario = $this->model->findByDocumento($numDoc);
        unset($usuario['ContrasenaHash']);

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol'           => $usuario['rol'],
        ]);

        $this->ok(['token' => $token, 'usuario' => $usuario], 'Registro exitoso.', 201);
    }

    // GET /auth/me
    public function me(): void {
        $payload = AuthMiddleware::verify();
        $usuario = $this->model->findByDocumento((int)$payload['num_documento']);
        if (!$usuario) $this->error('Usuario no encontrado.', 404);
        unset($usuario['ContrasenaHash']);
        $this->ok(['usuario' => $usuario]);
    }

    // PUT /auth/perfil
    public function actualizarPerfil(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)$payload['num_documento'];
        $body = $this->body();

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        $requeridos = ['nombre', 'apellido', 'correo'];
        foreach ($requeridos as $campo) {
            if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato valido.', 400);
        }

        if ($this->model->correoExisteEnOtroUsuario($body['correo'], $doc)) {
            $this->error('Ya existe otro usuario con ese correo.', 409);
        }

        $this->model->actualizarPerfil($doc, [
            'nombre' => trim((string)$body['nombre']),
            'apellido' => trim((string)$body['apellido']),
            'correo' => trim((string)$body['correo']),
            'telefono' => trim((string)($body['telefono'] ?? '')),
            'barrio' => trim((string)($body['barrio'] ?? '')),
            'direccion' => trim((string)($body['direccion'] ?? '')),
        ]);

        $usuarioActualizado = $this->model->findByDocumento($doc);
        $this->ok(['usuario' => $usuarioActualizado], 'Perfil actualizado correctamente.');
    }

    // POST /auth/cambiar-password
    public function cambiarPassword(): void {
        $body = $this->body();

        if (empty($body['correo']) || empty($body['num_documento']) || empty($body['nueva_contrasena'])) {
            $this->error('Correo, numero de documento y nueva contrasena son requeridos.', 400);
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato valido.', 400);
        }

        if (strlen($body['nueva_contrasena']) < 6) {
            $this->error('La contrasena debe tener al menos 6 caracteres.', 400);
        }

        $usuario = $this->model->findByCorreoYDocumento($body['correo'], (int)$body['num_documento']);
        if (!$usuario) {
            $this->error('No existe un usuario con ese correo y documento.', 404);
        }

        $this->model->cambiarPassword((int)$body['num_documento'], $body['nueva_contrasena']);
        $this->ok([], 'Contrasena actualizada correctamente.');
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
