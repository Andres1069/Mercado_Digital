<?php
// backend/app/Controllers/AuthController.php

require_once __DIR__ . '/../Models/UsuarioModel.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/Mailer.php';

class AuthController {
    private UsuarioModel $model;
    private const BARRIO_UNICO = 'Chicala del Sur';
    private const RESET_TTL_SECONDS = 900; // 15 minutos
    private const RESET_STORE_FILE = __DIR__ . '/../../storage/reset_codes.json';

    public function __construct() {
        $this->model = new UsuarioModel();
    }

    // POST /auth/login
    public function login(): void {
        $body = $this->body();

        if (empty($body['correo']) || empty($body['contrasena'])) {
            $this->error('Correo y contraseña son requeridos.', 400);
        }

        $usuario = $this->model->findByCorreo($body['correo']);

        if ($usuario && !empty($usuario['estado']) && $usuario['estado'] !== 'Activo') {
            $this->error('Tu cuenta esta inactiva. Contacta a un administrador.', 403);
        }

        if (!$usuario) {
            $this->error('Correo o contraseña incorrectos.', 401);
        }

        if (!password_verify($body['contrasena'], $usuario['ContrasenaHash'])) {
            $this->error('Correo o contraseña incorrectos.', 401);
        }

        unset($usuario['ContrasenaHash']);

        // sid: identifica la sesion activa. Al iniciar sesion de nuevo, el sid cambia y se invalida el token anterior.
        $sid = bin2hex(random_bytes(24));
        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId((int)$usuario['Num_Documento'], $sid);
        }
        $usuario['sesion_id'] = $sid;

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol'           => $usuario['rol'],
            'sid'           => $sid,
        ]);

        $this->ok(['token' => $token, 'usuario' => $usuario], 'Login exitoso.');
    }

    // POST /auth/registro
    public function registro(): void {
        $body = $this->body();

        $requeridos = ['num_documento', 'nombre', 'apellido', 'correo', 'contrasena', 'barrio', 'direccion'];
        foreach ($requeridos as $campo) {
            if (empty($body[$campo])) {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato válido.', 400);
        }

        if (strlen($body['contrasena']) > 6) {
            $this->error('La contraseña debe tener al menos 6 caracteres.', 400);
        }

        if ($this->model->correoExiste($body['correo'])) {
            $this->error('Este correo ya está registrado.', 409);
        }

        if ($this->model->documentoExiste((int)$body['num_documento'])) {
            $this->error('Este número de documento ya está registrado.', 409);
        }

        // Validacion de barrio: por ahora solo se admite "Chicala del Sur" (Sur de Bogota).
        $barrio = trim((string)$body['barrio']);
        $direccion = trim((string)$body['direccion']);

        if ($direccion === '') {
            $this->error('La direccion es requerida.', 400);
        }

        $normalizado = $this->normalizarTexto($barrio);
        if ($normalizado !== $this->normalizarTexto(self::BARRIO_UNICO) && $normalizado !== 'chicala') {
            $this->error("Barrio no permitido. Solo se acepta: " . self::BARRIO_UNICO . ".", 400);
        }

        // Fuerza el valor canonico para evitar variaciones en la BD.
        $body['barrio'] = self::BARRIO_UNICO;
        $body['direccion'] = $direccion;

        $numDoc = $this->model->registrar($body);
        $usuario = $this->model->findByDocumento($numDoc);
        unset($usuario['ContrasenaHash']);

        // sid: identifica la sesion activa. Al iniciar sesion de nuevo, el sid cambia y se invalida el token anterior.
        $sid = bin2hex(random_bytes(24));
        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId((int)$usuario['Num_Documento'], $sid);
        }
        $usuario['sesion_id'] = $sid;

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol'           => $usuario['rol'],
            'sid'           => $sid,
        ]);

        $this->ok(['token' => $token, 'usuario' => $usuario], 'Registro exitoso.', 201);
    }

    // GET /auth/me
    public function me(): void {
        $payload = AuthMiddleware::verify();
        $usuario = $this->model->findByDocumento((int)$payload['num_documento']);
        if (!$usuario) $this->error('Usuario no encontrado.', 404);
        unset($usuario['ContrasenaHash']);
        $this->ok(['usuario' => $usuario]);
    }

    // PUT /auth/perfil
    public function actualizarPerfil(): void {
        $payload = AuthMiddleware::verify();
        $doc = (int)$payload['num_documento'];
        $body = $this->body();

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        $requeridos = ['nombre', 'apellido', 'correo'];
        foreach ($requeridos as $campo) {
            if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
                $this->error("El campo '$campo' es requerido.", 400);
            }
        }

        if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
            $this->error('El correo no tiene un formato valido.', 400);
        }

        if ($this->model->correoExisteEnOtroUsuario($body['correo'], $doc)) {
            $this->error('Ya existe otro usuario con ese correo.', 409);
        }

        $this->model->actualizarPerfil($doc, [
            'nombre' => trim((string)$body['nombre']),
            'apellido' => trim((string)$body['apellido']),
            'correo' => trim((string)$body['correo']),
            'telefono' => trim((string)($body['telefono'] ?? '')),
            'barrio' => trim((string)($body['barrio'] ?? '')),
            'direccion' => trim((string)($body['direccion'] ?? '')),
        ]);

        $usuarioActualizado = $this->model->findByDocumento($doc);
        $this->ok(['usuario' => $usuarioActualizado], 'Perfil actualizado correctamente.');
    }

    // POST /auth/cambiar-password
    public function cambiarPassword(): void {
        // Cambio de contrasena "con sesion": evita que alguien la cambie solo con correo+documento.
        // Para recuperar cuenta sin sesion se usa /auth/reset-request + /auth/reset-confirm.
        $payload = AuthMiddleware::verify();
        $doc = (int)$payload['num_documento'];
        $body = $this->body();

        if (empty($body['actual_contrasena']) || empty($body['nueva_contrasena'])) {
            $this->error('Contrasena actual y nueva contrasena son requeridas.', 400);
        }

        if (strlen($body['nueva_contrasena']) < 6) {
            $this->error('La contrasena debe tener al menos 6 caracteres.', 400);
        }

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        // Verifica la contrasena actual.
        $usuarioCred = $this->model->findByCorreo($usuario['Correo']);
        if (!$usuarioCred || !password_verify($body['actual_contrasena'], $usuarioCred['ContrasenaHash'])) {
            $this->error('Contrasena actual incorrecta.', 401);
        }

        $this->model->cambiarPassword($doc, $body['nueva_contrasena']);
        if ($this->model->soportaSesionId()) {
            // Invalida sesiones anteriores tras cambio de contrasena.
            $this->model->actualizarSesionId($doc, bin2hex(random_bytes(24)));
        }
        $this->ok([], 'Contrasena actualizada correctamente.');
    }

    // POST /auth/reset-request
    // Siempre responde OK para evitar enumeracion de usuarios.
    public function resetRequest(): void {
        $body = $this->body();
        $correo = trim((string)($body['correo'] ?? ''));

        // Log de desarrollo para confirmar que el request llego al backend.
        $dir = __DIR__ . '/../../storage';
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        @file_put_contents($dir . '/reset_tokens.log', date('c') . " RESET_REQUEST correo=$correo" . PHP_EOL, FILE_APPEND);

        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->ok([], 'Se ha envio el codigo de recuperación.');
        }

        $usuario = $this->model->findByCorreo($correo);
        if (!$usuario || (!empty($usuario['estado']) && $usuario['estado'] !== 'Activo')) {
            $this->ok([], 'Se ha envio el codigo de recuperación.');
        }

        $ph = hash('sha256', (string)$usuario['ContrasenaHash']);
        $codigo = $this->generarCodigoReset();
        $tokenHash = hash('sha256', $codigo);
        $exp = time() + self::RESET_TTL_SECONDS;

        $store = $this->leerResetStore();
        // Evita colision improbable del codigo.
        while (isset($store[$tokenHash])) {
            $codigo = $this->generarCodigoReset();
            $tokenHash = hash('sha256', $codigo);
        }

        $store[$tokenHash] = [
            'doc' => (int)$usuario['Num_Documento'],
            'correo' => (string)$usuario['Correo'],
            'ph' => $ph,
            'exp' => $exp,
            'used' => false,
            'created' => time(),
        ];

        $this->limpiarResetStore($store);
        $this->guardarResetStore($store);

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $this->enviarCorreoReset($usuario['Correo'], $codigo, $origin);

        $this->ok([], 'Se ha envio el codigo de recuperación.');
    }

    // POST /auth/reset-confirm
    public function resetConfirm(): void {
        $body = $this->body();
        $token = trim((string)($body['token'] ?? ''));
        $nueva = (string)($body['nueva_contrasena'] ?? '');

        if ($token === '' || $nueva === '') {
            $this->error('Token y nueva contrasena son requeridos.', 400);
        }

        if (strlen($nueva) < 6) {
            $this->error('La contrasena debe tener al menos 6 caracteres.', 400);
        }

        // Compatibilidad: si llega un JWT (tiene puntos), se valida como antes.
        if (str_contains($token, '.')) {
            $payload = JWT::verify($token);
            if (!$payload || ($payload['purpose'] ?? '') !== 'pwd_reset') {
                $this->error('Token invalido o expirado.', 401);
            }

            $doc = (int)($payload['num_documento'] ?? 0);
            $correo = (string)($payload['correo'] ?? '');
            $ph = (string)($payload['ph'] ?? '');
            if ($doc <= 0 || $correo === '' || $ph === '') {
                $this->error('Token invalido o expirado.', 401);
            }

            $usuarioCred = $this->model->findByCorreo($correo);
            if (!$usuarioCred || (int)$usuarioCred['Num_Documento'] !== $doc) {
                $this->error('Token invalido o expirado.', 401);
            }

            $phActual = hash('sha256', (string)$usuarioCred['ContrasenaHash']);
            if (!hash_equals($phActual, $ph)) {
                $this->error('Token invalido o expirado.', 401);
            }

            $this->model->cambiarPassword($doc, $nueva);
        } else {
            // Codigo corto (sin BD): se valida contra `backend/storage/reset_codes.json`.
            $tokenHash = hash('sha256', strtoupper($token));
            $store = $this->leerResetStore();
            $this->limpiarResetStore($store);

            $entry = $store[$tokenHash] ?? null;
            if (!$entry || !empty($entry['used']) || (int)($entry['exp'] ?? 0) < time()) {
                $this->guardarResetStore($store);
                $this->error('Token invalido o expirado.', 401);
            }

            $doc = (int)($entry['doc'] ?? 0);
            $correo = (string)($entry['correo'] ?? '');
            $ph = (string)($entry['ph'] ?? '');
            if ($doc <= 0 || $correo === '' || $ph === '') {
                unset($store[$tokenHash]);
                $this->guardarResetStore($store);
                $this->error('Token invalido o expirado.', 401);
            }

            $usuarioCred = $this->model->findByCorreo($correo);
            if (!$usuarioCred || (int)$usuarioCred['Num_Documento'] !== $doc) {
                unset($store[$tokenHash]);
                $this->guardarResetStore($store);
                $this->error('Token invalido o expirado.', 401);
            }

            // Si ya cambio la contrasena despues de emitir el codigo, se invalida.
            $phActual = hash('sha256', (string)$usuarioCred['ContrasenaHash']);
            if (!hash_equals($phActual, $ph)) {
                $store[$tokenHash]['used'] = true;
                $this->guardarResetStore($store);
                $this->error('Token invalido o expirado.', 401);
            }

            $this->model->cambiarPassword($doc, $nueva);
            $store[$tokenHash]['used'] = true;
            $store[$tokenHash]['used_at'] = time();
            $this->guardarResetStore($store);
        }

        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId($doc, bin2hex(random_bytes(24)));
        }

        $this->ok([], 'Contrasena actualizada correctamente.');
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function normalizarTexto(string $texto): string {
        $t = strtolower(trim($texto));
        $t = strtr($t, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
            'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
            'ñ' => 'n',
        ]);
        $t = preg_replace('/\s+/', ' ', $t) ?? $t;
        return $t;
    }

    private function enviarCorreoReset(string $correo, string $codigo, string $origin): void {
        $subject = 'Codigo para restablecer tu contrasena - Mercado Digital';
        $link = '';
        if ($origin) {
            $link = rtrim($origin, '/') . '/login?token=' . urlencode($codigo);
        }

        $body  = "Hola,\n\n";
        $body .= "Recibimos una solicitud para restablecer la contrasena de tu cuenta en Mercado Digital.\n\n";
        $body .= "Tu codigo de verificacion es:\n\n";
        $body .= "    $codigo\n\n";
        $body .= "Este codigo es valido por 15 minutos.\n\n";
        if ($link) {
            $body .= "Tambien puedes abrir este enlace directamente:\n$link\n\n";
        }
        $body .= "Si no solicitaste este cambio, ignora este correo. Tu contrasena no sera modificada.\n\n";
        $body .= "— Equipo Mercado Digital\n";

        // Copia local de respaldo (util en desarrollo).
        $dir = __DIR__ . '/../../storage';
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        $line = date('c') . " RESET_CODE correo=$correo codigo=$codigo" . ($link ? " link=$link" : "") . PHP_EOL;
        @file_put_contents($dir . '/reset_tokens.log', $line, FILE_APPEND);

        // Intenta enviar por SMTP (configurado en backend/config/MailConfig.php).
        $enviado = Mailer::send($correo, $subject, $body);

        // Si el SMTP falla, intenta con mail() nativo (funciona en servidores con sendmail configurado).
        if (!$enviado) {
            $enviado = @mail($correo, $subject, $body);
        }

        if (!$enviado) {
            error_log("[Auth] Correo no enviado — verifica MailConfig.php. RESET_CODE correo=$correo codigo=$codigo");
        }
    }

    private function generarCodigoReset(): string {
        // Crockford Base32 sin caracteres ambiguos: 0-9 A-Z sin I L O U.
        $alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
        $out = '';
        for ($i = 0; $i < 8; $i++) {
            $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        return $out;
    }

    private function leerResetStore(): array {
        $file = self::RESET_STORE_FILE;
        if (!file_exists($file)) return [];
        $raw = @file_get_contents($file);
        $data = $raw ? json_decode($raw, true) : null;
        return is_array($data) ? $data : [];
    }

    private function guardarResetStore(array $data): void {
        $dir = dirname(self::RESET_STORE_FILE);
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        @file_put_contents(self::RESET_STORE_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
    }

    private function limpiarResetStore(array &$data): void {
        $now = time();
        foreach ($data as $k => $v) {
            $exp = (int)($v['exp'] ?? 0);
            $used = (bool)($v['used'] ?? false);
            // Elimina expirados; y usados con más de 1 día para que el archivo no crezca.
            if ($exp > 0 && $exp < $now) {
                unset($data[$k]);
                continue;
            }
            if ($used && (int)($v['used_at'] ?? 0) > 0 && ((int)$v['used_at'] + 86400) < $now) {
                unset($data[$k]);
            }
        }
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
