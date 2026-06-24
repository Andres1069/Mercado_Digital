<?php
// backend/app/Controllers/PedidoController.php

require_once __DIR__ . '/../Models/PedidoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/Mailer.php';
require_once __DIR__ . '/../Helpers/AuditLog.php';

class PedidoController {
    private PedidoModel $model;

    public function __construct() {
        $this->model = new PedidoModel();
    }

    // GET /pedidos/mis-pedidos
    public function misPedidos(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $pedidos = $this->model->getMisPedidos($doc);
        $this->ok(['pedidos' => $pedidos]);
    }

    // GET /pedidos  (admin/empleado)
    public function todos(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $pagina    = max(0, (int)($_GET['pagina'] ?? 0));
        $limite    = max(0, min(100, (int)($_GET['limite'] ?? 0)));
        $resultado = $this->model->getAll($pagina, $limite);
        if ($pagina > 0) {
            $this->ok($resultado);
        } else {
            $this->ok(['pedidos' => $resultado]);
        }
    }

    // GET /pedidos/{id}
    public function obtener(int $id): void {
        $payload = AuthMiddleware::verify();
        $rol = $payload['rol'] ?? '';
        $doc = (int)($payload['num_documento'] ?? 0);

        $pedido = $this->model->getById($id);
        if (!$pedido) $this->err('Pedido no encontrado.', 404);

        // Clientes solo pueden ver sus propios pedidos
        if (!in_array($rol, ['Administrador', 'Empleado'], true) && (int)$pedido['Num_Documento'] !== $doc) {
            $this->err('No tienes permiso para ver este pedido.', 403);
        }

        $this->ok(['pedido' => $pedido]);
    }

    // POST /pedidos
    public function crear(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $body = $this->body();
        $items = $body['items'] ?? [];
        $metodoPago = trim((string)($body['metodo_pago'] ?? ''));
        $montoTotal = (int)($body['monto_total'] ?? 0);

        if (empty($items) || !is_array($items)) {
            $this->err('El carrito esta vacio.');
        }
        if ($metodoPago === '') {
            $this->err('El metodo de pago es requerido.');
        }

        try {
            $codPedido = $this->model->crear($doc, $items, $metodoPago, $montoTotal);
        } catch (RuntimeException $e) {
            $this->err($e->getMessage(), 422);
        }
        $this->ok(['cod_pedido' => $codPedido], 'Pedido creado exitosamente.', 201);
    }

    // POST /ventas/presencial
    public function crearVentaPresencial(): void {
        $payload = AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $vendedor = (int)($payload['num_documento'] ?? 0);
        if ($vendedor <= 0) $this->err('No se pudo identificar el vendedor.', 401);

        $body = $this->body();
        $items = $body['items'] ?? [];
        $metodoPago = trim((string)($body['metodo_pago'] ?? 'Efectivo'));
        $montoTotal = (int)($body['monto_total'] ?? 0);
        $observaciones = trim((string)($body['observaciones'] ?? ''));

        if (empty($items) || !is_array($items)) {
            $this->err('Agrega al menos un producto a la venta.');
        }
        if ($montoTotal <= 0) {
            $this->err('El total de la venta debe ser mayor a cero.');
        }

        try {
            $codPedido = $this->model->crear($vendedor, $items, $metodoPago, $montoTotal, [
                'canal_venta' => 'Tienda',
                'tipo_entrega' => 'Recoger_Tienda',
                'estado_pedido' => 'Entregado',
                'estado_pago' => 'Completado',
                'vendedor' => $vendedor,
                'observaciones' => $observaciones !== '' ? $observaciones : 'Venta presencial en tienda',
            ]);
        } catch (RuntimeException $e) {
            $this->err($e->getMessage(), 422);
        }

        $this->ok(['cod_pedido' => $codPedido], 'Venta presencial registrada.', 201);
    }

    // PUT /pedidos/{id}/entrega  body: {tipo_entrega: "Domicilio"|"Recoger_Tienda"}
    public function actualizarTipoEntrega(int $id): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $body = $this->body();
        $tipo = strtolower(trim((string)($body['tipo_entrega'] ?? '')));
        $mapa = [
            'domicilio' => 'Domicilio',
            'recoger_tienda' => 'Recoger_Tienda',
            'recoger tienda' => 'Recoger_Tienda',
            'recoger-en-tienda' => 'Recoger_Tienda',
        ];
        if (!isset($mapa[$tipo])) {
            $this->err('Tipo de entrega invalido.');
        }

        $tipoCanonico = $mapa[$tipo];

        $ok = $this->model->actualizarTipoEntrega($id, $doc, $tipoCanonico);
        if (!$ok) $this->err('Pedido no encontrado o sin permiso para actualizarlo.', 404);

        $this->ok(['tipo_entrega' => $tipoCanonico], 'Tipo de entrega actualizado.');
    }

    // PUT /pedidos/{id}/estado  (admin/empleado)
    public function cambiarEstado(int $id): void {
        $payload = AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        if ($estado === '') $this->err('El campo estado es requerido.');

        $ok = $this->model->cambiarEstado($id, $estado);
        if (!$ok) $this->err('Pedido no encontrado.', 404);
        AuditLog::registrar('cambiar_estado', 'pedido', $id, (int)($payload['num_documento'] ?? 0), $estado);
        $this->ok([], 'Estado actualizado.');
    }

    // POST /pedidos/{id}/notificar-domicilio  (admin/empleado)
    public function notificarDomicilio(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);

        $pedido = $this->model->getContactoPedido($id);
        if (!$pedido) {
            $this->err('Pedido no encontrado.', 404);
        }

        $correo = trim((string)($pedido['Correo'] ?? ''));
        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->err('El cliente no tiene un correo valido registrado.', 400);
        }

        $faltantes = [];
        if (empty($pedido['Cod_Domicilio'])) {
            $faltantes[] = 'registrar el domicilio';
        }
        if (trim((string)($pedido['Direccion_entrega'] ?? '')) === '') {
            $faltantes[] = 'direccion de entrega';
        }
        if (trim((string)($pedido['Telefono_entrega'] ?? '')) === '') {
            $faltantes[] = 'telefono de contacto';
        }

        $lista = $faltantes ? implode(', ', $faltantes) : 'confirmar los datos de entrega';
        $nombre = trim((string)($pedido['Nombre'] ?? '') . ' ' . (string)($pedido['Apellido'] ?? ''));
        $nombre = $nombre !== '' ? $nombre : 'cliente';
        $asunto = "Completa los datos de domicilio del pedido #{$id}";

        $texto = "Hola {$nombre},\n\n"
            . "Tu pedido #{$id} ya fue revisado por nuestro equipo. Para continuar con la entrega necesitamos: {$lista}.\n\n"
            . "Ingresa a Mercado Digital, ve a Mis pedidos y completa la informacion del domicilio.\n\n"
            . "Gracias por comprar en Mercado Digital.";

        $htmlLista = '<ul style="margin:0; padding-left:20px; color:#d4ddd6;"><li>' . implode('</li><li>', array_map('htmlspecialchars', $faltantes ?: ['confirmar los datos de entrega'])) . '</li></ul>';
        
        $contactoMailHref = 'mailto:mercado.digital.bog@gmail.com';
        $socialHref = '#';

        $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa tu pedido - Mercado Digital</title>
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
      <div class="eyebrow">Acción Requerida</div>
      <h1 class="title">Hola, {$nombre}</h1>
      <p class="subtitle">Tu pedido <strong>#{$id}</strong> ya fue revisado por nuestro equipo. Sin embargo, nos hace falta información para poder llevarlo a tu puerta.</p>
      
      <div class="code-card">
        <p style="margin:0 0 10px; font-size:14px; font-weight:bold; color:#ffffff;">Para continuar con la entrega necesitamos:</p>
        {$htmlLista}
      </div>
      
      <p class="subtitle" style="margin-top:22px; font-size:14px;">Ingresa a la plataforma, ve a <strong>Mis pedidos</strong> y completa la información de domicilio para que podamos despacharlo cuanto antes.</p>
    </div>
    <div class="footer">
      <p>Recibiste este correo porque tienes un pedido pendiente en Mercado Digital.<br>Si crees que se trata de un error, <a href="{$contactoMailHref}">contáctanos</a>.</p>
      <p style="margin-top:8px;">&copy; 2026 Mercado Digital &bull; <a href="{$socialHref}">Política de privacidad</a></p>
    </div>
  </div>
</body>
</html>
HTML;

        $enviado = Mailer::send($correo, $asunto, $texto, $html);
        if (!$enviado) {
            $this->ok([
                'enviado' => false,
                'correo' => $correo,
                'mensaje_sugerido' => $texto,
            ], 'No se pudo enviar el correo automaticamente. Revisa la configuracion SMTP o copia el mensaje sugerido.', 200);
        }

        $this->ok(['enviado' => true, 'correo' => $correo], 'Notificacion enviada al cliente.');
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(array_replace(['success' => true, 'message' => $msg], $data));
        exit;
    }

    private function err(string $msg, int $code = 400): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}
