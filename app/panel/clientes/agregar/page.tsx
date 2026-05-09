"use client"
import {useState} from "react"

export default function AgregarCliente(){

const [nombre,setNombre]=useState("")
const [telefono,setTelefono]=useState("")
const [direccion,setDireccion]=useState("")
const [ciudad,setCiudad]=useState("")
const [cumple,setCumple]=useState("")
const [dia,setDia]=useState("")

function guardar(){

let clientes=JSON.parse(localStorage.getItem("clientes")||"[]")

clientes.push({
nombre,
telefono,
direccion,
ciudad,
cumple,
dia
})

localStorage.setItem("clientes",JSON.stringify(clientes))

alert("Cliente guardado")

setNombre("")
setTelefono("")
setDireccion("")
setCiudad("")
setCumple("")
setDia("")

}

return(

<div style={{background:"#ffffff",minHeight:"100vh",padding:"40px"}}>

<h1 style={{color:"#000",marginBottom:"30px"}}>
Agregar Nuevo Cliente
</h1>

<input
placeholder="Nombre"
value={nombre}
onChange={e=>setNombre(e.target.value)}
style={{display:"block",marginBottom:"15px",padding:"10px",width:"300px",color:"#000"}}
/>

<input
placeholder="Telefono"
value={telefono}
onChange={e=>setTelefono(e.target.value)}
style={{display:"block",marginBottom:"15px",padding:"10px",width:"300px",color:"#000"}}
/>

<input
placeholder="Direccion"
value={direccion}
onChange={e=>setDireccion(e.target.value)}
style={{display:"block",marginBottom:"15px",padding:"10px",width:"300px",color:"#000"}}
/>

<input
placeholder="Ciudad"
value={ciudad}
onChange={e=>setCiudad(e.target.value)}
style={{display:"block",marginBottom:"15px",padding:"10px",width:"300px",color:"#000"}}
/>

<input
type="date"
value={cumple}
onChange={e=>setCumple(e.target.value)}
style={{display:"block",marginBottom:"15px",padding:"10px",width:"300px",color:"#000"}}
/>

<select
value={dia}
onChange={e=>setDia(e.target.value)}
style={{display:"block",marginBottom:"20px",padding:"10px",width:"300px",color:"#000"}}
>

<option value="">Día de visita</option>
<option value="Lunes">Lunes</option>
<option value="Martes">Martes</option>
<option value="Miercoles">Miércoles</option>
<option value="Jueves">Jueves</option>
<option value="Viernes">Viernes</option>

</select>

<button
onClick={guardar}
style={{
background:"#0070f3",
color:"#fff",
border:"none",
padding:"12px 20px",
borderRadius:"6px",
cursor:"pointer"
}}
>

Guardar Cliente

</button>

</div>

)

}