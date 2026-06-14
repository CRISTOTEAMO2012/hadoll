"use client"

import {useState,useEffect} from "react"
import { supabase } from "@/supabase"
export default function Produccion(){

const [productos,setProductos]=useState([])
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")
const [mensaje,setMensaje]=useState("")

useEffect(()=>{

cargarProductos()

},[])

async function cargarProductos(){

const { data, error } = await supabase
.from("productos")
.select("*")
.order("id")

if(error){
console.log(error)
return
}

setProductos(data || [])

}

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
function fechaEcuador(){
return new Date().toLocaleDateString(
"en-CA",
{
timeZone:"America/Guayaquil"
}
)
}

// COSTO INSUMOS
async function costoInsumo(nombre){

const { data = [] } = await supabase
.from("insumos")
.select("*")

let compras = data.filter(i =>
normalizar(i.insumo) === normalizar(nombre) &&
i.tipo === "compra" &&
Number(i.precio) > 0
)

if(compras.length === 0) return 0

let totalDinero = 0
let totalCantidad = 0

compras.forEach(c=>{
totalDinero += Number(c.total || 0)
totalCantidad += Number(c.cantidad || 0)
})

return totalCantidad ? totalDinero / totalCantidad : 0
}

async function costoBotella(clave){

const { data = [] } = await supabase
.from("bodega")
.select("*")

let nombre = ""

if(clave === "botella600") nombre = "botella600"
if(clave === "botella1L") nombre = "botella1L"
if(clave === "botella6000") nombre = "botella6000"

let compras = data.filter(i =>
i.producto === nombre &&
i.modo === "compra" &&
Number(i.precio) > 0
)

if(compras.length === 0) return 0

let totalDinero = 0
let totalCantidad = 0

compras.forEach(c=>{
totalDinero += Number(c.precio || 0) * Number(c.cantidad || 0)
totalCantidad += Number(c.cantidad || 0)
})

return totalCantidad ? totalDinero / totalCantidad : 0
}

// DETALLE
async function calcularCostoDetallado(tipo,cant){

let detalle = []
let total = 0
let consumos = []

async function usar(nombre,cantidadPorUnidad){

let costo = await costoInsumo(nombre)

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

// BOTELLAS
async function usarBotella(nombre,clave,cantidadPorUnidad){

let costo = await costoBotella(clave)

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
await usar("Tapa Verde",1)
await usar("Sticker Azul",1)
await usar("Sello Blanco",1)
}

if(tipo==="botellon_sin_llave"){
await usar("Tapa Azul",1)
await usar("Sticker Azul",1)
await usar("Sello Blanco",1)
}

if(tipo==="paca15"){
await usar("Fajilla 600 ml",15)
await usarBotella("Botella 600 ml","botella600",15)
}

if(tipo==="paca24"){
await usar("Fajilla 600 ml",24)
await usarBotella("Botella 600 ml","botella600",24)
}

if(tipo==="botella1L"){
await usar("Fajilla 1 L",1)
await usarBotella("Botella 1L","botella1L",1)
}

if(tipo==="botella6000"){
await usar("Sticker 6000 ml",1)
await usarBotella("Botella 6000 ml","botella6000",1)
}

return {detalle,total,consumos}
}

async function registrarProduccion(){

if(producto===""){
alert("Seleccione producto")
return
}

let tipo = tipoProducto(producto)

if(!tipo){
alert("Producto no válido")
return
}

const { data: inventarioData, error: inventarioError } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

if(inventarioError){
alert("No se pudo leer inventario")
return
}

let inventario = {
empresa: inventarioData.empresa,
dorita: inventarioData.dorita
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



await supabase
.from("inventario")
.upsert([
{
id:1,
empresa: inventario.empresa,
dorita: inventario.dorita
}
])

let resultado = await calcularCostoDetallado(tipo,cant)

for(const c of resultado.consumos){

await supabase
.from("insumos")
.insert([
{
insumo:c.insumo,
tipo:"consumo",
cantidad:c.cantidad,
precio:0,
total:0,
fecha:fechaEcuador(),
tipogasto:"fijo"
}
])

}

await supabase
.from("produccion")
.insert([
{
producto,
cantidad:cant,
total:resultado.total,
detalle:resultado.detalle,
fecha:fechaEcuador()
}
])

setMensaje("✅ Producción registrada correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

setProducto("")
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
<h1 style={titulo}>🏭 Producción</h1>

<div style={formulario}>

<div style={gridProductos}>

{productos.map((p:any,i)=>(

<button
key={i}
type="button"
onClick={()=>setProducto(p.nombre)}
style={
producto===p.nombre
? productoActivo
: productoCard
}
>

{p.nombre.includes("con llave") && "🫙🔑"}
{p.nombre.includes("sin llave") && "🫙"}

{p.nombre.includes("Paca 15") && "📦15"}
{p.nombre.includes("Paca 24") && "📦24"}

{p.nombre.includes("1L") && "🥤1L"}

{p.nombre.includes("6000") && "💧6L"}

<br/>

{p.nombre}

</button>

))}

</div>

<input
style={{
...input,
fontSize:"24px",
fontWeight:"bold",
textAlign:"center"
}}
type="number"
placeholder="Cantidad a producir"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
/>
{producto && (

<div style={resumenBox}>

<h3>📋 Producción seleccionada</h3>

<p>
<b>Producto:</b> {producto}
</p>

<p>
<b>Cantidad:</b> {cantidad || 0}
</p>

</div>

)}
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
const gridProductos={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
gap:"18px"
}

const productoCard={
background:"#ffffff",
border:"2px solid #cbd5e1",
borderRadius:"16px",
padding:"25px",
cursor:"pointer",
fontWeight:"bold",
fontSize:"20px",
minHeight:"130px"
}

const productoActivo={
background:"#f97316",
color:"#fff",
border:"2px solid #ea580c",
borderRadius:"16px",
padding:"25px",
cursor:"pointer",
fontWeight:"bold",
fontSize:"20px",
minHeight:"130px"
}

const resumenBox={
background:"#fff7ed",
border:"2px solid #fdba74",
padding:"15px",
borderRadius:"12px"
}