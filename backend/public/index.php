<?php
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

set_exception_handler(function (Throwable $e): void {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor.',
        'detail'  => $e->getMessage()
    ]);
    exit;
});

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/JWT.php';
require_once __DIR__ . '/../app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Models/UsuarioModel.php';
require_once __DIR__ . '/../app/Models/ProductoModel.php';
require_once __DIR__ . '/../app/Models/OfertaModel.php';
require_once __DIR__ . '/../app/Models/PedidoModel.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ProductoController.php';
require_once __DIR__ . '/../app/Controllers/OfertaController.php';
require_once __DIR__ . '/../app/Controllers/PedidoController.php';

$ruta   = $_GET['ruta'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'];
$partes = array_values(array_filter(explode('/', trim($ruta, '/'))));
$modulo = $partes[0] ?? '';
$accion = $partes[1] ?? '';

switch ($modulo) {
    case 'auth':
        $ctrl = new AuthController();
        match(true) {
            $metodo === 'POST' && $accion === 'login'    => $ctrl->login(),
            $metodo === 'POST' && $accion === 'registro' => $ctrl->registro(),
            $metodo === 'GET'  && $accion === 'me'       => $ctrl->me(),
            default => ruta404()
        };
        break;

    case 'productos':
        $ctrl = new ProductoController();
        match(true) {
            $metodo === 'GET'    && $accion === 'mas-vendidos' => $ctrl->masVendidos(),
            $metodo === 'GET'    && $accion === ''             => $ctrl->listar(),
            $metodo === 'GET'    && is_numeric($accion)        => $ctrl->obtener((int)$accion),
            $metodo === 'POST'   && $accion === ''             => $ctrl->crear(),
            $metodo === 'PUT'    && is_numeric($accion)        => $ctrl->actualizar((int)$accion),
            $metodo === 'DELETE' && is_numeric($accion)        => $ctrl->eliminar((int)$accion),
            default => ruta404()
        };
        break;

    case 'categorias':
        (new ProductoController())->categorias();
        break;

    case 'proveedores':
        (new ProductoController())->proveedores();
        break;

    case 'ofertas':
        $ctrl = new OfertaController();
        match(true) {
            $metodo === 'GET'    && $accion === ''             => $ctrl->listar(),
            $metodo === 'GET'    && $accion === 'todas'        => $ctrl->todas(),
            $metodo === 'POST'   && $accion === ''             => $ctrl->crear(),
            $metodo === 'PUT'    && is_numeric($accion)        => $ctrl->actualizar((int)$accion),
            $metodo === 'DELETE' && is_numeric($accion)        => $ctrl->eliminar((int)$accion),
            default => ruta404()
        };
        break;

    case 'pedidos':
        $ctrl = new PedidoController();
        match(true) {
            $metodo === 'GET' && $accion === 'mis-pedidos' => $ctrl->misPedidos(),
            default => ruta404()
        };
        break;

    case '':
        echo json_encode(['success' => true, 'mensaje' => 'API Mercado Digital v2.0', 'version' => '2.0.0']);
        break;

    default:
        ruta404();
}

function ruta404(): never {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ruta no encontrada.']);
    exit;
}
