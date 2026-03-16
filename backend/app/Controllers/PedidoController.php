<?php
// backend/app/Controllers/PedidoController.php

require_once __DIR__ . '/../Models/PedidoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class PedidoController {
    private PedidoModel $model;

    public function __construct() {
        $this->model = new PedidoModel();
    }

    // GET /api/pedidos/mis-pedidos
    public function misPedidos(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->err('No se pudo identificar el usuario.', 401);
        }

        $pedidos = $this->model->getMisPedidos($doc);
        $this->ok(['pedidos' => $pedidos]);
    }

    // POST /api/pedidos
    public function crear(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->err('No se pudo identificar el usuario.', 401);
        }

        $body = $this->body();
        $items = $body['items'] ?? [];
        $metodoPago = trim((string)($body['metodo_pago'] ?? 'Efectivo'));

        $venta = $this->model->crearVenta($doc, $items, $metodoPago);
        $this->ok(['venta' => $venta], 'Venta registrada.', 201);
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
