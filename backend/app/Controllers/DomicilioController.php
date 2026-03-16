<?php

require_once __DIR__.'/../Models/DomicilioModel.php';

class DomicilioController{

private $model;

public function __construct(){
$this->model=new DomicilioModel();
}

/* Crear domicilio */

public function crear(){

$data=json_decode(file_get_contents("php://input"),true);

$resultado=$this->model->crearDomicilio($data);

$this->model->guardarHistorial($data['pedido'],'Pedido recibido');

echo json_encode(["success"=>$resultado]);

}

/* Historial domicilios usuario */

public function usuario(){

$usuario=$_GET['usuario'];

$resultado=$this->model->domiciliosUsuario($usuario);

echo json_encode($resultado);

}

/* Detalle pedido */

public function detalle(){

$pedido=$_GET['pedido'];

$resultado=$this->model->detallePedido($pedido);

echo json_encode($resultado);

}

/* Cancelar pedido */

public function cancelar(){

$pedido=$_GET['pedido'];

$resultado=$this->model->cancelarPedido($pedido);

if($resultado){
$this->model->guardarHistorial($pedido,'Cancelado');
}

echo json_encode(["success"=>$resultado]);

}

/* Seguimiento */

public function seguimiento(){

$pedido=$_GET['pedido'];

$resultado=$this->model->historial($pedido);

echo json_encode($resultado);

}

}