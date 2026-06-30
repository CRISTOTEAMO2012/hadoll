"use client"

import {useEffect,useState} from "react"
import { LoadScript, GoogleMap, Marker, Polyline } from "@react-google-maps/api"
import { supabase } from "@/supabase"
export default function Rutas(){

const[dia,setDia]=useState("Lunes")
const[clientes,setClientes]=useState([])
const [ventas,setVentas]=useState<any[]>([])

useEffect(()=>{
cargarTodo()
const i=setInterval(cargarTodo,2000)
return ()=>clearInterval(i)
},[])

async function cargarTodo(){

const { data, error } = await supabase
.from("clientes")
.select("*")

if(error){
console.log(error)
return
}

setClientes(data || [])

const { data: ventasData, error: errorVentas } = await supabase
.from("ventas")
.select("cliente,fecha")

if(errorVentas){
console.log(errorVentas)
return
}

setVentas(ventasData || [])

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
let filtrados = ordenarRuta(
clientes.filter(
c =>
c.dia?.toLowerCase() === dia.toLowerCase() &&
c.lat &&
c.lng
)
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

<div>

<b>{i+1}. {c.nombre}</b>

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

<button style={btnW} onClick={()=>whatsapp(c)}>💬</button>
<button style={btnC} onClick={()=>llamar(c)}>📞</button>
<button style={btnM} onClick={()=>ir(c)}>🧭</button>

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
💬
</button>

<button
style={btnC}
onClick={()=>llamar(c)}
>
📞
</button>

<button
style={btnM}
onClick={()=>ir(c)}
>
🧭
</button>

</div>

</div>

))

)}

</div>
</div>
)
}

// 🎨 ESTILOS
const container={background:"#fff",padding:"30px",color:"#000"}
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


const mapa={width:"100%",height:"300px",marginBottom:"20px"}

const lista={display:"flex",flexDirection:"column",gap:"10px"}

const cardCliente={
padding:"12px",
borderRadius:"10px",
display:"flex",
justifyContent:"space-between",
border:"1px solid #ddd"
}

const acciones={display:"flex",gap:"6px"}

const btnW={background:"#25D366",color:"#fff",padding:"6px",border:"none"}
const btnC={background:"#2563eb",color:"#fff",padding:"6px",border:"none"}
const btnM={background:"#f59e0b",color:"#fff",padding:"6px",border:"none"}