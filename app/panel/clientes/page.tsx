"use client"

import { useState, useEffect } from "react"
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export default function Clientes(){

const [nombre,setNombre]=useState("")
const [direccion,setDireccion]=useState("")
const [referencia,setReferencia]=useState("")
const [telefono,setTelefono]=useState("")
const [dia,setDia]=useState("Lunes")
const [ciudad,setCiudad]=useState("")

const [coords,setCoords]=useState(null)

const [clientes,setClientes]=useState([])

const [buscar,setBuscar]=useState("")
const [filtroDia,setFiltroDia]=useState("Todos")
const [filtroCiudad,setFiltroCiudad]=useState("Todas")

const [editandoIndex,setEditandoIndex]=useState(null)

useEffect(()=>{
let data=JSON.parse(localStorage.getItem("clientes")||"[]")
setClientes(data)
},[])

// 📤 EXPORTAR A EXCEL REAL
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

let fecha = new Date().toISOString().slice(0,10)

saveAs(
data,
`Clientes_${fecha}.xlsx`
)

}

// 🔥 FUNCION SEGURA
async function obtenerDatos(lat,lng){

try{

let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC38UAIuSha_SbHHMK_Jf0pnsNDOM7WaH8`)
let data = await res.json()

if(data.status !== "OK"){
console.log("Error geocoding:", data)
return
}

let dir = data.results[0]?.formatted_address || ""
setDireccion(dir)

let componentes = data.results[0]?.address_components || []

let canton = ""

componentes.forEach(c=>{
if(c.types.includes("locality")) canton = c.long_name
if(c.types.includes("administrative_area_level_2")) canton = c.long_name
})

setCiudad(canton)

}catch(err){
console.log("Error:",err)
}

}

// 📍 UBICACION
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

// 💾 GUARDAR
function guardarCliente(){

if(nombre===""){
alert("Ingrese nombre")
return
}

let data=[...clientes]

let nuevo={
nombre,
direccion,
referencia,
telefono,
dia,
ciudad,
coords
}

if(editandoIndex !== null){
data[editandoIndex]=nuevo
setEditandoIndex(null)
}else{
data.push(nuevo)
}

localStorage.setItem("clientes",JSON.stringify(data))
setClientes(data)

setNombre("")
setDireccion("")
setReferencia("")
setTelefono("")
setDia("Lunes")
setCiudad("")
setCoords(null)

alert("Guardado correctamente")
}

// ✏️ EDITAR
function editarCliente(index){

let c = clientes[index]

setNombre(c.nombre)
setDireccion(c.direccion)
setReferencia(c.referencia || "")
setTelefono(c.telefono)
setDia(c.dia)
setCiudad(c.ciudad)
setCoords(c.coords || null)

setEditandoIndex(index)
}

// ❌ BORRAR
function borrarCliente(index){

if(!confirm("¿Eliminar cliente?")) return

let data=[...clientes]
data.splice(index,1)

localStorage.setItem("clientes",JSON.stringify(data))
setClientes(data)

}

// FILTROS
let lista=clientes

if(filtroDia!=="Todos"){
lista=lista.filter(c=>c.dia===filtroDia)
}

if(filtroCiudad!=="Todas"){
lista=lista.filter(c=>c.ciudad===filtroCiudad)
}

if(buscar!==""){
lista=lista.filter(c=>
c.nombre.toLowerCase().includes(buscar.toLowerCase())
)
}

return(

<div style={contenedor}>

<h1 style={titulo}>👥 CLIENTES PRO + MAPA</h1>

<h2>{editandoIndex !== null ? "Editar cliente" : "Registrar cliente"}</h2>

<input style={input} placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}/>

<input style={input} placeholder="Dirección automática" value={direccion} readOnly/>

<input style={input} placeholder="Referencia" value={referencia} onChange={e=>setReferencia(e.target.value)}/>

<input style={input} placeholder="Teléfono" value={telefono} onChange={e=>setTelefono(e.target.value)}/>

<input style={input} placeholder="Cantón automático" value={ciudad} readOnly/>

<select style={input} value={dia} onChange={e=>setDia(e.target.value)}>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
<option>Domingo</option>
</select>

<button style={botonUbicacion} onClick={usarUbicacion}>
📍 Usar mi ubicación
</button>

<LoadScript googleMapsApiKey="AIzaSyC38UAIuSha_SbHHMK_Jf0pnsNDOM7WaH8">

<GoogleMap
mapContainerStyle={{width:"100%",height:"300px",marginTop:"10px",borderRadius:"10px"}}
center={coords || {lat:-1.67,lng:-78.65}}
zoom={13}


options={{
zoomControl: true
}}


onClick={async (e)=>{

let lat = e.latLng.lat()
let lng = e.latLng.lng()

setCoords({lat,lng})

await obtenerDatos(lat,lng)

}}
>

{coords && <Marker position={coords} />}

</GoogleMap>

</LoadScript>

<button style={botonGuardar} onClick={guardarCliente}>
{editandoIndex !== null ? "Actualizar cliente" : "Guardar cliente"}
</button>

<hr style={{margin:"40px 0"}}/>

<h2>Buscar clientes</h2>

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

<input style={input} placeholder="Buscar por nombre" value={buscar} onChange={e=>setBuscar(e.target.value)}/>

<select style={input} value={filtroDia} onChange={e=>setFiltroDia(e.target.value)}>
<option>Todos</option>
<option>Lunes</option>
<option>Martes</option>
<option>Miércoles</option>
<option>Jueves</option>
<option>Viernes</option>
<option>Sábado</option>
<option>Domingo</option>
</select>

<select style={input} value={filtroCiudad} onChange={e=>setFiltroCiudad(e.target.value)}>
<option>Todas</option>
{[...new Set(clientes.map(c=>c.ciudad))].map((ci,i)=>(
<option key={i}>{ci}</option>
))}
</select>

<div style={grid}>

{lista.map((c,i)=>(

<div key={i} style={card}>

<h3>{c.nombre}</h3>

<p>📍 {c.direccion}</p>
<p>📝 {c.referencia}</p>
<p>🏙 {c.ciudad}</p>
<p>📞 {c.telefono}</p>
<p>📅 Ruta: {c.dia}</p>

<div style={{marginTop:"10px"}}>

<button style={botonEditar} onClick={()=>editarCliente(i)}>
Editar
</button>

<button style={botonEliminar} onClick={()=>borrarCliente(i)}>
Borrar
</button>

</div>

</div>

))}

</div>

</div>

)

}

const contenedor={background:"#f1f5f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"30px",marginBottom:"20px"}

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

const grid={display:"grid",gridTemplateColumns:"repeat(3,260px)",gap:"20px",marginTop:"20px"}

const card={
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
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