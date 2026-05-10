"use client"

import {useState,useEffect} from "react"
import * as XLSX from "xlsx"

export default function Inicial(){

const [cliente,setCliente]=useState("")
const [tipo,setTipo]=useState("")
const [cantidad,setCantidad]=useState("")
const [clientes, setClientes] = useState<any[]>([])
const [data,setData]=useState([])
const [verTabla,setVerTabla]=useState(false)

useEffect(()=>{

let c=JSON.parse(localStorage.getItem("clientes")||"[]")
setClientes(c)

cargar()

},[])

function cargar(){

let prestados=JSON.parse(localStorage.getItem("envasesprestados")||"[]")

let iniciales = prestados.filter(p=>p.tipo==="inicial")

setData(iniciales)

}

// 🔥 NOMBRE BONITO
function nombreBonito(clave){

if(clave === "Botellón 20L con llave") return "Botellón 20L con llave"

if(clave === "Botellón 20L sin llave") return "Botellón 20L sin llave"

if(clave === "botellon20llave_vacios") return "Botellón 20L con llave"

if(clave === "botellon20sin_llave_vacios") return "Botellón 20L sin llave"

return clave

}

function guardar(){

if(!cliente || cliente==="Seleccionar cliente"){
alert("Seleccione cliente")
return
}

if(!tipo){
alert("Seleccione tipo de envase")
return
}

if(!cantidad || Number(cantidad)<=0){
alert("Ingrese cantidad válida")
return
}

let prestados=JSON.parse(localStorage.getItem("envasesprestados")||"[]")

// 🔥 USAR NOMBRE BONITO
let nombreEnvase = nombreBonito(tipo)

// 🔥 BUSCAR SI YA EXISTE
let index = prestados.findIndex(p =>

p.cliente===cliente &&
p.tipo==="inicial" &&
p.envase===nombreEnvase

)

if(index !== -1){

prestados[index].cantidad += Number(cantidad)

}else{

prestados.push({
cliente,
envase:nombreEnvase,
cantidad:Number(cantidad),
fecha:new Date().toISOString().split("T")[0],
tipo:"inicial"
})

}

localStorage.setItem("envasesprestados",JSON.stringify(prestados))

cargar()

setCantidad("")

alert("Guardado correctamente")

}

// 🔥 EXPORTAR
function exportarExcel(){

let ws = XLSX.utils.json_to_sheet(data)

let wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, "Inicial")

XLSX.writeFile(wb, "envases_inicial.xlsx")

}

return(

<div style={contenedor}>

<h1 style={titulo}>📥 Registro Inicial</h1>

<div style={card}>

<select
style={input}
value={cliente}
onChange={(e)=>setCliente(e.target.value)}
>

<option>Seleccionar cliente</option>

{clientes.map((c,i)=>(

<option key={i}>
{c.nombre}
</option>

))}

</select>

<select
style={input}
value={tipo}
onChange={(e)=>setTipo(e.target.value)}
>

<option value="">
Tipo de envase
</option>

<option value="Botellón 20L con llave">
Botellón 20L con llave
</option>

<option value="Botellón 20L sin llave">
Botellón 20L sin llave
</option>

</select>

<input
style={input}
type="number"
placeholder="Cantidad"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
/>

<button style={boton} onClick={guardar}>
Guardar
</button>

<button
style={{...boton,background:"#2563eb",marginTop:"10px"}}
onClick={()=>setVerTabla(!verTabla)}
>
{verTabla ? "Ocultar tabla" : "Ver tabla"}
</button>

<button
style={{...boton,background:"#f59e0b",marginTop:"10px"}}
onClick={exportarExcel}
>
Exportar Excel
</button>

</div>

{/* 🔥 TABLA */}
{verTabla && (

<div style={{marginTop:"30px",maxWidth:"800px"}}>

<table style={tabla}>

<thead style={{background:"#1e293b",color:"#fff"}}>

<tr>
<th>Cliente</th>
<th>Envase</th>
<th>Cantidad</th>
<th>Fecha</th>
</tr>

</thead>

<tbody>

{data.map((d,i)=>(

<tr
key={i}
style={{
textAlign:"center",
borderBottom:"1px solid #ddd"
}}
>

<td>{d.cliente}</td>

<td>{nombreBonito(d.envase)}</td>

<td>{d.cantidad}</td>

<td>{d.fecha}</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</div>

)

}

// 🎨 estilos

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
background:"#fff",
padding:"20px",
borderRadius:"10px",
maxWidth:"400px"
}

const input={
display:"block",
width:"100%",
padding:"10px",
marginBottom:"10px",
border:"1px solid #999",
borderRadius:"6px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"10px",
border:"none",
borderRadius:"6px",
width:"100%"
}

const tabla={
width:"100%",
borderCollapse:"collapse",
background:"#fff"
}