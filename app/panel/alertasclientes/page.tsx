"use client"

import { useEffect, useState } from "react"

export default function AlertasClientes(){

const [alertas,setAlertas]=useState([])

useEffect(()=>{

let clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
let ventas = JSON.parse(localStorage.getItem("ventas") || "[]")

let hoy = new Date()

let resultado:any[] = []

clientes.forEach(cliente=>{

let ventasCliente = ventas.filter(v => v.cliente === cliente.nombre)

if(ventasCliente.length === 0){

resultado.push({
nombre:cliente.nombre,
dias:"Nunca ha comprado",
telefono:cliente.telefono
})

}else{

let ultimaVenta = ventasCliente[ventasCliente.length-1]

let fechaVenta = new Date(ultimaVenta.fecha)

let diferencia = Math.floor((hoy - fechaVenta) / (1000*60*60*24))

if(diferencia >= 7){

resultado.push({
nombre:cliente.nombre,
dias:diferencia,
telefono:cliente.telefono
})

}

}

})

setAlertas(resultado)

},[])

return(

<div style={contenedor}>

<h1 style={titulo}>⚠ CLIENTES QUE NO COMPRAN</h1>

<div style={grid}>

{alertas.map((a,i)=>(

<div key={i} style={card}>

<h3>{a.nombre}</h3>

<p>⏱ {a.dias} días sin comprar</p>

<a
href={`https://wa.me/593${a.telefono}`}
target="_blank"
style={botonWhatsapp}
>

Escribir WhatsApp

</a>

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
marginBottom:"30px"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(3,260px)",
gap:"20px"
}

const card={
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
}

const botonWhatsapp={
background:"#25D366",
color:"#fff",
padding:"10px",
borderRadius:"6px",
textDecoration:"none",
display:"inline-block",
marginTop:"10px"
}