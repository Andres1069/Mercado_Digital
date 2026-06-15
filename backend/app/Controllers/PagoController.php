<?php
// backend/app/Controllers/PagoController.php

class PagoController {

    private PagoModel $model;

    public function __construct() {
        $this->model = new PagoModel();
    }

    public function obtener(int $pedidoId): void {
        AuthMiddleware::verify();
        $pago = $this->model->getByPedido($pedidoId);
        if (!$pago) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'No se encontró el pago para este pedido.']);
            return;
        }
        echo json_encode(['success' => true, 'pago' => $pago]);
    }

    public function todos(): void {
        AuthMiddleware::requireRole(['Administrador']);
        echo json_encode(['success' => true, 'pagos' => $this->model->getAll()]);
    }

    public function verificar(int $pagoId): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $estado = trim($body['estado'] ?? '');
        $notas  = isset($body['notas']) ? trim($body['notas']) : null;

        if (!in_array($estado, ['aprobado', 'rechazado', 'pendiente'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Estado inválido. Use: aprobado, rechazado o pendiente.']);
            return;
        }

        $ok = $this->model->verificar($pagoId, $estado, $notas ?: null);
        echo json_encode(['success' => $ok]);
    }

    public function simular(int $pedidoId): void {
        AuthMiddleware::verify();

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $metodo = trim($body['metodo'] ?? '');
        $datos  = is_array($body['datos'] ?? null) ? $body['datos'] : [];

        if (!in_array($metodo, ['Tarjeta', 'Nequi', 'Daviplata'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Método de pago no válido.']);
            return;
        }

        $pago = $this->model->getByPedido($pedidoId);
        if (!$pago) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'No se encontró el pago para este pedido.']);
            return;
        }

        if ($metodo === 'Tarjeta') {
            $numero       = preg_replace('/[\s\-]/', '', (string)($datos['numero_tarjeta'] ?? ''));
            $primerDigito = (int)substr($numero, 0, 1);
            $aprobado     = $primerDigito % 2 === 0;
            $mensaje      = $aprobado
                ? '¡Pago aprobado! Gracias por tu compra.'
                : 'Algo salió mal con la transacción.';
        } else {
            $claveDinamica = trim((string)($datos['clave_dinamica'] ?? ''));
            if ($claveDinamica === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'La clave dinámica es requerida para autorizar la transacción.']);
                return;
            }
            $celular      = preg_replace('/[\s\-]/', '', (string)($datos['celular'] ?? ''));
            $ultimoDigito = (int)substr($celular, -1);
            $aprobado     = $ultimoDigito % 2 === 0;
            $mensaje      = $aprobado
                ? '¡Pago aprobado! Gracias por tu compra.'
                : 'Transacción rechazada.';
        }

        $verificacion = $aprobado ? 'aprobado' : 'rechazado';
        $estadoPago   = $aprobado ? 'Completado' : 'Fallido';

        $this->model->registrarSimulado($pedidoId, $metodo, $verificacion, $estadoPago, $mensaje);

        echo json_encode([
            'success'   => true,
            'resultado' => [
                'aprobado'     => $aprobado,
                'verificacion' => $verificacion,
                'mensaje'      => $mensaje,
            ],
        ]);
    }
}
