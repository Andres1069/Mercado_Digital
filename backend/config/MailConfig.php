<?php
// Configuracion SMTP para Mercado Digital.
// Puedes editar este archivo o definir variables de entorno:
// MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM, MAIL_FROM_NAME
//
// Para Gmail:
// 1. Activa la verificacion en dos pasos.
// 2. Genera una contrasena de aplicacion.
// 3. Usa esa contrasena en MAIL_PASS.

if (!function_exists('md_mail_env')) {
    function md_mail_env(string $key, string $default): string {
        $value = getenv($key);
        if ($value === false || $value === '') {
            return $default;
        }
        return $value;
    }
}

define('MAIL_HOST', md_mail_env('MAIL_HOST', 'smtp.gmail.com'));
define('MAIL_PORT', (int) md_mail_env('MAIL_PORT', '587'));
define('MAIL_USER', md_mail_env('MAIL_USER', 'mercado.digital.bog@gmail.com'));
define('MAIL_PASS', md_mail_env('MAIL_PASS', 'lmfv gssx iytc iyli'));
define('MAIL_FROM', md_mail_env('MAIL_FROM', MAIL_USER));
define('MAIL_FROM_NAME', md_mail_env('MAIL_FROM_NAME', 'Mercado Digital'));
