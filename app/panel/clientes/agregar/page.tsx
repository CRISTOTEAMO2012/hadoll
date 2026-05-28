"use client"

import { useState } from "react"
import { supabase } from "@/supabase"

export default function AgregarCliente(){

const [nombre,setNombre]=useState("")
const [telefono,setTelefono]=useState("")
const [direccion,setDireccion]=useState("")
const [ciudad,setCiudad]=useState("")

async function guardar(){

// LOCAL
let clientes = JSON.parse(localStorage.getItem("clientes") || "[]")

clientes.push({
nombre,
telefono,
direccion,
ciudad
})

localStorage.setItem("clientes",JSON.stringify(clientes))

// SUPABASE
const { error } = await supabase
.from("clientes")
.insert([
{
nombre,
telefono,
direccion,
ciudad
}
])

if(error){

alert("ERROR: " + JSON.stringify(error))
console.log(error)
return

}

alert("CLIENTE GUARDADO EN INTERNET ✅")

setNombre("")
setTelefono("")
setDireccion("")
setCiudad("")

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
style={{
display:"block",
marginBottom:"15px",
padding:"10px",
width:"300px",
color:"#000"
}}
/>

<input
placeholder="Telefono"
value={telefono}
onChange={e=>setTelefono(e.target.value)}
style={{
display:"block",
marginBottom:"15px",
padding:"10px",
width:"300px",
color:"#000"
}}
/>

<input
placeholder="Direccion"
value={direccion}
onChange={e=>setDireccion(e.target.value)}
style={{
display:"block",
marginBottom:"15px",
padding:"10px",
width:"300px",
color:"#000"
}}
/>

<input
placeholder="Ciudad"
value={ciudad}
onChange={e=>setCiudad(e.target.value)}
style={{
display:"block",
marginBottom:"20px",
padding:"10px",
width:"300px",
color:"#000"
}}
/>

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