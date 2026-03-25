<?php
// backend/config/Mailer.php
// Envío SMTP con STARTTLS. Sin dependencias externas.

require_once __DIR__ . '/MailConfig.php';

class Mailer {

    /**
     * Envía un correo de texto plano.
     * Retorna true si el servidor SMTP aceptó el mensaje, false en caso de error.
     */
    public static function send(string $to, string $subject, string $bodyText): bool {
        $host     = MAIL_HOST;
        $port     = MAIL_PORT;
        $user     = MAIL_USER;
        $pass     = MAIL_PASS;
        $from     = MAIL_FROM;
        $fromName = MAIL_FROM_NAME;

        // Si el usuario no configuró las credenciales, salir sin lanzar excepción.
        if ($user === 'tucorreo@gmail.com' || $user === '' || $pass === '' || $pass === 'tuAppPassword16chars') {
            error_log("[Mailer] Credenciales SMTP no configuradas en backend/config/MailConfig.php");
            return false;
        }

        // Abre conexión TCP.
        $fp = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 15);
        if (!$fp) {
            error_log("[Mailer] No se pudo conectar a {$host}:{$port} — {$errstr} ({$errno})");
            return false;
        }
        stream_set_timeout($fp, 15);

        // Lee una línea del servidor.
        $read = fn(): string => (string) fgets($fp, 512);

        // Envía un comando y retorna la respuesta inmediata.
        $cmd = function (string $line) use ($fp, $read): string {
            fwrite($fp, $line . "\r\n");
            return $read();
        };

        // Lee respuestas multi-línea (220-, 250-, etc.) hasta llegar a la final.
        $readAll = function () use ($read): string {
            $last = '';
            while (true) {
                $line = $read();
                $last = $line;
                // Una respuesta de una sola línea o la última de multi-línea tiene espacio en pos [3].
                if ($line === '' || strlen($line) < 4 || $line[3] === ' ') break;
            }
            return $last;
        };

        try {
            $read();                           // 220 banner
            $cmd("EHLO mercadodigital.local"); // EHLO
            $readAll();                        // consume capabilities

            // STARTTLS
            $r = $cmd("STARTTLS");
            if (!str_starts_with($r, '220')) {
                fclose($fp);
                error_log("[Mailer] STARTTLS rechazado: {$r}");
                return false;
            }

            // Negocia TLS sobre el socket existente.
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                fclose($fp);
                error_log("[Mailer] No se pudo activar TLS.");
                return false;
            }

            // Re-saludo tras TLS.
            $cmd("EHLO mercadodigital.local");
            $readAll();

            // AUTH LOGIN
            $r = $cmd("AUTH LOGIN");
            if (!str_starts_with($r, '334')) { fclose($fp); error_log("[Mailer] AUTH LOGIN fallo: {$r}"); return false; }
            $r = $cmd(base64_encode($user));
            if (!str_starts_with($r, '334')) { fclose($fp); error_log("[Mailer] Usuario rechazado: {$r}"); return false; }
            $r = $cmd(base64_encode($pass));
            if (!str_starts_with($r, '235')) { fclose($fp); error_log("[Mailer] Contrasena rechazada: {$r}"); return false; }

            // Sobre del mensaje.
            $cmd("MAIL FROM:<{$from}>");
            $cmd("RCPT TO:<{$to}>");
            $cmd("DATA");

            // Cabeceras + cuerpo.
            $msgId   = '<' . bin2hex(random_bytes(8)) . '@mercadodigital.local>';
            $headers  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$from}>\r\n";
            $headers .= "To: {$to}\r\n";
            $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
            $headers .= "Message-ID: {$msgId}\r\n";
            $headers .= "Date: " . date('r') . "\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $headers .= "Content-Transfer-Encoding: base64\r\n";

            $encodedBody = chunk_split(base64_encode($bodyText));

            fwrite($fp, $headers . "\r\n" . $encodedBody . "\r\n.\r\n");
            $r = $read(); // 250 respuesta al punto final

            $cmd("QUIT");
            fclose($fp);

            $ok = str_starts_with($r, '250');
            if (!$ok) error_log("[Mailer] Servidor no aceptó el mensaje: {$r}");
            return $ok;

        } catch (Throwable $e) {
            fclose($fp);
            error_log("[Mailer] Excepcion: " . $e->getMessage());
            return false;
        }
    }
}
