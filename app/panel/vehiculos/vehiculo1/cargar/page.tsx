"use client"

import {useState,useEffect} from "react"
import { supabase } from "@/supabase"

export default function CargarVehiculo(){

const [productos,setProductos]=useState([])
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")
const [origen,setOrigen]=useState("")
const [mensaje,setMensaje]=useState("")

useEffect(()=>{

cargarProductos()

},[])

async function cargarProductos(){

const { data, error } = await supabase
.from("productos")
.select("*")
.order("nombre")

if(error){
console.log(error)
return
}

setProductos(data || [])

}

// 🔥 TRADUCTOR
function tipoProducto(nombre){

nombre = nombre.toLowerCase()

if(nombre.includes("6000")) return "botella6000_llenos"
if(nombre.includes("1l")) return "botella1L_llenos" // ✅ AGREGADO
if(nombre.includes("paca 15")) return "paca15"
if(nombre.includes("paca 24")) return "paca24"
if(nombre.includes("con llave")) return "botellon20llave_llenos"
if(nombre.includes("sin llave")) return "botellon20sin_llave_llenos"

return null
}

async function cargarVehiculo(){

if(producto===""){
alert("Seleccione producto")
return
}

const { data, error } = await supabase
.from("inventario")
.select("*")
.limit(1)
.single()

if(error){
alert(error.message)
return
}

let inventario = {
empresa: data.empresa || {},
dorita: data.dorita || {},
vehiculo1: data.vehiculo1 || {},
vehiculo2: data.vehiculo2 || {}
}

let clave = tipoProducto(producto)

if(!clave){
alert("Producto no válido")
return
}

if(!inventario[origen]){
alert("No existe inventario en " + origen)
return
}

if(inventario[origen][clave] === undefined){
alert("Este producto no existe en " + origen)
return
}

if(inventario[origen][clave] < cantidad){
alert("Stock insuficiente en " + origen)
return
}

// 🔻 DESCONTAR
inventario[origen][clave] -= Number(cantidad)

// 🔺 SUMAR VEHICULO 1
if(!inventario.vehiculo1){
inventario.vehiculo1={}
}

if(!inventario.vehiculo1[clave]){
inventario.vehiculo1[clave]=0
}

inventario.vehiculo1[clave] += Number(cantidad)

const { error: errorGuardar } = await supabase
.from("inventario")
.update({
empresa: inventario.empresa,
dorita: inventario.dorita,
vehiculo1: inventario.vehiculo1,
vehiculo2: inventario.vehiculo2
})
.eq("id", data.id)

if(errorGuardar){

alert(errorGuardar.message)
console.log(errorGuardar)

return

}

setMensaje("✅ Producto cargado exitosamente")

setTimeout(()=>{
setMensaje("")
},2000)

setProducto("")
setCantidad("")
setOrigen("")

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

<h1 style={titulo}>🚚 Cargar Vehículo 1</h1>

<div style={formulario}>
<select style={input} value={origen} onChange={(e)=>setOrigen(e.target.value)}>
<option value="">Seleccionar origen</option>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<select style={input} value={producto} onChange={(e)=>setProducto(e.target.value)}>
<option value="">Seleccionar producto</option>
{productos.map((p,i)=>(
<option key={i} value={p.nombre}>{p.nombre}</option>
))}
</select>

<input style={input} type="number" value={cantidad} onChange={(e)=>setCantidad(e.target.value)}/>

<button style={boton} onClick={cargarVehiculo}>
Cargar Producto
</button>

</div>

</div>

)
}

// estilos
const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"30px",marginBottom:"25px"}
const formulario={display:"flex",flexDirection:"column",gap:"15px",maxWidth:"400px"}
const input={padding:"10px",border:"1px solid #ccc",borderRadius:"6px"}
const boton={background:"#2563eb",color:"#fff",padding:"12px",border:"none",borderRadius:"6px"}
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