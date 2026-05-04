<?php
// backend/app/Middleware/AuthMiddleware.php

require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../Models/UsuarioModel.php';

class AuthMiddleware {

    /**
     * Verifica que el request tenga un token válido.
     * Si no lo tiene, responde 401 y detiene la ejecución.
     * Si lo tiene, retorna el payload del token.
     */
    public static function verify(): array {
        $token = JWT::fromHeader();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token requerido. Inicia sesión.']);
            exit;
        }

        $payload = JWT::verify($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token inválido o expirado.']);
            exit;
        }

        $model = new UsuarioModel();

        // Si el usuario fue desactivado, el token no deberia seguir permitiendo operar.
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc > 0) {
            $estado = $model->obtenerEstadoPorDocumento($doc);
            if ($estado !== null && $estado !== 'Activo') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Tu cuenta esta inactiva. Contacta a un administrador.']);
                exit;
            }
        }

        // Una sola sesion activa por usuario: si inicia sesion en otro dispositivo, el sid cambia y este token se invalida.
        if ($doc > 0 && $model->soportaSesionId()) {
            $sidToken = (string)($payload['sid'] ?? '');
            if ($sidToken === '') {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Sesion expirada. Inicia sesion nuevamente.']);
                exit;
            }

            $sidActual = $model->obtenerSesionIdPorDocumento($doc);
            if (!$sidActual || !hash_equals($sidActual, $sidToken)) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Sesion cerrada por inicio en otro dispositivo.']);
                exit;
            }
        }

        return $payload;
    }

    /**
     * Verifica que el usuario tenga uno de los roles permitidos.
     * Uso: AuthMiddleware::requireRole(['Administrador', 'Empleado'])
     */
    public static function requireRole(array $roles): array {
        $payload = self::verify();

        if (!in_array($payload['rol'], $roles)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No tienes permiso para esta acción.']);
            exit;
        }

        return $payload;
    }
}
