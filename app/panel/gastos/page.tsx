"use client"

import {useState,useEffect} from "react"

export default function Gastos(){

const [tipo,setTipo]=useState("")
const [valor,setValor]=useState("")
const [lista,setLista]=useState([])
const [verHistorial,setVerHistorial]=useState(false)

// 🔥 NUEVO
const [desde,setDesde]=useState("")
const [hasta,setHasta]=useState("")
const [origen,setOrigen]=useState("caja")
const [socios,setSocios]=useState([])

useEffect(()=>{
filtrarGastos()

// 🔥 cargar socios
let s = JSON.parse(localStorage.getItem("socios")||"[]")
setSocios(s)

},[])

function obtenerBase(){

let data=JSON.parse(localStorage.getItem("gastos")||"[]")

return data.filter(g => 
g.tipo !== "Compra inventario" && 
g.tipo !== "Insumo"
)

}

function filtrarGastos(){

let filtrados = obtenerBase()

if(desde){
filtrados = filtrados.filter(g => g.fecha >= desde)
}

if(hasta){
filtrados = filtrados.filter(g => g.fecha <= hasta)
}

setLista(filtrados)

}

function guardar(){

if(!tipo || !valor){
alert("Complete los datos")
return
}

let gastos=JSON.parse(localStorage.getItem("gastos")||"[]")

let hoy = new Date().toISOString().split("T")[0]

// 🔥 definir origen real
let origenFinal = origen === "caja" ? "caja" : origen

gastos.push({
tipo,
descripcion: tipo,
cantidad:1,
precio:Number(valor),
total:Number(valor),
fecha:hoy,
origen: origenFinal // 🔥 CLAVE
})

localStorage.setItem("gastos",JSON.stringify(gastos))

alert("Gasto guardado")

setTipo("")
setValor("")
setOrigen("caja")

filtrarGastos()

}

return(

<div style={contenedor}>

<h1 style={titulo}>💸 Gastos Corrientes</h1>

<div style={card}>

{/* 🔥 INPUT LIBRE */}
<input
style={input}
placeholder="Escriba el gasto (ej: combustible, reparación, etc)"
value={tipo}
onChange={(e)=>setTipo(e.target.value)}
/>

<input
style={input}
type="number"
placeholder="Valor del gasto"
value={valor}
onChange={(e)=>setValor(e.target.value)}
/>

{/* 🔥 ORIGEN DINERO */}
<select style={input} value={origen} onChange={(e)=>setOrigen(e.target.value)}>
<option value="caja">Caja</option>

{socios.map((s,i)=>(
<option key={i} value={s.nombre}>{s.nombre}</option>
))}

</select>

<button style={boton} onClick={guardar}>
Guardar gasto
</button>

<button style={botonHistorial} onClick={()=>setVerHistorial(!verHistorial)}>
{verHistorial ? "Ocultar historial" : "Ver historial"}
</button>

</div>

{verHistorial && (

<>
<h2 style={{marginTop:"30px"}}>📋 Historial de gastos corrientes</h2>

<div style={filtros}>

<input
type="date"
value={desde}
onChange={(e)=>setDesde(e.target.value)}
style={input}
/>

<input
type="date"
value={hasta}
onChange={(e)=>setHasta(e.target.value)}
style={input}
/>

<button style={botonFiltrar} onClick={filtrarGastos}>
Filtrar
</button>

</div>

{lista.length === 0 && <p>No hay registros</p>}

{lista.map((g,i)=>(

<div key={i} style={fila}>
📅 {g.fecha} | 🧾 {g.tipo} | 💲 {g.total} | 🏷 {g.origen || "caja"}
</div>

))}

</>

)}

</div>

)

}

// estilos (NO TOQUÉ NADA)

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

const card: any = {
background:"#ffffff",
padding:"20px",
borderRadius:"10px",
maxWidth:"400px",
boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
}

const input={
display:"block",
width:"100%",
padding:"10px",
marginBottom:"12px",
border:"1px solid #999",
borderRadius:"6px"
}

const boton={
background:"#ef4444",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
width:"100%",
fontWeight:"bold",
cursor:"pointer",
marginBottom:"10px"
}

const botonHistorial={
background:"#2563eb",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px",
width:"100%",
cursor:"pointer"
}

const botonFiltrar={
background:"#f97316",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px",
width:"100%",
cursor:"pointer"
}

const fila={
background:"#ffffff",
padding:"10px",
marginTop:"6px",
borderRadius:"6px",
maxWidth:"400px"
}

const filtros={
background:"#ffffff",
padding:"15px",
borderRadius:"10px",
marginBottom:"15px",
maxWidth:"400px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}