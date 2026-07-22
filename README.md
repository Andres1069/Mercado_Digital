# Mercado Digital

**Plataforma de e-commerce integral con autenticación JWT, procesamiento de pagos locales (Nequi/Daviplata) y sistema de gestión de pedidos y domicilios.**

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
- **💳 Pagos Locales**: Integración de pagos mediante transferencias y códigos QR (Nequi y Daviplata) con validación administrativa.
- **🛍️ Catálogo de Productos**: Gestión de productos, categorías y promociones
- **📦 Sistema de Pedidos**: Creación, seguimiento y gestión de pedidos
- **🚚 Módulo de Domicilios Avanzado**: Gestión de entregas, seguimiento de envíos y subida de evidencias fotográficas
- **👥 Gestión de Usuarios**: Roles diferenciados (Cliente, Empleado, Proveedor, Administrador)
- **📊 Reportes y Analítica**: Dashboard mejorado con estadísticas de ventas e inventario
- **💬 Soporte y Asistencia**: Integración de Chatbot interactivo
- **📧 Notificaciones**: Alertas y confirmaciones de pedidos por correo electrónico
- **🎨 Interfaz Responsiva**: Frontend moderno y optimizado con Tailwind CSS y React, incluyendo mejoras en Login y navegación

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
- Cuentas de **Nequi** y/o **Daviplata** para recepción de pagos
- Servidor SMTP configurado (para recuperación de contraseña)

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd mercado_digital
```

### 2. Configurar Backend

1. **Editar credenciales de base de datos:**
   Abre y edita las propiedades en el archivo `backend/config/Database.php` con tus credenciales locales.

2. **Importar esquema de base de datos y migraciones:**

```bash
mysql -u usuario -p nombre_bd < backend/config/mercado_digital.sql
mysql -u usuario -p nombre_bd < backend/config/migracion_oferta.sql
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

### Configuración del Backend (Archivos nativos)

El backend no utiliza un archivo `.env` por defecto, por lo que las configuraciones se hacen directamente en los archivos de la carpeta `backend/config/`:

- **Base de Datos:** Edita las propiedades `$host`, `$db_name`, `$username` y `$password` en el archivo `Database.php`.
- **JWT:** Modifica la variable estática `$secretKey` en `JWT.php`.
- **Servidor SMTP (Correos):** Configura las credenciales por defecto (`MAIL_USER`, `MAIL_PASS`) en `MailConfig.php`.
- **Pagos Locales (Nequi/Daviplata):** Se configuran directamente en la Base de Datos o desde el Panel de Administración.

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
POST   /pago/registrar          - Registrar comprobante de pago (Nequi/Daviplata)
POST   /pago/verificar          - Verificar pago (Admin)
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

**Email:** mercado.digital.bog@gmail.com
**Telefono** +57 3244314271

---

**Última actualización:** Julio 2026
