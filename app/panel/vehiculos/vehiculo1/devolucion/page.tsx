"use client"

import {useState,useEffect} from "react"

export default function DevolucionVehiculo(){

const [inventario,setInventario]=useState({})
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState(1)

const [envase,setEnvase]=useState("")
const [cantidadEnvase,setCantidadEnvase]=useState(1)

const [destino,setDestino]=useState("empresa")

useEffect(()=>{
let data = JSON.parse(localStorage.getItem("inventario") || "{}")
setInventario(data.vehiculo1 || {})
},[])

// 🔥 TRADUCTOR
function traducir(nombre){
nombre = nombre.toLowerCase()

if(nombre.includes("6000")) return "botella6000_llenos"
if(nombre.includes("1l")) return "botella1L_llenos" // ✅ NUEVO
if(nombre.includes("paca 15")) return "paca15"
if(nombre.includes("paca 24")) return "paca24"
if(nombre.includes("con llave")) return "botellon20llave_llenos"
if(nombre.includes("sin llave")) return "botellon20sin_llave_llenos"

return null
}

// 🔥 ENVASE
function traducirVacio(nombre){
nombre = nombre.toLowerCase()

if(nombre.includes("con llave")) return "botellon20llave_vacios"
if(nombre.includes("sin llave")) return "botellon20sin_llave_vacios"

return null
}

// 🔵 DEVOLVER PRODUCTO
function devolverProducto(){

let inv = JSON.parse(localStorage.getItem("inventario") || "{}")
let clave = traducir(producto)
let cant = Number(cantidad)

if(!clave) return alert("Producto no válido")

if(!inv.vehiculo1 || inv.vehiculo1[clave] === undefined)
return alert("Producto no existe en vehículo")

if(inv.vehiculo1[clave] < cant)
return alert("Cantidad mayor al inventario")

inv.vehiculo1[clave] -= cant

if(!inv[destino]) inv[destino]={}
if(!inv[destino][clave]) inv[destino][clave]=0

inv[destino][clave] += cant

localStorage.setItem("inventario",JSON.stringify(inv))
setInventario(inv.vehiculo1)

alert("Producto devuelto correctamente")
}

// 🟠 DEVOLVER ENVASE
function registrarEnvase(){

let inv = JSON.parse(localStorage.getItem("inventario") || "{}")
let clave = traducirVacio(envase)
let cant = Number(cantidadEnvase)

if(!clave) return alert("Envase no válido")

if(!inv.vehiculo1) return alert("No hay inventario")

if(inv.vehiculo1[clave]){
if(inv.vehiculo1[clave] < cant)
return alert("No hay suficientes envases")

inv.vehiculo1[clave] -= cant
}

if(!inv[destino]) inv[destino]={}
if(!inv[destino][clave]) inv[destino][clave]=0

inv[destino][clave] += cant

localStorage.setItem("inventario",JSON.stringify(inv))
setInventario(inv.vehiculo1)

alert("Envases devueltos correctamente")
}

return(

<div style={contenedor}>

<h1 style={titulo}>↩ Devolución Vehículo 1</h1>

<div style={seccion}>
<h2>📦 Devolver producto lleno</h2>

<select style={input} value={producto} onChange={(e)=>setProducto(e.target.value)}>
<option value="">Seleccionar producto</option>
<option>Botellón 20L con llave</option>
<option>Botellón 20L sin llave</option>
<option>Paca 15 botellas</option>
<option>Paca 24 botellas</option>
<option>Botella 6000 ml</option>
<option>Botella 1L</option> {/* ✅ NUEVO */}
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

<div style={seccion}>
<h2>🧴 Devolver envases vacíos</h2>

<select style={input} value={envase} onChange={(e)=>setEnvase(e.target.value)}>
<option value="">Seleccionar envase</option>
<option>Botellón 20L con llave</option>
<option>Botellón 20L sin llave</option>
</select>

<input style={input} type="number" value={cantidadEnvase} onChange={(e)=>setCantidadEnvase(e.target.value)} />

<select style={input} value={destino} onChange={(e)=>setDestino(e.target.value)}>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<button style={botonNaranja} onClick={registrarEnvase}>
Registrar envases
</button>
</div>

</div>
)
}

// estilos
const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"30px",marginBottom:"30px",color:"#000"}
const seccion={background:"#ffffff",padding:"20px",borderRadius:"10px",marginBottom:"30px",maxWidth:"500px",display:"flex",flexDirection:"column",gap:"12px",color:"#000"}
const input={padding:"10px",border:"1px solid #ccc",borderRadius:"6px",background:"#fff",color:"#000"}
const botonAzul={background:"#2563eb",color:"#fff",padding:"10px",border:"none",borderRadius:"6px"}
const botonNaranja={background:"#f97316",color:"#fff",padding:"10px",border:"none",borderRadius:"6px"}