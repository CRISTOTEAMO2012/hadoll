"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabase"
export default function Insumos(){

const FIJOS = [
"Tapa Azul",
"Tapa Verde",
"Sticker Azul",
"Sticker 6000 ml",
"Sello Blanco",
"Fajilla 600 ml",
"Fajilla 1 L"
]

const[nuevoInsumo,setNuevoInsumo]=useState("")
const[insumos,setInsumos]=useState([])

const[insumo,setInsumo]=useState("")
const[cantidad,setCantidad]=useState("")
const[precio,setPrecio]=useState("")
const[modo,setModo]=useState("compra")

// 🔥 NUEVO (lo que pediste)
const[tipoGasto,setTipoGasto]=useState("fijo")

const[mensaje,setMensaje]=useState("")

const[inventario,setInventario]=useState({})
const[verInventario,setVerInventario]=useState(true)

useEffect(()=>{

cargarCatalogo()
cargarInventario()

},[])

async function cargarCatalogo(){

const { data, error } = await supabase
.from("catalogo_insumos")
.select("*")
.order("id")

if(error){
console.log(error)
return
}

console.log(data)

setInsumos(data.map(i => i.nombre))

}

async function cargarInventario(){

const { data, error } = await supabase
.from("insumos")
.select("*")

if(error){
console.log(error)
return
}

calcularInventario(data || [])

}

function calcularInventario(data){

let inv = {}

data.forEach(item=>{

let nombre = item.insumo.toLowerCase()

if(!inv[nombre]) inv[nombre]=0

if(
item.tipo==="compra" ||
item.tipo==="existente" ||
item.tipo==="devolucion"
){
inv[nombre] += Number(item.cantidad)
}

if(item.tipo==="danado" || item.tipo==="consumo"){
inv[nombre] -= Number(item.cantidad)
}

})

setInventario(inv)
}

async function agregarInsumo(){

if(nuevoInsumo.trim()==="") return

const { error } = await supabase
.from("catalogo_insumos")
.insert([
{
nombre: nuevoInsumo
}
])

if(error){
alert(error.message)
return
}

await cargarCatalogo()

setNuevoInsumo("")

}

async function eliminarInsumo(nombre){

if(FIJOS.includes(nombre)){
alert("Este insumo es del sistema")
return
}

const { error } = await supabase
.from("catalogo_insumos")
.delete()
.eq("nombre", nombre)

if(error){
alert(error.message)
return
}

await cargarCatalogo()

if(insumo===nombre) setInsumo("")

}

async function registrar(){

if(!insumo){
alert("Seleccione insumo")
return
}

const { error } = await supabase
.from("insumos")
.insert([
{
insumo,
tipo:modo,
cantidad:Number(cantidad),
precio: modo==="compra" ? Number(precio) : 0,
total: modo==="compra" ? Number(cantidad)*Number(precio) : 0,
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"}),
tipogasto: tipoGasto
}
])

if(error){

alert(error.message)
console.log(error)

}
// 🔥 SOLO LOS VARIABLES VAN A FINANZAS
if(modo === "compra" && tipoGasto === "variable"){

const { error: errorGasto } = await supabase
.from("gastos")
.insert([
{
tipo:"Insumo",
descripcion:`${insumo} x ${cantidad}`,
total:Number(cantidad)*Number(precio),
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
}
])

if(errorGasto){
alert(errorGasto.message)
console.log(errorGasto)
}

}

await cargarInventario()

setCantidad(1)
setPrecio(0)
setTipoGasto("fijo")

setMensaje("✅ Movimiento registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)
setInsumo("")
setCantidad("")
setPrecio("")
setTipoGasto("fijo")
}

return(

<div style={container}>
{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}
<h2 style={titulo}>🧪 INSUMOS</h2>

<div style={filaPrincipal}>

<div>

<button onClick={()=>setVerInventario(!verInventario)} style={btnInv}>
📦 Inventario general
</button>

<div style={bloque}>

<h4 style={labelTitulo}>Crear insumo</h4>

<input
value={nuevoInsumo}
onChange={e=>setNuevoInsumo(e.target.value)}
placeholder="Ej: Cloro, Sal..."
style={input}
/>

<button onClick={agregarInsumo} style={guardar}>
Agregar
</button>

{insumos.map((i,idx)=>(
<div key={idx} style={item}>
<span>{i}</span>

{FIJOS.includes(i)
? <span>🔒</span>
: <button onClick={()=>eliminarInsumo(i)} style={btnEliminar}>X</button>
}
</div>
))}

</div>

<div style={bloque}>

<h4 style={labelTitulo}>Movimiento</h4>

<div style={fila}>
<button onClick={()=>setModo("compra")} style={btnModo(modo==="compra")}>Compra</button>
<button onClick={()=>setModo("existente")} style={btnModo(modo==="existente")}>Stock</button>
<button onClick={()=>setModo("danado")} style={btnModo(modo==="danado")}>Dañado</button>
<button onClick={()=>setModo("consumo")} style={btnModo(modo==="consumo")}>Consumo</button>
</div>

<label style={label}>Insumo</label>
<select
value={insumo}
onChange={e=>{

let valor = e.target.value

setInsumo(valor)

if(FIJOS.includes(valor)){
setTipoGasto("fijo")
}else{
setTipoGasto("variable")
}

}}
style={input}
>
<option value="">Seleccione</option>
{insumos.map((i,idx)=>(
<option key={idx}>{i}</option>
))}
</select>

<label style={label}>Cantidad</label>
<input type="number" value={cantidad} onChange={e=>setCantidad(e.target.value)} style={input}/>

{modo==="compra" &&(
<>
<label style={label}>Precio</label>
<input type="number" value={precio} onChange={e=>setPrecio(e.target.value)} style={input}/>

{/* 🔥 AQUÍ ESTÁ EXACTAMENTE LO QUE PEDISTE */}
<label style={label}>Tipo de gasto</label>

<input
value={
tipoGasto==="fijo"
? "Fijo (no afecta finanzas)"
: "Variable (sí afecta finanzas)"
}
readOnly
style={{
...input,
background:"#e5e7eb",
cursor:"not-allowed"
}}
/>

</>
)}
<button onClick={registrar} style={guardar}>
Registrar
</button>

</div>

</div>

{verInventario && (
<div style={bloqueInventario}>

<h3 style={{marginBottom:"15px"}}>Inventario</h3>

{Object.entries(inventario).map(([k,v],i)=>{

let color = "#16a34a"

if(v <= 0) color = "#dc2626"
else if(v <= 10) color = "#f59e0b"

return(
<div key={i} style={cardInv}>

<span style={{textTransform:"capitalize"}}>
{k}
</span>

<div style={{...badgeInv,background:color}}>
{v}
</div>

</div>
)
})}

</div>
)}

</div>

</div>
)
}

// estilos intactos
const container={padding:"40px",background:"#f4f6f9",minHeight:"100vh",color:"#000"}
const titulo={textAlign:"center",marginBottom:"20px"}
const filaPrincipal={display:"flex",gap:"30px",flexWrap:"wrap"}
const bloque={background:"#fff",padding:"20px",borderRadius:"10px",marginBottom:"20px",width:"350px"}

const bloqueInventario={
background:"#fff",
padding:"20px",
borderRadius:"12px",
width:"320px",
boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
}

const cardInv={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"10px 12px",
marginBottom:"8px",
background:"#f8fafc",
borderRadius:"8px",
fontWeight:"500"
}

const badgeInv={
minWidth:"45px",
textAlign:"center",
padding:"6px 10px",
borderRadius:"999px",
color:"#fff",
fontWeight:"bold"
}

const labelTitulo={color:"#000"}
const label={color:"#000",marginTop:"10px"}
const input={width:"100%",padding:"10px",marginTop:"5px",border:"1px solid #ccc",borderRadius:"6px",background:"#fff",color:"#000"}
const guardar={marginTop:"10px",padding:"10px",background:"#16a34a",color:"#fff",border:"none",width:"100%",borderRadius:"6px"}
const fila={display:"flex",gap:"5px",flexWrap:"wrap"}
const btnModo=(a)=>({flex:"1 1 45%",padding:"8px",background:a?"#16a34a":"#e5e7eb",color:a?"#fff":"#000",border:"none",borderRadius:"5px"})
const item={display:"flex",justifyContent:"space-between",marginTop:"5px",background:"#f1f5f9",padding:"5px",borderRadius:"5px"}
const btnEliminar={background:"red",color:"#fff",border:"none",borderRadius:"4px"}
const btnInv={marginBottom:"10px",padding:"10px",background:"#0ea5e9",color:"#fff",border:"none",borderRadius:"6px"}
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