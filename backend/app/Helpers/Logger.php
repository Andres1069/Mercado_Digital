<?php
// backend/app/Helpers/Logger.php
// Logger mínimo a archivo: el cliente nunca debe ver el detalle real de una
// excepción (puede filtrar rutas, credenciales o estructura interna), pero ese
// detalle sí debe quedar registrado para poder diagnosticar el incidente.

class Logger {
    private static function logDir(): string {
        $dir = __DIR__ . '/../../storage/logs';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        return $dir;
    }

    public static function error(string $mensaje, array $contexto = []): void {
        self::escribir('ERROR', $mensaje, $contexto);
    }

    public static function warning(string $mensaje, array $contexto = []): void {
        self::escribir('WARNING', $mensaje, $contexto);
    }

    private static function escribir(string $nivel, string $mensaje, array $contexto): void {
        $linea = json_encode([
            'fecha'    => date('Y-m-d H:i:s'),
            'nivel'    => $nivel,
            'mensaje'  => $mensaje,
            'contexto' => $contexto,
            'uri'      => $_SERVER['REQUEST_URI'] ?? null,
            'metodo'   => $_SERVER['REQUEST_METHOD'] ?? null,
        ], JSON_UNESCAPED_UNICODE);

        $archivo = self::logDir() . '/app-' . date('Y-m-d') . '.log';
        error_log($linea . PHP_EOL, 3, $archivo);
    }
}
