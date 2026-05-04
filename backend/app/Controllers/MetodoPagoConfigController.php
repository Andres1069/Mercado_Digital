<?php
// backend/app/Controllers/MetodoPagoConfigController.php

class MetodoPagoConfigController {

    private MetodoPagoConfigModel $model;

    public function __construct() {
        $this->model = new MetodoPagoConfigModel();
    }

    // GET /metodos-pago  — público: cualquier usuario ve los métodos activos
    public function listar(): void {
        echo json_encode(['success' => true, 'config' => $this->model->getAll()]);
    }

    // GET /metodos-pago/{metodo}  — público
    public function obtenerPorMetodo(string $metodo): void {
        $config = $this->model->getByMetodo($metodo);
        if (!$config) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Método de pago no encontrado.']);
            return;
        }
        echo json_encode(['success' => true, 'config' => $config]);
    }

    // PUT /metodos-pago/{id}  — solo Administrador: actualiza el número
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $cfg = $this->model->getById($id);
        if (!$cfg) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Configuración no encontrada.']);
            return;
        }
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $numero = isset($body['numero']) ? trim((string)$body['numero']) : null;
        $this->model->updateNumero($id, $numero ?: null);
        echo json_encode(['success' => true, 'message' => 'Número actualizado correctamente.']);
    }

    // POST /metodos-pago/{id}/upload-qr  — solo Administrador: sube imagen QR
    public function uploadQR(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $cfg = $this->model->getById($id);
        if (!$cfg) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Configuración no encontrada.']);
            return;
        }

        if (!isset($_FILES['qr']) || $_FILES['qr']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            $code = $_FILES['qr']['error'] ?? -1;
            echo json_encode(['success' => false, 'message' => "No se recibió el archivo QR. Código: $code"]);
            return;
        }

        $file = $_FILES['qr'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Validar tipo real mediante finfo (evita spoofing de extensión)
        $finfo       = new finfo(FILEINFO_MIME_TYPE);
        $mime        = $finfo->file($file['tmp_name']);
        $mimesOK     = ['image/png', 'image/jpeg'];
        $extensionesOK = ['png', 'jpg', 'jpeg'];

        if (!in_array($mime, $mimesOK, true) || !in_array($ext, $extensionesOK, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Solo se permiten imágenes PNG, JPG o JPEG para el QR.']);
            return;
        }

        // Directorio de destino dentro de public/ (accesible por Apache)
        $uploadDir = __DIR__ . '/../../public/uploads/qr/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Eliminar QR anterior si existe
        if (!empty($cfg['qr_url'])) {
            $archivoViejo = __DIR__ . '/../../public/' . $cfg['qr_url'];
            if (file_exists($archivoViejo)) {
                @unlink($archivoViejo);
            }
        }

        $slug     = strtolower(str_replace(' ', '_', $cfg['metodo']));
        $nombre   = $slug . '_' . time() . '.' . $ext;
        $destino  = $uploadDir . $nombre;

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar el archivo en el servidor.']);
            return;
        }

        $qrUrl = 'uploads/qr/' . $nombre;
        $this->model->updateQR($id, $qrUrl);
        echo json_encode(['success' => true, 'message' => 'QR actualizado correctamente.', 'qr_url' => $qrUrl]);
    }
}
