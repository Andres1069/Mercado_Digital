<?php
// backend/app/Middleware/AuthMiddleware.php

require_once __DIR__ . '/../../config/JWT.php';

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
