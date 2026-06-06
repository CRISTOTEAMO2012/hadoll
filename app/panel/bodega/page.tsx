"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabase"
export default function Bodega(){

const[modo,setModo]=useState("compra")

const[producto,setProducto]=useState("")
const[cantidad,setCantidad]=useState("")
const[precio,setPrecio]=useState("")
const[destino,setDestino]=useState("")

const [historial, setHistorial] = useState<any[]>([])
const[mostrarHistorial,setMostrarHistorial]=useState(false)

// 🔍 FILTROS
const[filtroTexto,setFiltroTexto]=useState("")
const[filtroDesde,setFiltroDesde]=useState("")
const[filtroHasta,setFiltroHasta]=useState("")

// 💰 TOTALES
const[totalFiltrado,setTotalFiltrado]=useState(0)
const[totalGeneral,setTotalGeneral]=useState(0)
const[mensaje,setMensaje]=useState("")

// ✅ CLAVES CORRECTAS
const productos = [
{value:"botellon20llave_vacios", label:"Botellón 20L con llave"},
{value:"botellon20sin_llave_vacios", label:"Botellón 20L sin llave"},
{value:"llave_botellon", label:"Llave de botellón"},
{value:"botella600", label:"Botella 600 ml"},
{value:"botella6000", label:"Botella 6000 ml"},
{value:"botella1L", label:"Botella 1L"}
]

// 🔥 NO VAN A FINANZAS
const NO_GASTO = ["botella600","botella6000","botella1L"]

useEffect(()=>{cargarHistorial()},[])

async function cargarHistorial(){

// 🔥 COMPRAS CON GASTO
const { data: gastosData = [] } = await supabase
.from("gastos")
.select("*")

let compras = gastosData
.filter((g:any) => g.tipo === "Compra inventario")
.map((c:any) => ({
...c,
producto: c.descripcion || "",
movimiento:"Compra con gasto"
}))

// 🔥 DAÑADOS
const { data: danadosData = [] } = await supabase
.from("bodega")
.select("*")
.eq("modo","danado")

let danados = danadosData.map((d:any)=>({
...d,
movimiento:"Dañado"
}))

// 🔥 STOCK EXISTENTE
const { data: existentesData = [] } = await supabase
.from("bodega")
.select("*")
.eq("modo","existente")

let existentes = existentesData.map((e:any)=>({
...e,
movimiento:"Stock existente"
}))

// 🔥 COMPRAS SIN GASTO
const { data: comprasSinGastoData = [] } = await supabase
.from("bodega")
.select("*")

let comprasSinGasto = comprasSinGastoData
.filter((c:any)=>
NO_GASTO.includes(c.producto) &&
c.modo === "compra"
)
.map((c:any)=>({
...c,
movimiento:"Compra sin gasto"
}))

// 🔥 UNIR TODO
let historialCompleto = [
...compras,
...danados,
...existentes,
...comprasSinGasto
]

// 🔥 ORDENAR
historialCompleto.sort((a:any,b:any)=>
Number(new Date(b.fecha)) - Number(new Date(a.fecha))
)

let totalG = 0

compras.forEach((c: any) => totalG += Number(c.total || 0))

setTotalGeneral(totalG)

let filtrado = historialCompleto.filter(c=>{

let texto = (c.producto || "").toLowerCase()

let coincideTexto = texto.includes(filtroTexto.toLowerCase())

let coincideDesde = filtroDesde ? c.fecha >= filtroDesde : true

let coincideHasta = filtroHasta ? c.fecha <= filtroHasta : true

return coincideTexto && coincideDesde && coincideHasta

})

let totalF = 0

filtrado.forEach(f=>{
if(f.total){
totalF += Number(f.total || 0)
}
})

setTotalFiltrado(totalF)

setHistorial(filtrado)

}

useEffect(()=>{
if(mostrarHistorial){
cargarHistorial()
}
},[filtroTexto,filtroDesde,filtroHasta,mostrarHistorial])

function base(){
return{empresa:{},dorita:{}}
}

// 🔥 NOMBRE BONITO
function nombreBonito(clave: string){

if(clave==="botellon20llave_vacios") return "Botellón 20L con llave"
if(clave==="botellon20sin_llave_vacios") return "Botellón 20L sin llave"
if(clave==="llave_botellon") return "Llave de botellón"
if(clave==="botella600") return "Botella 600 ml"
if(clave==="botella6000") return "Botella 6000 ml"
if(clave==="botella1L") return "Botella 1L"

return clave

}

async function ejecutar(){

let { data: inventarioData } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

// SI NO EXISTE INVENTARIO, CREARLO
if(!inventarioData){

const { error: crearError } = await supabase
.from("inventario")
.insert([
{
id:1,
empresa:{},
dorita:{}
}
])

if(crearError){
alert("No se pudo crear inventario")
console.log(crearError)
return
}

inventarioData = {
empresa:{},
dorita:{}
}

}

let inventario = {
empresa: inventarioData.empresa || {},
dorita: inventarioData.dorita || {}
}

if(!inventario[destino][producto]){
inventario[destino][producto]=0
}

if(modo==="compra"){

inventario[destino][producto] += Number(cantidad)
const { error } = await supabase
.from("bodega")
.insert([
{
producto,
cantidad:Number(cantidad),
precio:Number(precio),
destino,
modo,
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
}
])

if(error){

alert(error.message)
console.log(error)

}else{

}
// 🔥 COMPRAS SIN GASTO
if(NO_GASTO.includes(producto)){

}

// 🔥 COMPRAS CON GASTO
if(!NO_GASTO.includes(producto)){

const { error } = await supabase
.from("gastos")
.insert([
{
tipo:"Compra inventario",
descripcion:`${producto} x ${cantidad}`,
total:Number(cantidad)*Number(precio),
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
}
])

if(error){
alert(error.message)
console.log(error)
}

if(error){
alert(error.message)
console.log(error)
}

}

setMensaje("✅ COMPRA REGISTRADA")

setTimeout(()=>{
setMensaje("")
},3000)
}

if(modo==="existente"){

inventario[destino][producto] += Number(cantidad)
await supabase
.from("bodega")
.insert([
{
producto,
cantidad:Number(cantidad),
precio:0,
destino,
modo,
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
}
])
// 🔥 GUARDAR HISTORIAL

setMensaje("✅ STOCK EXISTENTE AGREGADO")

setTimeout(()=>{
setMensaje("")
},3000)
}

if(modo==="danado"){

inventario[destino][producto] -= Number(cantidad)
await supabase
.from("bodega")
.insert([
{
producto,
cantidad:Number(cantidad),
precio:0,
destino,
modo,
fecha:new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
}
])
// 🔥 GUARDAR HISTORIAL DE DAÑADOS

setMensaje("✅ STOCK DAÑADO DESCONTADO")

setTimeout(()=>{
setMensaje("")
},3000)
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
if(mostrarHistorial){
cargarHistorial()
}
setProducto("")
setCantidad("")
setDestino("")
setPrecio("")
}
const animacion = `
@keyframes zoomIn {
0%{
transform:scale(0.7);
opacity:0;
}
100%{
transform:scale(1);
opacity:1;
}
}
`
return(

<div style={container}>

<style>{animacion}</style>

<div style={bloque}>

<h2 style={titulo}>🏬 BODEGA GENERAL</h2>
{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

<div style={contenedorBotones}>
<button onClick={()=>setModo("compra")} style={botonModo(modo==="compra")}>Compra</button>
<button onClick={()=>setModo("existente")} style={botonModo(modo==="existente")}>Stock existente</button>
<button onClick={()=>setModo("danado")} style={botonModo(modo==="danado")}>Dañados</button>
</div>

<label style={label}>Producto</label>

<select value={producto} onChange={e=>setProducto(e.target.value)} style={input}>
<option value="">Seleccione producto</option>

{productos.map((p,i)=>(
<option key={i} value={p.value}>{p.label}</option>
))}
</select>

<label style={label}>Cantidad</label>

<input
type="number"
value={cantidad}
onChange={e=>setCantidad(e.target.value)}
style={input}
/>

{modo==="compra" &&(
<>
<label style={label}>Precio unitario</label>

<input
type="number"
value={precio}
onChange={e=>setPrecio(Number(e.target.value))}
style={input}
/>
</>
)}

<label style={label}>Destino</label>

<select
value={destino}
onChange={e=>setDestino(e.target.value)}
style={input}
>
<option value="">Seleccione destino</option>  
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<button onClick={ejecutar} style={guardar}>
Registrar
</button>

</div>

<div style={acciones}>
<button
onClick={()=>setMostrarHistorial(!mostrarHistorial)}
style={btnAzul}
>
Historial
</button>
</div>

{mostrarHistorial && (

<div style={historialBox}>

<div style={totales}>
<div>Total filtrado: <b>${totalFiltrado}</b></div>
<div>Total general: <b>${totalGeneral}</b></div>
</div>

{historial.map((h,i)=>(

<div key={i} style={itemHistorial}>

<div>{h.fecha}</div>

<div>{nombreBonito(h.producto)}</div>

<div>{h.cantidad}</div>

<div>{h.movimiento}</div>

<div>
<b>
{h.total
? `$${h.total}`
: h.precio
? `$${h.precio}`
: "Sin gasto"}
</b>
</div>

</div>

))}

</div>

)}

</div>
)
}

// 🎨 ESTILOS (SIN TOCAR)
const container={background:"#f1f5f9",minHeight:"100vh",padding:"30px",color:"#111"}
const bloque={background:"#ffffff",padding:"20px",borderRadius:"12px",width:"360px",margin:"auto",color:"#111"}
const titulo: React.CSSProperties = {
  textAlign: "center",
  color: "#111"
}
const label={marginTop:"10px", color:"#111"}
const contenedorBotones={display:"flex",gap:"10px"}
const botonModo=(a: boolean)=>({flex:1,padding:"8px",background:a?"#16a34a":"#e5e7eb",color:a?"#fff":"#111",border:"none",borderRadius:"6px",cursor:"pointer"})
const input={margin:"5px 0",padding:"10px",width:"100%",border:"1px solid #ccc",borderRadius:"6px",background:"#fff",color:"#111"}
const guardar={background:"#16a34a",color:"#fff",padding:"10px",width:"100%",border:"none",borderRadius:"6px",cursor:"pointer"}
const acciones={display:"flex",justifyContent:"center",marginTop:"20px"}
const btnAzul={background:"#2563eb",color:"#fff",padding:"10px",border:"none",borderRadius:"6px",cursor:"pointer"}
const historialBox={background:"#ffffff",marginTop:"20px",padding:"15px",borderRadius:"10px",color:"#111"}
const itemHistorial={display:"grid",gridTemplateColumns:"repeat(5,1fr)",borderBottom:"1px solid #e5e7eb",padding:"8px",fontSize:"14px"}
const totales={display:"flex",justifyContent:"space-between",marginBottom:"10px",fontWeight:"bold"}
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
padding:"35px 60px",
borderRadius:"20px",
fontWeight:"bold",
fontSize:"32px",
textAlign:"center" as const,
boxShadow:"0 10px 40px rgba(0,0,0,0.4)",
animation:"zoomIn 0.3s ease"
}