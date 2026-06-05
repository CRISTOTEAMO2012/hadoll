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

let filtrado = prod.filter(p=>{

if(!desde || !hasta) return false

return p.fecha >= desde && p.fecha <= hasta

})

setData(filtrado)

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

// 🔥 ORDENAR
let dataOrdenada = [...data].sort((a,b)=> b.cantidad - a.cantidad)

return(

<div style={container}>

<h1 style={titulo}>📊 REPORTE DE PRODUCCIÓN</h1>

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

<button style={boton} onClick={exportarExcel}>
⬇ Excel
</button>

<button
style={{...boton,background:"#2563eb"}}
onClick={()=>setVerTabla(!verTabla)}
>
{verTabla ? "Ocultar tabla" : "Ver tabla"}
</button>

</div>

<h2>🔢 Total producido: {total}</h2>
<h3>🏆 Producto más producido: {productoTop}</h3>

<br/>

<canvas
ref={canvasRef}
width={900}
height={400}
style={{background:"#fff",border:"1px solid #ccc"}}
/>

<br/><br/>

{verTabla && (

<div style={{maxWidth:"800px"}}>

<table style={tabla}>

<thead style={{background:"#1e293b",color:"#fff"}}>

<tr>
<th>Fecha</th>
<th>Producto</th>
<th>Cantidad</th>
</tr>

</thead>

<tbody>

{dataOrdenada.map((p,i)=>(

<tr key={i} style={{textAlign:"center",borderBottom:"1px solid #ddd"}}>

<td>{p.fecha}</td>
<td>{p.producto}</td>
<td>{p.cantidad}</td>

</tr>

))}

</tbody>

</table>

</div>

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