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

    // POST /pago/{pedido}/comprobante  — usuario sube su comprobante (multipart/form-data)
    public function subirComprobante(int $pedidoId): void {
        AuthMiddleware::verify();

        // Verificar que llegó el archivo
        if (!isset($_FILES['comprobante']) || $_FILES['comprobante']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            $code = $_FILES['comprobante']['error'] ?? -1;
            echo json_encode(['success' => false, 'message' => "No se recibió el comprobante. Código PHP: $code"]);
            return;
        }

        // Verificar que llegó el monto
        if (!isset($_POST['monto_comprobante']) || !is_numeric($_POST['monto_comprobante'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El monto del comprobante es requerido y debe ser numérico.']);
            return;
        }

        $file = $_FILES['comprobante'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Validar tipo real del archivo con finfo
        $finfo       = new finfo(FILEINFO_MIME_TYPE);
        $mime        = $finfo->file($file['tmp_name']);
        $mimesOK     = ['image/png', 'image/jpeg', 'application/pdf'];
        $extensionesOK = ['png', 'jpg', 'jpeg', 'pdf'];

        if (!in_array($mime, $mimesOK, true) || !in_array($ext, $extensionesOK, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Solo se permiten comprobantes en PNG, JPG, JPEG o PDF.']);
            return;
        }

        // Crear directorio de destino si no existe
        $uploadDir = __DIR__ . '/../../public/uploads/comprobantes/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $nombre  = 'comprobante_' . $pedidoId . '_' . time() . '.' . $ext;
        $destino = $uploadDir . $nombre;

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar el comprobante en el servidor.']);
            return;
        }

        $comprobanteUrl   = 'uploads/comprobantes/' . $nombre;
        $montoComprobante = (int)$_POST['monto_comprobante'];

        $resultado = $this->model->subirComprobante($pedidoId, $comprobanteUrl, $montoComprobante);
        echo json_encode($resultado);
    }

    // PUT /pago/{id}/verificar  — solo admin: aprueba o rechaza manualmente
    public function verificar(int $pagoId): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $estado = trim($body['estado'] ?? '');
        $notas  = isset($body['notas']) ? trim($body['notas']) : null;

        if (!in_array($estado, ['aprobado', 'rechazado', 'pendiente'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Estado inválido. Use: aprobado, rechazado o pendiente.']);
            return;
        }

        $ok = $this->model->verificar($pagoId, $estado, $notas ?: null);
        echo json_encode([
            'success' => $ok,
            'message' => $ok ? 'Estado de verificación actualizado.' : 'Error al actualizar el estado.',
        ]);
    }
}
