"use client"

import {useEffect,useState} from "react"

export default function InventarioVehiculo2(){

const [inventario,setInventario]=useState({})

useEffect(()=>{
let data = JSON.parse(localStorage.getItem("inventario") || "{}")
setInventario(data.vehiculo2 || {})
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

// 🔥 dinámico como vehiculo 1
const llenos = Object.entries(inventario).filter(([k]) =>
k.includes("llenos") || k.includes("paca")
)

const vacios = Object.entries(inventario).filter(([k]) =>
k.includes("vacios")
)

function tarjeta(nombre,cantidad,colorFondo,colorTexto){
return(
<div style={{...card,background:colorFondo,color:colorTexto}}>
<h3 style={{marginBottom:"10px"}}>{nombre}</h3>
<div style={{fontSize:"28px",fontWeight:"bold"}}>
{cantidad || 0}
</div>
</div>
)
}

return(

<div style={contenedor}>

<h1 style={titulo}>🚚 Inventario Vehículo 2</h1>

<h2 style={subtitulo}>🟩 Productos Llenos</h2>
<div style={grid}>
{llenos.length === 0 && <p>No hay productos</p>}

{llenos.map(([k,v],i)=>
tarjeta(nombreBonito(k),v,"#dcfce7","#065f46")
)}
</div>

<h2 style={subtitulo}>🟨 Envases Vacíos</h2>
<div style={grid}>
{vacios.length === 0 && <p>No hay envases</p>}

{vacios.map(([k,v],i)=>
tarjeta(nombreBonito(k),v,"#fef9c3","#854d0e")
)}
</div>

</div>

)

}

// estilos iguales
const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"32px",marginBottom:"30px",textAlign:"center"}
const subtitulo={fontSize:"20px",margin:"20px 0 10px 0"}
const grid={display:"flex",flexWrap:"wrap",gap:"20px"}
const card={padding:"20px",borderRadius:"12px",width:"220px",textAlign:"center",boxShadow:"0 4px 10px rgba(0,0,0,0.1)",border:"1px solid #e5e7eb"}