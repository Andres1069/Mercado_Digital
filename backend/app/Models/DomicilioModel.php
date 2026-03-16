<?php

require_once __DIR__.'/../../config/Database.php';

class DomicilioModel{

private $db;

public function __construct(){
$database=new Database();
$this->db=$database->getConnection();
}

/* Crear domicilio cuando se genera el pedido */

public function crearDomicilio($data){

$sql="INSERT INTO domicilio
(Fecha,Estado,Cod_Usuario_pedido,Direccion_entrega,Telefono,Notas,Costo_envio,Distancia_km,Tiempo_estimado,Cod_pedido)
VALUES(NOW(),'Pedido recibido',?,?,?,?,?,?,?,?)";

$stmt=$this->db->prepare($sql);

return $stmt->execute([
$data['usuario'],
$data['direccion'],
$data['telefono'],
$data['notas'],
$data['costo_envio'],
$data['distancia'],
$data['tiempo'],
$data['pedido']
]);

}

/* Guardar historial de estado */

public function guardarHistorial($pedido,$estado){

$sql="INSERT INTO historial_estado_pedido
(Cod_pedido,Estado,Fecha)
VALUES(?,?,NOW())";

$stmt=$this->db->prepare($sql);

$stmt->execute([$pedido,$estado]);

}

/* Ver domicilios del usuario */

public function domiciliosUsuario($usuario){

$sql="SELECT
p.Cod_Pedido,
p.Fecha_Pedido,
p.Estado_Pedido,
d.Direccion_entrega,
d.Costo_envio
FROM pedido p
JOIN domicilio d
ON p.Cod_Pedido=d.Cod_pedido
WHERE d.Cod_Usuario_pedido=?";

$stmt=$this->db->prepare($sql);
$stmt->execute([$usuario]);

return $stmt->fetchAll(PDO::FETCH_ASSOC);

}

/* Detalle del pedido */

public function detallePedido($pedido){

$sql="SELECT
p.Cod_Pedido,
p.Fecha_Pedido,
p.Estado_Pedido,
d.Direccion_entrega,
d.Telefono,
d.Notas,
d.Costo_envio
FROM pedido p
JOIN domicilio d
ON p.Cod_Pedido=d.Cod_pedido
WHERE p.Cod_Pedido=?";

$stmt=$this->db->prepare($sql);
$stmt->execute([$pedido]);

return $stmt->fetch(PDO::FETCH_ASSOC);

}

/* Cancelar pedido */

public function cancelarPedido($pedido){

$sql="UPDATE pedido
SET Estado_Pedido='Cancelado'
WHERE Cod_Pedido=? AND Estado_Pedido='Pedido recibido'";

$stmt=$this->db->prepare($sql);

return $stmt->execute([$pedido]);

}

/* Ver historial de estados */

public function historial($pedido){

$sql="SELECT Estado,Fecha
FROM historial_estado_pedido
WHERE Cod_pedido=?
ORDER BY Fecha ASC";

$stmt=$this->db->prepare($sql);
$stmt->execute([$pedido]);

return $stmt->fetchAll(PDO::FETCH_ASSOC);

}

}

function calcularEnvio($distancia,$total){

$costoBase=3000;

$costoKm=$distancia*500;

$costo=$costoBase+$costoKm;

if($total>50000){
$costo=0;
}

return $costo;

}