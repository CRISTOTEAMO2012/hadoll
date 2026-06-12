"use client"

import {useEffect,useRef,useState} from "react"
import { supabase } from "@/supabase"
import * as XLSX from "xlsx"

export default function ReporteProduccion(){

const canvasRef = useRef(null)

const[data,setData]=useState([])
const[desde,setDesde]=useState("")
const[hasta,setHasta]=useState("")

const[total,setTotal]=useState(0)
const[productoTop,setProductoTop]=useState("")
const[verTabla,setVerTabla]=useState(false)
const[mensaje,setMensaje]=useState("")

useEffect(()=>{
filtrar()
},[desde,hasta])

async function filtrar(){

// 🔥 CAMBIO CLAVE: leer de produccionCostos
const { data: prod, error } = await supabase
.from("produccion")
.select("*")

if(error){
console.log(error)
return
}

let filtrado = []

if(desde && hasta){

filtrado = prod.filter(p => {
return p.fecha >= desde && p.fecha <= hasta
})

}

setData(filtrado)
console.log("Producción encontrada:", filtrado)

// 🔥 CALCULOS
let totalCantidad=0
let conteo={}

filtrado.forEach(p=>{

totalCantidad += Number(p.cantidad)

if(!conteo[p.producto]) conteo[p.producto]=0
conteo[p.producto]+=Number(p.cantidad)

})

setTotal(totalCantidad)

// producto top
let top = Object.entries(conteo).sort((a,b)=>b[1]-a[1])[0]
setProductoTop(top ? top[0] : "-")

dibujarGrafico(conteo)

}

// 🔥 GRAFICO
function dibujarGrafico(datos){

let canvas=canvasRef.current
if(!canvas) return

let ctx=canvas.getContext("2d")

ctx.clearRect(0,0,canvas.width,canvas.height)

let nombres=Object.keys(datos)
let valores=Object.values(datos)

if(valores.length===0) return

let max=Math.max(...valores,10)

let ancho=80
let espacio=40

valores.forEach((valor,i)=>{

let altura=(valor/max)*300

ctx.fillStyle="#16a34a"

ctx.fillRect(
i*(ancho+espacio)+80,
350-altura,
ancho,
altura
)

ctx.fillStyle="#000"

ctx.fillText(valor,i*(ancho+espacio)+100,330-altura)
ctx.fillText(nombres[i],i*(ancho+espacio)+80,380)

})

}

// 🔥 EXPORTAR EXCEL
function exportarExcel(){

let ws = XLSX.utils.json_to_sheet(data)
let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, "Produccion")

XLSX.writeFile(wb, "reporte_produccion.xlsx")

}
async function eliminarProduccion(p){


if(!confirm("¿Eliminar esta producción?")){
return
}

const { error } = await supabase
.from("produccion")
.delete()
.eq("id", p.id)

if(error){
alert(error.message)
return
}
const { data: inventarioData } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

let inventario = {
empresa: inventarioData.empresa || {},
dorita: inventarioData.dorita || {}
}

if(p.producto === "Botellón 20L con llave"){

inventario.empresa.botellon20llave_llenos =
(inventario.empresa.botellon20llave_llenos || 0)
- Number(p.cantidad)

inventario.empresa.botellon20llave_vacios =
(inventario.empresa.botellon20llave_vacios || 0)
+ Number(p.cantidad)

}
if(p.producto === "Botellón 20L sin llave"){

inventario.empresa.botellon20sin_llave_llenos =
(inventario.empresa.botellon20sin_llave_llenos || 0)
- Number(p.cantidad)

inventario.empresa.botellon20sin_llave_vacios =
(inventario.empresa.botellon20sin_llave_vacios || 0)
+ Number(p.cantidad)

}

if(p.producto === "Botella 1L"){

inventario.empresa.botella1L_llenos =
(inventario.empresa.botella1L_llenos || 0)
- Number(p.cantidad)

inventario.empresa.botella1L =
(inventario.empresa.botella1L || 0)
+ Number(p.cantidad)

}

if(p.producto === "Botella 600 ml"){

inventario.empresa.botella600_llenos =
(inventario.empresa.botella600_llenos || 0)
- Number(p.cantidad)

inventario.empresa.botella600 =
(inventario.empresa.botella600 || 0)
+ Number(p.cantidad)

}

if(p.producto === "Botella 6000 ml"){

inventario.empresa.botella6000_llenos =
(inventario.empresa.botella6000_llenos || 0)
- Number(p.cantidad)

inventario.empresa.botella6000 =
(inventario.empresa.botella6000 || 0)
+ Number(p.cantidad)

}
if(p.producto === "Paca 15 botellas 600 ml"){

inventario.empresa.paca15 =
(inventario.empresa.paca15 || 0)
- Number(p.cantidad)

inventario.empresa.botella600 =
(inventario.empresa.botella600 || 0)
+ (15 * Number(p.cantidad))

}

if(p.producto === "Paca 24 botellas 600 ml"){

inventario.empresa.paca24 =
(inventario.empresa.paca24 || 0)
- Number(p.cantidad)

inventario.empresa.botella600 =
(inventario.empresa.botella600 || 0)
+ (24 * Number(p.cantidad))

}
if(p.detalle && Array.isArray(p.detalle)){

for(const item of p.detalle){

if(
item.insumo === "Botella 1L" ||
item.insumo === "Botella 600 ml" ||
item.insumo === "Botella 6000 ml"
){
continue
}

await supabase
.from("insumos")
.insert([
{
insumo: item.insumo,
tipo: "devolucion",
cantidad: Number(item.cantidadTotal),
total: 0,
fecha: new Date().toLocaleDateString("en-CA",{
timeZone:"America/Guayaquil"
})
}
])

}

}

await supabase
.from("inventario")
.update({
empresa: inventario.empresa
})
.eq("id",1)
setMensaje("✅ Producción eliminada correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

filtrar()

}
// 🔥 ORDENAR
let dataOrdenada = [...data].sort((a,b)=> b.cantidad - a.cantidad)

return(

<div style={container}>

<h1 style={titulo}>📊 Reporte Producción</h1>

<div style={filtros}>

<input
type="date"
value={desde}
onChange={e=>setDesde(e.target.value)}
style={input}
/>

<input
type="date"
value={hasta}
onChange={e=>setHasta(e.target.value)}
style={input}
/>

<button
style={boton}
onClick={exportarExcel}
>
Exportar Excel
</button>

<button
style={{...boton,background:"#2563eb"}}
onClick={()=>setVerTabla(!verTabla)}
>
{verTabla ? "Ocultar tabla" : "Ver tabla"}
</button>

</div>

<h3>Total producido: {total}</h3>

<h3>Producto más producido: {productoTop}</h3>

<br/>

<canvas
ref={canvasRef}
width={900}
height={400}
style={{
background:"#fff",
border:"1px solid #ccc"
}}
/>
{mensaje && (

<div style={overlayMensaje}>
<div style={mensajeExito}>
{mensaje}
</div>
</div>

)}

{verTabla && (

<table style={tabla}>

<thead>

<tr>
<th>ID</th>
<th>Fecha</th>
<th>Producto</th>
<th>Cantidad</th>
<th>Total</th>
</tr>

</thead>

<tbody>

{dataOrdenada.map((p,i)=>(

<tr key={i}>
<td>{p.id}</td>
<td>{p.fecha}</td>
<td>{p.producto}</td>
<td>{p.cantidad}</td>
<td>${p.total}</td>

<td>
<button
onClick={()=>eliminarProduccion(p)}
style={{
background:"#dc2626",
color:"#fff",
border:"none",
padding:"8px 14px",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
>
🗑 Eliminar
</button>
</td>
</tr>

))}

</tbody>

</table>

)}

</div>

)

}

// estilos iguales
const container={
background:"#f4f6f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"28px",
marginBottom:"20px"
}

const filtros={
display:"flex",
gap:"10px",
marginBottom:"20px"
}

const input={
padding:"8px",
border:"1px solid #ccc",
borderRadius:"6px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"8px 15px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const tabla={
width:"100%",
borderCollapse:"collapse",
background:"#fff"
}
const overlayMensaje={
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}

const mensajeExito={
background:"#16a34a",
color:"#fff",
padding:"30px 45px",
borderRadius:"14px",
fontSize:"26px",
fontWeight:"bold",
boxShadow:"0 0 25px rgba(0,0,0,0.4)"
}