<?php
// backend/app/Controllers/PagoController.php

class PagoController {

    private PagoModel $model;

    public function __construct() {
        $this->model = new PagoModel();
    }

    // GET /pago/{pedido}  — usuario autenticado: obtiene su pago
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

    // GET /pago  — solo admin: lista todos los pagos con datos del cliente
    public function todos(): void {
        AuthMiddleware::requireRole(['Administrador']);
        echo json_encode(['success' => true, 'pagos' => $this->model->getAll()]);
    }

    // POST /pago/{pedido}/preferencia  — crea preferencia en MercadoPago y retorna init_point
    public function crearPreferencia(int $pedidoId): void {
        AuthMiddleware::verify();

        $pago = $this->model->getByPedido($pedidoId);
        if (!$pago) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Pedido no encontrado.']);
            return;
        }

        // Si ya fue aprobado, no crear nueva preferencia
        if (($pago['mp_status'] ?? '') === 'approved') {
            echo json_encode(['success' => false, 'message' => 'Este pago ya fue completado.']);
            return;
        }

        $body        = json_decode(file_get_contents('php://input'), true) ?? [];
        $frontendUrl = rtrim($body['frontend_url'] ?? MP_FRONTEND_URL, '/');
        $monto       = (float)$pago['Monto_Pago'];

        $preferenceData = [
            'items' => [
                [
                    'id'          => "pedido-{$pedidoId}",
                    'title'       => "Pedido #{$pedidoId} - Mercado Digital",
                    'quantity'    => 1,
                    'unit_price'  => $monto,
                    'currency_id' => 'COP',
                ]
            ],
            'back_urls' => [
                'success' => "{$frontendUrl}/pago/resultado?pedido={$pedidoId}&status=approved",
                'failure' => "{$frontendUrl}/carrito",
                'pending' => "{$frontendUrl}/carrito",
            ],
            'external_reference' => (string)$pedidoId,
            'notification_url'   => MP_WEBHOOK_URL . '/pago/webhook',
            'payment_methods'    => [
                'excluded_payment_methods' => [],
                'excluded_payment_types'   => [],
                'installments'             => 1,
            ],
        ];

        $ch = curl_init('https://api.mercadopago.com/checkout/preferences');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . MP_ACCESS_TOKEN,
                'Content-Type: application/json',
                'X-Idempotency-Key: pref-pedido-' . $pedidoId . '-' . time(),
            ],
            CURLOPT_POSTFIELDS     => json_encode($preferenceData),
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 201) {
            $err = json_decode($resp, true);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear preferencia en MercadoPago.',
                'detail'  => $err['message'] ?? $resp,
            ]);
            return;
        }

        $preference = json_decode($resp, true);
        $this->model->guardarPreferencia($pedidoId, $preference['id']);

        echo json_encode([
            'success'            => true,
            'init_point'         => $preference['init_point'],
            'sandbox_init_point' => $preference['sandbox_init_point'],
            'preference_id'      => $preference['id'],
        ]);
    }

    // POST /pago/webhook  — recibe notificaciones automáticas de MercadoPago (IPN)
    public function webhook(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        // MP puede enviar notificaciones tipo "payment" o via query params (?topic=payment&id=XXX)
        $tipo      = $body['type']          ?? ($_GET['topic'] ?? '');
        $paymentId = $body['data']['id']    ?? ($_GET['id']    ?? null);

        if ($tipo !== 'payment' || !$paymentId) {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

<<<<<<< HEAD
        $paymentData = $this->consultarPagoMP((int)$paymentId);
        if (!$paymentData) {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
=======
        $ok = $this->model->verificar($pagoId, $estado, $notas ?: null);
        echo json_encode(['success' => $ok]);
    }

    public function simular(int $pedidoId): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $metodo = trim($body['metodo'] ?? '');
        $datos  = is_array($body['datos'] ?? null) ? $body['datos'] : [];

        if (!in_array($metodo, ['Tarjeta', 'Nequi', 'Daviplata'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Método de pago no válido.']);
            return;
        }

        $pago = $this->model->getCheckoutData($pedidoId, $doc);
        if (!$pago) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'No se encontró el pago para este pedido.']);
            return;
        }

        if ($metodo === 'Tarjeta') {
            $numero   = preg_replace('/[\s\-]/', '', (string)($datos['numero_tarjeta'] ?? ''));
            $aprobado = $numero === '4000000000000000';
            $rechazo  = (mt_rand(0, 1) === 0) ? 'Fondos insuficientes.' : 'Transacción declinada por el banco.';
        } else {
            $celular  = preg_replace('/[\s\-]/', '', (string)($datos['celular'] ?? ''));
            $aprobado = $celular === '3000000000';
            $rechazo  = 'Número no registrado en ' . $metodo . '.';
        }

        $verificacion = $aprobado ? 'aprobado' : 'rechazado';
        $estadoPago   = $aprobado ? 'Completado' : 'Fallido';
        $mensaje      = $aprobado ? '¡Pago aprobado! Gracias por tu compra.' : ($rechazo ?? 'Transacción rechazada.');

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

    // ── Helpers privados ──────────────────────────────────────────────────

    private function resolverAppUrl(): string {
        require_once __DIR__ . '/../../config/StripeConfig.php';

        if (STRIPE_APP_URL !== '') {
            return STRIPE_APP_URL;
>>>>>>> 1d86c12 (pasarela de pagos)
        }

        $pedidoId      = (int)($paymentData['external_reference'] ?? 0);
        $status        = $paymentData['status']            ?? 'pending';
        $paymentMethod = $paymentData['payment_method_id'] ?? '';
        $mpPaymentId   = (string)($paymentData['id']       ?? '');

        if ($pedidoId > 0 && $mpPaymentId !== '') {
            $this->model->procesarPago($pedidoId, $mpPaymentId, $status, $paymentMethod);
        }

        http_response_code(200);
        echo json_encode(['success' => true]);
    }

    // GET /pago/{pedido}/verificar-mp?payment_id=XXX  — verifica pago tras redirect de MP
    public function verificarMP(int $pedidoId): void {
        AuthMiddleware::verify();

        $paymentId = $_GET['payment_id'] ?? null;

        // 1. Si tenemos payment_id explícito, intentar con ese primero
        $paymentData = null;
        if ($paymentId) {
            $paymentData = $this->consultarPagoMP((int)$paymentId);
        }

        // 2. Si no tenemos datos o el estado sigue pendiente, buscar por external_reference
        //    Esto cubre el caso en que el usuario cerró la pestaña de MP sin volver.
        $statusActual = $paymentData['status'] ?? '';
        if (!$paymentData || in_array($statusActual, ['pending', 'in_process', ''], true)) {
            $mejorPago = $this->buscarMejorPagoPorPedido($pedidoId);
            if ($mejorPago) {
                $paymentData = $mejorPago;
            }
        }

        if ($paymentData) {
            $mpStatus      = $paymentData['status']            ?? 'pending';
            $paymentMethod = $paymentData['payment_method_id'] ?? '';
            $mpPaymentId   = (string)($paymentData['id']       ?? '');

            if ($mpPaymentId !== '') {
                $this->model->procesarPago($pedidoId, $mpPaymentId, $mpStatus, $paymentMethod);
            }
        }

        $pago = $this->model->getByPedido($pedidoId);
        echo json_encode(['success' => true, 'pago' => $pago]);
    }

    /**
     * Busca todos los pagos de MP asociados al pedido por external_reference
     * y devuelve el mejor: primero approved, luego in_process, luego pending.
     */
    private function buscarMejorPagoPorPedido(int $pedidoId): ?array {
        $ch = curl_init(
            "https://api.mercadopago.com/v1/payments/search" .
            "?external_reference={$pedidoId}&sort=date_created&criteria=desc&limit=10"
        );
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . MP_ACCESS_TOKEN],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200) return null;
        $data = json_decode($resp, true);
        $pagos = $data['results'] ?? [];

        // Prioridad: approved > in_process > pending
        $prioridad = ['approved' => 0, 'in_process' => 1, 'pending' => 2];
        usort($pagos, fn($a, $b) =>
            ($prioridad[$a['status']] ?? 99) <=> ($prioridad[$b['status']] ?? 99)
        );

        return !empty($pagos) ? $pagos[0] : null;
    }

    // ── Helper privado ────────────────────────────────────────────────────

    private function consultarPagoMP(int $paymentId): ?array {
        $ch = curl_init("https://api.mercadopago.com/v1/payments/{$paymentId}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . MP_ACCESS_TOKEN],
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200) return null;
        $data = json_decode($resp, true);
        return is_array($data) ? $data : null;
    }
}
