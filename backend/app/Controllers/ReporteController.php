<?php

require_once __DIR__ . '/../Models/ReporteModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class ReporteController {
    private ReporteModel $model;

    public function __construct() {
        $this->model = new ReporteModel();
    }

    public function registros(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok([
            'reportes' => $this->model->getRegistrosReporte(),
            'resumen' => $this->model->getResumenReportes(),
        ]);
    }

    public function ventas(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok(['ventas' => $this->model->getVentasResumen()]);
    }

    public function productosMasVendidos(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok(['productos' => $this->model->getProductosMasVendidos()]);
    }

    public function pedidosPorEstado(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $this->ok(['estados' => $this->model->getPedidosPorEstado()]);
    }

    public function ingresos(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $periodo = $_GET['periodo'] ?? 'mes';
        if (!in_array($periodo, ['dia', 'mes'], true)) {
            $periodo = 'mes';
        }
        $this->ok([
            'periodo' => $periodo,
            'ingresos' => $this->model->getIngresosPorPeriodo($periodo),
        ]);
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(array_replace(['success' => true, 'message' => $msg], $data));
        exit;
    }
}
