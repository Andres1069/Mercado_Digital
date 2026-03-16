<?php
// backend/app/Controllers/CarritoController.php

require_once __DIR__ . '/../Models/CarritoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class CarritoController {
    private CarritoModel $model;

    public function __construct() {
        $this->model = new CarritoModel();
    }

    // GET /carrito
    public function obtener(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('Usuario no identificado.', 401);

        $carrito = $this->model->obtenerCarritoPorDocumento($doc);
        $this->ok(['carrito' => $carrito]);
    }

    // POST /carrito/agregar
    public function agregar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('Usuario no identificado.', 401);

        $body = $this->body();
        $productoId = (int)($body['producto_id'] ?? 0);
        $cantidad = (int)($body['cantidad'] ?? 1);
        if ($productoId <= 0) $this->err('Producto requerido.', 400);

        $this->model->agregarItem($doc, $productoId, $cantidad);
        $this->ok([], 'Producto agregado.');
    }

    // DELETE /carrito/item/:id
    public function quitar(int $id): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('Usuario no identificado.', 401);

        $this->model->eliminarItem($doc, $id);
        $this->ok([], 'Producto eliminado.');
    }

    // DELETE /carrito/vaciar
    public function vaciar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('Usuario no identificado.', 401);

        $this->model->vaciar($doc);
        $this->ok([], 'Carrito vaciado.');
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

