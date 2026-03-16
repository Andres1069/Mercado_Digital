<?php
// backend/app/Controllers/PagoController.php

require_once __DIR__ . '/../Models/PagoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class PagoController {
    private PagoModel $model;

    public function __construct() {
        $this->model = new PagoModel();
    }

    // GET /pagos
    public function listar(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $filtros = [
            'estado' => $_GET['estado'] ?? null,
            'desde' => $_GET['desde'] ?? null,
            'hasta' => $_GET['hasta'] ?? null,
        ];
        $this->ok(['pagos' => $this->model->listar($filtros)]);
    }

    // PUT /pagos/:id/estado
    public function cambiarEstado(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        $validos = ['Pendiente', 'Completado', 'Fallido'];
        if (!in_array($estado, $validos, true)) {
            $this->err('Estado invalido.', 400);
        }
        $this->model->actualizarEstado($id, $estado);
        $this->ok([], 'Estado de pago actualizado.');
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(['success' => true, 'message' => $msg, ...$data]);
        exit;
    }

    private function err(string $msg, int $code = 400): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}

