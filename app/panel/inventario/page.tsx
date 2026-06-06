"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabase"
import * as XLSX from "xlsx"

export default function Inventario(){

const [inventario,setInventario]=useState({})

// 🔄 CARGAR
useEffect(()=>{
cargar()
},[])

// 🔥 BASE CORREGIDA (MISMA ESTRUCTURA QUE PRODUCCIÓN)
function base(){
return{
empresa:{
botellon20llave_vacios:0,
botellon20llave_llenos:0,
botellon20sin_llave_vacios:0,
botellon20sin_llave_llenos:0,
botella600:0,
botella6000:0,
botella6000_llenos:0,
botella1L:0,
botella1L_llenos:0,
paca15:0,
paca24:0,
llave_botellon:0
},

dorita:{
botellon20llave_vacios:0,
botellon20llave_llenos:0,
botellon20sin_llave_vacios:0,
botellon20sin_llave_llenos:0,
botella600:0,
botella6000:0,
botella6000_llenos:0,
botella1L:0,
botella1L_llenos:0,
paca15:0,
paca24:0,
llave_botellon:0
}
}
}

async function cargar(){

const { data, error } = await supabase
.from("inventario")
.select("*")
.limit(1)
.single()

if(error || !data){

let baseData = base()

setInventario(baseData)

return
}

let inventarioData = {
empresa: data.empresa || base().empresa,
dorita: data.dorita || base().dorita
}

setInventario(inventarioData)

}

// 📤 EXPORTAR A EXCEL REAL (.xlsx)
function exportarExcel(){

let data = JSON.parse(localStorage.getItem("inventario") || "null")

if(!data) data = base()

function crearHoja(nombre, d){

 d = d || {}

 let filas = [
 ["CATEGORIA","PRODUCTO","CANTIDAD"],

 ["ENVASES LLENOS","Botellón 20L con llave", get(d,"botellon20llave_llenos")],
 ["ENVASES LLENOS","Botellón 20L sin llave", get(d,"botellon20sin_llave_llenos")],
 ["ENVASES LLENOS","Paca 15", get(d,"paca15")],
 ["ENVASES LLENOS","Paca 24", get(d,"paca24")],
 ["ENVASES LLENOS","Botella 6000", get(d,"botella6000_llenos")],
 ["ENVASES LLENOS","Botella 1L", get(d,"botella1L_llenos")],

 ["ENVASES VACIOS","Botellón 20L con llave", get(d,"botellon20llave_vacios")],
 ["ENVASES VACIOS","Botellón 20L sin llave", get(d,"botellon20sin_llave_vacios")],
 ["ENVASES VACIOS","Botella 600 ml", get(d,"botella600")],
 ["ENVASES VACIOS","Botella 6000", get(d,"botella6000")],
 ["ENVASES VACIOS","Botella 1L", get(d,"botella1L")],

 ["ACCESORIOS","Llaves de botellón", get(d,"llave_botellon")]
 ]

 let ws = XLSX.utils.aoa_to_sheet(filas)

 ws["!cols"] = [
 { wch: 18 },
 { wch: 30 },
 { wch: 12 }
 ]

 return ws
 }

 let wb = XLSX.utils.book_new()

 let hojaEmpresa = crearHoja("EMPRESA", data.empresa)
 let hojaDorita = crearHoja("LOCAL DORITA", data.dorita)

 XLSX.utils.book_append_sheet(wb, hojaEmpresa, "EMPRESA")
 XLSX.utils.book_append_sheet(wb, hojaDorita, "LOCAL DORITA")

 let fecha = new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})

 XLSX.writeFile(wb, "Inventario_" + fecha + ".xlsx")
}

// 🔢 VALOR SEGURO
function get(data, key){
return data && data[key] ? data[key] : 0
}

// 🔥 ALERTAS
function alerta(cantidad){
if(cantidad === 0) return "SIN STOCK"
if(cantidad <= 5) return "BAJO STOCK"
return ""
}

// 🎨 TARJETA
function tarjeta(nombre, cantidad, tipo){

let alertaTexto = alerta(cantidad)

return(
<div style={{
...card,
borderTop: tipo==="lleno"
? "4px solid #22c55e"
: "4px solid #f59e0b"
}}>

<div style={nombreStyle}>{nombre}</div>

<div style={{
...numero,
color: tipo==="lleno"
? "#16a34a"
: "#ca8a04"
}}>
{cantidad ?? 0}
</div>

{alertaTexto && (
<div style={alertaBox}>
{alertaTexto}
</div>
)}

</div>
)
}

// 🔥 TOTALES
function calcularTotales(data){

data = data || {}

let llenos =
get(data,"botellon20llave_llenos") +
get(data,"botellon20sin_llave_llenos") +
get(data,"paca15") +
get(data,"paca24") +
get(data,"botella6000_llenos") +
get(data,"botella1L_llenos")

let vacios =
get(data,"botellon20llave_vacios") +
get(data,"botellon20sin_llave_vacios") +
get(data,"botella600") +
get(data,"botella6000") +
get(data,"botella1L")

return {
llenos,
vacios,
total: llenos + vacios
}
}

// 🔥 BLOQUE
function renderBloque(nombre, data){

data = data || {}
let t = calcularTotales(data)

return(
<div style={bloque}>

<h2 style={subtitulo}>{nombre}</h2>

<div style={totalesBox}>
<div>🟩 {t.llenos}</div>
<div>🟨 {t.vacios}</div>
<div>📦 {t.total}</div>
</div>

<h3 style={subsub}>Envases llenos</h3>
<div style={grid}>
{tarjeta("Botellón 20L con llave", get(data,"botellon20llave_llenos"),"lleno")}
{tarjeta("Botellón 20L sin llave", get(data,"botellon20sin_llave_llenos"),"lleno")}
{tarjeta("Paca 15", get(data,"paca15"),"lleno")}
{tarjeta("Paca 24", get(data,"paca24"),"lleno")}
{tarjeta("Botella 6000", get(data,"botella6000_llenos"),"lleno")}
{tarjeta("Botella 1L", get(data,"botella1L_llenos"),"lleno")}
</div>

<h3 style={subsub}>Envases vacíos</h3>
<div style={grid}>
{tarjeta("Botellón 20L con llave", get(data,"botellon20llave_vacios"),"vacio")}
{tarjeta("Botellón 20L sin llave", get(data,"botellon20sin_llave_vacios"),"vacio")}
{tarjeta("Botella 600 ml", get(data,"botella600"),"vacio")}
{tarjeta("Botella 6000", get(data,"botella6000"),"vacio")}
{tarjeta("Botella 1L", get(data,"botella1L"),"vacio")}
</div>

<h3 style={subsub}>Accesorios</h3>
<div style={grid}>
{tarjeta("Llaves de botellón", get(data,"llave_botellon"),"vacio")}
</div>

</div>
)
}

return(

<div style={contenedor}>

<h1 style={titulo}>📦 INVENTARIO GENERAL</h1>

<button style={boton} onClick={cargar}>
Actualizar
</button>

<button style={boton} onClick={exportarExcel}>
Exportar a Excel
</button>

<div style={contenedorGrid}>
{renderBloque("🏢 EMPRESA", inventario.empresa)}
{renderBloque("🏪 LOCAL DORITA", inventario.dorita)}
</div>

</div>

)

}

const contenedor={
background:"#f8fafc",
minHeight:"100vh",
padding:"40px",
color:"#111"
}

const titulo={
fontSize:"30px",
marginBottom:"20px",
textAlign:"center"
}

const boton={
background:"#2563eb",
color:"#fff",
padding:"10px 20px",
border:"none",
borderRadius:"8px",
marginBottom:"30px",
cursor:"pointer",
marginRight:"10px"
}

const contenedorGrid={
display:"flex",
gap:"30px",
flexWrap:"wrap",
justifyContent:"center"
}

const bloque={
background:"#ffffff",
padding:"20px",
borderRadius:"16px",
boxShadow:"0 6px 20px rgba(0,0,0,0.08)",
width:"480px"
}

const subtitulo={
fontSize:"20px",
marginBottom:"10px"
}

const subsub={
marginTop:"20px",
marginBottom:"10px",
fontSize:"16px"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"15px"
}

const card: any = {
background:"#ffffff",
padding:"15px",
borderRadius:"12px",
boxShadow:"0 4px 10px rgba(0,0,0,0.05)",
textAlign:"center"
}

const nombreStyle={
fontSize:"13px",
color:"#555"
}

const numero={
fontSize:"28px",
fontWeight:"bold"
}

const alertaBox={
marginTop:"6px",
fontSize:"11px",
color:"#dc2626",
fontWeight:"bold"
}

const totalesBox={
display:"flex",
justifyContent:"space-between",
background:"#f1f5f9",
padding:"10px",
borderRadius:"10px",
fontWeight:"bold"
}