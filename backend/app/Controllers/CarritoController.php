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
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $carrito = $this->model->obtener($doc);
        $this->ok(['carrito' => $carrito]);
    }

    // POST /carrito/agregar  body: {cod_producto, cantidad}
    public function agregar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $body = $this->body();
        $codProducto = (int)($body['cod_producto'] ?? 0);
        $cantidad    = (int)($body['cantidad'] ?? 1);

        if ($codProducto <= 0) $this->err('El campo cod_producto es requerido.');
        if ($cantidad <= 0)    $this->err('La cantidad debe ser mayor a 0.');

        $carrito = $this->model->agregar($doc, $codProducto, $cantidad);
        $this->ok(['carrito' => $carrito], 'Producto agregado al carrito.');
    }

    // DELETE /carrito/item/{id}
    public function quitarItem(int $itemId): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $ok = $this->model->quitarItem($doc, $itemId);
        if (!$ok) $this->err('Item no encontrado en el carrito.', 404);
        $this->ok([], 'Item eliminado del carrito.');
    }

    // DELETE /carrito/vaciar
    public function vaciar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $this->model->vaciar($doc);
        $this->ok([], 'Carrito vaciado.');
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
