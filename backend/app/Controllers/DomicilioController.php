<?php

require_once __DIR__ . '/../Models/DomicilioModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Helpers/AuditLog.php';
require_once __DIR__ . '/../../config/Mailer.php';

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

    // POST /domicilio/cancelar
    public function cancelar(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) {
            $this->error('No se pudo identificar el usuario.', 401);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $pedidoId = (int)($body['pedido'] ?? 0);
        if ($pedidoId <= 0) {
            $this->error('El parametro pedido es requerido.', 400);
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
        $pagina    = max(0, (int)($_GET['pagina'] ?? 0));
        $limite    = max(0, min(100, (int)($_GET['limite'] ?? 0)));
        $resultado = $this->model->getAll($pagina, $limite);
        if ($pagina > 0) {
            $this->ok($resultado);
        } else {
            $this->ok(['domicilios' => $resultado]);
        }
    }

    // PUT /domicilio/{id}/estado  body: {estado, recibido_por?, documento_recibe?, observaciones_entrega?, comprobante_entrega?}
    public function actualizarEstado(int $id): void {
        $payload = AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body   = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        $validos = ['Pendiente', 'En preparacion', 'En camino', 'Entregado', 'Cancelado'];
        if (!in_array($estado, $validos, true)) {
            $this->error('Estado invalido. Valores permitidos: ' . implode(', ', $validos));
        }

        $comprobanteEntrega = trim((string)($body['comprobante_entrega'] ?? ''));
        $comprobante = [
            'recibido_por' => trim((string)($body['recibido_por'] ?? '')),
            'documento_recibe' => trim((string)($body['documento_recibe'] ?? '')),
            'observaciones_entrega' => trim((string)($body['observaciones_entrega'] ?? '')),
            'comprobante_entrega' => $comprobanteEntrega !== '' ? $comprobanteEntrega : null,
        ];

        if ($estado === 'Entregado' && $comprobante['recibido_por'] === '' && $comprobante['comprobante_entrega'] === null) {
            $this->error('Para marcar como entregado registra al menos quien recibio o un comprobante de entrega.');
        }

        $this->model->actualizarEstado($id, $estado, $comprobante);
        AuditLog::registrar('cambiar_estado', 'domicilio', $id, (int)($payload['num_documento'] ?? 0), $estado);

        // --- ENVIAR NOTIFICACIÓN DE ENTREGA ---
        if ($estado === 'Entregado') {
            $contacto = $this->model->getContactoPorDomicilio($id);
            if (!empty($contacto['Correo']) && filter_var($contacto['Correo'], FILTER_VALIDATE_EMAIL)) {
                $correoCliente = $contacto['Correo'];
                $nombreCliente = trim(($contacto['Nombre'] ?? '') . ' ' . ($contacto['Apellido'] ?? ''));
                $pedidoId = $contacto['Cod_Pedido'];

                $asunto = "¡Tu pedido #{$pedidoId} ha sido entregado!";
                $contactoMailHref = 'mailto:mercado.digital.bog@gmail.com';
                $socialHref = '#';

                $quienRecibio = htmlspecialchars($comprobante['recibido_por'] ?: 'No especificado');
                $evidenciaHTML = '';

                if ($comprobante['comprobante_entrega']) {
                    $urlFoto = htmlspecialchars($comprobante['comprobante_entrega']);
                    $evidenciaHTML = "<div style=\"text-align:center; margin-top:20px;\"><p style=\"color:#ffffff; font-size:14px; font-weight:bold; margin-bottom:10px;\">Evidencia fotográfica:</p><img src=\"{$urlFoto}\" alt=\"Evidencia de entrega\" style=\"max-width:100%; border-radius:8px; border:2px solid rgba(143,186,103,0.42);\"></div>";
                }

                $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Entregado - Mercado Digital</title>
  <style>
    body { margin:0; padding:32px 12px; background:#eceee9; font-family:Arial, sans-serif; color:#24352c; }
    .wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 36px rgba(0,0,0,0.08); }
    .header { background:#1a2e22; padding:24px 28px; text-align:center; }
    .brand-top { font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#a6b7aa; }
    .brand-bottom { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; color:#ffffff; line-height:1.1; }
    .hero { padding:40px 28px 34px; background:linear-gradient(140deg, #1a2e22 0%, #24402f 100%); }
    .eyebrow { font-size:11px; font-weight:700; letter-spacing:0.20em; text-transform:uppercase; color:#8fba67; margin-bottom:14px; }
    .title { margin:0 0 12px; font-family:Georgia, "Times New Roman", serif; font-size:25px; line-height:1.15; color:#ffffff; }
    .subtitle { margin:0 0 22px; font-size:15px; line-height:1.7; color:#d4ddd6; }
    .code-card { background:rgba(255,255,255,0.08); border:1px solid rgba(143,186,103,0.42); border-radius:10px; padding:18px 20px; }
    .footer { padding:24px 28px 28px; text-align:center; background:#f2f5f2; border-top:1px solid #e0e8e2; }
    .footer p { margin:0; font-size:12px; line-height:1.8; color:#8b9b90; }
    .footer a { color:#7daa5a; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-top">Mercado</div>
      <div class="brand-bottom">Digital</div>
    </div>
    <div class="hero">
      <div class="eyebrow">¡ENTREGA EXITOSA!</div>
      <h1 class="title">Hola, {$nombreCliente}</h1>
      <p class="subtitle">Nos alegra confirmarte que tu pedido <strong>#{$pedidoId}</strong> ha sido entregado en su destino.</p>
      
      <div class="code-card">
        <p style="margin:0 0 5px; font-size:14px; color:#b9c7bd;"><strong>Recibido por:</strong> {$quienRecibio}</p>
        {$evidenciaHTML}
      </div>
      
      <p class="subtitle" style="margin-top:22px; font-size:14px;">Esperamos que disfrutes tu compra. Gracias por elegirnos.</p>
    </div>
    <div class="footer">
      <p>Este es un correo automático confirmando la entrega de tu pedido.<br>Si tienes algún inconveniente, <a href="{$contactoMailHref}">contáctanos</a>.</p>
      <p style="margin-top:8px;">&copy; 2026 Mercado Digital &bull; <a href="{$socialHref}">Política de privacidad</a></p>
    </div>
  </div>
</body>
</html>
HTML;
                $texto = "Hola {$nombreCliente},\nTu pedido #{$pedidoId} ha sido entregado.\nRecibido por: {$quienRecibio}\nGracias por comprar en Mercado Digital.";
                Mailer::send($correoCliente, $asunto, $texto, $html);
            }
        }

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
