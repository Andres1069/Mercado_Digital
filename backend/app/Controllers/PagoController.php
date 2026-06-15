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
            echo json_encode(['success' => false, 'message' => 'No se encontro el pago para este pedido.']);
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

    public function crearPreferencia(int $pedidoId): void {
        AuthMiddleware::verify();

        $pago = $this->model->getByPedido($pedidoId);
        if (!$pago) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Pedido no encontrado.']);
            return;
        }

        if (($pago['mp_status'] ?? '') === 'approved') {
            echo json_encode(['success' => false, 'message' => 'Este pago ya fue completado.']);
            return;
        }

        $body        = json_decode(file_get_contents('php://input'), true) ?? [];
        $frontendUrl = rtrim($body['frontend_url'] ?? MP_FRONTEND_URL, '/');
        $monto       = (float)$pago['Monto_Pago'];

        $preferenceData = [
            'items' => [[
                'id'          => "pedido-{$pedidoId}",
                'title'       => "Pedido #{$pedidoId} - Mercado Digital",
                'quantity'    => 1,
                'unit_price'  => $monto,
                'currency_id' => 'COP',
            ]],
            'back_urls' => [
                'success' => "{$frontendUrl}/pago/resultado?pedido={$pedidoId}&status=approved",
                'failure' => "{$frontendUrl}/carrito",
                'pending' => "{$frontendUrl}/carrito",
            ],
            'external_reference' => (string)$pedidoId,
            'payment_methods'    => [
                'excluded_payment_methods' => [],
                'excluded_payment_types'   => [],
                'installments'             => 1,
            ],
        ];

        $webhookUrl = rtrim((string)MP_WEBHOOK_URL, '/') . '/pago/webhook';
        if ($this->esUrlPublica($webhookUrl)) {
            $preferenceData['notification_url'] = $webhookUrl;
        }

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
        $curlError = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 201) {
            $err = json_decode($resp, true);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear preferencia en MercadoPago.',
                'detail'  => $err['message'] ?? ($curlError ?: $resp),
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

    public function webhook(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $tipo      = $body['type']       ?? ($_GET['topic'] ?? '');
        $paymentId = $body['data']['id'] ?? ($_GET['id']    ?? null);

        if ($tipo !== 'payment' || !$paymentId) {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
        }

        $paymentData = $this->consultarPagoMP((int)$paymentId);
        if (!$paymentData) {
            http_response_code(200);
            echo json_encode(['success' => true]);
            return;
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

    public function verificarMP(int $pedidoId): void {
        AuthMiddleware::verify();

        $paymentId = $_GET['payment_id'] ?? null;
        $paymentData = null;

        if ($paymentId) {
            $paymentData = $this->consultarPagoMP((int)$paymentId);
        }

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

        $prioridad = ['approved' => 0, 'in_process' => 1, 'pending' => 2];
        usort($pagos, fn($a, $b) =>
            ($prioridad[$a['status']] ?? 99) <=> ($prioridad[$b['status']] ?? 99)
        );

        return !empty($pagos) ? $pagos[0] : null;
    }

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

    private function esUrlPublica(string $url): bool {
        $host = parse_url($url, PHP_URL_HOST);
        if (!$host) return false;

        $host = strtolower($host);
        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) return false;
        if (preg_match('/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/', $host)) return false;

        return (bool)filter_var($url, FILTER_VALIDATE_URL);
    }
}
