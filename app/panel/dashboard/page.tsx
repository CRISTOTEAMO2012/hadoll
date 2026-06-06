"use client"

import { useEffect, useState } from "react"

export default function Dashboard(){

const [ventasHoy,setVentasHoy]=useState(0)
const [ventasMes,setVentasMes]=useState(0)
const [produccionHoy,setProduccionHoy]=useState(0)
const [prestados,setPrestados]=useState(0)
const [vendidos,setVendidos]=useState(0)
const [clientes,setClientes]=useState(0)
const [vehiculos,setVehiculos]=useState(0)
const [empresa,setEmpresa]=useState(0)
const [dorita,setDorita]=useState(0)
const [vehiculoStock,setVehiculoStock]=useState(0)

// 🆕 NUEVOS DATOS
const [caja,setCaja]=useState(0)
const [cuentasCobrar,setCuentasCobrar]=useState(0)
const [productoTop,setProductoTop]=useState("-")
const [clienteTop,setClienteTop]=useState("-")
const [clientesInactivos,setClientesInactivos]=useState(0)
const [pedidosPendientes,setPedidosPendientes]=useState(0)

useEffect(()=>{

cargar()

const i=setInterval(cargar,3000)
return ()=>clearInterval(i)

},[])

function cargar(){

let hoy=new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})
let mesActual=hoy.slice(0,7)

// 🔥 VENTAS
let ventas=JSON.parse(localStorage.getItem("ventas")||"[]")

let ventasHoyData=ventas.filter(v=>v.fecha===hoy)

let totalHoy=ventasHoyData.reduce((acc,v)=>
acc+(Number(v.precio)*Number(v.cantidad)||0)
,0)

setVentasHoy(totalHoy)

let ventasMesData=ventas.filter(v=>v.fecha?.startsWith(mesActual))

let totalMes=ventasMesData.reduce((acc,v)=>
acc+(Number(v.precio)*Number(v.cantidad)||0)
,0)

setVentasMes(totalMes)

// 🔥 PRODUCTO TOP
let productos={}

ventas.forEach(v=>{

if(!productos[v.producto]){
productos[v.producto]=0
}

productos[v.producto]+=Number(v.cantidad||0)

})

let productoMasVendido=Object.entries(productos)
.sort((a,b)=>b[1]-a[1])

setProductoTop(productoMasVendido[0]?.[0] || "-")

// 🔥 CLIENTE TOP
let clientesTop={}

ventas.forEach(v=>{

if(!clientesTop[v.cliente]){
clientesTop[v.cliente]=0
}

clientesTop[v.cliente]+=Number(v.precio||0)*Number(v.cantidad||0)

})

let clienteMas=Object.entries(clientesTop)
.sort((a,b)=>b[1]-a[1])

setClienteTop(clienteMas[0]?.[0] || "-")

// 🔥 PRODUCCION
let produccion=JSON.parse(localStorage.getItem("produccion")||"[]")

let produccionHoyData=produccion.filter(p=>p.fecha===hoy)

let totalProduccion=produccionHoyData.reduce((acc,p)=>
acc+Number(p.cantidad||0)
,0)

setProduccionHoy(totalProduccion)

// 🔥 ENVASES
let prestadosData=JSON.parse(localStorage.getItem("envasesprestados")||"[]")

let totalPrestados=prestadosData.reduce((acc,p)=>
acc+Number(p.cantidad||0)
,0)

setPrestados(totalPrestados)

let vendidosData=JSON.parse(localStorage.getItem("envasesvendidos")||"[]")

let totalVendidos=vendidosData.reduce((acc,v)=>
acc+Number(v.cantidad||0)
,0)

setVendidos(totalVendidos)

// 🔥 CLIENTES
let clientesData=JSON.parse(localStorage.getItem("clientes")||"[]")

setClientes(clientesData.length)

// 🔥 CLIENTES INACTIVOS
let ultimaCompra={}

ventas.forEach(v=>{

if(!ultimaCompra[v.cliente] || v.fecha > ultimaCompra[v.cliente]){
ultimaCompra[v.cliente]=v.fecha
}

})

let hoyFecha=new Date()

let inactivos=clientesData.filter(c=>{

let ultima=ultimaCompra[c.nombre]

if(!ultima) return false

let dias=Math.floor(
(hoyFecha - new Date(ultima)) /
(1000*60*60*24)
)

return dias >= 15

})

setClientesInactivos(inactivos.length)

// 🔥 VEHICULOS
let vehiculosData=JSON.parse(localStorage.getItem("vehiculos")||"[]")

setVehiculos(vehiculosData.length)

// 🔥 INVENTARIO
let inventario=JSON.parse(localStorage.getItem("inventario")||"{}")

let empresaTotal=0
let doritaTotal=0
let vehiculoTotal=0

if(inventario.empresa){

Object.values(inventario.empresa).forEach(v=>
empresaTotal+=Number(v)
)

}

if(inventario.dorita){

Object.values(inventario.dorita).forEach(v=>
doritaTotal+=Number(v)
)

}

// 🔥 TODOS LOS VEHICULOS
Object.keys(inventario).forEach(k=>{

if(k.includes("vehiculo")){

Object.values(inventario[k]).forEach(v=>
vehiculoTotal+=Number(v)
)

}

})

setEmpresa(empresaTotal)
setDorita(doritaTotal)
setVehiculoStock(vehiculoTotal)

// 🔥 CAJA
let cajaData=JSON.parse(localStorage.getItem("caja")||"[]")

let totalCaja=0

cajaData.forEach(c=>{

if(c.tipo==="ingreso"){
totalCaja+=Number(c.monto||0)
}else{
totalCaja-=Number(c.monto||0)
}

})

setCaja(totalCaja)

// 🔥 CUENTAS POR COBRAR
let cuentas=JSON.parse(localStorage.getItem("cuentasCobrar")||"[]")

let totalCuentas=cuentas.reduce((acc,c)=>
acc+Number(c.saldo||0)
,0)

setCuentasCobrar(totalCuentas)

// 🔥 PEDIDOS
let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")

setPedidosPendientes(pedidos.length)

}

return(

<div style={contenedor}>

<h1 style={titulo}>📊 PANEL GENERAL</h1>

<div style={grid}>

<Card titulo="💰 Ventas hoy" valor={`$ ${ventasHoy}`} color="#16a34a"/>

<Card titulo="📅 Ventas del mes" valor={`$ ${ventasMes}`} color="#22c55e"/>

<Card titulo="🏭 Producción hoy" valor={produccionHoy} color="#f97316"/>

<Card titulo="💵 Caja actual" valor={`$ ${caja}`} color="#0f766e"/>

<Card titulo="💳 Cuentas por cobrar" valor={`$ ${cuentasCobrar}`} color="#dc2626"/>

<Card titulo="📝 Pedidos pendientes" valor={pedidosPendientes} color="#9333ea"/>

<Card titulo="🫙 Envases prestados" valor={prestados} color="#3b82f6"/>

<Card titulo="🫙 Envases vendidos" valor={vendidos} color="#0ea5e9"/>

<Card titulo="👥 Clientes" valor={clientes} color="#6366f1"/>

<Card titulo="🚨 Clientes inactivos" valor={clientesInactivos} color="#ef4444"/>

<Card titulo="🚚 Vehículos" valor={vehiculos} color="#8b5cf6"/>

<Card titulo="🏆 Producto TOP" valor={productoTop} color="#ca8a04"/>

<Card titulo="👑 Cliente TOP" valor={clienteTop} color="#0891b2"/>

<Card titulo="🏭 Inventario Empresa" valor={empresa} color="#0284c7"/>

<Card titulo="🏪 Inventario Dorita" valor={dorita} color="#eab308"/>

<Card titulo="🚚 Inventario Vehículos" valor={vehiculoStock} color="#ef4444"/>

</div>

</div>

)
}

// 🔥 TARJETA PRO
function Card({titulo,valor,color}){

return(

<div
style={{
background:color,
padding:"25px",
borderRadius:"16px",
color:"#fff",
boxShadow:"0 8px 20px rgba(0,0,0,0.15)",
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
transition:"0.3s",
minHeight:"120px"
}}
onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
>

<div style={{
fontSize:"16px",
opacity:0.9,
textAlign:"center"
}}>
{titulo}
</div>

<div style={{
fontSize:"28px",
fontWeight:"bold",
marginTop:"10px",
textAlign:"center"
}}>
{valor}
</div>

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
fontSize:"34px",
marginBottom:"30px",
fontWeight:"bold"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px"
}