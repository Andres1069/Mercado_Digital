<?php
// backend/config/Mailer.php
// Envio SMTP con STARTTLS. Sin dependencias externas.

require_once __DIR__ . '/MailConfig.php';

class Mailer {

    /**
     * Envia un correo de texto plano u HTML.
     * Retorna true si el servidor SMTP acepto el mensaje, false en caso de error.
     */
    public static function send(string $to, string $subject, string $bodyText, ?string $bodyHtml = null): bool {
        $host     = MAIL_HOST;
        $port     = MAIL_PORT;
        $user     = MAIL_USER;
        $pass     = MAIL_PASS;
        $from     = MAIL_FROM;
        $fromName = MAIL_FROM_NAME;

        if ($user === 'tucorreo@gmail.com' || $user === '' || $pass === '' || $pass === 'tuAppPassword16chars') {
            error_log("[Mailer] Credenciales SMTP no configuradas en backend/config/MailConfig.php");
            return false;
        }

        $fp = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 15);
        if (!$fp) {
            error_log("[Mailer] No se pudo conectar a {$host}:{$port} - {$errstr} ({$errno})");
            return false;
        }
        stream_set_timeout($fp, 15);

        $read = fn(): string => (string) fgets($fp, 512);

        $cmd = function (string $line) use ($fp, $read): string {
            fwrite($fp, $line . "\r\n");
            return $read();
        };

        $readAll = function () use ($read): string {
            $last = '';
            while (true) {
                $line = $read();
                $last = $line;
                if ($line === '' || strlen($line) < 4 || $line[3] === ' ') {
                    break;
                }
            }
            return $last;
        };

        try {
            $read();
            $cmd("EHLO mercadodigital.local");
            $readAll();

            $r = $cmd("STARTTLS");
            if (!str_starts_with($r, '220')) {
                fclose($fp);
                error_log("[Mailer] STARTTLS rechazado: {$r}");
                return false;
            }

            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                fclose($fp);
                error_log("[Mailer] No se pudo activar TLS.");
                return false;
            }

            $cmd("EHLO mercadodigital.local");
            $readAll();

            $r = $cmd("AUTH LOGIN");
            if (!str_starts_with($r, '334')) { fclose($fp); error_log("[Mailer] AUTH LOGIN fallo: {$r}"); return false; }
            $r = $cmd(base64_encode($user));
            if (!str_starts_with($r, '334')) { fclose($fp); error_log("[Mailer] Usuario rechazado: {$r}"); return false; }
            $r = $cmd(base64_encode($pass));
            if (!str_starts_with($r, '235')) { fclose($fp); error_log("[Mailer] Contrasena rechazada: {$r}"); return false; }

            $cmd("MAIL FROM:<{$from}>");
            $cmd("RCPT TO:<{$to}>");
            $cmd("DATA");

            $msgId   = '<' . bin2hex(random_bytes(8)) . '@mercadodigital.local>';
            $headers  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$from}>\r\n";
            $headers .= "To: {$to}\r\n";
            $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
            $headers .= "Message-ID: {$msgId}\r\n";
            $headers .= "Date: " . date('r') . "\r\n";
            $headers .= "MIME-Version: 1.0\r\n";

            if ($bodyHtml !== null && trim($bodyHtml) !== '') {
                $boundary = 'md-alt-' . bin2hex(random_bytes(8));
                $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

                $message  = "--{$boundary}\r\n";
                $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $message .= chunk_split(base64_encode($bodyText)) . "\r\n";
                $message .= "--{$boundary}\r\n";
                $message .= "Content-Type: text/html; charset=UTF-8\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $message .= chunk_split(base64_encode($bodyHtml)) . "\r\n";
                $message .= "--{$boundary}--\r\n";
            } else {
                $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
                $headers .= "Content-Transfer-Encoding: base64\r\n";
                $message = chunk_split(base64_encode($bodyText)) . "\r\n";
            }

            fwrite($fp, $headers . "\r\n" . $message . "\r\n.\r\n");
            $r = $read();

            $cmd("QUIT");
            fclose($fp);

            $ok = str_starts_with($r, '250');
            if (!$ok) {
                error_log("[Mailer] Servidor no acepto el mensaje: {$r}");
            }
            return $ok;

        } catch (Throwable $e) {
            fclose($fp);
            error_log("[Mailer] Excepcion: " . $e->getMessage());
            return false;
        }
    }
}
