import {useEffect,useState} from "react"
import axios from "axios"

export default function Historial(){

const[pedidos,setPedidos]=useState([])

useEffect(()=>{

axios.get("http://localhost/domicilio/usuario?usuario=1")
.then(res=>setPedidos(res.data))

},[])

return(

<div>

<h2>Mis pedidos</h2>

{pedidos.map(p=>(
<div key={p.Cod_Pedido}>

<p>Pedido #{p.Cod_Pedido}</p>
<p>Estado: {p.Estado_Pedido}</p>
<p>Total envío: {p.Costo_envio}</p>

</div>
))}

</div>

)

}