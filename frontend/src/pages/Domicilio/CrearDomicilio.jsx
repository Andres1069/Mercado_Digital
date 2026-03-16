import {useState} from "react"
import axios from "axios"

export default function CrearDomicilio(){

const[direccion,setDireccion]=useState("")
const[notas,setNotas]=useState("")

const crear=async()=>{

const data={
usuario:1,
pedido:1,
direccion:direccion,
telefono:"300000000",
notas:notas,
costo_envio:3000,
distancia:2,
tiempo:30
}

await axios.post("http://localhost/domicilio/crear",data)

alert("Pedido creado")

}

return(

<div>

<h2>Pedido a domicilio</h2>

<input
placeholder="Dirección"
onChange={(e)=>setDireccion(e.target.value)}
/>

<textarea
placeholder="Notas para el domiciliario"
onChange={(e)=>setNotas(e.target.value)}
/>

<button onClick={crear}>
Confirmar pedido
</button>

</div>

)

}