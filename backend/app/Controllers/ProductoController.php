<?php
// backend/app/Controllers/ProductoController.php

require_once __DIR__ . '/../Models/ProductoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Helpers/AuditLog.php';

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
        $pagina = max(0, (int)($_GET['pagina'] ?? 0));
        $limite = max(0, min(100, (int)($_GET['limite'] ?? 0)));
        $resultado = $this->model->getAll($filtros, $pagina, $limite);
        if ($pagina > 0) {
            $this->ok($resultado);
        } else {
            $this->ok(['productos' => $resultado]);
        }
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

    // POST /api/productos (solo admin)
    public function crear(): void {
        $payload = AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();
        if (empty($body['nombre']) || empty($body['precio'])) {
            $this->err('Nombre y precio son requeridos.', 400);
        }
        $id = $this->model->crear($body);
        AuditLog::registrar('crear', 'producto', $id, (int)($payload['num_documento'] ?? 0), $body['nombre'] ?? null);
        $this->ok(['id' => $id], 'Producto creado exitosamente.', 201);
    }

    // PUT /api/productos/:id (admin y empleado)
    public function actualizar(int $id): void {
        $payload = AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $this->model->actualizar($id, $body);
        AuditLog::registrar('editar', 'producto', $id, (int)($payload['num_documento'] ?? 0), $body['nombre'] ?? null);
        $this->ok([], 'Producto actualizado.');
    }

    // DELETE /api/productos/:id (solo admin)
    public function eliminar(int $id): void {
        $payload = AuthMiddleware::requireRole(['Administrador']);
        $this->model->eliminar($id);
        AuditLog::registrar('eliminar', 'producto', $id, (int)($payload['num_documento'] ?? 0));
        $this->ok([], 'Producto eliminado.');
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
