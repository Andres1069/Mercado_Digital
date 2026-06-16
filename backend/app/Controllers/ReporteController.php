<?php

require_once __DIR__ . '/../Models/ReporteModel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class ReporteController {
    private ReporteModel $model;

    public function __construct() {
        $this->model = new ReporteModel();
    }

    public function registros(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        [$desde, $hasta] = $this->rangoFechas();
        $this->ok([
            'reportes' => $this->model->getRegistrosReporte($desde, $hasta),
            'resumen' => $this->model->getResumenReportes($desde, $hasta),
        ]);
    }

    public function ventas(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        [$desde, $hasta] = $this->rangoFechas();
        $this->ok([
            'ventas' => $this->model->getVentasResumen($desde, $hasta),
            'canales' => $this->model->getVentasPorCanal($desde, $hasta),
            'rango' => ['desde' => $desde, 'hasta' => $hasta],
        ]);
    }

    public function productosMasVendidos(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        [$desde, $hasta] = $this->rangoFechas();
        $this->ok(['productos' => $this->model->getProductosMasVendidos(5, $desde, $hasta)]);
    }

    public function pedidosPorEstado(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        [$desde, $hasta] = $this->rangoFechas();
        $this->ok(['estados' => $this->model->getPedidosPorEstado($desde, $hasta)]);
    }

    public function ingresos(): void {
        AuthMiddleware::requireRole(['Administrador', 'Empleado']);
        $periodo = $_GET['periodo'] ?? 'mes';
        if (!in_array($periodo, ['dia', 'mes'], true)) {
            $periodo = 'mes';
        }
        [$desde, $hasta] = $this->rangoFechas();
        $this->ok([
            'periodo' => $periodo,
            'rango' => ['desde' => $desde, 'hasta' => $hasta],
            'ingresos' => $this->model->getIngresosPorPeriodo($periodo, $desde, $hasta),
        ]);
    }

    private function rangoFechas(): array {
        $desde = $this->fechaQuery('desde');
        $hasta = $this->fechaQuery('hasta');

        if ($desde && $hasta && $desde > $hasta) {
            [$desde, $hasta] = [$hasta, $desde];
        }

        return [$desde, $hasta];
    }

    private function fechaQuery(string $key): ?string {
        $value = trim((string)($_GET[$key] ?? ''));
        if ($value === '') return null;
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : null;
    }

    private function ok(array $data, string $msg = 'OK', int $code = 200): never {
        http_response_code($code);
        echo json_encode(array_replace(['success' => true, 'message' => $msg], $data));
        exit;
    }
}
