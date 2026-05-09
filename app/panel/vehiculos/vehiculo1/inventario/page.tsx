"use client"

import {useState,useEffect} from "react"

export default function InventarioVehiculo(){

const [inventario,setInventario]=useState({})

useEffect(()=>{
let data = JSON.parse(localStorage.getItem("inventario") || "{}")
setInventario(data.vehiculo1 || {})
},[])

function nombreBonito(clave){

if(clave === "botellon20llave_llenos") return "Botellón 20L con llave"
if(clave === "botellon20sin_llave_llenos") return "Botellón 20L sin llave"
if(clave === "botellon20llave_vacios") return "Botellón vacío con llave"
if(clave === "botellon20sin_llave_vacios") return "Botellón vacío sin llave"
if(clave === "paca15") return "Paca 15 botellas"
if(clave === "paca24") return "Paca 24 botellas"
if(clave === "botella6000_llenos") return "Botella 6000 ml"

return clave
}

// 🔥 MÁS PRECISO
const llenos = Object.entries(inventario).filter(([k]) =>
k.includes("llenos") || k.includes("paca")
)

const vacios = Object.entries(inventario).filter(([k]) =>
k.includes("vacios")
)

return(

<div style={contenedor}>

<h1 style={titulo}>🚚 Inventario Vehículo 1</h1>

<h2 style={subtitulo}>🟦 Productos Llenos</h2>

<div style={grid}>
{llenos.length === 0 && <p>No hay productos</p>}

{llenos.map(([k,v],i)=>(
<div key={i} style={card}>
<p style={nombre}>{nombreBonito(k)}</p>
<p style={numero}>{v || 0}</p>
</div>
))}
</div>

<h2 style={subtitulo}>🟧 Envases Vacíos</h2>

<div style={grid}>
{vacios.length === 0 && <p>No hay envases</p>}

{vacios.map(([k,v],i)=>(
<div key={i} style={cardVacio}>
<p style={nombre}>{nombreBonito(k)}</p>
<p style={numero}>{v || 0}</p>
</div>
))}
</div>

</div>

)

}

// estilos iguales
const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"32px",marginBottom:"20px"}
const subtitulo={marginTop:"30px",marginBottom:"15px",fontSize:"20px"}
const grid={display:"flex",flexWrap:"wrap",gap:"20px"}
const card={background:"#ffffff",padding:"20px",borderRadius:"12px",minWidth:"200px",boxShadow:"0 4px 10px rgba(0,0,0,0.1)",textAlign:"center"}
const cardVacio={background:"#fff7ed",padding:"20px",borderRadius:"12px",minWidth:"200px",boxShadow:"0 4px 10px rgba(0,0,0,0.1)",textAlign:"center"}
const nombre={fontWeight:"bold",marginBottom:"10px"}
const numero={fontSize:"28px",color:"#16a34a",fontWeight:"bold"}