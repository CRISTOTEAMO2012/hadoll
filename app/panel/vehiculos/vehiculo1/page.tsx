"use client"

import {useState,useEffect} from "react"
import Link from "next/link"

export default function Vehiculo1(){

const [marca,setMarca]=useState("")
const [placa,setPlaca]=useState("")
const [chofer,setChofer]=useState("")
const [mensaje,setMensaje]=useState("")
const [editando,setEditando]=useState(false)
useEffect(()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

if(data[0]){
setMarca(data[0].marca)
setPlaca(data[0].placa)
setChofer(data[0].chofer)
setEditando(true)
setVehiculoGuardado(data[0])
}

},[])

function guardar(){

let vehiculos = JSON.parse(localStorage.getItem("vehiculos") || "[]")

vehiculos[0]={
nombre:marca+" "+placa,
marca,
placa,
chofer
}

localStorage.setItem("vehiculos",JSON.stringify(vehiculos))
setVehiculoGuardado(vehiculos[0])
setMensaje("✅ Vehículo registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

setMarca("")
setPlaca("")
setChofer("")
setEditando(false)

}
const [vehiculoGuardado,setVehiculoGuardado]=useState<any>(null)
return(

<div style={contenedor}>

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

<h1 style={titulo}>🚚 Vehículo 1</h1>

<div style={formulario}>

<label>Marca del vehículo</label>

<input
style={input}
value={marca}
onChange={(e)=>setMarca(e.target.value)}
placeholder="Ej: Hino"
/>

<label>Placa</label>

<input
style={input}
value={placa}
onChange={(e)=>setPlaca(e.target.value)}
placeholder="Ej: ABC123"
/>

<label>Chofer</label>

<input
style={input}
value={chofer}
onChange={(e)=>setChofer(e.target.value)}
placeholder="Nombre del chofer"
/>

<button style={botonGuardar} onClick={guardar}>
{editando ? "Actualizar vehículo" : "Guardar vehículo"}
</button>

</div>
{vehiculoGuardado && (

<div style={tarjetaVehiculo}>

<h3>🚚 Vehículo registrado</h3>

<p><b>Marca:</b> {vehiculoGuardado.marca}</p>

<p><b>Placa:</b> {vehiculoGuardado.placa}</p>

<p><b>Chofer:</b> {vehiculoGuardado.chofer}</p>

<button
style={botonEditar}
onClick={()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

setMarca(data[0].marca)
setPlaca(data[0].placa)
setChofer(data[0].chofer)

setEditando(true)

}}
>
✏️ Editar
</button>

</div>

)}
<div style={botones}>

<Link href="/panel/vehiculos/vehiculo1/cargar">
<button style={botonAzul}>📦 Cargar Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo1/inventario">
<button style={botonVerde}>📊 Inventario Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo1/devolucion">
<button style={botonNaranja}>↩ Devolución Vehículo</button>
</Link>

</div>

</div>

)

}

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

const formulario={
background:"#ffffff",
padding:"25px",
borderRadius:"10px",
maxWidth:"420px",
display:"flex",
flexDirection:"column",
gap:"10px",
border:"1px solid #ddd",
marginBottom:"40px"
}

const input={
padding:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
}

const botonGuardar={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginTop:"10px"
}

const botones={
display:"flex",
gap:"15px"
}

const botonAzul={
background:"#2563eb",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const botonVerde={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const botonNaranja={
background:"#f97316",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}
const overlayMensaje={
position:"fixed" as const,
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}

const mensajeExito={
background:"#16a34a",
color:"#fff",
padding:"30px 45px",
borderRadius:"14px",
fontSize:"26px",
fontWeight:"bold",
boxShadow:"0 0 25px rgba(0,0,0,0.4)"
}

const tarjetaVehiculo={
background:"#fff",
padding:"20px",
borderRadius:"10px",
maxWidth:"420px",
marginBottom:"30px",
border:"1px solid #ddd"
}

const botonEditar={
background:"#2563eb",
color:"#fff",
padding:"10px 15px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginTop:"10px"
}