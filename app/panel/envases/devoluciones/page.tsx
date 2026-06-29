"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../supabase"
export default function DevolucionesEnvases(){

const [clientes, setClientes] = useState<any[]>([])
const [cliente,setCliente]=useState("")
const [busqueda,setBusqueda]=useState("")
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")
const [destino,setDestino]=useState("empresa")
const [historial,setHistorial]=useState<any[]>([])
const [mensaje,setMensaje]=useState("")
const [verHistorial,setVerHistorial]=useState(false)
useEffect(()=>{
cargarClientes()
cargarHistorial()
},[])

async function cargarClientes(){

const { data, error } = await supabase
.from("clientes")
.select("*")
.order("nombre")

if(error){

console.log(error)

alert("Error cargando clientes")

return

}

setClientes(data || [])

}

let clientesFiltrados = clientes.filter((c:any)=>
(c.nombre || "")
.toLowerCase()
.includes(busqueda.toLowerCase())
)

async function cargarHistorial(){
    
// 🔥 AHORA SE LEE DESDE envasesprestados
const { data, error } = await supabase
.from("envases_prestados")
.select("*")
.eq("tipo","devuelto")
.order("id",{ascending:false})

if(error){

console.log(error)

return

}

setHistorial(data || [])

}

async function guardarDevolucion(){

if(!cliente) return alert("Seleccione cliente")
if(!producto) return alert("Seleccione producto")
if(!cantidad) return alert("Ingrese cantidad")

const { data: movimientos, error: errorMovimientos } = await supabase
.from("envases_prestados")
.select("*")

if(errorMovimientos){

console.log(errorMovimientos)

alert("Error verificando saldo")

return

}

let saldoCliente = 0
console.log(movimientos)
movimientos?.forEach((m:any)=>{

if(m.tipo==="prestado" || m.tipo==="inicial"){
saldoCliente += Number(m.cantidad)
}

if(m.tipo==="devuelto"){
saldoCliente -= Number(m.cantidad)
}

})

if(Number(cantidad) > saldoCliente){

alert(`El cliente solo tiene ${saldoCliente} envases pendientes`)

return

}

let hoy = new Date().toLocaleDateString(
"en-CA",
{timeZone:"America/Guayaquil"}
)

// GUARDAR DEVOLUCION

const { error: errorPrestado } = await supabase
.from("envases_prestados")
.insert([
{
cliente,
envase:producto,
cantidad:Number(cantidad),
fecha:hoy,
tipo:"devuelto"
}
])

if(errorPrestado){

console.log(errorPrestado)

alert("Error guardando devolución")

return

}

// CARGAR INVENTARIO

const { data: inventarioData, error: inventarioError } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

if(inventarioError){

console.log(inventarioError)

alert("Error cargando inventario")

return

}

let inventario:any = inventarioData

let clave = producto

inventario[destino][clave] += Number(cantidad)

const { error: errorInventario } = await supabase
.from("inventario")
.update({
[destino]: inventario[destino]
})
.eq("id",1)

if(errorInventario){

console.log(errorInventario)

alert("Error actualizando inventario")

return

}

setBusqueda("")
setCliente("")
setProducto("")
setCantidad("")

await cargarHistorial()

setMensaje("✅ Envase devuelto correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

}

return(

<div style={contenedor}>
{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}
<h1 style={titulo}>♻️ Devolución de Envases</h1>

<div style={card}>

<input
type="text"
placeholder="Buscar cliente"
value={busqueda}
onChange={(e)=>setBusqueda(e.target.value)}
style={input}
/>

<select
value={cliente}
onChange={(e)=>setCliente(e.target.value)}
style={input}
>

<option value="">
Seleccionar cliente
</option>

{clientesFiltrados.map((c:any,i:number)=>(
<option key={i} value={c.nombre}>
{c.nombre}
</option>
))}

</select>

{/* 🔥 SELECT IGUAL QUE REGISTRO INICIAL */}
<select
value={producto}
onChange={(e)=>setProducto(e.target.value)}
style={input}
>

<option value="">
Seleccione envase
</option>

<option value="botellon20llave_vacios">
Botellón 20L con llave
</option>

<option value="botellon20sin_llave_vacios">
Botellón 20L sin llave
</option>

</select>

<input
type="number"
placeholder="Cantidad devuelta"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
style={input}
/>

<select
value={destino}
onChange={(e)=>setDestino(e.target.value)}
style={input}
>

<option value="empresa">
EMPRESA
</option>

<option value="dorita">
DORITA
</option>

<option value="vehiculo1">
VEHICULO 1
</option>

<option value="vehiculo2">
VEHICULO 2
</option>

</select>

<button
style={boton}
onClick={guardarDevolucion}
>
Guardar devolución
</button>

<button
style={{
...boton,
background:"#2563eb",
marginTop:"10px"
}}
onClick={()=>setVerHistorial(!verHistorial)}
>
{verHistorial ? "Ocultar historial" : "Ver historial"}
</button>

</div>

{verHistorial && (

<div style={historialBox}>

<h2 style={{marginBottom:"20px"}}>
📋 Historial devoluciones
</h2>

{historial.length === 0 ? (

<p>No hay devoluciones registradas</p>

) : (

historial.map((d:any,i:number)=>(

<div key={i} style={item}>

<div>

<b>{d.cliente}</b>

<div style={{fontSize:"14px",color:"#666"}}>
{d.envase}
</div>

<div style={{fontSize:"13px",color:"#999"}}>
{d.fecha}
</div>

</div>

<div style={cantidadBox}>
-{d.cantidad}
</div>

</div>

))

)}

</div>

)}

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
fontSize:"32px",
marginBottom:"30px"
}

const card: any = {
background:"#fff",
padding:"25px",
borderRadius:"14px",
maxWidth:"500px",
display:"flex",
flexDirection:"column",
gap:"15px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const input={
padding:"12px",
border:"1px solid #ccc",
borderRadius:"8px",
fontSize:"15px"
}

const boton={
background:"#7c3aed",
color:"#fff",
border:"none",
padding:"14px",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"15px"
}

const historialBox={
marginTop:"30px",
background:"#fff",
padding:"25px",
borderRadius:"14px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}

const item={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"15px 0",
borderBottom:"1px solid #e5e7eb"
}

const cantidadBox={
background:"#dcfce7",
padding:"10px 16px",
borderRadius:"10px",
fontWeight:"bold",
color:"#166534"
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