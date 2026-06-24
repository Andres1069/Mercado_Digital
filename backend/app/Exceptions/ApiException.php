<?php
// backend/app/Exceptions/ApiException.php
// Excepción base para errores que deben llegar al cliente con un status HTTP y
// un código estable (para que el frontend pueda mapearla a la pantalla de error
// correcta) sin filtrar detalles internos. set_exception_handler en index.php
// la reconoce y usa estos datos; cualquier otra excepción se trata como 500 genérico.

class ApiException extends RuntimeException {
    public function __construct(
        string $publicMessage,
        private int $statusCode = 500,
        private string $errorCode = 'SERVER_ERROR'
    ) {
        parent::__construct($publicMessage);
    }

    public function getStatusCode(): int {
        return $this->statusCode;
    }

    public function getErrorCode(): string {
        return $this->errorCode;
    }
}
