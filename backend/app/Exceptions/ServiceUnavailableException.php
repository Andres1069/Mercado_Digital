<?php
// backend/app/Exceptions/ServiceUnavailableException.php
// Para fallos de servicios externos (pasarela de pago, correo, etc).

require_once __DIR__ . '/ApiException.php';

class ServiceUnavailableException extends ApiException {
    public function __construct(string $publicMessage = 'Uno de nuestros servicios externos está temporalmente indisponible. Intenta más tarde.') {
        parent::__construct($publicMessage, 503, 'SERVICE_UNAVAILABLE');
    }
}
