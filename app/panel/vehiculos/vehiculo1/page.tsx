"use client"

import {useState,useEffect} from "react"
import Link from "next/link"

export default function Vehiculo1(){

const [marca,setMarca]=useState("")
const [placa,setPlaca]=useState("")
const [chofer,setChofer]=useState("")

useEffect(()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

if(data[0]){
setMarca(data[0].marca)
setPlaca(data[0].placa)
setChofer(data[0].chofer)
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

alert("Vehículo guardado")

}

return(

<div style={contenedor}>

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
Guardar vehículo
</button>

</div>

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