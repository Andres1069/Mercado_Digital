<?php
// backend/app/Controllers/OfertaController.php

require_once __DIR__ . '/../Models/OfertaModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class OfertaController {
    private OfertaModel $model;

    public function __construct() {
        $this->model = new OfertaModel();
    }

    // GET /api/ofertas  (publico - solo activas)
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
            $this->err('Titulo y porcentaje son requeridos.', 400);
        }

        $this->validarFechas($body, false);

        $id = $this->model->crear($body);
        $this->ok(['id' => $id], 'Oferta creada.', 201);
    }

    // PUT /api/ofertas/:id  (admin)
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body = $this->body();

        $this->validarFechas($body, true);
        $this->model->actualizar($id, $body);
        $this->ok([], 'Oferta actualizada.');
    }

    // DELETE /api/ofertas/:id  (admin)
    public function eliminar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->model->eliminar($id);
        $this->ok([], 'Oferta eliminada.');
    }

    private function validarFechas(array $body, bool $esEdicion): void {
        if (empty($body['fecha_inicio']) || empty($body['fecha_fin'])) {
            $this->err('Las fechas de inicio y fin son requeridas.', 400);
        }

        try {
            $ahora = new DateTimeImmutable(date('Y-m-d H:i:00'));
            $inicio = new DateTimeImmutable(str_replace('T', ' ', (string)$body['fecha_inicio']));
            $fin = new DateTimeImmutable(str_replace('T', ' ', (string)$body['fecha_fin']));
        } catch (Exception) {
            $this->err('Las fechas de la oferta no tienen un formato valido.', 400);
        }

        if ($fin <= $inicio) {
            $this->err('La fecha fin debe ser mayor que la fecha inicio.', 400);
        }

        if (!$esEdicion && $inicio < $ahora) {
            $this->err('No puedes crear ofertas con fecha de inicio en el pasado.', 400);
        }

        if ($fin < $ahora) {
            $this->err('No puedes guardar ofertas con fecha fin vencida.', 400);
        }
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
