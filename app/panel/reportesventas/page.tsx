"use client"

import {useEffect,useRef,useState} from "react"
import * as XLSX from "xlsx"
import { supabase } from "../../../supabase"
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

export default function ReporteVentas(){

const canvasRef = useRef(null)

const[fechaInicio,setFechaInicio]=useState("")
const[fechaFin,setFechaFin]=useState("")

const[totalCaja,setTotalCaja]=useState(0)
const[totalVentas,setTotalVentas]=useState(0)
const[totalCxc,setTotalCxc]=useState(0)

const[productoTop,setProductoTop]=useState("")
const[clienteTop,setClienteTop]=useState("")

const[dataPastel,setDataPastel]=useState([])

const[topClientes,setTopClientes]=useState([])
const[clientesPerdidos,setClientesPerdidos]=useState([])
const[rankingProductos,setRankingProductos]=useState([])

useEffect(()=>{
generarReporte()
},[fechaInicio,fechaFin])

async function generarReporte(){

const { data: ventas = [] } = await supabase
.from("ventas")
.select("*")

const { data: clientesSistema = [] } = await supabase
.from("clientes")
.select("*")

const { data: caja = [] } = await supabase
.from("caja")
.select("*")

const { data: deudas = [] } = await supabase
.from("deudas")
.select("*")

let productosConteo={}
let clientesConteo={}

let totalV=0
let totalReal=0
let totalPendiente=0

// FILTRO
let filtradas = ventas.filter(v=>{
if(!fechaInicio || !fechaFin) return false
return v.fecha >= fechaInicio && v.fecha <= fechaFin
})

// 🔹 RECORRER VENTAS
filtradas.forEach(v=>{

let monto = Number(v.precio)*Number(v.cantidad)

// totales
totalV += monto

// SOLO PRODUCTOS / RANKING
if(!productosConteo[v.producto]) productosConteo[v.producto]=0
productosConteo[v.producto]+=Number(v.cantidad)

if(!clientesConteo[v.cliente]) clientesConteo[v.cliente]=0
clientesConteo[v.cliente]+=monto

})

// 🔹 DINERO REAL DESDE CAJA
let cajaFiltrada = caja.filter(c=>{
if(!fechaInicio || !fechaFin) return false
return c.fecha >= fechaInicio && c.fecha <= fechaFin && c.tipo==="ingreso"
})

cajaFiltrada.forEach(c=>{
totalReal += Number(c.monto)
})

// 🔹 CUENTAS POR COBRAR (PENDIENTES)
if(fechaInicio && fechaFin){

deudas.forEach((d:any)=>{

if(
d.estado==="pendiente" &&
d.fecha >= fechaInicio &&
d.fecha <= fechaFin
){
totalPendiente += Number(d.monto)
}

})

}

// SETS
setTotalVentas(totalV)
setTotalCaja(totalReal)
setTotalCxc(totalPendiente)

// TOP CLIENTES
let ranking = Object.entries(clientesConteo).sort((a,b)=>b[1]-a[1])
setTopClientes(ranking.slice(0,10))

// CLIENTES INACTIVOS
let hoy = new Date()

function diasSinComprar(fecha){
let ultima = new Date(fecha)
return Math.floor((hoy - ultima)/(1000*60*60*24))
}

let ultimaCompra = {}

ventas.forEach(v=>{
if(!ultimaCompra[v.cliente] || v.fecha > ultimaCompra[v.cliente]){
ultimaCompra[v.cliente] = v.fecha
}
})

let perdidos = clientesSistema.map(c=>{
let ultima = ultimaCompra[c.nombre]
if(!ultima) return null
return {...c,dias:diasSinComprar(ultima)}
}).filter(c=>c && c.dias >= 8)

setClientesPerdidos(perdidos)

// PRODUCTOS
let rankingProd = Object.entries(productosConteo).sort((a,b)=>b[1]-a[1])
setRankingProductos(rankingProd)

setProductoTop(rankingProd[0]?.[0] || "-")
setClienteTop(ranking[0]?.[0] || "-")

let dataP = rankingProd.map(([nombre,valor])=>({
name:nombre,
value:valor
}))

setDataPastel(dataP)
}

// EXPORTAR
function exportarExcel(){

let datos = topClientes.map((c:any,index:number)=>({
Posicion:index+1,
Cliente:c[0],
Monto:c[1]
}))

let ws = XLSX.utils.json_to_sheet(datos)

let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
wb,
ws,
"Top Clientes"
)

XLSX.writeFile(
wb,
"reporte_ventas.xlsx"
)

}

// UI
function medalla(i){
if(i===0) return "🥇"
if(i===1) return "🥈"
if(i===2) return "🥉"
return "•"
}

function barra(valor,max){
let ancho = (valor/max)*100
return {
width: ancho+"%",
background:"#22c55e",
height:"6px",
borderRadius:"6px"
}
}

let maxCliente = topClientes[0]?.[1] || 1
let maxProducto = rankingProductos[0]?.[1] || 1

const COLORS = ["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"]

return(

<div style={contenedor}>

<h1 style={titulo}>📊 Dashboard de Ventas</h1>

<div style={filtros}>
<input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} style={input}/>
<input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={input}/>
<button style={boton} onClick={exportarExcel}>⬇ Excel</button>
</div>

{/* KPI */}
<div style={kpiGrid}>

<div style={kpi}>
<p style={label}>💰 Ventas Caja</p>
<h2 style={valor}>$ {totalCaja}</h2>
</div>

<div style={kpi}>
<p style={label}>📊 Ventas Totales</p>
<h2 style={valor}>$ {totalVentas}</h2>
</div>

<div style={kpi}>
<p style={label}>🧾 CxC Pendiente</p>
<h2 style={valor}>$ {totalCxc}</h2>
</div>

<div style={kpi}>
<p style={label}>🏆 Producto TOP</p>
<h3 style={valor}>{productoTop}</h3>
</div>

<div style={kpi}>
<p style={label}>👑 Cliente TOP</p>
<h3 style={valor}>{clienteTop}</h3>
</div>

</div>

{/* TOP CLIENTES */}
<div style={card}>
<h3 style={subtitulo}>🏆 Top Clientes</h3>

{topClientes.map((c,i)=>(
<div key={i} style={item}>
<div style={{flex:1}}>
<span>{medalla(i)} {c[0]}</span>
<div style={barra(c[1],maxCliente)}></div>
</div>
<b>$ {c[1]}</b>
</div>
))}

</div>

{/* PRODUCTOS */}
<div style={card}>
<h3 style={subtitulo}>📦 Ranking Productos</h3>

{rankingProductos.map((p,i)=>(
<div key={i} style={item}>
<div style={{flex:1}}>
<span>{p[0]}</span>
<div style={barra(p[1],maxProducto)}></div>
</div>
<b>{p[1]}</b>
</div>
))}

</div>

{/* INACTIVOS */}
<div style={card}>
<h3 style={subtitulo}>🚨 Clientes inactivos</h3>

{clientesPerdidos.length===0 && <p style={{color:"#16a34a"}}>✅ Todos activos</p>}

{clientesPerdidos.map((c,i)=>(
<p key={i} style={{color:"#dc2626"}}>
❌ {c.nombre} ({c.dias} días)
</p>
))}

</div>

{/* PIE */}
<div style={{background:"#fff",padding:"20px",borderRadius:"12px",marginTop:"20px"}}>
<PieChart width={400} height={400}>
<Pie data={dataPastel} cx="50%" cy="50%" outerRadius={120} dataKey="value">
{dataPastel.map((entry, index) => (
<Cell key={index} fill={COLORS[index % COLORS.length]} />
))}
</Pie>
<Tooltip />
<Legend />
</PieChart>
</div>

</div>
)
}

// ESTILOS

const contenedor={background:"#f8fafc",padding:"40px",color:"#111"}
const titulo={fontSize:"32px",marginBottom:"20px"}
const subtitulo={marginBottom:"10px"}

const filtros={display:"flex",gap:"10px",marginBottom:"20px"}

const input={padding:"10px",border:"1px solid #ccc",borderRadius:"6px"}

const boton={background:"#16a34a",color:"#fff",padding:"10px",border:"none",borderRadius:"6px"}

const kpiGrid={display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"15px",marginBottom:"20px"}

const kpi={background:"#fff",padding:"20px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}

const label={fontSize:"13px",color:"#6b7280"}
const valor={color:"#111"}

const card: any = {background:"#fff",padding:"20px",borderRadius:"12px",marginTop:"20px"}

const item={display:"flex",justifyContent:"space-between",marginBottom:"10px",gap:"10px"}