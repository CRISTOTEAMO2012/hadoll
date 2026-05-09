"use client"

import {useState,useEffect} from "react"

export default function DevolucionVehiculo2(){

const [inventario,setInventario]=useState({})
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState(1)

const [envase,setEnvase]=useState("")
const [cantidadEnvase,setCantidadEnvase]=useState(1)

const [destino,setDestino]=useState("empresa")

useEffect(()=>{
let data = JSON.parse(localStorage.getItem("inventario") || "{}")
setInventario(data.vehiculo2 || {})
},[])

const productosMap = [
{label:"Botellón 20L con llave", key:"botellon20llave_llenos"},
{label:"Botellón 20L sin llave", key:"botellon20sin_llave_llenos"},
{label:"Paca 15 botellas", key:"paca15"},
{label:"Paca 24 botellas", key:"paca24"},
{label:"Botella 6000 ml", key:"botella6000_llenos"},
{label:"Botella 1L", key:"botella1L_llenos"} // ✅ NUEVO
]

// 🔵 DEVOLVER
function devolverProducto(){

let inv = JSON.parse(localStorage.getItem("inventario") || "{}")
let cant = Number(cantidad)

if(!producto) return alert("Seleccione producto")

let item = productosMap.find(p=>p.label===producto)
if(!item) return alert("Producto inválido")

let key = item.key

if(!inv.vehiculo2 || inv.vehiculo2[key] === undefined)
return alert("No existe en vehículo")

if(inv.vehiculo2[key] < cant)
return alert("Cantidad mayor al inventario")

inv.vehiculo2[key] -= cant

if(!inv[destino]) inv[destino]={}
if(!inv[destino][key]) inv[destino][key]=0

inv[destino][key] += cant

localStorage.setItem("inventario",JSON.stringify(inv))
setInventario(inv.vehiculo2)

alert("Producto devuelto correctamente")
}

// 🟡 ENVASE
function devolverEnvase(){

let inv = JSON.parse(localStorage.getItem("inventario") || "{}")
let cant = Number(cantidadEnvase)

if(!envase) return alert("Seleccione envase")

if(!inv.vehiculo2 || inv.vehiculo2[envase] === undefined)
return alert("No hay ese envase")

if(inv.vehiculo2[envase] < cant)
return alert("Cantidad mayor al inventario")

inv.vehiculo2[envase] -= cant

if(!inv[destino]) inv[destino]={}
if(!inv[destino][envase]) inv[destino][envase]=0

inv[destino][envase] += cant

localStorage.setItem("inventario",JSON.stringify(inv))
setInventario(inv.vehiculo2)

alert("Envases devueltos correctamente")
}

return(

<div style={contenedor}>

<h1 style={titulo}>↩ Devolución Vehículo 2</h1>

<div style={card}>

<h2>📦 Devolver producto lleno</h2>

<select style={input} value={producto} onChange={(e)=>setProducto(e.target.value)}>
<option value="">Seleccionar producto</option>
{productosMap.map((p,i)=>(<option key={i}>{p.label}</option>))}
</select>

<input style={input} type="number" value={cantidad} onChange={(e)=>setCantidad(e.target.value)} />

<select style={input} value={destino} onChange={(e)=>setDestino(e.target.value)}>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<button style={botonAzul} onClick={devolverProducto}>
Registrar devolución
</button>

</div>

<div style={card}>

<h2>🧴 Devolver envases vacíos</h2>

<select style={input} value={envase} onChange={(e)=>setEnvase(e.target.value)}>
<option value="">Seleccionar envase</option>
<option value="botellon20llave_vacios">Botellón 20L con llave</option>
<option value="botellon20sin_llave_vacios">Botellón 20L sin llave</option>
</select>

<input style={input} type="number" value={cantidadEnvase} onChange={(e)=>setCantidadEnvase(e.target.value)} />

<select style={input} value={destino} onChange={(e)=>setDestino(e.target.value)}>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<button style={botonNaranja} onClick={devolverEnvase}>
Registrar envases
</button>

</div>

</div>
)
}

// estilos
const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"32px",marginBottom:"30px",color:"#000"}
const card={background:"#ffffff",padding:"20px",borderRadius:"12px",marginBottom:"30px",maxWidth:"500px",display:"flex",flexDirection:"column",gap:"12px",color:"#000"}
const input={padding:"10px",border:"1px solid #ccc",borderRadius:"6px",background:"#fff",color:"#000"}
const botonAzul={background:"#2563eb",color:"#fff",padding:"10px",border:"none",borderRadius:"6px"}
const botonNaranja={background:"#f97316",color:"#fff",padding:"10px",border:"none",borderRadius:"6px"}