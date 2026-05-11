"use client"

import {useEffect,useState} from "react"

export default function Pedidos(){

const [pedidos,setPedidos]=useState([])
const [filtroDia,setFiltroDia]=useState("TODOS")

useEffect(()=>{
cargarTodo()
},[])

function cargarTodo(){
let ped = JSON.parse(localStorage.getItem("pedidos")||"[]")
setPedidos(ped)
}

// 📅 FORMATEAR DÍA
function obtenerDia(fecha){
if(!fecha) return "-"
let f = new Date(fecha+"T00:00:00")
return f.toLocaleDateString("es-EC",{weekday:"long"})
}

// 🔍 FILTRAR
function pedidosFiltrados(){
if(filtroDia==="TODOS") return pedidos

return pedidos.filter(p=>{
let dia = obtenerDia(p.fecha)
return dia.toLowerCase() === filtroDia.toLowerCase()
})
}

// 🔥 ATENDER PEDIDO
function atenderPedido(index:any){

let lista=[...pedidos]
lista[index].estado="atendido"

localStorage.setItem("pedidos",JSON.stringify(lista))
setPedidos(lista)

}

// ❌ ELIMINAR
function eliminarPedido(index:any){

if(!confirm("¿Eliminar pedido?")) return

let lista=[...pedidos]
lista.splice(index,1)

localStorage.setItem("pedidos",JSON.stringify(lista))
setPedidos(lista)

}

return(

<div style={contenedor}>

<h1 style={titulo}>💧 PEDIDOS EN TIEMPO REAL</h1>

{/* 🔥 FILTRO POR DÍA */}
<div style={filtroBox}>

<select
value={filtroDia}
onChange={(e)=>setFiltroDia(e.target.value)}
style={filtroSelect}
>
<option value="TODOS">📅 TODOS</option>
<option value="lunes">Lunes</option>
<option value="martes">Martes</option>
<option value="miércoles">Miércoles</option>
<option value="jueves">Jueves</option>
<option value="viernes">Viernes</option>
<option value="sábado">Sábado</option>
<option value="domingo">Domingo</option>
</select>

</div>

<div style={tablaContainer}>

<table style={tabla}>

<thead style={thead}>
<tr>
<th>Cliente</th>
<th>Producto</th>
<th>Cantidad</th>
<th>Día</th>
<th>Fecha</th>
<th>Ciudad</th>
<th>Estado</th>
<th>Acciones</th>
</tr>
</thead>

<tbody>

{pedidosFiltrados().map((p,i)=>(

<tr key={i} style={fila}>

<td>{p.cliente}</td>
<td>{p.producto}</td>
<td style={{fontWeight:"bold"}}>{p.cantidad}</td>

<td style={{textTransform:"capitalize"}}>
{obtenerDia(p.fecha)}
</td>

<td>{p.fecha}</td>
<td>{p.ciudad || "-"}</td>

<td>
<span style={{
padding:"6px 10px",
borderRadius:"20px",
background:p.estado==="atendido"?"#22c55e":"#f59e0b",
color:"#fff",
fontSize:"12px",
fontWeight:"bold"
}}>
{p.estado}
</span>
</td>

<td style={{display:"flex",gap:"6px",justifyContent:"center"}}>

<button
onClick={()=>atenderPedido(i)}
style={botonAtender}
>
✔ Atendido
</button>

<button
onClick={()=>eliminarPedido(i)}
style={botonEliminar}
>
✖ Eliminar
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}

// 🎨 ESTILOS PRO

const contenedor={
background:"linear-gradient(135deg,#0f172a,#1e293b)",
minHeight:"100vh",
padding:"40px",
color:"#fff"
}

const titulo={
fontSize:"32px",
marginBottom:"20px",
textAlign:"center"
}

const filtroBox={
display:"flex",
justifyContent:"center",
marginBottom:"20px"
}

const filtroSelect={
padding:"10px",
borderRadius:"8px",
border:"none",
fontWeight:"bold"
}

const tablaContainer={
background:"#fff",
borderRadius:"12px",
padding:"20px",
overflowX:"auto"
}

const tabla={
width:"100%",
borderCollapse:"collapse",
color:"#000"
}

const thead={
background:"#1e293b",
color:"#fff"
}

const fila={
textAlign:"center",
borderBottom:"1px solid #ddd"
}

const botonEliminar={
background:"#ef4444",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

const botonAtender={
background:"#22c55e",
color:"#fff",
padding:"6px 10px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}