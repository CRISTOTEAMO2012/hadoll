"use client"

import {useEffect,useRef,useState} from "react"
import * as XLSX from "xlsx"
import { supabase } from "../../../supabase"
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

export default function ReporteVentas(){

const canvasRef = useRef(null)

const hoy = new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})

const[fechaInicio,setFechaInicio]=useState(hoy)
const[fechaFin,setFechaFin]=useState(hoy)

const[totalCaja,setTotalCaja]=useState(0)
const[totalVentas,setTotalVentas]=useState(0)
const[totalCxc,setTotalCxc]=useState(0)

const[productoTop,setProductoTop]=useState("")
const[clienteTop,setClienteTop]=useState("")

const[dataPastel,setDataPastel]=useState([])

const[topClientes,setTopClientes]=useState([])
const[clientesPerdidos,setClientesPerdidos]=useState([])
const[rankingProductos,setRankingProductos]=useState([])
const[ciudadFiltro,setCiudadFiltro]=useState("")
const[ciudades,setCiudades]=useState<any[]>([])
const [ventasDia,setVentasDia]=useState<any[]>([])
const [mostrarVentas,setMostrarVentas]=useState(false)
const [mostrarConfirmacion,setMostrarConfirmacion]=useState(false)
const [ventaSeleccionada,setVentaSeleccionada]=useState<any>(null)
const[resumenCiudad,setResumenCiudad]=useState<any[]>([])
const [mensaje,setMensaje]=useState("")

useEffect(()=>{
generarReporte()
},[fechaInicio,fechaFin,ciudadFiltro])

useEffect(()=>{
console.log(ventasDia)
},[ventasDia])

async function generarReporte(){

let ventas:any[] = []
let desde = 0
const bloque = 1000

while(true){

const { data, error } = await supabase
.from("ventas")
.select("*")
.order("id",{ascending:true})
.range(desde,desde + bloque - 1)

if(error){
console.error("ERROR CARGANDO VENTAS:",error)
break
}

if(!data || data.length===0) break

ventas = [...ventas,...data]

if(data.length < bloque) break

desde += bloque

}

const { data: clientesSistema = [] } = await supabase
.from("clientes")
.select("*")

setCiudades([
...new Set(
clientesSistema
.map((c:any)=>c.ciudad)
.filter(Boolean)
)
])

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

setVentasDia(filtradas)
console.log("VENTAS DEL DIA:", filtradas)
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
if(ciudadFiltro){

let clientesCiudad = clientesSistema
.filter((c:any)=>
(c.ciudad || "").trim().toLowerCase()
===
(ciudadFiltro || "").trim().toLowerCase()
)
.map((c:any)=> c.nombre)

let resumen:any = {}

filtradas.forEach((v:any)=>{

if(clientesCiudad.includes(v.cliente)){

if(!resumen[v.producto]){
resumen[v.producto]=0
}

resumen[v.producto]+=Number(v.cantidad)

}

})

setResumenCiudad(
Object.entries(resumen)
.sort((a:any,b:any)=>b[1]-a[1])
)

}else{

setResumenCiudad([])

}
setRankingProductos(rankingProd)

setProductoTop(rankingProd[0]?.[0] || "-")
setClienteTop(ranking[0]?.[0] || "-")

let dataP = rankingProd.map(([nombre,valor])=>({
name:nombre,
value:valor
}))

setDataPastel(dataP)
}

async function revertirVenta(){

console.log("REVERTIR INICIADO")
console.log(ventaSeleccionada)

if(!ventaSeleccionada) return

const { data: inventarioData, error } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

if(error){

alert("Error cargando inventario")

return

}

let inventario = inventarioData

let origen = ventaSeleccionada.origen

let clave = obtenerClaveInventario(
ventaSeleccionada.producto
)

let cantidad = Number(ventaSeleccionada.cantidad)

if(
!inventario[origen] ||
inventario[origen][clave] === undefined
){

alert("No se encontró el producto en el inventario.")

return

}

// DEVOLVER PRODUCTO AL INVENTARIO

inventario[origen][clave] += cantidad

// GUARDAR EL INVENTARIO ACTUALIZADO SIEMPRE

const { error: errorInventario } = await supabase
.from("inventario")
.update({
  [origen]: inventario[origen]
})
.eq("id",1)

if(errorInventario){

  alert("Error actualizando inventario")

  return

}

// DEVOLVER ENVASES VACÍOS SI ERA CAMBIO

if(
ventaSeleccionada.producto.toLowerCase().includes("20l") &&
ventaSeleccionada.tipo_envase==="cambio"
){

if(ventaSeleccionada.devolucion_manual){

inventario[origen]["botellon20llave_vacios"] -= Number(ventaSeleccionada.vacios_con_llave)

inventario[origen]["botellon20sin_llave_vacios"] -= Number(ventaSeleccionada.vacios_sin_llave)

}else{

if(
ventaSeleccionada.producto
.toLowerCase()
.includes("con llave")
){

inventario[origen]["botellon20llave_vacios"] -= cantidad

}else{

inventario[origen]["botellon20sin_llave_vacios"] -= cantidad

}

}

const { error:errorInventario2 } = await supabase
.from("inventario")
.update({
[origen]: inventario[origen]
})
.eq("id",1)

if(errorInventario2){

alert("Error devolviendo envases")

return

}

}

// SI ERA CAMBIO, ELIMINAR EL MOVIMIENTO DE DEVOLUCIÓN

if(ventaSeleccionada.tipo_envase==="cambio"){

await supabase
.from("envases_prestados")
.delete()
.eq("venta_id",ventaSeleccionada.id)

}

// ELIMINAR ENVASE PRESTADO

if(ventaSeleccionada.tipo_envase==="prestado"){

const { error } = await supabase
.from("envases_prestados")
.delete()
.eq("venta_id",ventaSeleccionada.id)

if(error){

alert("Error eliminando envase prestado")

return

}

}

// ELIMINAR ENVASE VENDIDO

if(ventaSeleccionada.tipo_envase==="vendido"){

const { error } = await supabase
.from("envases_vendidos")
.delete()
.eq("venta_id",ventaSeleccionada.id)

if(error){

alert("Error eliminando envase vendido")

return

}

}

if(
ventaSeleccionada.pago==="efectivo" ||
ventaSeleccionada.pago==="transferencia" ||
ventaSeleccionada.pago==="mixto"
){

await supabase
.from("caja")
.delete()
.eq("venta_id",ventaSeleccionada.id)

}

if(
ventaSeleccionada.pago==="fiado" ||
ventaSeleccionada.pago==="mixto"
){

await supabase
.from("deudas")
.delete()
.eq("venta_id",ventaSeleccionada.id)

}

// ELIMINAR LA VENTA

const { error:errorVenta } = await supabase
.from("ventas")
.delete()
.eq("id",ventaSeleccionada.id)

if(errorVenta){

alert("Error eliminando la venta")

console.log(errorVenta)

return

}

setMensaje("✅ Venta revertida correctamente")

setTimeout(()=>{

setMensaje("")
setMostrarConfirmacion(false)
setVentaSeleccionada(null)
generarReporte()

},2000)

}

function obtenerClaveVacio(nombre:string){

nombre = nombre.toLowerCase()

if(nombre.includes("con llave"))
return "botellon20llave_vacios"

if(nombre.includes("sin llave"))
return "botellon20sin_llave_vacios"

return null

}

function obtenerClaveInventario(nombre:string){

nombre = nombre.toLowerCase()

if(nombre.includes("6000")) return "botella6000_llenos"

if(nombre.includes("1l")) return "botella1L_llenos"

if(nombre.includes("paca 15")) return "paca15"

if(nombre.includes("paca 24")) return "paca24"

if(nombre.includes("con llave")) return "botellon20llave_llenos"

if(nombre.includes("sin llave")) return "botellon20sin_llave_llenos"

if(nombre.includes("llave")) return "llave_botellon"

return null

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

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>

{mensaje}

</div>

</div>

)}

<h1 style={titulo}>📊 REPORTE GENERAL DE VENTAS </h1>

<div style={filtros}>
<input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} style={input}/>
<input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} style={input}/>
<select
style={input}
value={ciudadFiltro}
onChange={(e)=>setCiudadFiltro(e.target.value)}
>

<option value="">
Todas las ciudades
</option>

{ciudades.map((c:any,i:number)=>(

<option key={i} value={c}>
{c}
</option>

))}

</select>
<button style={boton} onClick={exportarExcel}>⬇ Excel</button>
<button
style={boton}
onClick={()=>{
console.log("BOTON FUNCIONA")
setMostrarVentas(!mostrarVentas)
}}
>
🧾 Ver Ventas
</button>
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
{ciudadFiltro && (

<div style={card}>

<h2>
🌎 Ventas por Ciudad: {ciudadFiltro}
</h2>

{resumenCiudad.length===0 ? (

<p>No existen ventas</p>

) : (

resumenCiudad.map((p:any,i:number)=>(

<div key={i} style={item}>

<b>{p[0]}</b>

<span>
{p[1]} unidades
</span>

</div>

))

)}

</div>

)}

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
{mostrarVentas && (

<div style={card}>

<h2>🧾 Ventas encontradas</h2>

{ventasDia.length===0 ? (

<p>No existen ventas en ese rango de fechas.</p>

) : (

ventasDia.map((v:any,i:number)=>(

<div key={i} style={detalleVenta}>

<div>
<b>{v.cliente}</b>
</div>

<div>{v.producto}</div>

<div>
Cantidad: {v.cantidad}
</div>

<div>
${v.total}
</div>

<div>
{v.fecha}
</div>

<button
style={botonEliminar}
onClick={()=>{
setVentaSeleccionada(v)
setMostrarConfirmacion(true)
}}
>
🔄 Revertir venta
</button>

</div>

))

)}

</div>

)}
{mostrarConfirmacion && (

<div style={overlay}>

<div style={ventana}>

<h2>⚠️ Confirmar reversión</h2>

<p><b>Cliente:</b> {ventaSeleccionada?.cliente}</p>

<p><b>Producto:</b> {ventaSeleccionada?.producto}</p>

<p><b>Cantidad:</b> {ventaSeleccionada?.cantidad}</p>

<p><b>Total:</b> ${ventaSeleccionada?.total}</p>

<p><b>Origen:</b> {ventaSeleccionada?.origen}</p>

<p><b>Forma de pago:</b> {ventaSeleccionada?.pago}</p>

<p><b>Tipo envase:</b> {ventaSeleccionada?.tipo_envase}</p>

<p style={{color:"red",fontWeight:"bold"}}>

Esta operación revertirá completamente esta venta.

</p>

<div style={{display:"flex",gap:"15px",marginTop:"20px"}}>

<button
style={boton}
onClick={()=>setMostrarConfirmacion(false)}
>
Cancelar
</button>

<button
style={botonEliminar}
onClick={revertirVenta}
>
🔄 Revertir venta
</button>

</div>

</div>

</div>

)}
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

const detalleVenta={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"12px",
borderBottom:"1px solid #e5e7eb",
gap:"15px",
flexWrap:"wrap" as const
}

const botonEliminar={
background:"#dc2626",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold"
}

const overlay={
position:"fixed" as const,
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.55)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}

const ventana={
background:"#fff",
padding:"30px",
borderRadius:"14px",
width:"520px",
boxShadow:"0 0 25px rgba(0,0,0,.35)"
}

const overlayMensaje={
position:"fixed" as const,
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:99999
}

const mensajeExito={
background:"#16a34a",
color:"#fff",
padding:"30px 45px",
borderRadius:"14px",
fontSize:"26px",
fontWeight:"bold",
boxShadow:"0 0 25px rgba(0,0,0,.4)"
}