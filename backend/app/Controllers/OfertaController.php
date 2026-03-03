<?php
// backend/app/Controllers/OfertaController.php

require_once __DIR__ . '/../Models/OfertaModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class OfertaController {
    private OfertaModel $model;

    public function __construct() {
        $this->model = new OfertaModel();
    }

    // GET /api/ofertas  (público - solo activas)
    public function listar(): void {
        $this->ok(['ofertas' => $this->model->getActivas()]);
    }

    // GET /api/ofertas/todas  (admin)
    public function todas(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $this->ok(['ofertas' => $this->model->getAll()]);
    }

    // POST /api/ofertas  (admin)
    public function crear(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();
        if (empty($body['titulo']) || empty($body['porcentaje_descuento'])) {
            $this->err('Título y porcentaje son requeridos.', 400);
        }
        $id = $this->model->crear($body);
        $this->ok(['id' => $id], 'Oferta creada.', 201);
    }

    // PUT /api/ofertas/:id  (admin)
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->model->actualizar($id, $this->body());
        $this->ok([], 'Oferta actualizada.');
    }

    // DELETE /api/ofertas/:id  (admin)
    public function eliminar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->model->eliminar($id);
        $this->ok([], 'Oferta desactivada.');
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
