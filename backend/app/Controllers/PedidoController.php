<?php
// backend/app/Controllers/PedidoController.php

require_once __DIR__ . '/../Models/PedidoModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/Mailer.php';

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
        $pedidos = $this->model->getAll();
        $this->ok(['pedidos' => $pedidos]);
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

        $codPedido = $this->model->crear($doc, $items, $metodoPago, $montoTotal);
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

        $codPedido = $this->model->crear($vendedor, $items, $metodoPago, $montoTotal, [
            'canal_venta' => 'Tienda',
            'tipo_entrega' => 'Recoger_Tienda',
            'estado_pedido' => 'Entregado',
            'estado_pago' => 'Completado',
            'vendedor' => $vendedor,
            'observaciones' => $observaciones !== '' ? $observaciones : 'Venta presencial en tienda',
        ]);

        $this->ok(['cod_pedido' => $codPedido], 'Venta presencial registrada.', 201);
    }

    // PUT /pedidos/{id}/entrega  body: {tipo_entrega: "Domicilio"|"Recoger_Tienda"}
    public function actualizarTipoEntrega(int $id): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)($payload['num_documento'] ?? 0);
        if ($doc <= 0) $this->err('No se pudo identificar el usuario.', 401);

        $body = $this->body();
        $tipo = trim((string)($body['tipo_entrega'] ?? ''));
        if (!in_array($tipo, ['Domicilio', 'Recoger_Tienda'], true)) {
            $this->err('Tipo de entrega invalido.');
        }

        $ok = $this->model->actualizarTipoEntrega($id, $doc, $tipo);
        if (!$ok) $this->err('Pedido no encontrado o sin permiso para actualizarlo.', 404);

        $this->ok(['tipo_entrega' => $tipo], 'Tipo de entrega actualizado.');
    }

    // PUT /pedidos/{id}/estado  (admin/empleado)
    public function cambiarEstado(int $id): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $body = $this->body();
        $estado = trim((string)($body['estado'] ?? ''));
        if ($estado === '') $this->err('El campo estado es requerido.');

        $ok = $this->model->cambiarEstado($id, $estado);
        if (!$ok) $this->err('Pedido no encontrado.', 404);
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

        $htmlLista = '<ul><li>' . implode('</li><li>', array_map('htmlspecialchars', $faltantes ?: ['confirmar los datos de entrega'])) . '</li></ul>';
        $html = "<p>Hola <strong>" . htmlspecialchars($nombre) . "</strong>,</p>"
            . "<p>Tu pedido <strong>#{$id}</strong> ya fue revisado por nuestro equipo.</p>"
            . "<p>Para continuar con la entrega necesitamos:</p>{$htmlLista}"
            . "<p>Ingresa a Mercado Digital, ve a <strong>Mis pedidos</strong> y completa la informacion del domicilio.</p>"
            . "<p>Gracias por comprar en Mercado Digital.</p>";

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
