"use client"

import {useEffect,useState} from "react"

export default function Caja(){

const [fecha,setFecha]=useState("")
const [total,setTotal]=useState(0)

const [ventaEfectivo,setVentaEfectivo]=useState(0)
const [ventaTransferencia,setVentaTransferencia]=useState(0)

const [cobroEfectivo,setCobroEfectivo]=useState(0)
const [cobroTransferencia,setCobroTransferencia]=useState(0)

useEffect(()=>{
let hoy = new Date().toISOString().split("T")[0]
setFecha(hoy)
},[])

useEffect(()=>{

if(!fecha) return

let caja = JSON.parse(localStorage.getItem("caja")||"[]")

let totalDia=0

let vEf=0
let vTr=0

let cEf=0
let cTr=0

caja.forEach(m=>{

if(m.fecha === fecha){

let monto = Number(m.monto)

// TOTAL
if(m.tipo === "ingreso"){
totalDia += monto

// 🔥 CLAVE REAL
let esCobro = m.origen === "cobro"

if(esCobro){
if(m.metodo==="efectivo") cEf += monto
if(m.metodo==="transferencia") cTr += monto
}else{
if(m.metodo==="efectivo") vEf += monto
if(m.metodo==="transferencia") vTr += monto
}
}

if(m.tipo === "egreso"){
totalDia -= monto
}

}

})

setTotal(totalDia)

setVentaEfectivo(vEf)
setVentaTransferencia(vTr)

setCobroEfectivo(cEf)
setCobroTransferencia(cTr)

},[fecha])

return(
<div style={contenedor}>

<h1 style={titulo}>💰 Caja</h1>

<input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)} style={input}/>

<div style={totalBox}>
Total del día: $ {total}
</div>

<div style={grid}>

<div style={card}>
<h3>💵 Ventas Efectivo</h3>
<h2>$ {ventaEfectivo}</h2>
</div>

<div style={card}>
<h3>🏦 Ventas Transferencia</h3>
<h2>$ {ventaTransferencia}</h2>
</div>

<div style={cardCobro}>
<h3>📥 Cobros Efectivo</h3>
<h2>$ {cobroEfectivo}</h2>
</div>

<div style={cardCobro}>
<h3>📥 Cobros Transferencia</h3>
<h2>$ {cobroTransferencia}</h2>
</div>

</div>

</div>
)
}

// estilos iguales
const contenedor={background:"#f4f6f9",minHeight:"100vh",padding:"40px",color:"#000"}
const titulo={fontSize:"32px",marginBottom:"20px",fontWeight:"bold"}
const input={marginBottom:"20px",padding:"8px",borderRadius:"6px",border:"1px solid #ccc"}
const totalBox={background:"#16a34a",color:"#fff",padding:"20px",borderRadius:"10px",fontSize:"22px",marginBottom:"30px",textAlign:"center"}
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"20px"}
const card={background:"#fff",padding:"20px",borderRadius:"12px",textAlign:"center"}
const cardCobro={background:"#dbeafe",padding:"20px",borderRadius:"12px",textAlign:"center"}