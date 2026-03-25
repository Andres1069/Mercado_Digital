<?php
// backend/app/Controllers/PedidoController.php

require_once __DIR__ . '/../Models/PedidoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class PedidoController {
    private PedidoModel $model;

    public function __construct() {
        $this->model = new PedidoModel();
    }

    // GET /pedidos/mis-pedidos
    public function misPedidos(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $pedidos = $this->model->getMisPedidos($doc);
        $this->ok(['pedidos' => $pedidos]);
    }

    // GET /pedidos  (admin/empleado)
    public function todos(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $pedidos = $this->model->getAll();
        $this->ok(['pedidos' => $pedidos]);
    }

    // GET /pedidos/{id}
    public function obtener(int $id): void {
        $payload = AuthMiddleware::verify();
        $rol = $payload['rol'] ?? '';
        $doc = (int)($payload['num_documento'] ?? 0);

        $pedido = $this->model->getById($id);
        if (!$pedido) $this->err('Pedido no encontrado.', 404);

        // Clientes solo pueden ver sus propios pedidos
        if (!in_array($rol, ['Administrador', 'Empleado'], true) && (int)$pedido['Num_Documento'] !== $doc) {
            $this->err('No tienes permiso para ver este pedido.', 403);
        }

        $this->ok(['pedido' => $pedido]);
    }

    // POST /pedidos
    public function crear(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $body = $this->body();
        $items = $body['items'] ?? [];
        $metodoPago = trim((string)($body['metodo_pago'] ?? ''));
        $montoTotal = (int)($body['monto_total'] ?? 0);

        if (empty($items) || !is_array($items)) {
            $this->err('El carrito esta vacio.');
        }
        if ($metodoPago === '') {
            $this->err('El metodo de pago es requerido.');
        }

        $codPedido = $this->model->crear($doc, $items, $metodoPago, $montoTotal);
        $this->ok(['cod_pedido' => $codPedido], 'Pedido creado exitosamente.', 201);
    }

    // PUT /pedidos/{id}/estado  (admin/empleado)
    public function cambiarEstado(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        if ($estado === '') $this->err('El campo estado es requerido.');

        $ok = $this->model->cambiarEstado($id, $estado);
        if (!$ok) $this->err('Pedido no encontrado.', 404);
        $this->ok([], 'Estado actualizado.');
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(array_replace(['success' => true, 'message' => $msg], $data));
        exit;
    }

    private function err(string $msg, int $code = 400): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}
