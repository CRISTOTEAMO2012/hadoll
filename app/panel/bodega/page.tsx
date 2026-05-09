"use client"

import { useState, useEffect } from "react"

export default function Bodega(){

const[modo,setModo]=useState("compra")

const[producto,setProducto]=useState("botellon20llave_vacios")
const[cantidad,setCantidad]=useState(1)
const[precio,setPrecio]=useState(0)
const[destino,setDestino]=useState("empresa")

const[historial,setHistorial]=useState([])
const[mostrarHistorial,setMostrarHistorial]=useState(false)

// 🔍 FILTROS
const[filtroTexto,setFiltroTexto]=useState("")
const[filtroDesde,setFiltroDesde]=useState("")
const[filtroHasta,setFiltroHasta]=useState("")

// 💰 TOTALES
const[totalFiltrado,setTotalFiltrado]=useState(0)
const[totalGeneral,setTotalGeneral]=useState(0)

// ✅ CLAVES CORRECTAS
const productos = [
{value:"botellon20llave_vacios", label:"Botellón 20L con llave"},
{value:"botellon20sin_llave_vacios", label:"Botellón 20L sin llave"},
{value:"llave_botellon", label:"Llave de botellón"},
{value:"botella600", label:"Botella 600 ml"},
{value:"botella6000", label:"Botella 6000 ml"},
{value:"botella1L", label:"Botella 1L"}
]

// 🔥 NO VAN A FINANZAS
const NO_GASTO = ["botella600","botella6000","botella1L"]

useEffect(()=>{cargarHistorial()},[])

function cargarHistorial(){

// 🔥 COMPRAS CON GASTO
let gastos = JSON.parse(localStorage.getItem("gastos")||"[]")

let compras = gastos
.filter((g:any) => g.tipo === "Compra inventario")
.map((c:any) => ({
...c,
movimiento:"Compra con gasto"
}))

// 🔥 DAÑADOS
let danados = JSON.parse(localStorage.getItem("danados")||"[]")

danados = danados.map((d:any) => ({
...d,
movimiento:"Dañado"
}))

// 🔥 STOCK EXISTENTE
let existentes = JSON.parse(localStorage.getItem("stockExistente")||"[]")

existentes = existentes.map((e:any) => ({
...e,
movimiento:"Stock existente"
}))

// 🔥 COMPRAS SIN GASTO
let comprasSinGasto = JSON.parse(localStorage.getItem("comprasSinGasto")||"[]")

comprasSinGasto = comprasSinGasto.map((c:any) => ({
...c,
movimiento:"Compra sin gasto"
}))

// 🔥 UNIR TODO
let historialCompleto = [
...compras,
...danados,
...existentes,
...comprasSinGasto
]

// 🔥 ORDENAR
historialCompleto.sort((a:any,b:any)=>
Number(new Date(b.fecha)) - Number(new Date(a.fecha))
)

let totalG = 0

compras.forEach(c=> totalG += Number(c.total || 0))

setTotalGeneral(totalG)

let filtrado = historialCompleto.filter(c=>{

let texto = (c.producto || "").toLowerCase()

let coincideTexto = texto.includes(filtroTexto.toLowerCase())

let coincideDesde = filtroDesde ? c.fecha >= filtroDesde : true

let coincideHasta = filtroHasta ? c.fecha <= filtroHasta : true

return coincideTexto && coincideDesde && coincideHasta

})

let totalF = 0

filtrado.forEach(f=>{
if(f.total){
totalF += Number(f.total || 0)
}
})

setTotalFiltrado(totalF)

setHistorial(filtrado)

}

useEffect(()=>{
if(mostrarHistorial){
cargarHistorial()
}
},[filtroTexto,filtroDesde,filtroHasta,mostrarHistorial])

function base(){
return{empresa:{},dorita:{}}
}

function obtenerInventario(){
let inv = JSON.parse(localStorage.getItem("inventario")||"null")
if(!inv) return base()

let baseInv = base()

inv.empresa = {...baseInv.empresa, ...inv.empresa}
inv.dorita = {...baseInv.dorita, ...inv.dorita}

return inv
}

// 🔥 NOMBRE BONITO
function nombreBonito(clave){

if(clave==="botellon20llave_vacios") return "Botellón 20L con llave"
if(clave==="botellon20sin_llave_vacios") return "Botellón 20L sin llave"
if(clave==="llave_botellon") return "Llave de botellón"
if(clave==="botella600") return "Botella 600 ml"
if(clave==="botella6000") return "Botella 6000 ml"
if(clave==="botella1L") return "Botella 1L"

return clave

}

function ejecutar(){

let inventario = obtenerInventario()

if(!inventario[destino][producto]){
inventario[destino][producto]=0
}

if(modo==="compra"){

inventario[destino][producto] += Number(cantidad)

// 🔥 COMPRAS SIN GASTO
if(NO_GASTO.includes(producto)){

let comprasSinGasto = JSON.parse(localStorage.getItem("comprasSinGasto") || "[]")

comprasSinGasto.push({
producto,
cantidad,
precio,
destino,
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("comprasSinGasto", JSON.stringify(comprasSinGasto))

let costos = JSON.parse(localStorage.getItem("costosBotellas") || "{}")

let prevCosto = costos[producto] || 0

let nuevoCosto = prevCosto === 0
? Number(precio)
: (prevCosto + Number(precio)) / 2

costos[producto] = nuevoCosto

localStorage.setItem("costosBotellas", JSON.stringify(costos))
}

// 🔥 COMPRAS CON GASTO
if(!NO_GASTO.includes(producto)){

let gastos = JSON.parse(localStorage.getItem("gastos")||"[]")

gastos.push({
tipo:"Compra inventario",
producto,
cantidad,
precio,
total:Number(cantidad)*Number(precio),
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("gastos",JSON.stringify(gastos))
}

alert("Compra registrada")
}

if(modo==="existente"){

inventario[destino][producto] += Number(cantidad)

// 🔥 GUARDAR HISTORIAL
let existentes = JSON.parse(localStorage.getItem("stockExistente")||"[]")

existentes.push({
producto,
cantidad,
destino,
fecha:new Date().toISOString().split("T")[0]
})

localStorage.setItem("stockExistente",JSON.stringify(existentes))

alert("Stock existente agregado")
}

if(modo==="danado"){

inventario[destino][producto] -= Number(cantidad)

// 🔥 GUARDAR HISTORIAL DE DAÑADOS
let danados = JSON.parse(localStorage.getItem("danados")||"[]")

danados.push({
producto,
cantidad,
destino,
fecha:new Date().toISOString().split("T")[0],
tipo:"dañado"
})

localStorage.setItem("danados",JSON.stringify(danados))

alert("Stock dañado descontado")
}

localStorage.setItem("inventario",JSON.stringify(inventario))

if(mostrarHistorial){
cargarHistorial()
}
}

return(

<div style={container}>

<div style={bloque}>

<h2 style={titulo}>🏬 BODEGA GENERAL</h2>

<div style={contenedorBotones}>
<button onClick={()=>setModo("compra")} style={botonModo(modo==="compra")}>Compra</button>
<button onClick={()=>setModo("existente")} style={botonModo(modo==="existente")}>Stock existente</button>
<button onClick={()=>setModo("danado")} style={botonModo(modo==="danado")}>Dañados</button>
</div>

<label style={label}>Producto</label>

<select value={producto} onChange={e=>setProducto(e.target.value)} style={input}>
{productos.map((p,i)=>(
<option key={i} value={p.value}>{p.label}</option>
))}
</select>

<label style={label}>Cantidad</label>

<input
type="number"
value={cantidad}
onChange={e=>setCantidad(e.target.value)}
style={input}
/>

{modo==="compra" &&(
<>
<label style={label}>Precio unitario</label>

<input
type="number"
value={precio}
onChange={e=>setPrecio(e.target.value)}
style={input}
/>
</>
)}

<label style={label}>Destino</label>

<select
value={destino}
onChange={e=>setDestino(e.target.value)}
style={input}
>
<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>
</select>

<button onClick={ejecutar} style={guardar}>
Registrar
</button>

</div>

<div style={acciones}>
<button
onClick={()=>setMostrarHistorial(!mostrarHistorial)}
style={btnAzul}
>
Historial
</button>
</div>

{mostrarHistorial && (

<div style={historialBox}>

<div style={totales}>
<div>Total filtrado: <b>${totalFiltrado}</b></div>
<div>Total general: <b>${totalGeneral}</b></div>
</div>

{historial.map((h,i)=>(

<div key={i} style={itemHistorial}>

<div>{h.fecha}</div>

<div>{nombreBonito(h.producto)}</div>

<div>{h.cantidad}</div>

<div>{h.movimiento}</div>

<div>
<b>
{h.total
? `$${h.total}`
: h.precio
? `$${h.precio}`
: "Sin gasto"}
</b>
</div>

</div>

))}

</div>

)}

</div>
)
}

// 🎨 ESTILOS (SIN TOCAR)
const container={background:"#f1f5f9",minHeight:"100vh",padding:"30px",color:"#111"}
const bloque={background:"#ffffff",padding:"20px",borderRadius:"12px",width:"360px",margin:"auto",color:"#111"}
const titulo={textAlign:"center", color:"#111"}
const label={marginTop:"10px", color:"#111"}
const contenedorBotones={display:"flex",gap:"10px"}
const botonModo=(a)=>({flex:1,padding:"8px",background:a?"#16a34a":"#e5e7eb",color:a?"#fff":"#111",border:"none",borderRadius:"6px",cursor:"pointer"})
const input={margin:"5px 0",padding:"10px",width:"100%",border:"1px solid #ccc",borderRadius:"6px",background:"#fff",color:"#111"}
const guardar={background:"#16a34a",color:"#fff",padding:"10px",width:"100%",border:"none",borderRadius:"6px",cursor:"pointer"}
const acciones={display:"flex",justifyContent:"center",marginTop:"20px"}
const btnAzul={background:"#2563eb",color:"#fff",padding:"10px",border:"none",borderRadius:"6px",cursor:"pointer"}
const historialBox={background:"#ffffff",marginTop:"20px",padding:"15px",borderRadius:"10px",color:"#111"}
const itemHistorial={display:"grid",gridTemplateColumns:"repeat(5,1fr)",borderBottom:"1px solid #e5e7eb",padding:"8px",fontSize:"14px"}
const totales={display:"flex",justifyContent:"space-between",marginBottom:"10px",fontWeight:"bold"}