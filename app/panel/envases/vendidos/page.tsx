"use client"

import {useEffect,useState} from "react"
import * as XLSX from "xlsx"

export default function Page(){

const [data,setData]=useState<any[]>([])
const [resumen,setResumen]=useState<any[]>([])
const [clienteSeleccionado,setClienteSeleccionado]=useState("")
const [detalle,setDetalle]=useState<any[]>([])

useEffect(()=>{
cargar()
},[])

function cargar(){

let vendidos = JSON.parse(localStorage.getItem("envasesvendidos")||"[]")

setData(vendidos)

// 🔥 AGRUPAR POR CLIENTE
let agrupado:any = {}

vendidos.forEach((v:any)=>{

if(!agrupado[v.cliente]){
agrupado[v.cliente]=0
}

agrupado[v.cliente]+=Number(v.cantidad)

})

let resumenArray = Object.entries(agrupado).map(([cliente,total])=>({
cliente,
total
}))

setResumen(resumenArray)

}

// 🔥 ABRIR / CERRAR DETALLE
function verDetalle(cliente:string){

if(clienteSeleccionado === cliente){
setClienteSeleccionado("")
setDetalle([])
return
}

setClienteSeleccionado(cliente)

let filtrado = data.filter(d=>d.cliente===cliente)
setDetalle(filtrado)

}

// 🔥 EXPORTAR GENERAL
function exportarGeneral(){

let ws = XLSX.utils.json_to_sheet(resumen)
let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, "Vendidos")

XLSX.writeFile(wb, "envases_vendidos_resumen.xlsx")

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

XLSX.writeFile(wb, `envases_vendidos_${clienteSeleccionado}.xlsx`)

}

// 🔥 CERRAR
function cerrarDetalle(){
setClienteSeleccionado("")
setDetalle([])
}

return(

<div style={contenedor}>

<h1 style={titulo}>🧾 ENVASES VENDIDOS</h1>

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
<th style={th}>Total vendidos</th>
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
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"30px"}}>

<h2>📄 Detalle de: {clienteSeleccionado}</h2>

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
</tr>
</thead>

<tbody>

{detalle.map((d,i)=>(

<tr key={i} style={fila}>
<td style={td}>{d.fecha}</td>
<td style={td}>{d.producto}</td>
<td style={td}>{d.cantidad}</td>
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