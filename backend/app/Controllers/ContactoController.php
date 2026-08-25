<?php

require_once __DIR__ . '/../../config/Mailer.php';

class ContactoController {

    public function enviar(): void {

        $data = json_decode(file_get_contents("php://input"), true);

        $nombre   = trim($data['nombre'] ?? '');
        $email    = trim($data['email'] ?? '');
        $telefono = trim($data['telefono'] ?? '');
        $mensaje  = trim($data['mensaje'] ?? '');

        // Validaciones
        if (!$nombre || !$email) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Nombre y correo son obligatorios.'
            ]);

            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Correo inválido.'
            ]);

            return;
        }

        // =========================
        // CORREO PARA USTEDES
        // =========================

        $subjectAdmin = "Nueva solicitud de contacto";

        $bodyAdmin = "
Nueva solicitud desde Mercado Digital

Nombre: {$nombre}
Correo: {$email}
Telefono: {$telefono}

Mensaje:
{$mensaje}
";

        $bodyAdminHtml = "
<h2>Nueva solicitud de contacto</h2>

<p><strong>Nombre:</strong> {$nombre}</p>
<p><strong>Correo:</strong> {$email}</p>
<p><strong>Teléfono:</strong> {$telefono}</p>

<p><strong>Mensaje:</strong></p>
<p>{$mensaje}</p>
";

        $correoAdmin = "mercadodigitalbog@gmail.com";

        $adminEnviado = Mailer::send(
            $correoAdmin,
            $subjectAdmin,
            $bodyAdmin,
            $bodyAdminHtml
        );

        // =========================
        // CORREO AUTOMÁTICO AL CLIENTE
        // =========================

        $subjectCliente = "Hemos recibido tu solicitud - Mercado Digital";

        $bodyCliente = "
Hola {$nombre},

Gracias por contactarnos.

Recibimos correctamente tu solicitud y pronto nos comunicaremos contigo.

Mercado Digital
";

        $contactoMailHref = 'mailto:mercado.digital.bog@gmail.com';
        $socialHref = '#';

        $bodyClienteHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud Recibida - Mercado Digital</title>
  <style>
    body { margin:0; padding:32px 12px; background:#eceee9; font-family:Arial, sans-serif; color:#24352c; }
    .wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 36px rgba(0,0,0,0.08); }
    .header { background:#1a2e22; padding:24px 28px; text-align:center; }
    .brand-top { font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#a6b7aa; }
    .brand-bottom { font-family:Georgia, "Times New Roman", serif; font-size:30px; font-weight:700; color:#ffffff; line-height:1.1; }
    .hero { padding:40px 28px 34px; background:linear-gradient(140deg, #1a2e22 0%, #24402f 100%); }
    .eyebrow { font-size:11px; font-weight:700; letter-spacing:0.20em; text-transform:uppercase; color:#8fba67; margin-bottom:14px; }
    .title { margin:0 0 12px; font-family:Georgia, "Times New Roman", serif; font-size:25px; line-height:1.15; color:#ffffff; }
    .subtitle { margin:0 0 22px; font-size:15px; line-height:1.7; color:#d4ddd6; }
    .code-card { background:rgba(255,255,255,0.08); border:1px solid rgba(143,186,103,0.42); border-radius:10px; padding:18px 20px; font-style: italic; color: #ffffff; }
    .footer { padding:24px 28px 28px; text-align:center; background:#f2f5f2; border-top:1px solid #e0e8e2; }
    .footer p { margin:0; font-size:12px; line-height:1.8; color:#8b9b90; }
    .footer a { color:#7daa5a; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-top">Mercado</div>
      <div class="brand-bottom">Digital</div>
    </div>
    <div class="hero">
      <div class="eyebrow">¡SOLICITUD RECIBIDA!</div>
      <h1 class="title">Hola, {$nombre}</h1>
      <p class="subtitle">Gracias por ponerte en contacto con <strong>Mercado Digital</strong>. Hemos recibido tu mensaje correctamente y nuestro equipo te responderá lo más pronto posible.</p>
      
      <p style="margin:0 0 10px; font-size:14px; font-weight:bold; color:#8fba67;">Mensaje enviado:</p>
      <div class="code-card">
        "{$mensaje}"
      </div>
      
      <p class="subtitle" style="margin-top:22px; font-size:14px;">Gracias por confiar en nosotros.</p>
    </div>
    <div class="footer">
      <p>Este es un correo automático confirmando la recepción de tu mensaje.<br>Si tienes dudas adicionales, <a href="{$contactoMailHref}">contáctanos aquí</a>.</p>
      <p style="margin-top:8px;">&copy; 2026 Mercado Digital &bull; <a href="{$socialHref}">Política de privacidad</a></p>
    </div>
  </div>
</body>
</html>
HTML;

        $clienteEnviado = Mailer::send(
            $email,
            $subjectCliente,
            $bodyCliente,
            $bodyClienteHtml
        );

        // =========================
        // RESPUESTA FINAL
        // =========================

        if ($adminEnviado && $clienteEnviado) {

            echo json_encode([
                'success' => true,
                'message' => 'Solicitud enviada correctamente.'
            ]);

        } else {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudieron enviar los correos.'
            ]);
        }
    }
}