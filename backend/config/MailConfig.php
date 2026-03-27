<?php
// ─────────────────────────────────────────────────────────────────
//  Configuración SMTP para Mercado Digital
//  Edita este archivo con tus credenciales antes de usar el sistema
//  de recuperación de contraseña.
//
//  Para Gmail:
//    1. Activa "Verificación en dos pasos" en tu cuenta Google.
//    2. Ve a: Cuenta Google → Seguridad → Contraseñas de aplicaciones.
//    3. Genera una contraseña para "Otra aplicación" → copia los 16 caracteres.
//    4. Pega esa contraseña en MAIL_PASS (sin espacios).
// ─────────────────────────────────────────────────────────────────

define('MAIL_HOST',      'smtp.gmail.com');
define('MAIL_PORT',      587);
define('MAIL_USER',      'tucorreo@gmail.com');    // ← cambia esto
define('MAIL_PASS',      'tuAppPassword16chars');  // ← contraseña de aplicación Google
define('MAIL_FROM',      'tucorreo@gmail.com');    // ← igual a MAIL_USER
define('MAIL_FROM_NAME', 'Mercado Digital');
