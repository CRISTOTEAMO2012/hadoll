"use client"

import { useEffect, useState } from "react"

export default function DevolucionesEnvases(){

const [clientes,setClientes]=useState([])
const [cliente,setCliente]=useState("")

const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")

const [historial,setHistorial]=useState([])

useEffect(()=>{

let clientesGuardados = JSON.parse(localStorage.getItem("clientes") || "[]")
setClientes(clientesGuardados)

if(clientesGuardados.length > 0){
setCliente(clientesGuardados[0].nombre || "")
}

cargarHistorial()

},[])

function cargarHistorial(){

// 🔥 AHORA SE LEE DESDE envasesprestados
let data = JSON.parse(localStorage.getItem("envasesprestados") || "[]")

// 🔥 SOLO DEVOLUCIONES
let devoluciones = data.filter(d=>d.tipo==="devuelto")

devoluciones.sort((a,b)=> new Date(b.fecha) - new Date(a.fecha))

setHistorial(devoluciones)

}

function guardarDevolucion(){

if(!cliente) return alert("Seleccione cliente")
if(!producto) return alert("Seleccione producto")
if(!cantidad) return alert("Ingrese cantidad")

// 🔥 AHORA TODO VA A envasesprestados
let movimientos = JSON.parse(localStorage.getItem("envasesprestados") || "[]")

movimientos.push({
cliente,
envase:producto,
cantidad:Number(cantidad),
fecha:new Date().toISOString().split("T")[0],
tipo:"devuelto"
})

localStorage.setItem("envasesprestados",JSON.stringify(movimientos))

setProducto("")
setCantidad("")

cargarHistorial()

alert("Devolución registrada")

}

return(

<div style={contenedor}>

<h1 style={titulo}>♻️ Devolución de Envases</h1>

<div style={card}>

<select
value={cliente}
onChange={(e)=>setCliente(e.target.value)}
style={input}
>

{clientes.map((c,i)=>(

<option key={i}>
{c.nombre}
</option>

))}

</select>

{/* 🔥 SELECT IGUAL QUE REGISTRO INICIAL */}
<select
value={producto}
onChange={(e)=>setProducto(e.target.value)}
style={input}
>

<option value="">
Seleccione envase
</option>

<option value="Botellón 20L con llave">
Botellón 20L con llave
</option>

<option value="Botellón 20L sin llave">
Botellón 20L sin llave
</option>

</select>

<input
type="number"
placeholder="Cantidad devuelta"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
style={input}
/>

<button
style={boton}
onClick={guardarDevolucion}
>
Guardar devolución
</button>

</div>

<div style={historialBox}>

<h2 style={{marginBottom:"20px"}}>
📋 Historial devoluciones
</h2>

{historial.length===0 && (
<p>No hay devoluciones registradas</p>
)}

{historial.map((d,i)=>(

<div key={i} style={item}>

<div>

<b>{d.cliente}</b>

<div style={{fontSize:"14px",color:"#666"}}>
{d.envase}
</div>

<div style={{fontSize:"13px",color:"#999"}}>
{d.fecha}
</div>

</div>

<div style={cantidadBox}>
-{d.cantidad}
</div>

</div>

))}

</div>

</div>

)

}

// 🎨 ESTILOS

const contenedor={
background:"#f1f5f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"32px",
marginBottom:"30px"
}

const card={
background:"#fff",
padding:"25px",
borderRadius:"14px",
maxWidth:"500px",
display:"flex",
flexDirection:"column",
gap:"15px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const input={
padding:"12px",
border:"1px solid #ccc",
borderRadius:"8px",
fontSize:"15px"
}

const boton={
background:"#7c3aed",
color:"#fff",
border:"none",
padding:"14px",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"15px"
}

const historialBox={
marginTop:"30px",
background:"#fff",
padding:"25px",
borderRadius:"14px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const item={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"15px 0",
borderBottom:"1px solid #e5e7eb"
}

const cantidadBox={
background:"#dcfce7",
padding:"10px 16px",
borderRadius:"10px",
fontWeight:"bold",
color:"#166534"
}