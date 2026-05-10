"use client"
import {useState,useEffect} from "react"

export default function BorrarCliente(){

const [clientes,setClientes]=useState([])
const [busqueda,setBusqueda]=useState("")

useEffect(()=>{

let datos=JSON.parse(localStorage.getItem("clientes")||"[]")
setClientes(datos)

},[])

function borrar(nombre: any){

let nuevos=clientes.filter(c=>c.nombre!==nombre)

localStorage.setItem("clientes",JSON.stringify(nuevos))

setClientes(nuevos)

alert("Cliente eliminado")

}

const filtrados = clientes.filter(c =>
c.nombre.toLowerCase().includes(busqueda.toLowerCase())
)

return(

<div style={{background:"#ffffff",minHeight:"100vh",padding:"40px"}}>

<h1 style={{color:"#000",marginBottom:"30px"}}>Borrar Cliente</h1>

<input
placeholder="Buscar cliente por nombre"
value={busqueda}
onChange={e=>setBusqueda(e.target.value)}
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

{filtrados.map((c,i)=>(

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
<p style={{color:"#000"}}><b>Ciudad:</b> {c.ciudad}</p>

<button
onClick={()=>borrar(c.nombre)}
style={{
background:"red",
color:"#fff",
border:"none",
padding:"10px 20px",
borderRadius:"6px",
cursor:"pointer",
marginTop:"10px"
}}
>

Eliminar Cliente

</button>

</div>

))}

</div>

)

}