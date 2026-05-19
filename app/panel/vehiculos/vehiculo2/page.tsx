"use client"

import {useState,useEffect} from "react"
import Link from "next/link"

export default function Vehiculo2(){

const [marca,setMarca]=useState("")
const [placa,setPlaca]=useState("")
const [chofer,setChofer]=useState("")

const [mensaje,setMensaje]=useState("")
const [editando,setEditando]=useState(false)


useEffect(()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

if(data[1]){
setMarca(data[1].marca)
setPlaca(data[1].placa)
setChofer(data[1].chofer)
setEditando(true)
}

},[])

function guardar(){

let vehiculos = JSON.parse(localStorage.getItem("vehiculos") || "[]")

vehiculos[1]={
nombre:marca+" "+placa,
marca,
placa,
chofer
}

localStorage.setItem("vehiculos",JSON.stringify(vehiculos))

setMensaje("✅ Vehículo registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

setMarca("")
setPlaca("")
setChofer("")
setEditando(false)

}

return(

<div style={contenedor}>

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

<h1 style={titulo}>🚚 Vehículo 2</h1>

<div style={formulario}>

<label>Marca del vehículo</label>
<input style={input} value={marca} onChange={(e)=>setMarca(e.target.value)} />

<label>Placa</label>
<input style={input} value={placa} onChange={(e)=>setPlaca(e.target.value)} />

<label>Chofer</label>
<input style={input} value={chofer} onChange={(e)=>setChofer(e.target.value)} />

<button style={botonGuardar} onClick={guardar}>
{editando ? "Actualizar vehículo" : "Guardar vehículo"}
</button>

{JSON.parse(localStorage.getItem("vehiculos") || "[]")[1] && (

<div style={tarjetaVehiculo}>

<h3>🚚 Vehículo registrado</h3>

<p><b>Marca:</b> {JSON.parse(localStorage.getItem("vehiculos") || "[]")[1].marca}</p>

<p><b>Placa:</b> {JSON.parse(localStorage.getItem("vehiculos") || "[]")[1].placa}</p>

<p><b>Chofer:</b> {JSON.parse(localStorage.getItem("vehiculos") || "[]")[1].chofer}</p>

<button
style={botonEditar}
onClick={()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

setMarca(data[1].marca)
setPlaca(data[1].placa)
setChofer(data[1].chofer)

setEditando(true)

}}
>
✏️ Editar
</button>

</div>

)}

<Link href="/panel/vehiculos/vehiculo2/cargar">
<button style={botonAzul}>📦 Cargar Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo2/inventario">
<button style={botonVerde}>📊 Inventario Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo2/devolucion">
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
background:"#fff",
padding:"20px",
borderRadius:"10px",
display:"flex",
flexDirection:"column",
gap:"10px",
maxWidth:"420px",
marginBottom:"30px",
border:"1px solid #ddd"
}

const input={
padding:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
}

const botonGuardar={
background:"#16a34a",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px"
}

const botones={display:"flex",gap:"15px"}

const botonAzul={background:"#2563eb",color:"#fff",padding:"10px",borderRadius:"6px",border:"none"}

const botonVerde={background:"#16a34a",color:"#fff",padding:"10px",borderRadius:"6px",border:"none"}

const botonNaranja={background:"#f97316",color:"#fff",padding:"10px",borderRadius:"6px",border:"none"}
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