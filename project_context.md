# Project Context: Mercado Digital

This document provides a high-level overview of the "Mercado Digital" project to help any new developer or AI agent understand the architecture, routing, and deployment configurations instantly.

## 🏗️ Architecture Overview

The project is divided into a decoupled **Frontend (React)** and **Backend (PHP)** architecture, communicating via a RESTful API.

### 1. Frontend (React + Vite)
- **Framework:** React 18 with Vite for fast bundling.
- **Styling:** Tailwind CSS (via utility classes) and raw CSS in `index.css`.
- **State Management:** React Context API (`AuthContext` for JWT authentication, `CartContext` for shopping cart).
- **Routing:** `react-router-dom` handles client-side routing.
  - `/admin/*` routes are protected and require `rol = administrador`.
  - Client routes (`/`, `/carrito`, `/perfil`, etc.) handle the e-commerce flow.
- **Key Services:**
  - `src/services/api.js`: Handles all Axios requests to the PHP backend, automatically injecting the JWT token into the `Authorization` header.
- **Deployment:** Vercel. Connects to the backend using the `VITE_API_BASE_URL` environment variable specified in `.env.production`.

### 2. Backend (Vanilla PHP API)
- **Framework:** Vanilla PHP mimicking a minimal MVC architecture (inspired by CodeIgniter but entirely custom/lightweight).
- **Entry Point:** `backend/public/index.php`. All requests are routed through here using Apache `mod_rewrite`.
- **Controllers:** Located in `backend/app/Controllers`. They handle business logic and return JSON responses.
- **Models:** Located in `backend/app/Models`. They handle database queries using PDO.
- **Authentication:** JWT (JSON Web Tokens). The token is verified via middleware/helpers in the API endpoints.
- **Database Connection:** `backend/config/Database.php` uses `getenv()` to read environment variables.
- **Deployment:** Render (via Docker).
  - Uses the `php:8.2-apache` image.
  - **Crucial Fix:** The `Dockerfile` injects `PassEnv` into Apache so that Render's system environment variables (`DB_HOST`, `DB_PASS`, etc.) are accessible to PHP's `getenv()`.

### 3. Database
- **Engine:** MySQL (Hosted on Aiven).
- **Structure:** Tables for `usuarios`, `productos`, `categorias`, `pedidos`, `domicilios`, etc.
- **Important Note:** Aiven does not grant `SUPER` privileges. When importing SQL dumps, `DEFINER` statements and global variable modifications must be stripped.

## 🔌 Core Workflows

- **Login Flow:** User submits credentials -> Backend verifies against DB -> Backend returns a JWT -> Frontend saves JWT in `localStorage` and `AuthContext` -> Frontend includes JWT in all future requests.
- **Payments:** Local payments via Nequi/Daviplata. The user uploads a payment receipt (image), which is saved in the backend (`public/uploads`) and verified manually by an admin.
- **CORS:** Handled in `backend/public/index.php`. It explicitly allows requests from the frontend URL (`localhost` and Vercel domain).

## 🚀 Environment Variables setup

**Frontend (Vercel):**
- `VITE_API_BASE_URL`: URL of the Render API (e.g., `https://mercado-digital-eexq.onrender.com`)

**Backend (Render):**
- `DB_HOST`: e.g., `mysql-2325ba37...`
- `DB_PORT`: `17755`
- `DB_NAME`: `defaultdb`
- `DB_USER`: `avnadmin`
- `DB_PASS`: Your Aiven password
