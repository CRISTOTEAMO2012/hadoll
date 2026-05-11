"use client"

export const dynamic = "force-dynamic"

import {useState,useEffect} from "react"
import {useRouter,useSearchParams} from "next/navigation"

export default function EditarCliente(){

const router = useRouter()
const params = useSearchParams()

if(!params) return null

const [index,setIndex] = useState<any>(null)

useEffect(()=>{
setIndex(params.get("id"))
},[params])

const [nombre,setNombre]=useState("")
const [direccion,setDireccion]=useState("")
const [telefono,setTelefono]=useState("")
const [dia,setDia]=useState("Lunes")
const [ciudad,setCiudad]=useState("Riobamba")

useEffect(()=>{

let data = JSON.parse(localStorage.getItem("clientes")||"[]")

if(index !== null && data[index]){

let c = data[index]

setNombre(c.nombre)
setDireccion(c.direccion)
setTelefono(c.telefono)
setDia(c.dia)
setCiudad(c.ciudad)

}

},[index])

function guardar(){

let data = JSON.parse(localStorage.getItem("clientes")||"[]")

data[Number(index)] = {
nombre,
direccion,
telefono,
dia,
ciudad
}

localStorage.setItem("clientes",JSON.stringify(data))

alert("Cliente actualizado")

router.push("/clientes")

}

return(

<div style={{padding:"40px",background:"#f1f5f9",minHeight:"100vh"}}>

<h1>✏️ Editar Cliente</h1>

<input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre" style={input}/>
<input value={direccion} onChange={e=>setDireccion(e.target.value)} placeholder="Dirección" style={input}/>
<input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="Teléfono" style={input}/>

<select value={ciudad} onChange={e=>setCiudad(e.target.value)} style={input}>
<option>Riobamba</option>
<option>Guaranda</option>
<option>Ambato</option>
<option>Chillanes</option>
<option>San Miguel</option>
<option>Chimbo</option>
<option>San Pablo</option>
</select>

<select value={dia} onChange={e=>setDia(e.target.value)} style={input}>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
<option>Domingo</option>
</select>

<button onClick={guardar} style={boton}>
Guardar cambios
</button>

</div>

)

}

const input={
display:"block",
margin:"10px 0",
padding:"10px",
width:"300px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px"
}