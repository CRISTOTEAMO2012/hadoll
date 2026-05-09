"use client"

import {useState,useEffect} from "react"
import Link from "next/link"

export default function Vehiculo4(){

const [marca,setMarca]=useState("")
const [placa,setPlaca]=useState("")
const [chofer,setChofer]=useState("")

useEffect(()=>{

let data = JSON.parse(localStorage.getItem("vehiculos") || "[]")

if(data[3]){
setMarca(data[3].marca)
setPlaca(data[3].placa)
setChofer(data[3].chofer)
}

},[])

function guardar(){

let vehiculos = JSON.parse(localStorage.getItem("vehiculos") || "[]")

vehiculos[3]={
nombre:marca+" "+placa,
marca,
placa,
chofer
}

localStorage.setItem("vehiculos",JSON.stringify(vehiculos))

alert("Vehículo 4 guardado")

}

return(

<div style={contenedor}>

<h1 style={titulo}>🚚 Vehículo 4</h1>

<div style={formulario}>

<label>Marca del vehículo</label>
<input style={input} value={marca} onChange={(e)=>setMarca(e.target.value)} />

<label>Placa</label>
<input style={input} value={placa} onChange={(e)=>setPlaca(e.target.value)} />

<label>Chofer</label>
<input style={input} value={chofer} onChange={(e)=>setChofer(e.target.value)} />

<button style={botonGuardar} onClick={guardar}>
Guardar vehículo
</button>

</div>

<div style={botones}>

<Link href="/panel/vehiculos/vehiculo4/cargar">
<button style={botonAzul}>📦 Cargar Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo4/inventario">
<button style={botonVerde}>📊 Inventario Vehículo</button>
</Link>

<Link href="/panel/vehiculos/vehiculo4/devolucion">
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