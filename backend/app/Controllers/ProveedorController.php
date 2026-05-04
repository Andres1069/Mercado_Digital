<?php

require_once __DIR__ . '/../Models/ProveedorModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class ProveedorController {
    private ProveedorModel $model;

    public function __construct() {
        $this->model = new ProveedorModel();
    }

    // GET /proveedores
    public function listar(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $this->ok(['proveedores' => $this->model->getAll()]);
    }

    // GET /proveedores/:id
    public function obtener(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $p = $this->model->getById($id);
        if (!$p) $this->err('Proveedor no encontrado.', 404);
        $this->ok([
            'proveedor'          => $p,
            'productos_bajo_stock' => $this->model->getProductosBajoStock($id),
        ]);
    }

    // POST /proveedores
    public function crear(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();
        if (empty($body['nombre']) || empty($body['telefono']) || empty($body['correo'])) {
            $this->err('Nombre, telefono y correo son requeridos.', 400);
        }
        $id = $this->model->crear($body);
        $this->ok(['id' => $id], 'Proveedor creado exitosamente.', 201);
    }

    // PUT /proveedores/:id
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();
        if (empty($body['nombre']) || empty($body['telefono']) || empty($body['correo'])) {
            $this->err('Nombre, telefono y correo son requeridos.', 400);
        }
        $this->model->actualizar($id, $body);
        $this->ok([], 'Proveedor actualizado.');
    }

    // DELETE /proveedores/:id
    public function eliminar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->model->eliminar($id);
        $this->ok([], 'Proveedor eliminado.');
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
