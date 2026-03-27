<?php
// backend/config/JWT.php
// Manejo simple de JSON Web Tokens (sin librerías externas)

class JWT {
    // 🔐 Cambia esta clave por una larga y aleatoria en producción
    private static string $secretKey = 'mercado_digital_clave_super_secreta_2025';
    private static int $expireHours  = 8; // El token dura 8 horas

    /**
     * Genera un token JWT
     */
    public static function generate(array $payload, ?int $expireSeconds = null): string {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

        $payload['iat'] = time();
        $ttl = $expireSeconds ?? (self::$expireHours * 3600);
        $payload['exp'] = time() + $ttl;

        $payload64  = base64_encode(json_encode($payload));
        $signature  = hash_hmac('sha256', "$header.$payload64", self::$secretKey);

        return "$header.$payload64.$signature";
    }

    /**
     * Verifica y decodifica un token JWT
     * Retorna el payload o false si es inválido/expirado
     */
    public static function verify(string $token): array|false {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload64, $signature] = $parts;

        // Verificar firma
        $expectedSig = hash_hmac('sha256', "$header.$payload64", self::$secretKey);
        if (!hash_equals($expectedSig, $signature)) return false;

        $payload = json_decode(base64_decode($payload64), true);
        if (!$payload) return false;

        // Verificar expiración
        if (isset($payload['exp']) && $payload['exp'] < time()) return false;

        return $payload;
    }

    /**
     * Extrae el token del header Authorization: Bearer <token>
     */
    public static function fromHeader(): ?string {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }
}
