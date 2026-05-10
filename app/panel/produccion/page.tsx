"use client"

import {useState,useEffect} from "react"

export default function Produccion(){

const [productos,setProductos]=useState([])
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState(1)

useEffect(()=>{

let listaProductos = JSON.parse(localStorage.getItem("productos") || "[]")

if(listaProductos.length === 0){

listaProductos = [
{nombre:"Botellón 20L con llave", precio:2.5},
{nombre:"Botellón 20L sin llave", precio:2},
{nombre:"Paca 15 botellas 600 ml", precio:3.5},
{nombre:"Paca 24 botellas 600 ml", precio:5},
{nombre:"Botella 6000 ml", precio:1.5},
{nombre:"Botella 1L", precio:1}
]

localStorage.setItem("productos", JSON.stringify(listaProductos))
}

setProductos(listaProductos)

},[])

function tipoProducto(nombre){

nombre = nombre.toLowerCase()

if(nombre.includes("con llave")) return "botellon_llave"
if(nombre.includes("sin llave")) return "botellon_sin_llave"
if(nombre.includes("paca 15")) return "paca15"
if(nombre.includes("paca 24")) return "paca24"
if(nombre.includes("6000")) return "botella6000"
if(nombre.includes("1l")) return "botella1L"

return null
}

// NORMALIZADOR
function normalizar(txt){
return txt.toLowerCase().trim()
}

// COSTO INSUMOS
function costoInsumo(nombre){

let mov = JSON.parse(localStorage.getItem("movimientosInsumos") || "[]")

let compras = mov.filter(m =>
normalizar(m.insumo) === normalizar(nombre) &&
m.tipo === "compra" &&
m.precio > 0
)

if(compras.length === 0) return 0

let totalDinero = 0
let totalCantidad = 0

compras.forEach(c=>{
totalDinero += c.total
totalCantidad += c.cantidad
})

return totalCantidad ? totalDinero / totalCantidad : 0
}

// 🔥 COSTO BOTELLAS DESDE INVENTARIO (ARREGLADO)
function costoBotella(clave){

let inventario = JSON.parse(localStorage.getItem("inventario") || "null")
if(!inventario) return 0

// usamos costo guardado manualmente en inventario si existe
let costos = JSON.parse(localStorage.getItem("costosBotellas") || "{}")

if(costos[clave]) return costos[clave]

// fallback = 0 si no hay costo
return 0
}

// DETALLE
function calcularCostoDetallado(tipo,cant){

let detalle = []
let total = 0
let consumos = []

function usar(nombre,cantidadPorUnidad){

let costo = costoInsumo(nombre)

let totalCantidad = cantidadPorUnidad * cant
let totalCosto = totalCantidad * costo

detalle.push({
insumo:nombre,
cantidadUnidad:cantidadPorUnidad,
cantidadTotal:totalCantidad,
costo,
total:totalCosto
})

consumos.push({
insumo:nombre,
cantidad:totalCantidad
})

total += totalCosto
}

// 🔥 BOTELLAS
function usarBotella(nombre,clave,cantidadPorUnidad){

let costo = costoBotella(clave)

let totalCantidad = cantidadPorUnidad * cant
let totalCosto = totalCantidad * costo

detalle.push({
insumo:nombre,
cantidadUnidad:cantidadPorUnidad,
cantidadTotal:totalCantidad,
costo,
total:totalCosto
})

total += totalCosto
}

// REGLAS

if(tipo==="botellon_llave"){
usar("Tapa Verde",1)
usar("Sticker Azul",1)
usar("Sello Blanco",1)
}

if(tipo==="botellon_sin_llave"){
usar("Tapa Azul",1)
usar("Sticker Azul",1)
usar("Sello Blanco",1)
}

if(tipo==="paca15"){
usar("Fajilla 600 ml",15)
usarBotella("Botella 600 ml","botella600",15)
}

if(tipo==="paca24"){
usar("Fajilla 600 ml",24)
usarBotella("Botella 600 ml","botella600",24)
}

if(tipo==="botella1L"){
usar("Fajilla 1 L",1)
usarBotella("Botella 1L","botella1L",1)
}

if(tipo==="botella6000"){
usar("Sticker 6000 ml",1)
usarBotella("Botella 6000 ml","botella6000",1)
}

return {detalle,total,consumos}
}

function registrarProduccion(){

if(producto===""){
alert("Seleccione producto")
return
}

let tipo = tipoProducto(producto)

if(!tipo){
alert("Producto no válido")
return
}

let inventario = JSON.parse(localStorage.getItem("inventario") || "null")

if(!inventario){
alert("No hay inventario")
return
}

let cant = Number(cantidad)

// VALIDACIONES

if(tipo==="botellon_llave" && (inventario.empresa.botellon20llave_vacios || 0) < cant){
alert("No hay suficientes botellones con llave")
return
}

if(tipo==="botellon_sin_llave" && (inventario.empresa.botellon20sin_llave_vacios || 0) < cant){
alert("No hay suficientes botellones sin llave")
return
}

if(tipo==="paca15" && (inventario.empresa.botella600 || 0) < cant*15){
alert("No hay botellas 600 ml")
return
}

if(tipo==="paca24" && (inventario.empresa.botella600 || 0) < cant*24){
alert("No hay botellas 600 ml")
return
}

if(tipo==="botella6000" && (inventario.empresa.botella6000 || 0) < cant){
alert("No hay botellas 6000")
return
}

if(tipo==="botella1L" && (inventario.empresa.botella1L || 0) < cant){
alert("No hay botellas 1L")
return
}

// PRODUCCIÓN

if(tipo==="botellon_llave"){
inventario.empresa.botellon20llave_vacios -= cant
inventario.empresa.botellon20llave_llenos =
(inventario.empresa.botellon20llave_llenos || 0) + cant
}

if(tipo==="botellon_sin_llave"){
inventario.empresa.botellon20sin_llave_vacios -= cant
inventario.empresa.botellon20sin_llave_llenos =
(inventario.empresa.botellon20sin_llave_llenos || 0) + cant
}

if(tipo==="paca15"){
inventario.empresa.botella600 -= cant*15
inventario.empresa.paca15 =
(inventario.empresa.paca15 || 0) + cant
}

if(tipo==="paca24"){
inventario.empresa.botella600 -= cant*24
inventario.empresa.paca24 =
(inventario.empresa.paca24 || 0) + cant
}

if(tipo==="botella6000"){
inventario.empresa.botella6000 -= cant
inventario.empresa.botella6000_llenos =
(inventario.empresa.botella6000_llenos || 0) + cant
}

if(tipo==="botella1L"){
inventario.empresa.botella1L -= cant
inventario.empresa.botella1L_llenos =
(inventario.empresa.botella1L_llenos || 0) + cant
}

localStorage.setItem("inventario",JSON.stringify(inventario))

let resultado = calcularCostoDetallado(tipo,cant)

let mov = JSON.parse(localStorage.getItem("movimientosInsumos") || "[]")

resultado.consumos.forEach(c=>{
mov.push({
insumo:c.insumo,
tipo:"consumo",
cantidad:c.cantidad,
precio:0,
total:0,
fecha:new Date().toISOString().split("T")[0]
})
})

localStorage.setItem("movimientosInsumos",JSON.stringify(mov))

let costos = JSON.parse(localStorage.getItem("produccionCostos") || "[]")

costos.push({
producto,
cantidad:cant,
total:resultado.total,
detalle:resultado.detalle,
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("produccionCostos",JSON.stringify(costos))

alert("Producción registrada OK")

setCantidad(1)
}

return(
<div style={contenedor}>
<h1 style={titulo}>🏭 Producción</h1>

<div style={formulario}>

<select style={input} value={producto} onChange={(e)=>setProducto(e.target.value)}>
<option value="">Seleccionar producto</option>
{productos.map((p,i)=>(
<option key={i} value={p.nombre}>{p.nombre}</option>
))}
</select>

<input style={input} type="number" value={cantidad} onChange={(e)=>setCantidad(Number(e.target.value))}/>

<button style={boton} onClick={registrarProduccion}>
Registrar
</button>

</div>
</div>
)
}

const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"30px",marginBottom:"30px"}
const formulario={display:"flex",flexDirection:"column",gap:"15px",maxWidth:"400px"}
const input={padding:"10px",borderRadius:"6px",border:"1px solid #ccc"}
const boton={background:"#f97316",color:"#fff",border:"none",padding:"12px",borderRadius:"6px"}