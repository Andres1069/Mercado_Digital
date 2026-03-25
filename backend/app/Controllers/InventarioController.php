<?php
// backend/app/Controllers/InventarioController.php

require_once __DIR__ . '/../Models/InventarioModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class InventarioController {
    private InventarioModel $model;

    public function __construct() {
        $this->model = new InventarioModel();
    }

    // GET /inventario
    public function listar(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $items = $this->model->getAll();
        $this->ok(['inventario' => $items]);
    }

    // GET /inventario/alertas?umbral=10
    public function alertas(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $umbral  = isset($_GET['umbral']) ? (int)$_GET['umbral'] : 10;
        $lista   = $this->model->getStockBajo($umbral);
        $sinStock  = array_values(array_filter($lista, fn($p) => (int)$p['Stock'] <= 0));
        $stockBajo = array_values(array_filter($lista, fn($p) => (int)$p['Stock'] >  0));
        $this->ok([
            'sin_stock'  => $sinStock,
            'stock_bajo' => $stockBajo,
            'total'      => count($lista),
        ]);
    }

    // PUT /inventario/{id}  body: {stock, entradas?, salidas?}
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();

        if (!isset($body['stock'])) $this->err('El campo stock es requerido.');

        $stock    = (int)$body['stock'];
        $entradas = isset($body['entradas']) ? (int)$body['entradas'] : null;
        $salidas  = isset($body['salidas'])  ? (int)$body['salidas']  : null;

        if ($stock < 0) $this->err('El stock no puede ser negativo.');

        $ok = $this->model->actualizar($id, $stock, $entradas, $salidas);
        if (!$ok) $this->err('Registro de inventario no encontrado.', 404);
        $this->ok([], 'Inventario actualizado.');
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
