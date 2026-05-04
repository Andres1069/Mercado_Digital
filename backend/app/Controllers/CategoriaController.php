<?php
// backend/app/Controllers/CategoriaController.php

class CategoriaController {

    private CategoriaModel $model;

    public function __construct() {
        $this->model = new CategoriaModel();
    }

    // GET /categorias  — público
    public function listar(): void {
        echo json_encode(['success' => true, 'categorias' => $this->model->getAll()]);
    }

    // POST /categorias  — solo Administrador
    public function crear(): void {
        AuthMiddleware::requireRole(['Administrador']);
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $nombre = trim($body['nombre'] ?? '');

        if ($nombre === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El nombre de la categoría es obligatorio.']);
            return;
        }
        if (mb_strlen($nombre) > 30) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El nombre no puede superar los 30 caracteres.']);
            return;
        }
        if ($this->model->nombreExiste($nombre)) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ya existe una categoría con ese nombre.']);
            return;
        }

        $id = $this->model->crear($nombre);
        http_response_code(201);
        echo json_encode([
            'success'  => true,
            'message'  => 'Categoría creada correctamente.',
            'categoria'=> ['Cod_Categoria' => $id, 'Nombre' => $nombre],
        ]);
    }

    // PUT /categorias/{id}  — solo Administrador
    public function actualizar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $cat = $this->model->getById($id);
        if (!$cat) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Categoría no encontrada.']);
            return;
        }

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $nombre = trim($body['nombre'] ?? '');

        if ($nombre === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El nombre de la categoría es obligatorio.']);
            return;
        }
        if (mb_strlen($nombre) > 30) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El nombre no puede superar los 30 caracteres.']);
            return;
        }
        if ($this->model->nombreExiste($nombre, $id)) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ya existe otra categoria con ese nombre.']);
            return;
        }

        $this->model->actualizar($id, $nombre);
        echo json_encode(['success' => true, 'message' => 'Categoría actualizada correctamente.']);
    }

    // DELETE /categorias/{id}  — solo Administrador
    public function eliminar(int $id): void {
        AuthMiddleware::requireRole(['Administrador']);
        $cat = $this->model->getById($id);
        if (!$cat) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Categoría no encontrada.']);
            return;
        }

        $total = $this->model->totalProductos($id);
        if ($total > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'No se puede eliminar "' . $cat['Nombre'] . '" porque tiene ' . $total . ' producto(s) asociado(s). Reasigna o elimina los productos primero.',
            ]);
            return;
        }

        $this->model->eliminar($id);
        echo json_encode(['success' => true, 'message' => 'Categoría eliminada correctamente.']);
    }
}
