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

        $bodyClienteHtml = "
<div style='font-family: Arial, sans-serif;'>

<h2>¡Hola {$nombre}!</h2>

<p>
Gracias por contactarte con <strong>Mercado Digital</strong>.
</p>

<p>
Hemos recibido correctamente tu solicitud y pronto te responderemos.
</p>

<hr>

<p>
Este fue el mensaje que nos enviaste:
</p>

<blockquote style='background:#f5f5f5;padding:10px;border-left:4px solid #25D366;'>
{$mensaje}
</blockquote>

<p>
Gracias por confiar en nosotros 💚
</p>

</div>
";

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