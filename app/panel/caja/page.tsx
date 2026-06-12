"use client"

import {useEffect,useState} from "react"
import { supabase } from "@/supabase"
export default function Caja(){

const [fecha,setFecha]=useState("")
const [total,setTotal]=useState(0)

const [ventaEfectivo,setVentaEfectivo]=useState(0)
const [ventaTransferencia,setVentaTransferencia]=useState(0)

const [cobroEfectivo,setCobroEfectivo]=useState(0)
const [cobroTransferencia,setCobroTransferencia]=useState(0)

useEffect(()=>{
let hoy = new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
setFecha(hoy)
},[])

useEffect(()=>{

if(!fecha) return

cargarCaja()

},[fecha])

async function cargarCaja(){

const { data, error } = await supabase
.from("caja")
.select("*")

if(error){

console.log(error)

return

}

let totalDia=0

let vEf=0
let vTr=0

let cEf=0
let cTr=0

data?.forEach((m:any)=>{

if(m.fecha === fecha){

let monto = Number(m.monto || 0)

if(m.tipo === "ingreso"){

totalDia += monto

let metodo = (m.metodo || "").toLowerCase()

let detalle = (m.detalle || "").toLowerCase()

let esCobro =
detalle.includes("cobro") ||
detalle.includes("abono")

if(esCobro){

if(metodo === "efectivo"){
cEf += monto
}

if(metodo === "transferencia"){
cTr += monto
}

}else{

if(metodo === "efectivo"){
vEf += monto
}

if(metodo === "transferencia"){
vTr += monto
}

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

}

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
const totalBox={background:"#16a34a",color:"#fff",padding:"20px",borderRadius:"10px",fontSize:"22px",marginBottom:"30px",textAlign:"center" as const}
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"20px"}
const card: any = {background:"#fff",padding:"20px",borderRadius:"12px",textAlign:"center"}
const cardCobro: any = {background:"#dbeafe",padding:"20px",borderRadius:"12px",textAlign:"center"}