"use client"

import {useState,useEffect} from "react"

export default function CargarVehiculo(){

const [productos,setProductos]=useState([])
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState(1)
const [origen,setOrigen]=useState("empresa")

useEffect(()=>{
let listaProductos = JSON.parse(localStorage.getItem("productos") || "[]")
setProductos(listaProductos)
},[])

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

function cargarVehiculo(){

if(producto===""){
alert("Seleccione producto")
return
}

let inventario = JSON.parse(localStorage.getItem("inventario") || "{}")

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

localStorage.setItem("inventario",JSON.stringify(inventario))

alert("Producto cargado correctamente")
setCantidad(1)

}

return(

<div style={contenedor}>

<h1 style={titulo}>🚚 Cargar Vehículo 1</h1>

<div style={formulario}>

<select style={input} value={origen} onChange={(e)=>setOrigen(e.target.value)}>
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