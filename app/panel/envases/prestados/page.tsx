"use client"

import {useEffect,useState} from "react"
import * as XLSX from "xlsx"
import { supabase } from "../../../../supabase"

export default function Page(){

const [data,setData]=useState<any[]>([])
const [resumen,setResumen]=useState<any[]>([])
const [clienteSeleccionado,setClienteSeleccionado]=useState("")
const [detalle,setDetalle]=useState<any[]>([])
const [saldo,setSaldo]=useState<any>({})

useEffect(()=>{
cargar()
},[])

async function cargar(){

const { data: prestados, error } = await supabase
.from("envases_prestados")
.select("*")
.order("id",{ascending:false})

if(error){

console.log(error)

alert("Error cargando envases prestados")

return

}

let filtrados = (prestados || []).filter((p:any)=>
p.tipo==="inicial" ||
p.tipo==="prestado" ||
p.tipo==="devuelto"
)

setData(filtrados)

let agrupado:any = {}

filtrados.forEach((p:any)=>{

console.log(p.cliente, p.tipo, p.cantidad)

let cliente = (p.cliente || "").trim()

if(agrupado[cliente] === undefined){
agrupado[cliente] = 0
}

if(
p.tipo==="prestado" ||
p.tipo==="inicial"
){
agrupado[cliente] += Number(p.cantidad)
}

if(p.tipo==="devuelto"){
agrupado[cliente] -= Number(p.cantidad)
}

})

let resumenArray = Object.entries(agrupado).map(([cliente,total])=>({
cliente: cliente.trim(),
total
}))
console.log("AGRUPADO:", agrupado)
console.log("RESUMEN:", resumenArray)
console.log(resumenArray)

setResumen(resumenArray)

}

// 🔥 NOMBRE BONITO
function nombreBonito(envase:string){

if(!envase) return ""

if(envase==="botellon20llave_vacios"){
return "Botellón 20L con llave"
}

if(envase==="botellon20sin_llave_vacios"){
return "Botellón 20L sin llave"
}

return envase

}

// 🔥 ABRIR / CERRAR DETALLE
function verDetalle(cliente:string){

if(clienteSeleccionado === cliente){
setClienteSeleccionado("")
setDetalle([])
setSaldo({})
return
}

setClienteSeleccionado(cliente)

let filtrado = data.filter(d=>d.cliente===cliente)

setDetalle(filtrado)

// 🔥 CALCULAR SALDOS
let saldoConLlave = 0
let saldoSinLlave = 0

filtrado.forEach((d:any)=>{

let envase = (d.envase || d.producto || "").toLowerCase()

// 🔵 SUMAR
if(d.tipo==="inicial" || d.tipo==="prestado"){

if(
envase.includes("con llave") ||
envase.includes("20llave")
){
saldoConLlave += Number(d.cantidad)
}

if(
envase.includes("sin llave") ||
envase.includes("20sin")
){
saldoSinLlave += Number(d.cantidad)
}

}

// 🔻 RESTAR
if(d.tipo==="devuelto"){

if(
envase.includes("con llave") ||
envase.includes("20llave")
){
saldoConLlave -= Number(d.cantidad)
}

if(
envase.includes("sin llave") ||
envase.includes("20sin")
){
saldoSinLlave -= Number(d.cantidad)
}

}

})

setSaldo({
conLlave: saldoConLlave,
sinLlave: saldoSinLlave
})

}

// 🔥 EXPORTAR GENERAL
function exportarGeneral(){

let ws = XLSX.utils.json_to_sheet(resumen)
let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, "Resumen")

XLSX.writeFile(wb, "envases_prestados_resumen.xlsx")

}

// 🔥 EXPORTAR CLIENTE
function exportarCliente(){

if(!clienteSeleccionado){
alert("Seleccione un cliente")
return
}

let ws = XLSX.utils.json_to_sheet(detalle)
let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, clienteSeleccionado)

XLSX.writeFile(wb, `envases_${clienteSeleccionado}.xlsx`)

}

// 🔥 CERRAR
function cerrarDetalle(){
setClienteSeleccionado("")
setDetalle([])
setSaldo({})
}

return(

<div style={contenedor}>

<h1 style={titulo}>🫙 ENVASES PRESTADOS</h1>

<div style={{marginBottom:"20px"}}>

<button style={boton} onClick={exportarGeneral}>
📥 Exportar resumen
</button>

{clienteSeleccionado && (
<button
style={{...boton,background:"#2563eb",marginLeft:"10px"}}
onClick={exportarCliente}
>
📄 Exportar cliente
</button>
)}

</div>

<h2>📊 Total por cliente</h2>

<div style={tablaContainer}>

<table style={tabla}>

<thead style={thead}>
<tr>
<th style={th}>Cliente</th>
<th style={th}>Total envases</th>
</tr>
</thead>

<tbody>

{resumen.map((r,i)=>(

<tr
key={i}
style={{
...fila,
background: clienteSeleccionado===r.cliente ? "#dbeafe" : "#fff"
}}
onClick={()=>verDetalle(r.cliente)}
>

<td style={td}>{r.cliente}</td>
<td style={td}>{r.total}</td>

</tr>

))}

</tbody>

</table>

</div>

{/* 🔽 DETALLE */}
{clienteSeleccionado && (

<>
<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:"30px"
}}>

<div>

<h2>📄 Detalle de: {clienteSeleccionado}</h2>

{/* 🔥 SALDOS */}
<div style={{
marginTop:"10px",
background:"#ecfdf5",
padding:"12px",
borderRadius:"10px",
fontWeight:"bold"
}}>

<div>
🫙 Con llave: {saldo.conLlave || 0}
</div>

<div style={{marginTop:"5px"}}>
🫙 Sin llave: {saldo.sinLlave || 0}
</div>

</div>

</div>

<button
onClick={cerrarDetalle}
style={{...boton,background:"#ef4444"}}
>
❌ Cerrar
</button>

</div>

<div style={tablaContainer}>

<table style={tabla}>

<thead style={thead}>
<tr>
<th style={th}>Fecha</th>
<th style={th}>Envase</th>
<th style={th}>Cantidad</th>
<th style={th}>Tipo</th>
</tr>
</thead>

<tbody>

{detalle.map((d,i)=>(

<tr key={i} style={fila}>

<td style={td}>{d.fecha}</td>

<td style={td}>
{nombreBonito(d.envase || d.producto)}
</td>

<td style={td}>{d.cantidad}</td>

<td style={td}>
{d.tipo==="devuelto"
? "♻️ Devuelto"
: d.tipo}
</td>

</tr>

))}

</tbody>

</table>

</div>
</>

)}

</div>

)

}

// 🎨 ESTILOS

const contenedor={
background:"#f1f5f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
textAlign:"center",
fontSize:"30px",
marginBottom:"30px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"10px 15px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const tablaContainer={
background:"#fff",
borderRadius:"10px",
overflow:"hidden",
boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
}

const tabla={
width:"100%",
borderCollapse:"collapse"
}

const thead={
background:"#1e293b",
color:"#fff"
}

const th={padding:"10px"}

const td={padding:"10px"}

const fila={
textAlign:"center",
borderBottom:"1px solid #ddd",
cursor:"pointer"
}