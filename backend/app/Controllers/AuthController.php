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
            $this->error('Correo y contrasena son requeridos.', 400);
        }

        $usuario = $this->model->findByCorreo($body['correo']);

        if ($usuario && !empty($usuario['estado']) && $usuario['estado'] !== 'Activo') {
            $this->error('Tu cuenta esta inactiva. Contacta a un administrador.', 403);
        }

        if (!$usuario) {
            $this->error('Correo o contrasena incorrectos.', 401);
            $this->error('Correo o contrasena incorrectos.', 401);
        }

        if (!password_verify($body['contrasena'], $usuario['ContrasenaHash'])) {
            $this->error('Correo o contrasena incorrectos.', 401);
            $this->error('Correo o contrasena incorrectos.', 401);
        }

        unset($usuario['ContrasenaHash']);

        $sid = bin2hex(random_bytes(24));
        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId((int)$usuario['Num_Documento'], $sid);
        }
        $usuario['sesion_id'] = $sid;

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol' => $usuario['rol'],
            'sid' => $sid,
            'rol' => $usuario['rol'],
            'sid' => $sid,
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
            $this->error('El correo no tiene un formato valido.', 400);
            $this->error('El correo no tiene un formato valido.', 400);
        }

        $errorPassword = $this->validarContrasena((string)$body['contrasena']);
        if ($errorPassword !== null) {
            $this->error($errorPassword, 400);
        }

        if ($this->model->correoExiste($body['correo'])) {
            $this->error('Este correo ya esta registrado.', 409);
            $this->error('Este correo ya esta registrado.', 409);
        }

        if ($this->model->documentoExiste((int)$body['num_documento'])) {
            $this->error('Este numero de documento ya esta registrado.', 409);
            $this->error('Este numero de documento ya esta registrado.', 409);
        }

        $barrio = trim((string)$body['barrio']);
        $direccion = trim((string)$body['direccion']);

        if ($direccion === '') {
            $this->error('La direccion es requerida.', 400);
        }

        $normalizado = $this->normalizarTexto($barrio);
        if ($normalizado !== $this->normalizarTexto(self::BARRIO_UNICO) && $normalizado !== 'chicala') {
            $this->error('Barrio no permitido. Solo se acepta: ' . self::BARRIO_UNICO . '.', 400);
            $this->error('Barrio no permitido. Solo se acepta: ' . self::BARRIO_UNICO . '.', 400);
        }

        $body['barrio'] = self::BARRIO_UNICO;
        $body['direccion'] = $direccion;

        $numDoc = $this->model->registrar($body);
        $usuario = $this->model->findByDocumento($numDoc);
        unset($usuario['ContrasenaHash']);

        $sid = bin2hex(random_bytes(24));
        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId((int)$usuario['Num_Documento'], $sid);
        }
        $usuario['sesion_id'] = $sid;

        $token = JWT::generate([
            'num_documento' => $usuario['Num_Documento'],
            'rol' => $usuario['rol'],
            'sid' => $sid,
            'rol' => $usuario['rol'],
            'sid' => $sid,
        ]);

        $this->ok(['token' => $token, 'usuario' => $usuario], 'Registro exitoso.', 201);
    }

    // GET /auth/me
    public function me(): void {
        $payload = AuthMiddleware::verify();
        $usuario = $this->model->findByDocumento((int)$payload['num_documento']);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }
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
        $payload = AuthMiddleware::verify();
        $doc = (int)$payload['num_documento'];
        $body = $this->body();

        if (empty($body['actual_contrasena']) || empty($body['nueva_contrasena'])) {
            $this->error('Contrasena actual y nueva contrasena son requeridas.', 400);
        }

        $errorPassword = $this->validarContrasena((string)$body['nueva_contrasena']);
        if ($errorPassword !== null) {
            $this->error($errorPassword, 400);
        $errorPassword = $this->validarContrasena((string)$body['nueva_contrasena']);
        if ($errorPassword !== null) {
            $this->error($errorPassword, 400);
        }

        $usuario = $this->model->findByDocumento($doc);
        if (!$usuario) {
            $this->error('Usuario no encontrado.', 404);
        }

        $usuarioCred = $this->model->findByCorreo($usuario['Correo']);
        if (!$usuarioCred || !password_verify($body['actual_contrasena'], $usuarioCred['ContrasenaHash'])) {
            $this->error('Contrasena actual incorrecta.', 401);
        }

        $this->model->cambiarPassword($doc, $body['nueva_contrasena']);
        if ($this->model->soportaSesionId()) {
            $this->model->actualizarSesionId($doc, bin2hex(random_bytes(24)));
        }
        $this->ok([], 'Contrasena actualizada correctamente.');
    }

    // POST /auth/reset-request
    public function resetRequest(): void {
        $body = $this->body();
        $correo = trim((string)($body['correo'] ?? ''));

        $dir = __DIR__ . '/../../storage';
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        @file_put_contents($dir . '/reset_tokens.log', date('c') . " RESET_REQUEST correo=$correo" . PHP_EOL, FILE_APPEND);

        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->ok([], 'Se ha envio el codigo de recuperacion.');
            $this->ok([], 'Se ha envio el codigo de recuperacion.');
        }

        $usuario = $this->model->findByCorreo($correo);
        if (!$usuario || (!empty($usuario['estado']) && $usuario['estado'] !== 'Activo')) {
            $this->ok([], 'Se ha envio el codigo de recuperacion.');
            $this->ok([], 'Se ha envio el codigo de recuperacion.');
        }

        $ph = hash('sha256', (string)$usuario['ContrasenaHash']);
        $codigo = $this->generarCodigoReset();
        $tokenHash = hash('sha256', $codigo);
        $exp = time() + self::RESET_TTL_SECONDS;

        $store = $this->leerResetStore();
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

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $enviado = $this->enviarCorreoReset($usuario['Correo'], $codigo, $origin);
        if (!$enviado) {
            $this->error('No fue posible enviar el codigo al correo configurado. Verifica SMTP e intenta de nuevo.', 500);
        }

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $enviado = $this->enviarCorreoReset($usuario['Correo'], $codigo, $origin);
        if (!$enviado) {
            $this->error('No fue posible enviar el codigo al correo configurado. Verifica SMTP e intenta de nuevo.', 500);
        }

        $this->limpiarResetStore($store);
        $this->guardarResetStore($store);

        $this->ok([], 'Se ha envio el codigo de recuperacion.');
        $this->ok([], 'Se ha envio el codigo de recuperacion.');
    }

    // POST /auth/reset-confirm
    public function resetConfirm(): void {
        $body = $this->body();
        $token = trim((string)($body['token'] ?? ''));
        $nueva = (string)($body['nueva_contrasena'] ?? '');

        if ($token === '' || $nueva === '') {
            $this->error('Token y nueva contrasena son requeridos.', 400);
        }

        $errorPassword = $this->validarContrasena($nueva);
        if ($errorPassword !== null) {
            $this->error($errorPassword, 400);
        $errorPassword = $this->validarContrasena($nueva);
        if ($errorPassword !== null) {
            $this->error($errorPassword, 400);
        }

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

    private function validarContrasena(string $contrasena): ?string {
        if (strlen($contrasena) < 8) {
            return 'La contrasena debe tener minimo 8 caracteres.';
        }
        if (!preg_match('/[A-Z]/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 letra mayuscula.';
        }
        if (!preg_match('/[a-z]/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 letra minuscula.';
        }
        if (!preg_match('/\d/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 numero.';
        }
        return null;
    }

    private function validarContrasena(string $contrasena): ?string {
        if (strlen($contrasena) < 8) {
            return 'La contrasena debe tener minimo 8 caracteres.';
        }
        if (!preg_match('/[A-Z]/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 letra mayuscula.';
        }
        if (!preg_match('/[a-z]/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 letra minuscula.';
        }
        if (!preg_match('/\d/', $contrasena)) {
            return 'La contrasena debe incluir al menos 1 numero.';
        }
        return null;
    }

    private function normalizarTexto(string $texto): string {
        $t = strtolower(trim($texto));
        $t = strtr($t, [
            'Ã¡' => 'a', 'Ã©' => 'e', 'Ã­' => 'i', 'Ã³' => 'o', 'Ãº' => 'u',
            'Ã ' => 'a', 'Ã¨' => 'e', 'Ã¬' => 'i', 'Ã²' => 'o', 'Ã¹' => 'u',
            'Ã¤' => 'a', 'Ã«' => 'e', 'Ã¯' => 'i', 'Ã¶' => 'o', 'Ã¼' => 'u',
            'Ã±' => 'n',
            'Ã¡' => 'a', 'Ã©' => 'e', 'Ã­' => 'i', 'Ã³' => 'o', 'Ãº' => 'u',
            'Ã ' => 'a', 'Ã¨' => 'e', 'Ã¬' => 'i', 'Ã²' => 'o', 'Ã¹' => 'u',
            'Ã¤' => 'a', 'Ã«' => 'e', 'Ã¯' => 'i', 'Ã¶' => 'o', 'Ã¼' => 'u',
            'Ã±' => 'n',
        ]);
        $t = preg_replace('/\s+/', ' ', $t) ?? $t;
        return $t;
    }

    private function enviarCorreoReset(string $correo, string $codigo, string $origin): bool {
    private function enviarCorreoReset(string $correo, string $codigo, string $origin): bool {
        $subject = 'Codigo para restablecer tu contrasena - Mercado Digital';
        $link = $origin ? rtrim($origin, '/') . '/login?token=' . urlencode($codigo) : '';
        $link = $origin ? rtrim($origin, '/') . '/login?token=' . urlencode($codigo) : '';

        $body  = "Hola,\n\n";
        $body .= "Recibimos una solicitud para restablecer la contrasena de tu cuenta en Mercado Digital.\n\n";
        $body .= "Tu codigo de verificacion es:\n\n";
        $body .= $codigo . "\n\n";
        $body .= $codigo . "\n\n";
        $body .= "Este codigo es valido por 15 minutos.\n\n";
        if ($link !== '') {
        if ($link !== '') {
            $body .= "Tambien puedes abrir este enlace directamente:\n$link\n\n";
        }
        $body .= "Si no solicitaste este cambio, ignora este correo. Tu contrasena no sera modificada.\n\n";
        $body .= "- Equipo Mercado Digital\n";
        $body .= "- Equipo Mercado Digital\n";

        $correoHtml = htmlspecialchars($correo, ENT_QUOTES, 'UTF-8');
        $codigoHtml = htmlspecialchars($codigo, ENT_QUOTES, 'UTF-8');
        $linkHtml = htmlspecialchars($link !== '' ? $link : '#', ENT_QUOTES, 'UTF-8');
        $contactoMail = 'mercado.digital.bog@gmail.com';
        $contactoMailHref = 'mailto:' . $contactoMail;
        $contactoTelefono = '+57 300 000 0000';
        $contactoTelefonoHref = 'tel:+573000000000';
        $socialHref = htmlspecialchars($origin !== '' ? rtrim($origin, '/') : '#', ENT_QUOTES, 'UTF-8');

        $bodyHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Mercado Digital</title>
  <style>
    body { margin:0; padding:32px 12px; background:#eceee9; font-family:Arial, sans-serif; color:#24352c; }
    .wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 36px rgba(0,0,0,0.08); }
    .header { background:#1a2e22; padding:24px 28px; text-align:center; }
    .brand-top { font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#a6b7aa; }
    .brand-bottom { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; color:#ffffff; line-height:1.1; }
    .hero { padding:40px 28px 34px; background:linear-gradient(140deg, #1a2e22 0%, #24402f 100%); }
    .eyebrow { font-size:11px; font-weight:700; letter-spacing:0.20em; text-transform:uppercase; color:#8fba67; margin-bottom:14px; }
    .title { margin:0 0 12px; font-family:Georgia, "Times New Roman", serif; font-size:25px; line-height:1.15; color:#ffffff; white-space:nowrap; }
    .title em { color:#ffffff; font-style:normal; }
    .subtitle { margin:0 0 22px; font-size:15px; line-height:1.7; color:#d4ddd6; }
    .code-label { font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#8fba67; margin-bottom:10px; }
    .code-card { background:rgba(255,255,255,0.08); border:1px solid rgba(143,186,103,0.42); border-radius:10px; padding:18px 20px; }
    .code-value { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; line-height:1.1; letter-spacing:0.08em; color:#ffffff; word-break:break-all; }
    .code-help { margin-top:10px; padding-top:10px; border-top:1px solid rgba(168,204,136,0.20); font-size:12px; line-height:1.6; color:#b9c7bd; }
    .note { margin-top:14px; font-size:12px; color:#b2c0b6; }
    .info { padding:28px 24px; background:#f8faf7; }
    .contact-only { max-width:420px; margin:0 auto; }
    .section-title { margin:0 0 6px; font-family:Georgia, "Times New Roman", serif; font-size:17px; color:#1a2e22; }
    .section-copy { margin:0 0 12px; font-size:12px; line-height:1.65; color:#6f8175; }
    .contact-table { width:100%; border-collapse:separate; border-spacing:0 10px; }
    .contact-card { background:#ffffff; border:1px solid #dfe8e0; border-radius:10px; }
    .contact-cell { padding:10px 12px; font-size:12px; font-weight:600; color:#2f5a39; }
    .contact-icon-wrap { width:42px; }
    .contact-icon-dot { display:inline-block; width:30px; height:30px; border-radius:50%; line-height:30px; text-align:center; background:#eef5e8; color:#6b9b4f; border:1px solid #d7e5cc; font-size:11px; font-weight:700; font-family:Arial, sans-serif; }
    .footer { padding:24px 28px 28px; text-align:center; background:#f2f5f2; border-top:1px solid #e0e8e2; }
    .footer p { margin:0; font-size:12px; line-height:1.8; color:#8b9b90; }
    .footer a { color:#7daa5a; text-decoration:none; }
    @media screen and (max-width:620px) {
      body { padding:20px 8px; }
      .header, .hero, .info, .footer { padding-left:20px !important; padding-right:20px !important; }
      .title { font-size:15px !important; white-space:normal !important; }
      .code-value { font-size:22px !important; letter-spacing:0.05em !important; }
      .info { padding:30px 28px !important; }
      .section-title { font-size:19px !important; margin-bottom:8px !important; }
      .section-copy { font-size:13px !important; margin-bottom:14px !important; }
      .contact-cell { padding:12px 14px !important; font-size:13px !important; }
      .contact-icon-wrap { width:48px !important; }
      .contact-icon-dot { width:34px !important; height:34px !important; line-height:34px !important; font-size:13px !important; }
    }
  </style>
</head>
<body>
  <div style="text-align:center; font-size:11px; color:#9ea9a1; letter-spacing:0.06em; margin-bottom:14px;">
    No solicitaste este cambio? Ignora este correo o contactanos.
  </div>
  <div class="wrapper">
    <div class="header">
      <div class="brand-top">Mercado</div>
      <div class="brand-bottom">Digital</div>
    </div>
    <div class="hero">
      <div class="eyebrow">Seguridad de cuenta</div>
      <h1 class="title">Restablecer <em>contrasena</em></h1>
      <p class="subtitle">Usa este codigo para confirmar tu identidad y crear una nueva contrasena para la cuenta {$correoHtml}.</p>
      <div class="code-label">Tu codigo secreto</div>
      <div class="code-card">
        <div class="code-value">{$codigoHtml}</div>
        <div class="code-help">Copia este codigo tal cual aparece aqui para evitar espacios o separaciones.</div>
      </div>
      <div class="note">Ingresa este codigo en la pantalla de recuperacion. Expira en 15 minutos.</div>
    </div>
    <div class="info">
      <div class="contact-only">
        <h3 class="section-title">Contactanos.</h3>
        <p class="section-copy">Tienes dudas? Nuestro equipo esta listo para ayudarte en cualquier momento.</p>
        <table class="contact-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">&#9742;</span></td>
                  <td class="contact-cell"><a href="{$contactoTelefonoHref}" style="color:#2f5a39; text-decoration:none;">{$contactoTelefono}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">@</span></td>
                  <td class="contact-cell"><a href="{$contactoMailHref}" style="color:#2f5a39; text-decoration:none;">{$contactoMail}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">&#9679;</span></td>
                  <td class="contact-cell">Bogota, Colombia</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div class="footer">
      <p>Recibiste este correo porque alguien solicito un cambio de contrasena para tu cuenta.<br>Si no lo solicitaste, <a href="{$contactoMailHref}">ignora este mensaje</a> o <a href="{$contactoMailHref}">contactanos</a>.</p>
      <p style="margin-top:8px;">&copy; 2026 Mercado Digital &bull; <a href="{$socialHref}">Politica de privacidad</a> &bull; <a href="{$contactoMailHref}">Cancelar suscripcion</a></p>
    </div>
  </div>
</body>
</html>
HTML;

        $correoHtml = htmlspecialchars($correo, ENT_QUOTES, 'UTF-8');
        $codigoHtml = htmlspecialchars($codigo, ENT_QUOTES, 'UTF-8');
        $linkHtml = htmlspecialchars($link !== '' ? $link : '#', ENT_QUOTES, 'UTF-8');
        $contactoMail = 'mercado.digital.bog@gmail.com';
        $contactoMailHref = 'mailto:' . $contactoMail;
        $contactoTelefono = '+57 300 000 0000';
        $contactoTelefonoHref = 'tel:+573000000000';
        $socialHref = htmlspecialchars($origin !== '' ? rtrim($origin, '/') : '#', ENT_QUOTES, 'UTF-8');

        $bodyHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Mercado Digital</title>
  <style>
    body { margin:0; padding:32px 12px; background:#eceee9; font-family:Arial, sans-serif; color:#24352c; }
    .wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 36px rgba(0,0,0,0.08); }
    .header { background:#1a2e22; padding:24px 28px; text-align:center; }
    .brand-top { font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#a6b7aa; }
    .brand-bottom { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; color:#ffffff; line-height:1.1; }
    .hero { padding:40px 28px 34px; background:linear-gradient(140deg, #1a2e22 0%, #24402f 100%); }
    .eyebrow { font-size:11px; font-weight:700; letter-spacing:0.20em; text-transform:uppercase; color:#8fba67; margin-bottom:14px; }
    .title { margin:0 0 12px; font-family:Georgia, "Times New Roman", serif; font-size:25px; line-height:1.15; color:#ffffff; white-space:nowrap; }
    .title em { color:#ffffff; font-style:normal; }
    .subtitle { margin:0 0 22px; font-size:15px; line-height:1.7; color:#d4ddd6; }
    .code-label { font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#8fba67; margin-bottom:10px; }
    .code-card { background:rgba(255,255,255,0.08); border:1px solid rgba(143,186,103,0.42); border-radius:10px; padding:18px 20px; }
    .code-value { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; line-height:1.1; letter-spacing:0.08em; color:#ffffff; word-break:break-all; }
    .code-help { margin-top:10px; padding-top:10px; border-top:1px solid rgba(168,204,136,0.20); font-size:12px; line-height:1.6; color:#b9c7bd; }
    .note { margin-top:14px; font-size:12px; color:#b2c0b6; }
    .info { padding:28px 24px; background:#f8faf7; }
    .contact-only { max-width:420px; margin:0 auto; }
    .section-title { margin:0 0 6px; font-family:Georgia, "Times New Roman", serif; font-size:17px; color:#1a2e22; }
    .section-copy { margin:0 0 12px; font-size:12px; line-height:1.65; color:#6f8175; }
    .contact-table { width:100%; border-collapse:separate; border-spacing:0 10px; }
    .contact-card { background:#ffffff; border:1px solid #dfe8e0; border-radius:10px; }
    .contact-cell { padding:10px 12px; font-size:12px; font-weight:600; color:#2f5a39; }
    .contact-icon-wrap { width:42px; }
    .contact-icon-dot { display:inline-block; width:30px; height:30px; border-radius:50%; line-height:30px; text-align:center; background:#eef5e8; color:#6b9b4f; border:1px solid #d7e5cc; font-size:11px; font-weight:700; font-family:Arial, sans-serif; }
    .footer { padding:24px 28px 28px; text-align:center; background:#f2f5f2; border-top:1px solid #e0e8e2; }
    .footer p { margin:0; font-size:12px; line-height:1.8; color:#8b9b90; }
    .footer a { color:#7daa5a; text-decoration:none; }
    @media screen and (max-width:620px) {
      body { padding:20px 8px; }
      .header, .hero, .info, .footer { padding-left:20px !important; padding-right:20px !important; }
      .title { font-size:15px !important; white-space:normal !important; }
      .code-value { font-size:22px !important; letter-spacing:0.05em !important; }
      .info { padding:30px 28px !important; }
      .section-title { font-size:19px !important; margin-bottom:8px !important; }
      .section-copy { font-size:13px !important; margin-bottom:14px !important; }
      .contact-cell { padding:12px 14px !important; font-size:13px !important; }
      .contact-icon-wrap { width:48px !important; }
      .contact-icon-dot { width:34px !important; height:34px !important; line-height:34px !important; font-size:13px !important; }
    }
  </style>
</head>
<body>
  <div style="text-align:center; font-size:11px; color:#9ea9a1; letter-spacing:0.06em; margin-bottom:14px;">
    No solicitaste este cambio? Ignora este correo o contactanos.
  </div>
  <div class="wrapper">
    <div class="header">
      <div class="brand-top">Mercado</div>
      <div class="brand-bottom">Digital</div>
    </div>
    <div class="hero">
      <div class="eyebrow">Seguridad de cuenta</div>
      <h1 class="title">Restablecer <em>contrasena</em></h1>
      <p class="subtitle">Usa este codigo para confirmar tu identidad y crear una nueva contrasena para la cuenta {$correoHtml}.</p>
      <div class="code-label">Tu codigo secreto</div>
      <div class="code-card">
        <div class="code-value">{$codigoHtml}</div>
        <div class="code-help">Copia este codigo tal cual aparece aqui para evitar espacios o separaciones.</div>
      </div>
      <div class="note">Ingresa este codigo en la pantalla de recuperacion. Expira en 15 minutos.</div>
    </div>
    <div class="info">
      <div class="contact-only">
        <h3 class="section-title">Contactanos.</h3>
        <p class="section-copy">Tienes dudas? Nuestro equipo esta listo para ayudarte en cualquier momento.</p>
        <table class="contact-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">&#9742;</span></td>
                  <td class="contact-cell"><a href="{$contactoTelefonoHref}" style="color:#2f5a39; text-decoration:none;">{$contactoTelefono}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">@</span></td>
                  <td class="contact-cell"><a href="{$contactoMailHref}" style="color:#2f5a39; text-decoration:none;">{$contactoMail}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="contact-card">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="contact-cell contact-icon-wrap"><span class="contact-icon-dot">&#9679;</span></td>
                  <td class="contact-cell">Bogota, Colombia</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div class="footer">
      <p>Recibiste este correo porque alguien solicito un cambio de contrasena para tu cuenta.<br>Si no lo solicitaste, <a href="{$contactoMailHref}">ignora este mensaje</a> o <a href="{$contactoMailHref}">contactanos</a>.</p>
      <p style="margin-top:8px;">&copy; 2026 Mercado Digital &bull; <a href="{$socialHref}">Politica de privacidad</a> &bull; <a href="{$contactoMailHref}">Cancelar suscripcion</a></p>
    </div>
  </div>
</body>
</html>
HTML;

        $dir = __DIR__ . '/../../storage';
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        $line = date('c') . " RESET_CODE correo=$correo codigo=$codigo" . ($link !== '' ? " link=$link" : '') . PHP_EOL;
        $line = date('c') . " RESET_CODE correo=$correo codigo=$codigo" . ($link !== '' ? " link=$link" : '') . PHP_EOL;
        @file_put_contents($dir . '/reset_tokens.log', $line, FILE_APPEND);

        $enviado = Mailer::send($correo, $subject, $body, $bodyHtml);
        $enviado = Mailer::send($correo, $subject, $body, $bodyHtml);
        if (!$enviado) {
            $enviado = @mail($correo, $subject, $body);
        }

        if (!$enviado) {
            error_log("[Auth] Correo no enviado - verifica MailConfig.php. RESET_CODE correo=$correo codigo=$codigo");
            error_log("[Auth] Correo no enviado - verifica MailConfig.php. RESET_CODE correo=$correo codigo=$codigo");
        }
        return $enviado;
        return $enviado;
    }

    private function generarCodigoReset(): string {
        $alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
        $out = '';
        for ($i = 0; $i < 8; $i++) {
            $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        return $out;
    }

    private function leerResetStore(): array {
        $file = self::RESET_STORE_FILE;
        if (!file_exists($file)) {
            return [];
        }
        if (!file_exists($file)) {
            return [];
        }
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
