<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['evidencia']) || $_FILES['evidencia']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['evidencia'];

// Desactivar warnings HTML para no romper la respuesta JSON
error_reporting(0);

try {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, $file['tmp_name']) : 'application/octet-stream';
    if ($finfo) finfo_close($finfo);

    // Validate file type (basico)
    if (!$mimeType || (!str_starts_with($mimeType, 'image/') && $mimeType !== 'application/octet-stream')) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El archivo debe ser una imagen. Detectado: ' . $mimeType]);
        exit;
    }

    // Fotos de evidencia de entrega tomadas por el domiciliario/empleado al confirmar el pedido.
    $uploadDir = __DIR__ . '/uploads/entrega_pedido/';

    // Create directory if it doesn't exist
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
        exit;
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!$ext) {
        // Determine from mime
        $ext = explode('/', $mimeType)[1] ?? 'jpg';
    }

    $pedidoId = isset($_POST['pedido_id']) ? preg_replace('/[^0-9]/', '', $_POST['pedido_id']) : 'unknown';
    $filename = 'entrega_pedido_' . $pedidoId . '_' . time() . '.' . $ext;
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
        exit;
    }

    // Generate URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;

    // Si estamos en localhost, agregamos la ruta de XAMPP. En Render va directo.
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        $baseUrl .= '/mercado_digital/backend/public';
    }

    $url = $baseUrl . '/uploads/entrega_pedido/' . $filename;

    echo json_encode(['success' => true, 'url' => $url, 'message' => 'File uploaded successfully']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al procesar la foto: ' . $e->getMessage()]);
}
