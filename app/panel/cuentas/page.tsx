"use client"

import { useEffect, useState } from "react"

export default function Cuentas(){

const [deudas,setDeudas]=useState([])
const [clienteActivo,setClienteActivo]=useState(null)
const [verHistorial,setVerHistorial]=useState(false)

useEffect(()=>{
cargar()
},[])

function cargar(){
let data = JSON.parse(localStorage.getItem("deudas")||"[]")

data = data.map(d => ({
...d,
producto: d.producto || "Producto",
cantidad: d.cantidad || 1
}))

setDeudas(data)
}

// AGRUPAR
function agrupar(tipo){
let grupo={}

deudas.forEach((d,i)=>{
if(d.estado===tipo){

if(!grupo[d.cliente]){
grupo[d.cliente]={total:0,items:[]}
}

grupo[d.cliente].total += Number(d.monto)
grupo[d.cliente].items.push({...d,index:i})
}
})

return grupo
}

// MÉTODO PAGO
function elegirMetodo(){
let metodo = prompt("Forma de pago: efectivo / transferencia")
if(!metodo) return null

metodo = metodo.toLowerCase()

if(metodo !== "efectivo" && metodo !== "transferencia"){
alert("Método inválido")
return null
}

return metodo
}

// 🔥 REGISTRAR EN CAJA (FUNCIÓN CENTRAL)
function registrarEnCaja(descripcion,monto,metodo){

let caja = JSON.parse(localStorage.getItem("caja") || "[]")

caja.push({
tipo:"ingreso",
origen:"cobro", // 🔥 ESTA ES LA CLAVE
descripcion,
monto:Number(monto),
metodo,
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("caja",JSON.stringify(caja))
}

// COBRAR TODO
function cobrarTodo(cliente:any){

let metodo = elegirMetodo()
if(!metodo) return

let data=[...deudas]
let hoy = new Date().toISOString().split("T")[0]
let totalCobro=0

data.forEach((d,i)=>{
if(d.cliente===cliente && d.estado==="pendiente"){
totalCobro += Number(d.monto)
data[i]={...d,estado:"pagado",fechaCobro:hoy}
}
})

localStorage.setItem("deudas",JSON.stringify(data))

// ✅ CAJA
registrarEnCaja(`Cobro total deuda ${cliente}`,totalCobro,metodo)

cargar()
setClienteActivo(null)
}

// COBRAR ITEM
function cobrarItem(index:any){

let metodo = elegirMetodo()
if(!metodo) return

let data=[...deudas]
let deuda = data[index]
let hoy = new Date().toISOString().split("T")[0]

data[index]={...deuda,estado:"pagado",fechaCobro:hoy}

localStorage.setItem("deudas",JSON.stringify(data))

// ✅ CAJA
registrarEnCaja(`Cobro deuda ${deuda.cliente}`,deuda.monto,metodo)

cargar()
}

// 🔥 ABONO PARCIAL (CORREGIDO)
function abonarDeuda(index:any){

let monto = prompt("Ingrese valor a abonar")
if(!monto) return

let montoNumero:any = Number(monto)

if(isNaN(montoNumero) || montoNumero <= 0){
alert("Valor inválido")
return
}

let metodo = elegirMetodo()
if(!metodo) return

let data=[...deudas]
let deuda = data[index]

if(monto > deuda.monto){
alert("No puede abonar más de la deuda")
return
}

let hoy = new Date().toISOString().split("T")[0]

// RESTAR
data[index].monto = Number(deuda.monto) - monto

if(data[index].monto === 0){
data[index].estado = "pagado"
data[index].fechaCobro = hoy
}

localStorage.setItem("deudas",JSON.stringify(data))

// ✅ CAJA
registrarEnCaja(`Abono deuda ${deuda.cliente}`,monto,metodo)

cargar()
}

// DATA
let pendientes = agrupar("pendiente")
let pagados = agrupar("pagado")

return(

<div style={contenedor}>

<h1 style={titulo}>💳 CUENTAS POR COBRAR</h1>

{!clienteActivo && !verHistorial && (
<>
<h2>Pendientes</h2>

{Object.entries(pendientes).map(([cliente,data])=>(
<div key={cliente} style={card}>
<div onClick={()=>setClienteActivo(cliente)} style={{cursor:"pointer"}}>
👤 <b>{cliente}</b><br/>
💲 {data.total}
</div>

<button style={boton} onClick={()=>cobrarTodo(cliente)}>
Cobrar todo
</button>
</div>
))}

<button style={botonHistorial} onClick={()=>setVerHistorial(true)}>
Ver historial
</button>
</>
)}

{clienteActivo && !verHistorial && (
<div>
<button style={botonVolver} onClick={()=>setClienteActivo(null)}>
⬅ Volver
</button>

<h2>{clienteActivo}</h2>

{pendientes[clienteActivo]?.items.map((d,i)=>(
<div key={i} style={card}>
<div>
📦 {d.cantidad} x {d.producto}<br/>
📅 {d.fecha}<br/>
💲 {d.monto}
</div>

<div style={{display:"flex",gap:"5px"}}>
<button style={boton} onClick={()=>cobrarItem(d.index)}>
Cobrar
</button>

<button style={{...boton,background:"#f59e0b"}} onClick={()=>abonarDeuda(d.index)}>
Abonar
</button>
</div>

</div>
))}
</div>
)}

{verHistorial && !clienteActivo && (
<div>
<button style={botonVolver} onClick={()=>setVerHistorial(false)}>
⬅ Volver
</button>

<h2>Historial</h2>

{Object.entries(pagados).map(([cliente,data])=>(
<div key={cliente} style={card} onClick={()=>setClienteActivo(cliente)}>
👤 {cliente} | 💲 {data.total}
</div>
))}
</div>
)}

{verHistorial && clienteActivo && (
<div>
<button style={botonVolver} onClick={()=>setClienteActivo(null)}>
⬅ Volver
</button>

<h2>{clienteActivo}</h2>

{pagados[clienteActivo]?.items.map((d,i)=>(
<div key={i} style={cardPagado}>
📦 {d.cantidad} x {d.producto} | 📅 {d.fecha} | 💰 {d.fechaCobro} | 💲 {d.monto}
</div>
))}
</div>
)}

</div>
)
}

// estilos
const contenedor={background:"#ffffff",minHeight:"100vh",padding:"30px",color:"#000"}
const titulo={fontSize:"28px",marginBottom:"20px"}

const card: any = {
background:"#f9fafb",
padding:"15px",
border:"1px solid #ccc",
borderRadius:"8px",
marginBottom:"10px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}

const cardPagado={
background:"#d1fae5",
padding:"10px",
borderRadius:"6px",
marginBottom:"5px"
}

const boton={
background:"#16a34a",
color:"#fff",
border:"none",
padding:"10px",
borderRadius:"6px"
}

const botonHistorial={
marginTop:"20px",
background:"#2563eb",
color:"#fff",
padding:"10px",
borderRadius:"6px",
border:"none"
}

const botonVolver={
marginBottom:"20px",
background:"#6b7280",
color:"#fff",
padding:"10px",
borderRadius:"6px",
border:"none"
}