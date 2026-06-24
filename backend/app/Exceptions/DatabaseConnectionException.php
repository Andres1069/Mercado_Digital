<?php
// backend/app/Exceptions/DatabaseConnectionException.php

require_once __DIR__ . '/ApiException.php';

class DatabaseConnectionException extends ApiException {
    public function __construct(string $publicMessage = 'El sistema no puede conectarse a la base de datos en este momento.') {
        parent::__construct($publicMessage, 500, 'DB_CONNECTION_ERROR');
    }
}
