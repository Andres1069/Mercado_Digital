<?php
// ─────────────────────────────────────────────────────────────────────────────
// Configuración de MercadoPago
// Obtén tus credenciales en: https://www.mercadopago.com.co/developers/panel
// ─────────────────────────────────────────────────────────────────────────────

// Access Token de tu aplicación (empieza con TEST-... en sandbox o APP_USR-... en producción)
define('MP_ACCESS_TOKEN', 'APP_USR-1726239872103255-040513-919e4106279ab5f41a7fee7a000a6505-3314217814');

// URL del frontend (para redirigir al usuario después del pago)
// En producción cambia esto por tu dominio real, ej: 'https://tudominio.com'
// Para desarrollo local se usa automáticamente window.location.origin enviado desde el frontend
define('MP_FRONTEND_URL', 'http://localhost:5173');

// URL del backend (para recibir webhooks de MercadoPago)
// Debe ser una URL pública accesible desde internet.
// En desarrollo local usa un túnel como ngrok: 'https://xxxx.ngrok.io/mercado_digital/backend/public'
// En producción: 'https://tudominio.com/backend/public'
define('MP_WEBHOOK_URL', 'http://localhost/mercado_digital/backend/public');
