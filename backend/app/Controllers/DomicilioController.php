<?php

require_once __DIR__ . '/../Models/DomicilioModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Models/DomicilioModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class DomicilioController {
    private DomicilioModel $model;

    public function __construct() {
        $this->model = new DomicilioModel();
    }

    // POST /domicilio/crear
    // Crea el domicilio para un pedido del usuario (si no existe).
    public function crear(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $body = $this->body();
        $pedidoId = (int)($body['pedido'] ?? 0);
        if ($pedidoId <= 0) {
            $this->error('El campo pedido es requerido.', 400);
        }

        $estado = trim((string)($body['estado'] ?? 'Pendiente'));
        // Extra opcional: si tu BD tiene columnas extendidas en `domicilio`, el modelo las usa.
        $extra = [
            'pedido' => $pedidoId,
            'direccion' => $body['direccion'] ?? null,
            'telefono' => $body['telefono'] ?? null,
            'notas' => $body['notas'] ?? null,
            'costo_envio' => $body['costo_envio'] ?? null,
            'distancia' => $body['distancia'] ?? null,
            'tiempo' => $body['tiempo'] ?? null,
        ];

        $res = $this->model->crearParaPedido($doc, $pedidoId, $estado === '' ? 'Pendiente' : $estado, $extra);
        $msg = $res['created'] ? 'Domicilio creado.' : 'El domicilio ya existia.';
        $this->ok($res, $msg, $res['created'] ? 201 : 200);
    }

    // GET /domicilio/usuario
    public function usuario(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $domicilios = $this->model->listarPorDocumento($doc);
        $this->ok(['domicilios' => $domicilios]);
    }

    // GET /domicilio/detalle?pedido=123
    public function detalle(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $pedidoId = (int)($_GET['pedido'] ?? 0);
        if ($pedidoId <= 0) {
            $this->error('Parametro pedido requerido.', 400);
        }

        $detalle = $this->model->detallePorDocumento($doc, $pedidoId);
        if (!$detalle) {
            $this->error('Pedido no encontrado.', 404);
        }

        $this->ok(['detalle' => $detalle]);
    }

    // GET /domicilio/cancelar?pedido=123
    public function cancelar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $pedidoId = (int)($_GET['pedido'] ?? 0);
        if ($pedidoId <= 0) {
            $this->error('Parametro pedido requerido.', 400);
        }

        $ok = $this->model->cancelarPedido($doc, $pedidoId);
        if (!$ok) {
            $this->error('No se pudo cancelar el pedido (no existe o no pertenece al usuario).', 404);
        }

        $this->ok(['success' => true], 'Pedido cancelado.');
    }

    // GET /domicilio/seguimiento?pedido=123
    public function seguimiento(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $pedidoId = (int)($_GET['pedido'] ?? 0);
        if ($pedidoId <= 0) {
            $this->error('Parametro pedido requerido.', 400);
        }

        $data = $this->model->seguimiento($doc, $pedidoId);
        $this->ok($data);
    }

    // GET /domicilio/todos  (admin/empleado)
    public function todos(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $domicilios = $this->model->getAll();
        $this->ok(['domicilios' => $domicilios]);
    }

    // PUT /domicilio/{id}/estado  body: {estado}
    public function actualizarEstado(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body   = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        $validos = ['Pendiente', 'En preparacion', 'En camino', 'Entregado', 'Cancelado'];
        if (!in_array($estado, $validos, true)) {
            $this->error('Estado invalido. Valores permitidos: ' . implode(', ', $validos));
        }
        $this->model->actualizarEstado($id, $estado);
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

    private function error(string $msg, int $code = 400): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}
