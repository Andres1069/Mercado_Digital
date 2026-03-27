import {useEffect,useState} from "react"
import axios from "axios"

export default function Seguimiento(){

const[historial,setHistorial]=useState([])

useEffect(()=>{

setInterval(()=>{

axios.get("/domicilio/seguimiento?pedido=1")
.then(res=>setHistorial(res.data))

},5000)

},[])

return(

<div>

<h2>Seguimiento del pedido</h2>

{historial.map((h,i)=>(
<div key={i}>
<p>{h.Estado} - {h.Fecha}</p>
</div>
))}

</div>

)

}