"use client"

import { useState, useEffect } from "react"
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { supabase } from "@/supabase"

export default function Clientes(){

const [nombre,setNombre]=useState("")
const [direccion,setDireccion]=useState("")
const [referencia,setReferencia]=useState("")
const [telefono,setTelefono]=useState("")
const [dia,setDia]=useState("Lunes")
const [ciudad,setCiudad]=useState("")
const [coords,setCoords]=useState<any>(null)

const [clientes, setClientes] = useState<any[]>([])

const [buscar,setBuscar]=useState("")
const [filtroDia,setFiltroDia]=useState("Todos")
const [filtroCiudad,setFiltroCiudad]=useState("Todas")

const [editandoIndex,setEditandoIndex]=useState<any>(null)

const [mensaje,setMensaje]=useState("")
const [mostrarRepetidos,setMostrarRepetidos]=useState(false)

function normalizarTexto(texto:any){

return String(texto || "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase()
.replace(/\s+/g," ")
.trim()

}

const nombreNormalizado = normalizarTexto(nombre)
const referenciaNormalizada = normalizarTexto(referencia)

const posiblesDuplicados = clientes
.filter((c:any)=>{

if(editandoIndex !== null && c.id === editandoIndex){
return false
}

const nombreCliente = normalizarTexto(c.nombre)
const referenciaCliente = normalizarTexto(c.referencia)

const coincideNombre =
nombreNormalizado.length >= 5 &&
(
nombreCliente.includes(nombreNormalizado) ||
nombreNormalizado.includes(nombreCliente)
)

const coincideReferencia =
referenciaNormalizada.length >= 5 &&
(
referenciaCliente.includes(referenciaNormalizada) ||
referenciaNormalizada.includes(referenciaCliente)
)

return coincideNombre || coincideReferencia

})
.slice(0,5)

const clientesPotencialmenteRepetidos = clientes
.map((cliente:any,index:number)=>{

const nombreCliente = normalizarTexto(cliente.nombre)
const referenciaCliente = normalizarTexto(cliente.referencia)

const similares = clientes.filter((otro:any,otroIndex:number)=>{

if(index === otroIndex) return false

const nombreOtro = normalizarTexto(otro.nombre)
const referenciaOtro = normalizarTexto(otro.referencia)

const nombreParecido =
nombreCliente.length >= 5 &&
nombreOtro.length >= 5 &&
(
nombreCliente.includes(nombreOtro) ||
nombreOtro.includes(nombreCliente)
)

const referenciaParecida =
referenciaCliente.length >= 5 &&
referenciaOtro.length >= 5 &&
(
referenciaCliente.includes(referenciaOtro) ||
referenciaOtro.includes(referenciaCliente)
)

return nombreParecido || referenciaParecida

})

return {
cliente,
similares
}

})
.filter((grupo:any)=>grupo.similares.length > 0)

// CARGAR CLIENTES
useEffect(()=>{

async function cargarClientes(){

let data:any[] = []
let desde = 0
const bloque = 1000

while(true){

const { data: lote, error } = await supabase
.from("clientes")
.select("*")
.order("id",{ascending:false})
.range(desde, desde + bloque - 1)

if(error){
console.log(error)
return
}

if(!lote || lote.length === 0) break

data = [...data, ...lote]

if(lote.length < bloque) break

desde += bloque

}

setClientes(data || [])

}


cargarClientes()

},[])

// EXPORTAR EXCEL
function exportarExcel(){

if(clientes.length===0){
alert("No hay clientes para exportar")
return
}

let datos = clientes.map((c,i)=>({

"N°": i+1,
"Nombre": c.nombre,
"Dirección": c.direccion,
"Referencia": c.referencia,
"Ciudad": c.ciudad,
"Teléfono": c.telefono,
"Día de Ruta": c.dia,
"Latitud": c.coords?.lat || "",
"Longitud": c.coords?.lng || ""

}))

const worksheet = XLSX.utils.json_to_sheet(datos)

worksheet["!cols"] = [
{ wch: 5 },
{ wch: 25 },
{ wch: 40 },
{ wch: 25 },
{ wch: 20 },
{ wch: 18 },
{ wch: 15 },
{ wch: 12 },
{ wch: 12 }
]

const workbook = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
workbook,
worksheet,
"Clientes"
)

const excelBuffer = XLSX.write(
workbook,
{
bookType:"xlsx",
type:"array"
}
)

const data = new Blob(
[excelBuffer],
{
type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
)

let fecha = new Date().toLocaleDateString(
"en-CA",
{
timeZone:"America/Guayaquil"
}
)

saveAs(
data,
`Clientes_${fecha}.xlsx`
)

}

// OBTENER DIRECCIÓN
async function obtenerDatos(lat:any,lng:any){

try{

let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC38UAIuSha_SbHHMK_Jf0pnsNDOM7WaH8`)

let data = await res.json()

if(data.status !== "OK"){
console.log(data)
return
}

let dir = data.results[0]?.formatted_address || ""
setDireccion(dir)

let componentes = data.results[0]?.address_components || []

let canton = ""

componentes.forEach((c:any)=>{

if(c.types.includes("locality")) canton = c.long_name

if(c.types.includes("administrative_area_level_2")) canton = c.long_name

})

setCiudad(canton)

}catch(err){

console.log(err)

}

}

// UBICACIÓN
function usarUbicacion(){

if(!navigator.geolocation){
alert("Tu navegador no permite ubicación")
return
}

navigator.geolocation.getCurrentPosition(

async (pos)=>{

let lat = pos.coords.latitude
let lng = pos.coords.longitude

setCoords({lat,lng})

await obtenerDatos(lat,lng)

},

()=>{
alert("No se pudo obtener ubicación")
}

)

}

// GUARDAR CLIENTE
async function guardarCliente(){

if(nombre===""){
alert("Ingrese nombre")
return
}

// EDITAR
if(editandoIndex !== null){

let clienteEditar:any = clientes.find((c:any)=>c.id === editandoIndex)

const { error } = await supabase
.from("clientes")
.update({
nombre,
direccion,
referencia,
telefono,
dia,
ciudad,
lat: coords?.lat || null,
lng: coords?.lng || null
})
.eq("id", clienteEditar.id)

if(error){

alert("ERROR EDITANDO")
console.log(error)
return

}

let nuevos = clientes.map((c:any)=>

c.id === editandoIndex
? {
...c,
nombre,
direccion,
referencia,
telefono,
dia,
ciudad,
lat:coords?.lat || null,
lng:coords?.lng || null
}
: c

)

setClientes(nuevos)

setEditandoIndex(null)

}else{

// NUEVO CLIENTE
const { data: nuevoCliente, error } = await supabase
.from("clientes")
.insert({
nombre,
direccion,
referencia,
telefono,
dia,
ciudad,
lat: coords?.lat || null,
lng: coords?.lng || null
})
.select()

if(error){

console.log(error)
alert("ERROR AL GUARDAR")
return

}

setClientes([
nuevoCliente[0],
...clientes
])

}

// LIMPIAR
setNombre("")
setDireccion("")
setReferencia("")
setTelefono("")
setDia("Lunes")
setCiudad("")
setCoords(null)

setMensaje("✅ CLIENTE GUARDADO EXITOSAMENTE")

setTimeout(()=>{
setMensaje("")
},3000)

}

// EDITAR
function editarCliente(c:any){

setNombre(c.nombre)
setDireccion(c.direccion)
setReferencia(c.referencia || "")
setTelefono(c.telefono)
setDia(c.dia)
setCiudad(c.ciudad)

if(c.lat && c.lng){

setCoords({
lat:c.lat,
lng:c.lng
})

}else{

setCoords(null)

}

setEditandoIndex(c.id)

}

// BORRAR
async function borrarCliente(cliente:any){

if(!confirm("¿Eliminar cliente?")) return

const { error } = await supabase
.from("clientes")
.delete()
.eq("id", cliente.id)

if(error){

alert("ERROR AL BORRAR")
console.log(error)
return

}

setClientes(
clientes.filter((c:any)=>c.id !== cliente.id)
)

alert("CLIENTE ELIMINADO ✅")

}

// FILTROS
let lista = clientes

if(filtroDia!=="Todos"){
lista = lista.filter(c=>c.dia===filtroDia)
}

if(filtroCiudad!=="Todas"){
lista = lista.filter(c=>c.ciudad===filtroCiudad)
}

if(buscar!==""){

lista = lista.filter(c=>

(c.nombre || "")
.toLowerCase()
.includes(buscar.toLowerCase())

||

(c.referencia || "")
.toLowerCase()
.includes(buscar.toLowerCase())

)

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

<div style={contenedor}>

<style>{animacion}</style>

<h1 style={titulo}>👥 CLIENTES PRO + MAPA</h1>

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

<h2>
{editandoIndex !== null ? "Editar cliente" : "Registrar cliente"}
</h2>

<input
style={input}
placeholder="Nombre"
value={nombre}
onChange={e=>setNombre(e.target.value)}
/>

<input
style={input}
placeholder="Dirección automática"
value={direccion}
readOnly
/>

<input
style={input}
placeholder="Referencia"
value={referencia}
onChange={e=>setReferencia(e.target.value)}
/>

{posiblesDuplicados.length > 0 && (

<div style={alertaDuplicado}>

<div style={{fontWeight:"bold",marginBottom:"8px"}}>
⚠️ CLIENTE POSIBLEMENTE YA AGREGADO
</div>

{posiblesDuplicados.map((c:any)=>(

<div key={c.id} style={{marginBottom:"5px"}}>

<b>{c.nombre}</b>

{c.referencia && (
<span> — {c.referencia}</span>
)}

</div>

))}

</div>

)}

<input
style={input}
placeholder="Teléfono"
value={telefono}
onChange={e=>setTelefono(e.target.value)}
/>

<input
style={input}
placeholder="Cantón automático"
value={ciudad}
readOnly
/>

<select
style={input}
value={dia}
onChange={e=>setDia(e.target.value)}
>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
<option>Domingo</option>
</select>

<button
style={botonUbicacion}
onClick={usarUbicacion}
>
📍 Usar mi ubicación
</button>

<LoadScript googleMapsApiKey="AIzaSyC38UAIuSha_SbHHMK_Jf0pnsNDOM7WaH8">

<GoogleMap
mapContainerStyle={{
width:"100%",
height:"300px",
marginTop:"10px",
borderRadius:"10px"
}}
center={coords || {lat:-1.67,lng:-78.65}}
zoom={13}
options={{
zoomControl:true
}}
onClick={async (e)=>{

let lat = e.latLng?.lat()
let lng = e.latLng?.lng()

setCoords({lat,lng})

await obtenerDatos(lat,lng)

}}
>

{coords && <Marker position={coords} />}

</GoogleMap>

</LoadScript>

<button
style={botonGuardar}
onClick={guardarCliente}
>
{editandoIndex !== null ? "Actualizar cliente" : "Guardar cliente"}
</button>

<hr style={{margin:"40px 0"}}/>

<h2>Buscar clientes</h2>

<button
style={{
background:"#f59e0b",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginBottom:"15px",
marginRight:"10px"
}}
onClick={()=>setMostrarRepetidos(!mostrarRepetidos)}
>
⚠️ Potencialmente repetidos ({clientesPotencialmenteRepetidos.length})
</button>

{mostrarRepetidos && (

<div style={{
background:"#fff7ed",
border:"2px solid #f59e0b",
padding:"15px",
borderRadius:"10px",
marginBottom:"20px"
}}>

<h3>
⚠️ Clientes potencialmente repetidos
</h3>

{clientesPotencialmenteRepetidos.length === 0 ? (

<p>No se encontraron posibles duplicados ✅</p>

) : (

clientesPotencialmenteRepetidos.map((grupo:any)=>(

<div
key={grupo.cliente.id}
style={{
background:"#fff",
padding:"15px",
borderRadius:"8px",
marginBottom:"15px",
border:"1px solid #fed7aa"
}}
>

<div style={{
fontWeight:"bold",
fontSize:"16px",
marginBottom:"5px"
}}>
{grupo.cliente.nombre}
</div>

<div>
📝 Referencia: {grupo.cliente.referencia || "Sin referencia"}
</div>

<div>
🏙 Ciudad: {grupo.cliente.ciudad || ""}
</div>

<div>
📞 {grupo.cliente.telefono || ""}
</div>


<div style={{
marginTop:"12px",
padding:"10px",
background:"#fef3c7",
borderRadius:"6px"
}}>

<div style={{
fontWeight:"bold",
color:"#92400e",
marginBottom:"8px"
}}>
🔎 SE PARECE A:
</div>

{grupo.similares.map((similar:any)=>(

<div
key={similar.id}
style={{
padding:"8px",
marginBottom:"6px",
background:"#fff",
borderRadius:"5px"
}}
>

<div>
➡️ <b>{similar.nombre}</b>
</div>

<div>
📝 {similar.referencia || "Sin referencia"}
</div>

<div>
📞 {similar.telefono || ""}
</div>

</div>

))}

</div>


<button
style={{
...botonEliminar,
marginTop:"10px",
cursor:"pointer"
}}
onClick={()=>borrarCliente(grupo.cliente)}
>
🗑 Borrar este cliente
</button>

</div>

))

)}

</div>

)}

<button
style={{
background:"#7c3aed",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginBottom:"15px"
}}
onClick={exportarExcel}
>
📤 Exportar clientes a Excel
</button>

<input
style={input}
placeholder="Buscar por nombre"
value={buscar}
onChange={e=>setBuscar(e.target.value)}
/>

<select
style={input}
value={filtroDia}
onChange={e=>setFiltroDia(e.target.value)}
>
<option>Todos</option>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
<option>Domingo</option>
</select>

<select
style={input}
value={filtroCiudad}
onChange={e=>setFiltroCiudad(e.target.value)}
>
<option>Todas</option>

{[...new Set(clientes.map(c=>c.ciudad))].map((ci:any,i)=>(

<option key={i}>
{ci}
</option>

))}

</select>

<div style={grid}>

{lista.map((c,i)=>(

<div key={i} style={card}>

<div style={{fontWeight:"bold",minWidth:"180px"}}>
{c.nombre}
</div>

<div style={{minWidth:"280px"}}>
📍 {c.direccion}
</div>

<div style={{minWidth:"180px"}}>
📝 {c.referencia}
</div>

<div style={{minWidth:"120px"}}>
🏙 {c.ciudad}
</div>

<div style={{minWidth:"140px"}}>
📞 {c.telefono}
</div>

<div style={{minWidth:"120px"}}>
📅 Ruta: {c.dia}
</div>

<div>

<button
style={botonEditar}
onClick={()=>editarCliente(c)}
>
Editar
</button>

<button
style={botonEliminar}
onClick={()=>borrarCliente(c)}
>
Borrar
</button>

<a
href={`https://wa.me/593${(c.telefono || "").replace(/^0/,"")}`}
target="_blank"
>

<button style={botonWhatsapp}>
WhatsApp
</button>

</a>

</div>

</div>

))}

</div>

</div>

)

}

const contenedor={
background:"#f1f5f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"30px",
marginBottom:"20px"
}

const input={
display:"block",
width:"320px",
margin:"10px 0",
padding:"10px",
borderRadius:"6px",
border:"1px solid #ccc",
background:"#fff",
color:"#000"
}

const botonUbicacion={
background:"#2563eb",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const botonGuardar={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginTop:"10px"
}

const grid={
display:"flex",
flexDirection:"column" as const,
gap:"10px",
marginTop:"20px"
}

const card:any = {
background:"#fff",
padding:"12px",
borderRadius:"10px",
boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
gap:"15px",
flexWrap:"wrap"
}

const botonEditar={
background:"#2563eb",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
marginRight:"5px"
}

const botonEliminar={
background:"#ef4444",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px"
}

const botonWhatsapp={
background:"#25d366",
color:"#fff",
padding:"8px 12px",
border:"none",
borderRadius:"6px",
marginLeft:"5px",
cursor:"pointer"
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
padding:"35px 60px",
borderRadius:"20px",
fontWeight:"bold",
fontSize:"32px",
textAlign:"center" as const,
boxShadow:"0 10px 40px rgba(0,0,0,0.4)",
animation:"zoomIn 0.3s ease"
}

const alertaDuplicado={

background:"#fef3c7",
border:"2px solid #f59e0b",
color:"#92400e",
padding:"12px",
borderRadius:"8px",
width:"320px",
marginBottom:"10px"

}