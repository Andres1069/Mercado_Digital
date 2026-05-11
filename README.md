# Mercado Digital

**Plataforma de e-commerce integral con autenticación JWT, procesamiento de pagos con Mercado Pago y sistema de gestión de pedidos y domicilios.**

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [API REST](#api-rest)
- [Desarrollo](#desarrollo)
- [Licencia](#licencia)

---

## ✨ Características

### Funcionalidades Principales

- **🔐 Autenticación Segura**: JWT con validación de sesión única por dispositivo
- **💳 Pasarela de Pagos**: Integración completa con Mercado Pago
- **🛍️ Catálogo de Productos**: Gestión de productos, categorías y promociones
- **📦 Sistema de Pedidos**: Creación, seguimiento y gestión de pedidos
- **🚚 Módulo de Domicilios**: Gestión de entregas y seguimiento de envíos
- **👥 Gestión de Usuarios**: Roles diferenciados (Cliente, Empleado, Proveedor, Administrador)
- **📊 Reportes y Análitica**: Dashboard con estadísticas de ventas e inventario
- **🎨 Interfaz Responsiva**: Frontend moderno con Tailwind CSS y React

---

## 🔧 Requisitos

### Backend
- **PHP** 8.0+
- **MySQL** 5.7+
- **Composer** (opcional, para gestión de dependencias)
- **cURL** habilitado

### Frontend
- **Node.js** 16.0+
- **npm** o **pnpm**

### Servicios Externos
- Cuenta en **Mercado Pago** (sandbox y producción)
- Servidor SMTP configurado (para recuperación de contraseña)

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd mercado_digital
```

### 2. Configurar Backend

```bash
# Copiar archivo de configuración
cp backend/config/Database.php.example backend/config/Database.php

# Editar credenciales de base de datos
nano backend/config/Database.php
```

**Importar esquema de base de datos:**

```bash
mysql -u usuario -p nombre_bd < backend/config/mercado_digital.sql
```

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env (opcional)
cp .env.example .env
```

**Variables de entorno (opcional):**
```env
VITE_API_BASE_URL=http://localhost/mercado_digital/backend/public
```

### 4. Iniciar Desarrollo

```bash
# Terminal 1: Frontend (Vite dev server)
cd frontend
npm run dev

# Terminal 2: Backend (requiere XAMPP o servidor PHP)
# Acceder a: http://localhost/mercado_digital
```

---

## 📁 Estructura del Proyecto

```
mercado_digital/
├── backend/
│   ├── app/
│   │   ├── Controllers/        # Controladores de la API
│   │   ├── Models/             # Modelos de datos
│   │   └── Middleware/         # Middleware (autenticación, etc.)
│   ├── config/
│   │   ├── Database.php        # Configuración de BD
│   │   ├── JWT.php             # Configuración JWT
│   │   ├── Mailer.php          # SMTP
│   │   └── mercadopago.php     # Credenciales de Mercado Pago
│   ├── public/
│   │   ├── index.php           # Punto de entrada (router)
│   │   └── uploads/            # Archivos subidos
│   └── storage/
│       └── reset_codes.json    # Códigos de recuperación
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas (rutas)
│   │   ├── context/            # Context API (estado global)
│   │   ├── services/           # Servicios (API calls)
│   │   └── App.jsx             # Componente raíz
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

Crear archivo `backend/config/.env` con:

```php
// Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=mercado_digital

// JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

// Mercado Pago
MP_ACCESS_TOKEN=tu_token_aqui
MP_WEBHOOK_URL=https://tudominio.com/mercado_digital/backend/public/pago/webhook

// SMTP (recuperación de contraseña)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_contraseña_app
```

---

## 🔐 Autenticación y Seguridad

### Sesión Única por Dispositivo

**Problema resuelto:** Un usuario solo puede tener una sesión activa a la vez.

**Implementación:**
- Cada login genera un `SesionId` único guardado en la BD
- El JWT incluye este ID
- El middleware valida que coincida en cada request
- Si otro dispositivo inicia sesión, invalida la sesión anterior

**Configuración requerida:**

```sql
ALTER TABLE usuario ADD COLUMN Estado varchar(20) NOT NULL DEFAULT 'Activo';
ALTER TABLE usuario ADD COLUMN SesionId varchar(64) DEFAULT NULL;
```

### Características de Seguridad

- ✅ Contraseñas hasheadas con `password_hash()` (bcrypt)
- ✅ JWT con expiración configurable
- ✅ CORS restringido a orígenes autorizados
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de entrada en todos los formularios
- ✅ SQL prepared statements (prevención de inyecciones)
- ✅ Cookies HTTP-only para tokens sensibles

---

## 🌐 API REST

### Endpoints Principales

#### Autenticación
```
POST   /auth/login              - Iniciar sesión
POST   /auth/registro           - Registrarse
POST   /auth/logout             - Cerrar sesión
GET    /auth/me                 - Obtener usuario actual
PUT    /auth/perfil             - Actualizar perfil
POST   /auth/cambiar-password   - Cambiar contraseña
POST   /auth/reset-request      - Solicitar recuperación
POST   /auth/reset-confirm      - Confirmar recuperación
```

#### Productos
```
GET    /productos               - Listar productos
GET    /productos/{id}          - Obtener producto
POST   /productos               - Crear (admin)
PUT    /productos/{id}          - Actualizar (admin)
DELETE /productos/{id}          - Eliminar (admin)
```

#### Pedidos
```
GET    /pedidos/mis-pedidos     - Mis pedidos
GET    /pedidos/{id}            - Detalle del pedido
POST   /pedidos                 - Crear pedido
PUT    /pedidos/{id}/estado     - Cambiar estado
```

#### Pagos
```
GET    /pago/{pedido}           - Obtener pago
POST   /pago/{pedido}/preferencia - Crear preferencia Mercado Pago
GET    /pago/{pedido}/verificar-mp - Verificar pago
```

**Documentación completa de endpoints disponible en `backend/docs/API.md`** (próximamente)

---

## 👨‍💻 Desarrollo

### Stack Tecnológico

**Backend:**
- PHP 8+ con arquitectura MVC
- MySQL para persistencia
- JWT para autenticación
- cURL para integraciones externas

**Frontend:**
- React 18+
- Vite como bundler
- Tailwind CSS para estilos
- React Router para navegación
- Context API para estado global

### Ejecutar en Modo Desarrollo

```bash
# Backend (requiere XAMPP corriendo)
# El router automático está en: public/index.php

# Frontend
cd frontend
npm run dev
```

### Build para Producción

```bash
# Frontend
cd frontend
npm run build

# Backend está listo para producción en:
# /backend/public/index.php
```

---

## 🚀 Deployment

### Producción (Shared Hosting)

1. Subir archivos a `public_html/mercado_digital`
2. Ejecutar migraciones de BD
3. Configurar variables de entorno
4. Compilar frontend: `npm run build`
5. Copiar dist a `public_html/`

### Docker (Opcional)

```bash
docker-compose up -d
```

---

## 📝 Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

---

## 📞 Soporte

Para reportar bugs o sugerencias, contactar al equipo de desarrollo.

**Email:** desarrollo@mercadodigital.com

---

**Última actualización:** Mayo 2026
