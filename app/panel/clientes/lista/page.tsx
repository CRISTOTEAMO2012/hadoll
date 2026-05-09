"use client"
import { useEffect, useState } from "react"

export default function ListaClientes(){

const [clientes,setClientes]=useState([])
const [filtroCiudad,setFiltroCiudad]=useState("")

useEffect(()=>{

let datos=JSON.parse(localStorage.getItem("clientes")||"[]")
setClientes(datos)

},[])

const clientesFiltrados = filtroCiudad
? clientes.filter(c=>c.ciudad.toLowerCase().includes(filtroCiudad.toLowerCase()))
: clientes

return(

<div style={{background:"#ffffff",minHeight:"100vh",padding:"40px"}}>

<h1 style={{color:"#000",marginBottom:"30px"}}>
Lista Total de Clientes
</h1>

<input
placeholder="Buscar por ciudad (ej: Guaranda)"
value={filtroCiudad}
onChange={e=>setFiltroCiudad(e.target.value)}
style={{
padding:"12px",
width:"300px",
marginBottom:"30px",
fontSize:"16px",
color:"#000",
border:"1px solid #999",
borderRadius:"6px"
}}
/>

{clientesFiltrados.map((c,i)=>(

<div key={i}
style={{
border:"1px solid #ccc",
padding:"15px",
marginBottom:"15px",
borderRadius:"8px",
background:"#f9f9f9"
}}
>

<p style={{color:"#000"}}><b>Nombre:</b> {c.nombre}</p>
<p style={{color:"#000"}}><b>Teléfono:</b> {c.telefono}</p>
<p style={{color:"#000"}}><b>Dirección:</b> {c.direccion}</p>
<p style={{color:"#000"}}><b>Ciudad:</b> {c.ciudad}</p>
<p style={{color:"#000"}}><b>Cumpleaños:</b> {c.cumple}</p>

</div>

))}

</div>

)
}