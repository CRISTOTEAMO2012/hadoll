"use client"

import {useEffect,useState} from "react"
import { LoadScript, GoogleMap, Marker, Polyline } from "@react-google-maps/api"
import { supabase } from "@/supabase"
export default function Rutas(){
const fechaEcuador = () => {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "America/Guayaquil" })
    .replace(" ", "T")
}

function ahoraEcuadorISO(){
  const ahora = new Date()
  const ecuador = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Guayaquil" })
  )
  return ecuador.toISOString()
}

const[dia,setDia]=useState("Lunes")
const[clientes,setClientes]=useState([])
const [visitas,setVisitas]=useState<any[]>([])
const [ventas, setVentas] = useState<any[]>([])
const [clienteSeleccionado,setClienteSeleccionado]=useState<any>(null)
const [mostrarVisita,setMostrarVisita]=useState(false)
const [diasReprogramar,setDiasReprogramar]=useState(3)
const [actualizando,setActualizando]=useState(false)

useEffect(() => {
  cargarTodo()
}, [])

async function cargarTodo(){
setActualizando(true)    
let visitasData:any[] = []
let desdeVisitas = 0
const bloqueVisitas = 1000

while(true){

const { data: loteVisitas, error: errorVisitas } = await supabase
.from("visitas_ruta")
.select("*")
.order("id",{ascending:true})
.range(desdeVisitas, desdeVisitas + bloqueVisitas - 1)

if(errorVisitas){

console.log(errorVisitas)

setActualizando(false)

return

}

if(!loteVisitas || loteVisitas.length === 0) break

visitasData = [...visitasData, ...loteVisitas]

if(loteVisitas.length < bloqueVisitas) break

desdeVisitas += bloqueVisitas

}

setVisitas(visitasData)
let data:any[] = []
let desdeClientes = 0
const bloqueClientes = 1000

while(true){

const { data: loteClientes, error } = await supabase
.from("clientes")
.select("*")
.order("id",{ascending:true})
.range(desdeClientes, desdeClientes + bloqueClientes - 1)

if(error){

console.log(error)

setActualizando(false)

return

}

if(!loteClientes || loteClientes.length === 0) break

data = [...data, ...loteClientes]

if(loteClientes.length < bloqueClientes) break

desdeClientes += bloqueClientes

}

setClientes(data)

let ventasData:any[] = []
let desdeVentas = 0
const bloqueVentas = 1000

while(true){

const { data: loteVentas, error: errorVentas } = await supabase
.from("ventas")
.select("id,cliente,fecha")
.order("id",{ascending:true})
.range(desdeVentas, desdeVentas + bloqueVentas - 1)

if(errorVentas){

console.log(errorVentas)

setActualizando(false)

return

}

if(!loteVentas || loteVentas.length === 0) break

ventasData = [...ventasData, ...loteVentas]

if(loteVentas.length < bloqueVentas) break

desdeVentas += bloqueVentas

}

setVentas(ventasData)
setActualizando(false)

}

// 📅 FECHA SEGÚN DÍA
function fechaPorDia(dia){
let hoyFecha = new Date()
let dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]

let hoyIndex = hoyFecha.getDay()
let targetIndex = dias.indexOf(dia)

let diferencia = targetIndex - hoyIndex
if(diferencia < 0) diferencia += 7

let futura = new Date()
futura.setDate(hoyFecha.getDate() + diferencia)

return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Guayaquil"}).format(futura)
}

// 📍 DISTANCIA
function distancia(a,b){
let dx = a.lat - b.lat
let dy = a.lng - b.lng
return Math.sqrt(dx*dx + dy*dy)
}

// 🧠 ORDENAR
function ordenarRuta(lista){

if(lista.length===0) return []

let ordenados=[lista[0]]
let restantes=[...lista.slice(1)]

while(restantes.length){
let ultimo = ordenados[ordenados.length-1]

let cercanoIndex=0
let min=Infinity

restantes.forEach((c,i)=>{
let d = distancia(
{lat:ultimo.lat,lng:ultimo.lng},
{lat:c.lat,lng:c.lng}
)
if(d<min){
min=d
cercanoIndex=i
}
})

ordenados.push(restantes[cercanoIndex])
restantes.splice(cercanoIndex,1)
}

return ordenados
}

// CLIENTES DEL DÍA
let hoy = new Date().toISOString().substring(0,10)

let filtrados = ordenarRuta(

clientes.filter((c:any)=>{

if(
c.dia?.toLowerCase()!==dia.toLowerCase()
)return false

if(!c.lat || !c.lng)
return false

const visitaHoy = visitas.find((v:any)=>

v.cliente_id===c.id &&
v.fecha_visita===hoy

)

return !visitaHoy

})

)

// 🖨️ IMPRIMIR RUTA (AGREGADO)
function imprimirRuta(){

let contenido = `
<h2 style="text-align:center;">RUTA - ${dia}</h2>
<p><b>Fecha:</b> ${fechaPorDia(dia)}</p>
<hr/>
<ol>
${filtrados.map((c,i)=>`
<li style="margin-bottom:10px;">
<b>${i+1}. ${c.nombre}</b><br/>
${c.ciudad || ""}<br/>
${c.direccion || ""}<br/>
<b>Referencia:</b> ${c.referencia || "Sin referencia"}
</li>
`).join("")}
</ol>

<br/>
<p><b>Total clientes:</b> ${filtrados.length}</p>
<br/><br/>
<div>Firma: ____________________________</div>
`

let ventana = window.open("", "", "width=800,height=600")
ventana.document.write(`
<html>
<head>
<title>Ruta ${dia}</title>
<style>
body{font-family:Arial;padding:20px}
</style>
</head>
<body>
${contenido}
</body>
</html>
`)
ventana.document.close()
ventana.print()

}


// 📞
function llamar(c){
let numero = c.telefono?.replace(/\D/g,"")
if(numero) window.open(`tel:${numero}`)
}

// 💬
function whatsapp(c){
let numero = c.telefono?.replace(/\D/g,"")
let mensaje = `Hola ${c.nombre}, hoy pasamos 🚚`
window.open(`https://wa.me/593${numero}?text=${encodeURIComponent(mensaje)}`)
}

// 🧭
function ir(c){
window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`)
}
// 🔥 CLIENTES RECOMENDADOS POR ÚLTIMA COMPRA

let recomendados = clientes.filter((c:any)=>{

const ventasCliente = ventas.filter(
(v:any)=>v.cliente === c.nombre
)

if(ventasCliente.length === 0){
return false
}

let ultimaFecha = ventasCliente
.sort((a:any,b:any)=>
new Date(b.fecha).getTime() -
new Date(a.fecha).getTime()
)[0]

let dias = Math.floor(
(
new Date().getTime() -
new Date(ultimaFecha.fecha).getTime()
)
/(1000*60*60*24)
)

return dias >= 8

})
// MAPA
let centro = filtrados.length > 0
? {
lat: filtrados[0].lat,
lng: filtrados[0].lng
}
: {
lat:-1.67,
lng:-78.65
}
async function registrarVisita(vendido:boolean){

if(!clienteSeleccionado) return

const hoy = new Date()

const proxima = new Date()

if(!vendido){
proxima.setDate(proxima.getDate()+diasReprogramar)
}

const fechaHoy = fechaEcuador()

const fechaProxima = proxima.toLocaleDateString(
"en-CA",
{timeZone:"America/Guayaquil"}
)

const { error } = await supabase
.from("visitas_ruta")

.insert({

  cliente_id: clienteSeleccionado.id,
  fecha_visita: fechaHoy,
  fecha_ecuador: fechaEcuador(),   // 🔥 AGREGA ESTO
  estado: vendido ? "VENDIDO" : "NO VENDIDO",
  motivo_no_venta: vendido ? null : "Reprogramado",
  revisitar_el: vendido ? null : fechaProxima,
  observaciones: null

})

if(error){

console.log(error)
alert("Error al registrar")
return

}

setMostrarVisita(false)

setClienteSeleccionado(null)

await cargarTodo()

alert("✅ Visita registrada")

}
async function registrarVisitaRapida(
  cliente:any,
  vendido:boolean,
  dias:number
){

  const hoy = new Date()

const fechaVisita = fechaEcuador()

  const proxima = new Date()

  proxima.setDate(proxima.getDate()+dias)

  const revisarEl = new Date(proxima).toLocaleString("sv-SE", {
  timeZone: "America/Guayaquil"
}).replace(" ", "T")

  const { error } = await supabase
  .from("visitas_ruta")
 .insert({

  cliente_id: cliente.id,
  fecha_visita: fechaVisita,
  fecha_ecuador: fechaEcuador(),   // 🔥 AGREGA ESTO
  estado: vendido ? "VENDIDO" : "NO VENDIDO",
  motivo_no_venta: vendido ? null : "Reprogramado",
  revisitar_el: vendido ? null : revisarEl,
  observaciones: null

})

  if(error){
    console.log(error)
    alert(error.message)
    return
  }

  await cargarTodo()

  alert("✅ Visita registrada")
}
return(

<div style={container}>

<h1 style={titulo}>🚚 RUTAS</h1>

<div style={top}>

<select value={dia} onChange={e=>setDia(e.target.value)} style={input}>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
</select>

{/* 🖨️ BOTÓN */}
<button onClick={imprimirRuta} style={btnPrint}>
🖨️ Imprimir Ruta
</button>

<button
onClick={cargarTodo}
disabled={actualizando}
style={{
background:"#16a34a",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
opacity:actualizando ? 0.7 : 1
}}
>
{actualizando ? "🔄 Actualizando..." : "🔄 Actualizar"}
</button>

</div>

<LoadScript googleMapsApiKey="AIzaSyC38UAIuSha_SbHHMK_Jf0pnsNDOM7WaH8">
<GoogleMap mapContainerStyle={mapa} center={centro} zoom={13}>

{filtrados.map((c,i)=>(<Marker key={i} position={{
lat:c.lat,
lng:c.lng
}}/>))}
<Polyline
path={
filtrados.map(c=>({
lat:c.lat,
lng:c.lng
}))
}
/>

</GoogleMap>
</LoadScript>

<div style={lista}>

{filtrados.map((c,i)=>(

<div key={i} style={cardCliente}>

<div style={{flex:1}}>

<div
style={{
fontSize:"18px",
fontWeight:"700",
marginBottom:"10px"
}}
>
{i+1}. {c.nombre}
</div>

<p><b>🏙 Ciudad:</b> {c.ciudad}</p>

<p style={{fontSize:"12px",color:"#555"}}>
📍 {c.direccion}
</p>

<p
style={{
fontSize:"13px",
color:"#dc2626",
fontWeight:"bold"
}}
>
📝 Referencia: {c.referencia || "Sin referencia"}
</p>

</div>

<div style={acciones}>

<button style={btnW} onClick={()=>whatsapp(c)}>
💬 WhatsApp
</button>

<button style={btnC} onClick={()=>llamar(c)}>
📞 Llamar
</button>

<button style={btnM} onClick={()=>ir(c)}>
🧭 Mapa
</button>

<button
style={{
background:"#16a34a",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>registrarVisitaRapida(c,true,0)}
>
✅ Vendido
</button>

<button
style={{
background:"#ea580c",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>registrarVisitaRapida(c,false,2)}
>
🔁2
</button>

<button
style={{
background:"#ea580c",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>registrarVisitaRapida(c,false,3)}
>
🔁3
</button>

<button
style={{
background:"#ea580c",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>registrarVisitaRapida(c,false,5)}
>
🔁5
</button>

<button
style={{
background:"#ea580c",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>registrarVisitaRapida(c,false,7)}
>
🔁7
</button>

</div>

</div>

))}

</div>
<h2
style={{
marginTop:"40px",
color:"#b91c1c",
fontSize:"28px",
fontWeight:"bold",
textAlign:"center"
}}
>
🚨 CLIENTES PRIORITARIOS PARA REABASTECIMIENTO 🚨
</h2>

<div style={lista}>

{recomendados.length===0 ? (

<p>Todos los clientes han comprado recientemente.</p>

) : (

recomendados.map((c:any,i:number)=>(

<div key={i} style={cardCliente}>

<div>

<b>{c.nombre}</b>

{(() => {

const ventasCliente = ventas.filter(
(v:any)=>v.cliente === c.nombre
)

const ultima = ventasCliente
.sort((a:any,b:any)=>
new Date(b.fecha).getTime() -
new Date(a.fecha).getTime()
)[0]

const dias = Math.floor(
(
new Date().getTime() -
new Date(ultima.fecha).getTime()
)
/(1000*60*60*24)
)

let estado = ""
let color = ""

if(dias >= 15){
estado = "🔴 VISITA URGENTE"
color = "#dc2626"
}
else if(dias >= 11){
estado = "🟠 VISITA PRIORITARIA"
color = "#ea580c"
}
else{
estado = "🟡 RECOMENDADO VISITAR"
color = "#ca8a04"
}

return (

<>

<p>
📅 Última compra hace <b>{dias}</b> días
</p>

<p
style={{
color,
fontWeight:"bold"
}}
>
{estado}
</p>

<p><b>🏙 Ciudad:</b> {c.ciudad}</p>

<p
style={{
fontSize:"12px",
color:"#555"
}}
>
📍 {c.direccion}
</p>

<p
style={{
fontSize:"13px",
color:"#dc2626",
fontWeight:"bold"
}}
>
📝 Referencia: {c.referencia || "Sin referencia"}
</p>

</>

)

})()}

</div>

<div style={acciones}>

<button
style={btnW}
onClick={()=>whatsapp(c)}
>
💬 WhatsApp
</button>

<button
style={btnC}
onClick={()=>llamar(c)}
>
📞 Llamar
</button>

<button
style={btnM}
onClick={()=>ir(c)}
>
🧭 Mapa
</button>
<button
style={{
background:"#2563eb",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginTop:"5px"
}}
onClick={()=>{
setClienteSeleccionado(c)
setMostrarVisita(true)
}}
>
✅ Visita
</button>

</div>

</div>

))

)}
{mostrarVisita && clienteSeleccionado && (

<div
style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}}
>

<div
style={{
background:"#fff",
padding:"30px",
borderRadius:"15px",
width:"500px"
}}
>

<h2>🚚 Registrar Visita</h2>

<hr/>

<p>

<b>Cliente:</b> {clienteSeleccionado.nombre}

</p>

<p>

¿Se realizó la venta?

</p>

<button
onClick={()=>registrarVisita(true)}
style={{
background:"#16a34a",
color:"#fff",
border:"none",
padding:"12px 18px",
borderRadius:"8px",
cursor:"pointer",
width:"100%",
marginBottom:"15px"
}}
>
✅ Visitado y Vendido
</button>

<p>

Si no compró...

</p>

<select
value={diasReprogramar}
onChange={(e)=>setDiasReprogramar(Number(e.target.value))}
style={{
width:"100%",
padding:"10px",
marginBottom:"15px"
}}
>

<option value={2}>Volver en 2 días</option>

<option value={3}>Volver en 3 días</option>

<option value={5}>Volver en 5 días</option>

<option value={7}>Volver en 7 días</option>

</select>

<button
onClick={()=>registrarVisita(false)}
style={{
background:"#ea580c",
color:"#fff",
border:"none",
padding:"12px 18px",
borderRadius:"8px",
cursor:"pointer",
width:"100%",
marginBottom:"15px"
}}
>
❌ Visitado pero NO compró
</button>

<button
onClick={()=>setMostrarVisita(false)}
style={{
background:"#dc2626",
color:"#fff",
border:"none",
padding:"12px 18px",
borderRadius:"8px",
cursor:"pointer",
width:"100%"
}}
>
Cerrar
</button>

</div>

</div>

)}
</div>
</div>
)
}

// 🎨 ESTILOS
const container={
background:"#f8fafc",
padding:"25px",
color:"#111827",
maxWidth:"1300px",
margin:"0 auto"
}
const titulo={fontSize:"26px",marginBottom:"10px"}
const top={marginBottom:"10px",display:"flex",gap:"10px",alignItems:"center"}

const input={padding:"8px",border:"1px solid #ccc",borderRadius:"6px"}

const btnPrint={
background:"#111827",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const mapa={
  width:"100%",
  height:"420px",
  marginBottom:"20px"
}
const lista={display:"flex",flexDirection:"column",gap:"10px"}

const cardCliente={
padding:"18px",
borderRadius:"14px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
border:"1px solid #e5e7eb",
background:"#fff",
boxShadow:"0 3px 10px rgba(0,0,0,0.08)",
marginBottom:"12px"
}

const acciones={
display:"flex",
flexWrap:"wrap",
justifyContent:"flex-end",
alignItems:"center",
gap:"6px",
width:"360px"
}

const btnW={
background:"#25D366",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"600",
fontSize:"13px",
minWidth:"90px"
}

const btnC={
background:"#2563eb",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"600",
fontSize:"13px",
minWidth:"90px"
}

const btnM={
background:"#f59e0b",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"600",
fontSize:"13px",
minWidth:"90px"
}

