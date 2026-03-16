<?php
ini_set('display_errors', '0');
error_reporting(E_ALL);
date_default_timezone_set('America/Bogota');

header('Content-Type: application/json; charset=UTF-8');
// CORS: permite consumir la API desde el dev-server (Vite) en localhost o en la IP local del PC.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originPermitido = false;
if ($origin) {
    $originPermitido = (bool)preg_match(
        '/^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(3000|5173)$/',
        $origin
    );
}

header('Access-Control-Allow-Origin: ' . ($originPermitido ? $origin : 'http://localhost:3000'));
header('Vary: Origin');
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
require_once __DIR__ . '/../app/Models/PagoModel.php';
require_once __DIR__ . '/../app/Models/ReporteModel.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ProductoController.php';
require_once __DIR__ . '/../app/Controllers/OfertaController.php';
require_once __DIR__ . '/../app/Controllers/PedidoController.php';
require_once __DIR__ . '/../app/Controllers/UsuarioController.php';
require_once __DIR__ . '/../app/Controllers/ReporteController.php';
require_once __DIR__ . '/../app/Controllers/CarritoController.php';
require_once __DIR__ . '/../app/Controllers/PagoController.php';

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
            $metodo === 'POST' && $accion === 'cambiar-password' => $ctrl->cambiarPassword(),
            $metodo === 'POST' && $accion === 'reset-request' => $ctrl->resetRequest(),
            $metodo === 'POST' && $accion === 'reset-confirm' => $ctrl->resetConfirm(),
            $metodo === 'GET'  && $accion === 'me'       => $ctrl->me(),
            $metodo === 'PUT'  && $accion === 'perfil'   => $ctrl->actualizarPerfil(),
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
            $metodo === 'POST' && $accion === ''           => $ctrl->crear(),
            default => ruta404()
        };
        break;

    case 'carrito':
        $ctrl = new CarritoController();
        match(true) {
            $metodo === 'GET'    && $accion === ''         => $ctrl->obtener(),
            $metodo === 'POST'   && $accion === 'agregar'  => $ctrl->agregar(),
            $metodo === 'DELETE' && $accion === 'vaciar'   => $ctrl->vaciar(),
            $metodo === 'DELETE' && $accion === 'item' && isset($partes[2]) && is_numeric($partes[2])
                                                          => $ctrl->quitar((int)$partes[2]),
            default => ruta404()
        };
        break;

    case 'reportes':
        $ctrl = new ReporteController();
        match(true) {
            $metodo === 'GET' && $accion === ''                     => $ctrl->registros(),
            $metodo === 'GET' && $accion === 'ventas'               => $ctrl->ventas(),
            $metodo === 'GET' && $accion === 'productos-mas-vendidos' => $ctrl->productosMasVendidos(),
            $metodo === 'GET' && $accion === 'pedidos-estado'       => $ctrl->pedidosPorEstado(),
            $metodo === 'GET' && $accion === 'ingresos'             => $ctrl->ingresos(),
            default => ruta404()
        };
        break;

    case 'pagos':
        $ctrl = new PagoController();
        match(true) {
            $metodo === 'GET' && $accion === ''                     => $ctrl->listar(),
            $metodo === 'PUT' && is_numeric($accion) && isset($partes[2]) && $partes[2] === 'estado'
                                                                     => $ctrl->cambiarEstado((int)$accion),
            default => ruta404()
        };
        break;

    case 'usuarios':
        $ctrl = new UsuarioController();
        match(true) {
            $metodo === 'GET'    && $accion === ''                      => $ctrl->listar(),
            $metodo === 'GET'    && $accion === 'roles'                 => $ctrl->roles(),
            $metodo === 'GET'    && $accion === 'stats'                 => $ctrl->stats(),
            $metodo === 'POST'   && $accion === ''                      => $ctrl->crear(),
            $metodo === 'PUT'    && isset($partes[2]) && $partes[2] === 'estado' && is_numeric($accion)
                                                                     => $ctrl->cambiarEstado((int)$accion),
            $metodo === 'PUT'    && isset($partes[2]) && $partes[2] === 'rol' && is_numeric($accion)
                                                                     => $ctrl->cambiarRol((int)$accion),
            $metodo === 'PUT'    && is_numeric($accion)                 => $ctrl->actualizar((int)$accion),
            $metodo === 'DELETE' && is_numeric($accion)                 => $ctrl->eliminar((int)$accion),
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
