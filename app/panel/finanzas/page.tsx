"use client"

import { useEffect, useState } from "react"
import * as XLSX from "xlsx"
import {
PieChart, Pie, Cell, Tooltip, Legend,
LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts"

export default function Finanzas(){

const [ingresos,setIngresos]=useState(0)
const [gastosCorrientes,setGastosCorrientes]=useState(0)
const [gastosInsumos,setGastosInsumos]=useState(0)
const [gastosBodega,setGastosBodega]=useState(0)
const [gastosProduccion,setGastosProduccion]=useState(0)

const [desde,setDesde]=useState("")
const [hasta,setHasta]=useState("")

const [dataGrafico,setDataGrafico]=useState([])

const [vista,setVista]=useState("")
const [detalle,setDetalle]=useState([])

// 🔥 GASTOS
const GASTOS_DEFAULT = [
"SUELDO PAUL MIGUEZ JIMENEZ",
"SUELDO JUAN FRANCISCO",
"PAGO LUZ",
"PAGO AGUA",
"PAGO INTERNET",
"PAGO CRÉDITO SAN JOSÉ EMPRESA",
"PAGO CRÉDITO PICHINCHA CARROS",
"PAGO SISTEMA"
]

const [tipoGasto,setTipoGasto]=useState(GASTOS_DEFAULT[0])
const [descripcion,setDescripcion]=useState("")
const [monto,setMonto]=useState("")

// 🔥 SOCIOS
const SOCIOS_DEFAULT = [
"LUIS BARRAGAN",
"MIGUEL MIGUEZ",
"GABRIEL MIGUEZ"
]

const [socio,setSocio]=useState(SOCIOS_DEFAULT[0])
const [montoAporte,setMontoAporte]=useState("")

useEffect(()=>{
let hoy = new Date().toISOString().split("T")[0]
setDesde(hoy)
setHasta(hoy)
},[])

useEffect(()=>{
if(desde && hasta){
calcularTodo()
}
},[desde,hasta])

function calcularTodo(){

let caja = JSON.parse(localStorage.getItem("caja")||"[]")
let gastos = JSON.parse(localStorage.getItem("gastos")||"[]")
let produccionCostos = JSON.parse(localStorage.getItem("produccionCostos")||"[]")

let movCaja = caja.filter(m=> m.fecha >= desde && m.fecha <= hasta)
let movGastos = gastos.filter(g=> g.fecha >= desde && g.fecha <= hasta)
let movProduccion = produccionCostos.filter(p=> p.fecha >= desde && p.fecha <= hasta)

let totalIngresos = 0

movCaja.forEach(m=>{
if(m.tipo === "ingreso"){
totalIngresos += Number(m.monto)
}
})

let corrientes=0
let insumos=0
let bodega=0
let produccion=0

movGastos.forEach(g=>{
let valor = Number(g.total || g.valor || 0)

if(g.tipo === "Insumo") insumos += valor
else if(g.tipo === "Compra inventario") bodega += valor
else corrientes += valor
})

movProduccion.forEach(p=>{
produccion += Number(p.total || 0)
})

let mapa = {}

movCaja.forEach(m=>{
if(!mapa[m.fecha]) mapa[m.fecha]={ingresos:0,gastos:0}

if(m.tipo==="ingreso"){
mapa[m.fecha].ingresos += Number(m.monto)
}
})

movGastos.forEach(g=>{
if(!mapa[g.fecha]) mapa[g.fecha]={ingresos:0,gastos:0}

mapa[g.fecha].gastos += Number(g.total || g.valor || 0)
})

movProduccion.forEach(p=>{
if(!mapa[p.fecha]) mapa[p.fecha]={ingresos:0,gastos:0}

mapa[p.fecha].gastos += Number(p.total || 0)
})

let array = Object.keys(mapa).map(fecha=>({
fecha,
ingresos: mapa[fecha].ingresos,
gastos: mapa[fecha].gastos,
utilidad: mapa[fecha].ingresos - mapa[fecha].gastos
}))

setIngresos(totalIngresos)
setGastosCorrientes(corrientes)
setGastosInsumos(insumos)
setGastosBodega(bodega)
setGastosProduccion(produccion)
setDataGrafico(array)
}

// ✅ ABRIR / CERRAR
function abrirDetalle(tipo){

if(vista === tipo){
setVista("")
setDetalle([])
return
}

let gastos = JSON.parse(localStorage.getItem("gastos")||"[]")
let produccionCostos = JSON.parse(localStorage.getItem("produccionCostos")||"[]")
let caja = JSON.parse(localStorage.getItem("caja")||"[]")

// ✅ FILTRO POR FECHAS
gastos = gastos.filter(g=>
g.fecha >= desde && g.fecha <= hasta
)

produccionCostos = produccionCostos.filter(p=>
p.fecha >= desde && p.fecha <= hasta
)

caja = caja.filter(c=>
c.fecha >= desde && c.fecha <= hasta
)

let lista = []

// ✅ INGRESOS
if(tipo==="ingresos"){
lista = caja.filter(c=> c.tipo === "ingreso")
}

// ✅ CORRIENTES
if(tipo==="corrientes"){
lista = gastos.filter(g=> 
g.tipo !== "Insumo" &&
g.tipo !== "Compra inventario"
)
}

// ✅ INSUMOS
if(tipo==="insumos"){
lista = gastos.filter(g=> g.tipo === "Insumo")
}

// ✅ BODEGA
if(tipo==="bodega"){
lista = gastos.filter(g=> g.tipo === "Compra inventario")
}

// ✅ PRODUCCION
if(tipo==="produccion"){
lista = produccionCostos
}

setVista(tipo)
setDetalle(lista)
}

// 🔥 RESUMEN POR INSUMO
function resumenPorInsumo(){

let mapa = {}

detalle.forEach(p=>{

(p.detalle || []).forEach(d=>{

let nombre = d.insumo || "Insumo"

if(!mapa[nombre]){
mapa[nombre] = {
cantidad:0,
precio:Number(d.precioUnitario || 0),
total:0
}
}

mapa[nombre].cantidad += Number(d.cantidadTotal || 0)
mapa[nombre].total += Number(d.total || 0)

})

})

return mapa
}

function guardarGasto(){

if(!monto) return alert("Ingrese monto")

let gastos = JSON.parse(localStorage.getItem("gastos") || "[]")

gastos.push({
tipo: tipoGasto === "Manual" ? descripcion : tipoGasto,
descripcion,
total: Number(monto),
fecha: new Date().toISOString().split("T")[0]
})

localStorage.setItem("gastos", JSON.stringify(gastos))

setDescripcion("")
setMonto("")

calcularTodo()

alert("Gasto registrado")
}

function guardarAporte(){

if(!montoAporte) return alert("Ingrese monto")

let caja = JSON.parse(localStorage.getItem("caja") || "[]")

caja.push({
tipo:"ingreso",
detalle:`Aporte socio: ${socio === "Manual" ? descripcion : socio}`,
monto:Number(montoAporte),
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("caja", JSON.stringify(caja))

setMontoAporte("")
setDescripcion("")

calcularTodo()

alert("Aporte registrado")
}

const totalGastos = gastosCorrientes + gastosInsumos + gastosBodega + gastosProduccion
const utilidad = ingresos - totalGastos

const dataPie = [
{ name: "Ingresos", value: ingresos },
{ name: "Corrientes", value: gastosCorrientes },
{ name: "Insumos", value: gastosInsumos },
{ name: "Bodega", value: gastosBodega },
{ name: "Producción", value: gastosProduccion }
]

const COLORS = ["#22c55e","#ef4444","#f97316","#3b82f6","#a855f7"]

return(

<div style={contenedor}>

<h1 style={titulo}>📊 Finanzas</h1>

<div style={filtro}>
<input type="date" value={desde} onChange={(e)=>setDesde(e.target.value)} style={input}/>
<input type="date" value={hasta} onChange={(e)=>setHasta(e.target.value)} style={input}/>
</div>

<div style={panel}>

<div style={cardForm}>
<h3>💸 Registrar Gasto</h3>

<select value={tipoGasto} onChange={(e)=>setTipoGasto(e.target.value)} style={input}>
{GASTOS_DEFAULT.map((g,i)=>(<option key={i}>{g}</option>))}
<option>Manual</option>
</select>

<input
type="number"
placeholder="Monto"
value={monto}
onChange={e=>setMonto(e.target.value)}
style={input}
/>

<button style={botonGuardar} onClick={guardarGasto}>
Guardar
</button>

</div>

<div style={cardForm}>

<h3>🤝 Aporte Socio</h3>

<select value={socio} onChange={(e)=>setSocio(e.target.value)} style={input}>
{SOCIOS_DEFAULT.map((s,i)=>(<option key={i}>{s}</option>))}
<option>Manual</option>
</select>

<input
type="number"
placeholder="Monto"
value={montoAporte}
onChange={e=>setMontoAporte(e.target.value)}
style={input}
/>

<button style={botonGuardar} onClick={guardarAporte}>
Registrar
</button>

</div>

</div>

<div style={grid}>

<div style={cardIngreso} onClick={()=>abrirDetalle("ingresos")}>
Ingresos
<h2>${ingresos}</h2>
</div>

<div style={cardCorriente} onClick={()=>abrirDetalle("corrientes")}>
Corrientes
<h2>${gastosCorrientes}</h2>
</div>

<div style={cardInsumo} onClick={()=>abrirDetalle("insumos")}>
Insumos
<h2>${gastosInsumos}</h2>
</div>

<div style={cardBodega} onClick={()=>abrirDetalle("bodega")}>
Bodega
<h2>${gastosBodega}</h2>
</div>

<div style={cardProduccion} onClick={()=>abrirDetalle("produccion")}>
Producción
<h2>${gastosProduccion}</h2>
</div>

<div style={cardUtilidad(utilidad)}>
UTILIDAD
<h1>${utilidad}</h1>
</div>

</div>

{/* ✅ DETALLES */}
{vista !== "" && vista !== "produccion" && (

<div style={detalleBox}>

<h3 style={{marginBottom:"15px"}}>
Detalle {vista}
</h3>

{detalle.length === 0 && (
<p>No hay registros</p>
)}

{detalle.map((d,i)=>(

<div key={i} style={detalleItem}>

<div>
<b>
{d.descripcion || d.detalle || d.tipo || "Registro"}
</b>

<p style={{fontSize:"13px",color:"#666"}}>
{d.fecha}
</p>
</div>

<div style={{fontWeight:"bold"}}>
${Number(d.total || d.valor || d.monto || 0).toFixed(2)}
</div>

</div>

))}

</div>

)}

{/* ✅ PRODUCCIÓN */}
{vista==="produccion" && (

<div style={detalleBox}>

<h3 style={{marginBottom:"15px"}}>
Costos por insumo
</h3>

{Object.entries(resumenPorInsumo()).map(([k,v],i)=>(

<div
key={i}
style={{
padding:"10px",
borderBottom:"1px solid #e5e7eb"
}}
>

<div style={{fontWeight:"bold"}}>
{k}
</div>

<div style={{
display:"flex",
gap:"20px",
fontSize:"14px",
marginTop:"5px"
}}>

<span>
Cant: <b>{v.cantidad}</b>
</span>

<span>
Unit: <b>${Number(v.precio).toFixed(2)}</b>
</span>

<span>
Total: <b>${Number(v.total).toFixed(2)}</b>
</span>

</div>

</div>

))}

</div>

)}

<div style={graficos}>

<PieChart width={320} height={320}>
<Pie data={dataPie} dataKey="value" outerRadius={100}>
{dataPie.map((entry, index)=>(
<Cell key={index} fill={COLORS[index]} />
))}
</Pie>
<Tooltip/>
<Legend/>
</PieChart>

<LineChart width={600} height={300} data={dataGrafico}>
<CartesianGrid stroke="#ccc"/>
<XAxis dataKey="fecha"/>
<YAxis/>
<Tooltip/>
<Legend/>
<Line type="monotone" dataKey="ingresos" stroke="#16a34a"/>
<Line type="monotone" dataKey="gastos" stroke="#ef4444"/>
<Line type="monotone" dataKey="utilidad" stroke="#2563eb"/>
</LineChart>

</div>

</div>
)
}

// 🎨 ESTILOS

const contenedor={
background:"#f4f6f9",
padding:"40px",
minHeight:"100vh",
color:"#000"
}

const titulo={
fontSize:"30px",
marginBottom:"20px"
}

const filtro={
display:"flex",
gap:"10px",
marginBottom:"20px"
}

const input={
padding:"10px",
border:"1px solid #ccc",
borderRadius:"8px",
width:"100%"
}

const panel={
display:"flex",
gap:"20px",
flexWrap:"wrap",
marginBottom:"20px"
}

const cardForm={
background:"#fff",
padding:"20px",
borderRadius:"12px",
width:"280px"
}

const botonGuardar={
marginTop:"10px",
background:"#16a34a",
color:"#fff",
border:"none",
padding:"10px",
borderRadius:"8px",
width:"100%",
cursor:"pointer"
}

const grid={
display:"flex",
gap:"15px",
flexWrap:"wrap"
}

const base={
padding:"15px",
borderRadius:"10px",
color:"#fff",
minWidth:"140px",
textAlign:"center",
cursor:"pointer",
transition:"0.2s"
}

const cardIngreso={...base,background:"#16a34a"}
const cardCorriente={...base,background:"#dc2626"}
const cardInsumo={...base,background:"#f97316"}
const cardBodega={...base,background:"#2563eb"}
const cardProduccion={...base,background:"#7c3aed"}

const cardUtilidad=(u)=>({
...base,
background: u>=0 ? "#16a34a" : "#dc2626"
})

const detalleBox={
marginTop:"20px",
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 2px 8px rgba(0,0,0,0.05)"
}

const detalleItem={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"12px 0",
borderBottom:"1px solid #e5e7eb"
}

const graficos={
display:"flex",
gap:"40px",
marginTop:"20px",
flexWrap:"wrap"
}