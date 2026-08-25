<?php

require_once __DIR__ . '/../Models/PedidoModel.php';
require_once __DIR__ . '/../Models/UsuarioModel.php';

class ChatbotController {
    
    private PedidoModel $pedidoModel;
    private UsuarioModel $usuarioModel;

    public function __construct() {
        $this->pedidoModel = new PedidoModel();
        $this->usuarioModel = new UsuarioModel();
    }

    public function consultarPedido(): void {
        $data = json_decode(file_get_contents("php://input"), true);
        $identificador = isset($data['id']) ? (int)$data['id'] : 0;
        $email = isset($data['email']) ? trim($data['email']) : '';

        if (!$identificador || !$email) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faltan datos.']);
            return;
        }

        // Intento 1: Buscar como ID de Pedido
        $pedido = $this->pedidoModel->getById($identificador);
        
        if ($pedido) {
            $numDoc = (int)$pedido['Num_Documento'];
            $usuario = $this->usuarioModel->findByDocumento($numDoc);
            
            if ($usuario && strtolower(trim($usuario['Correo'])) === strtolower($email)) {
                echo json_encode([
                    'success' => true,
                    'tipo'    => 'unico',
                    'nombre'  => $usuario['Nombre_Completo'] ?? $usuario['Nombre'] ?? 'Cliente',
                    'estado'  => $pedido['Estado_Pedido'],
                    'total'   => $pedido['Total_Pedido'],
                    'fecha'   => $pedido['Fecha_Pedido']
                ]);
                return;
            }
        }

        // Intento 2: Buscar como Documento (Cédula)
        $usuario = $this->usuarioModel->findByDocumento($identificador);
        if ($usuario && strtolower(trim($usuario['Correo'])) === strtolower($email)) {
            $pedidos = $this->pedidoModel->getMisPedidos($identificador);
            
            echo json_encode([
                'success' => true,
                'tipo'    => 'multiple',
                'nombre'  => $usuario['Nombre_Completo'] ?? $usuario['Nombre'] ?? 'Cliente',
                'pedidos' => $pedidos // array de pedidos
            ]);
            return;
        }

        // Si fallan ambos intentos
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Los datos proporcionados no coinciden con nuestros registros. Asegúrate de ingresar tu número de pedido o cédula correcta junto con tu correo.'
        ]);
    }

    public function ofertas(): void {
        require_once __DIR__ . '/../Models/OfertaModel.php';
        $ofertaModel = new OfertaModel();
        $ofertas = $ofertaModel->getActivas();

        echo json_encode([
            'success' => true,
            'ofertas' => $ofertas
        ]);
    }
}
