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

### 2. Configuración del Backend

El backend está diseñado para conectarse a una base de datos MySQL (local o en la nube como Aiven) mediante variables de entorno.

**Variables de entorno requeridas en tu servidor (ej: Render):**
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

*(Si trabajas en local con XAMPP, puedes hardcodearlas temporalmente en `backend/config/Database.php` o usar apache `SetEnv`).*

**Importar esquema de base de datos:**
```bash
mysql -u usuario -p nombre_bd < backend/config/mercado_digital.sql
```

### 3. Configuración del Frontend

```bash
cd frontend
npm install
```

**Conexión con el Backend:**
- **Local:** `frontend/.env.development`
- **Producción (Vercel):** `frontend/.env.production`

Asegúrate de definir la URL correcta de tu API en esos archivos:
```env
VITE_API_BASE_URL=https://tu-backend-en-render.onrender.com
```

### 4. Despliegue en la Nube (Recomendado)

- **Frontend (Vercel):** Conecta tu repositorio de GitHub, selecciona el Root Directory como `frontend` y Vercel se encarga del resto.
- **Backend (Render):** Crea un Web Service usando `Docker`, conéctalo al repositorio y configura las Variables de Entorno de tu base de datos.
```

---

## 💾 Respaldos Automáticos (Backups)

El proyecto cuenta con un sistema de **respaldos automáticos diarios** de la base de datos (Aiven) hacia Google Drive, utilizando **GitHub Actions**. El respaldo se ejecuta todos los días a las 3:00 AM UTC, o de forma manual.

### Requisitos Previos para Google Drive
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y crea un nuevo proyecto.
2. Habilita la **Google Drive API**.
3. Ve a "Credenciales" y crea una **Cuenta de Servicio (Service Account)**.
4. Genera una clave JSON para esta cuenta y descárgala.
5. Abre el JSON descargado, copia el correo que aparece en `"client_email"`.
6. Ve a tu Google Drive, crea una carpeta llamada `MercadoDigital_Backups` y compártela (con permisos de Editor) con ese correo (`client_email`).
7. Entra a esa carpeta en Google Drive y copia el **ID de la carpeta** que aparece en la URL (los caracteres después de `/folders/`).

### Configuración en GitHub
Para que el respaldo funcione, debes ir a tu repositorio en GitHub -> **Settings** -> **Secrets and variables** -> **Actions** y crear los siguientes secretos (Repository Secrets):

- `DB_HOST`: Host de tu base de datos en Aiven.
- `DB_PORT`: Puerto de tu base de datos (ej. 25060).
- `DB_USER`: Usuario de la base de datos.
- `DB_PASS`: Contraseña de la base de datos.
- `DB_NAME`: Nombre de la base de datos.
- `GDRIVE_CREDENTIALS`: Pega aquí todo el contenido del archivo JSON que descargaste de Google Cloud.
- `GDRIVE_FOLDER_ID`: El ID de la carpeta de Google Drive que copiaste en el paso anterior.

### Cómo Validar que Funciona
1. En tu repositorio de GitHub, ve a la pestaña **Actions**.
2. En el panel izquierdo, selecciona **"Backup Aiven DB to Google Drive"**.
3. Haz clic en el botón **"Run workflow"** a la derecha y presiona "Run workflow".
4. Espera a que termine (debe marcar un check verde).
5. Ve a tu carpeta compartida en Google Drive. Deberías ver un archivo nuevo llamado `backup_mercadodigital_YYYY-MM-DD_HH-MM-SS.sql`.
6. Puedes descargar este archivo `.sql` e importarlo localmente en XAMPP (`http://localhost/phpmyadmin`) para validar que toda la información y estructura esté intacta.

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
