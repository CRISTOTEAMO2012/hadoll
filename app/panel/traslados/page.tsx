"use client"

import {useState} from "react"
import { supabase } from "@/supabase"
export default function Traslados(){

const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")
const [origen,setOrigen]=useState("")
const [destino,setDestino]=useState("")
const [mensaje,setMensaje]=useState("")
function obtenerClave(prod){

// 🔵 LLENOS
if(prod==="llave_lleno") return "botellon20llave_llenos"
if(prod==="sinllave_lleno") return "botellon20sin_llave_llenos"
if(prod==="paca15") return "paca15"
if(prod==="paca24") return "paca24"
if(prod==="6000_lleno") return "botella6000_llenos"
if(prod==="1L_lleno") return "botella1L_llenos" // ✅ OK

// 🟡 VACÍOS
if(prod==="llave_vacio") return "botellon20llave_vacios"
if(prod==="sinllave_vacio") return "botellon20sin_llave_vacios"
if(prod==="6000_vacio") return "botella6000"

// 🔥 CORRECCIÓN AQUÍ
if(prod==="1L_vacio") return "botella1L" 

return null
}

async function mover(){

const { data: inventarioData, error } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

if(error || !inventarioData){
alert("No se pudo cargar inventario")
return
}

let inventario = {
empresa: inventarioData.empresa || {},
dorita: inventarioData.dorita || {}
}
let cant = Number(cantidad)

if(!producto || !origen || !destino || !cant){
alert("Complete todos los campos")
return
}

if(origen === destino){
alert("Origen y destino no pueden ser iguales")
return
}

if(!inventario[origen]){
alert("Inventario origen no existe")
return
}

// 🔧 crear destino si no existe
if(!inventario[destino]){
inventario[destino] = {}
}

let clave = obtenerClave(producto)

if(!clave){
alert("Producto inválido")
return
}

// 🔒 VALIDAR STOCK
if((inventario[origen][clave] || 0) < cant){
alert("Stock insuficiente")
return
}

// 🔻 RESTAR
inventario[origen][clave] -= cant

// 🔺 SUMAR
if(!inventario[destino][clave]){
inventario[destino][clave] = 0
}

inventario[destino][clave] += cant

// 💾 GUARDAR
await supabase
.from("inventario")
.update({
empresa: inventario.empresa,
dorita: inventario.dorita
})
.eq("id",1)

await supabase
.from("traslados")
.insert([
{
producto,
cantidad: Number(cantidad),
origen,
destino,
fecha: new Date().toLocaleDateString("en-CA",{
timeZone:"America/Guayaquil"
})
}
])

setMensaje("✅ Traslado registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

setProducto("")
setOrigen("")
setDestino("")
setCantidad("")
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


<h1 style={{marginBottom:"30px"}}>
🔄 TRASLADOS COMPLETOS
</h1>

<p>TIPO DE PRODUCTO</p>

<select value={producto} onChange={(e)=>setProducto(e.target.value)} style={input}>

<option value="">Seleccionar</option>

{/* 🔵 LLENOS */}
<option value="llave_lleno">Botellón 20L con llave (Lleno)</option>
<option value="sinllave_lleno">Botellón 20L sin llave (Lleno)</option>
<option value="paca15">Paca 15 botellas</option>
<option value="paca24">Paca 24 botellas</option>
<option value="6000_lleno">Botella 6000 ml (Llena)</option>
<option value="1L_lleno">Botella 1L (Llena)</option>

{/* 🟡 VACÍOS */}
<option value="llave_vacio">Botellón 20L con llave (Vacío)</option>
<option value="sinllave_vacio">Botellón 20L sin llave (Vacío)</option>
<option value="6000_vacio">Botella 6000 ml (Vacía)</option>
<option value="1L_vacio">Botella 1L (Vacía)</option>

</select>

<br/><br/>

<p>ORIGEN</p>

<select value={origen} onChange={(e)=>setOrigen(e.target.value)} style={input}>
<option value="">Seleccionar</option>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<br/><br/>

<p>DESTINO</p>

<select value={destino} onChange={(e)=>setDestino(e.target.value)} style={input}>
<option value="">Seleccionar</option>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<br/><br/>

<p>CANTIDAD</p>

<input
type="number"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
style={input}
/>

<br/><br/>

<button onClick={mover} style={boton}>
REALIZAR TRASLADO
</button>

</div>

)
}

const input={
padding:"12px",
width:"320px",
borderRadius:"6px",
border:"1px solid #ccc",
color:"#000"
}

const boton={
padding:"15px 40px",
background:"#f97316",
color:"#fff",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer"
}
const contenedor={
background:"#f1f5f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
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