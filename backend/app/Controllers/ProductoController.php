<?php
// backend/app/Controllers/ProductoController.php

require_once __DIR__ . '/../Models/ProductoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class ProductoController {
    private ProductoModel $model;

    public function __construct() {
        $this->model = new ProductoModel();
    }

    // GET /api/productos (publico)
    public function listar(): void {
        $filtros = [
            'categoria' => $_GET['categoria'] ?? null,
            'buscar'    => $_GET['buscar'] ?? null,
        ];
        $this->ok(['productos' => $this->model->getAll($filtros)]);
    }

    // GET /api/productos/:id (publico)
    public function obtener(int $id): void {
        $p = $this->model->getById($id);
        if (!$p) $this->err('Producto no encontrado.', 404);
        $this->ok(['producto' => $p]);
    }

    // GET /api/categorias (publico)
    public function categorias(): void {
        $this->ok(['categorias' => $this->model->getCategorias()]);
    }

    // GET /api/proveedores (publico)
    public function proveedores(): void {
        $this->ok(['proveedores' => $this->model->getProveedores()]);
    }

    // GET /api/productos/mas-vendidos (publico)
    public function masVendidos(): void {
        $this->ok(['productos' => $this->model->getMasVendidos()]);
    }

    // POST /api/productos (solo admin/empleado)
    public function crear(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        if (empty($body['nombre']) || empty($body['precio'])) {
            $this->err('Nombre y precio son requeridos.', 400);
        }
        $id = $this->model->crear($body);
        $this->ok(['id' => $id], 'Producto creado exitosamente.', 201);
    }

    // PUT /api/productos/:id (solo admin/empleado)
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $this->model->actualizar($id, $body);
        $this->ok([], 'Producto actualizado.');
    }

    // DELETE /api/productos/:id (solo admin)
    public function eliminar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->model->eliminar($id);
        $this->ok([], 'Producto eliminado.');
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
