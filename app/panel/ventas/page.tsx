"use client"

import {useState,useEffect} from "react"
import { supabase } from "../../../supabase"
export default function Ventas(){

const [clientes, setClientes] = useState<any[]>([])
const [vehiculos,setVehiculos]=useState<any[]>([])
const [productos,setProductos]=useState<any[]>([])

const [busqueda,setBusqueda]=useState("")
const [cliente,setCliente]=useState("")

const [origen,setOrigen]=useState("empresa")
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState(1)
const [precio,setPrecio]=useState("")
const [pago,setPago]=useState("efectivo")

// 🔥 NUEVO
const [abono,setAbono]=useState("")
const [metodoMixto,setMetodoMixto]=useState("efectivo")

const [tipoEnvase,setTipoEnvase]=useState("cambio")

const [devolucionManual,setDevolucionManual]=useState(false)

const [vaciosConLlave,setVaciosConLlave]=useState(0)

const [vaciosSinLlave,setVaciosSinLlave]=useState(0)

const [mensaje,setMensaje]=useState("")
useEffect(()=>{
cargarDatos()
},[])

async function cargarDatos(){

// CLIENTES
const { data: clientesData } = await supabase
.from("clientes")
.select("*")
.order("nombre")

// VEHICULOS
const { data: vehiculosData } = await supabase
.from("vehiculos")
.select("*")
.order("codigo")

// PRODUCTOS
const { data: productosData } = await supabase
.from("productos")
.select("*")
.order("nombre")

setClientes(clientesData || [])
setVehiculos(vehiculosData || [])
setProductos(productosData || [])

}

let clientesFiltrados = clientes.filter((c:any)=>
(c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
)
const vehiculo1 = vehiculos.find(
(v:any)=>v.codigo==="vehiculo1"
)

const vehiculo2 = vehiculos.find(
(v:any)=>v.codigo==="vehiculo2"
)

// 🔥 TRADUCTOR CLAVE
function obtenerClave(nombre:string){

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

// 🔁 VACÍOS
function obtenerClaveVacio(nombre:string){

nombre = nombre.toLowerCase()

if(nombre.includes("con llave")) return "botellon20llave_vacios"
if(nombre.includes("sin llave")) return "botellon20sin_llave_vacios"

return null
}

// 🔥 FECHA ECUADOR
function obtenerFechaEcuador(){

return new Date().toLocaleDateString(
"en-CA",
{
timeZone:"America/Guayaquil"
}
)

}

async function guardarVenta(){

if(cliente==""||producto==""){
alert("Complete los datos")
return
}

let cant = Number(cantidad)
let prec = Number(precio)

if(isNaN(cant) || isNaN(prec)){
alert("Cantidad o precio inválido")
return
}

let totalVenta = cant * prec

let hoy = obtenerFechaEcuador()
const { data: inventarioData, error: inventarioError } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()

if(inventarioError){

alert("Error cargando inventario")
console.log(inventarioError)
return

}

let inventario = inventarioData

let clave:any = obtenerClave(producto)

// 🔒 VALIDAR INVENTARIO
if(!inventario[origen] || inventario[origen][clave] === undefined){
alert("Producto no existe en inventario")
return
}

if(inventario[origen][clave] < cant){
alert("Stock insuficiente")
return
}

// 🔻 RESTAR INVENTARIO
inventario[origen][clave] -= cant

// 🔁 CAMBIO BOTELLONES
if(
producto.toLowerCase().includes("20l") &&
tipoEnvase==="cambio"
){

if(!devolucionManual){

let claveVacio:any = obtenerClaveVacio(producto)

if(!inventario[origen][claveVacio]){
inventario[origen][claveVacio]=0
}

inventario[origen][claveVacio]+=cant

}else{

if(
(vaciosConLlave + vaciosSinLlave) !== cant
){
alert(
"La suma de vacíos debe ser igual a la cantidad vendida"
)
return
}

if(!inventario[origen]["botellon20llave_vacios"]){
inventario[origen]["botellon20llave_vacios"]=0
}

if(!inventario[origen]["botellon20sin_llave_vacios"]){
inventario[origen]["botellon20sin_llave_vacios"]=0
}

inventario[origen]["botellon20llave_vacios"] += vaciosConLlave

inventario[origen]["botellon20sin_llave_vacios"] += vaciosSinLlave

}

}

// 🫙 ENVASE PRESTADO

if(
producto.toLowerCase().includes("20l") &&
tipoEnvase==="prestado"
){

const { error } = await supabase
.from("envases_prestados")
.insert([
{
cliente: cliente.trim().toUpperCase(),
envase: obtenerClaveVacio(producto),
cantidad: cant,
fecha: hoy,
tipo: "prestado"
}
])

if(error){

console.log(error)

alert("Error guardando envase prestado")

return

}

}

// 🫙 ENVASE VENDIDO

if(
producto.toLowerCase().includes("20l") &&
tipoEnvase==="vendido"
){

const { error } = await supabase
.from("envases_vendidos")
.insert([
{
cliente,
producto,
cantidad: cant,
fecha: hoy
}
])

if(error){

console.log(error)

alert("Error guardando envase vendido")

return

}

}

// 💾 INVENTARIO
const { error: errorInventario } = await supabase
.from("inventario")
.update({
[origen]: inventario[origen]
})
.eq("id",1)

if(errorInventario){

alert("Error actualizando inventario")

console.log(errorInventario)

return

}
// 🧾 VENTAS

// 🧾 GUARDAR VENTA EN SUPABASE

const { error: errorVenta } = await supabase
.from("ventas")
.insert([
{
fecha: hoy,
cliente,
producto,
cantidad: cant,
precio: prec,
total: totalVenta,
origen,
pago,
tipo_envase: tipoEnvase
}
])

if(errorVenta){

console.log(errorVenta)

alert("Error guardando venta")

return

}

// 💳 FIADO TOTAL

if(pago === "fiado"){

const { error } = await supabase
.from("deudas")
.insert([
{
cliente,
producto,
cantidad: cant,
monto: totalVenta,
fecha: hoy,
estado: "pendiente"
}
])

if(error){

console.log(error)

alert("Error guardando deuda")

return

}

}

// 💰 EFECTIVO O TRANSFERENCIA TOTAL

if(pago === "efectivo" || pago === "transferencia"){

const { error: errorCaja } = await supabase
.from("caja")
.insert([
{
tipo:"ingreso",
detalle:`Venta de ${producto}`,
monto: totalVenta,
fecha:hoy,
metodo:pago
}
])

if(errorCaja){

console.log(errorCaja)

alert("Error guardando ingreso en caja")

return

}

}

// 🔥 PAGO MIXTO
if(pago === "mixto"){

let valorAbono = Number(abono)

if(isNaN(valorAbono) || valorAbono <= 0){
alert("Ingrese abono válido")
return
}

if(valorAbono >= totalVenta){
alert("El abono no puede ser mayor o igual al total")
return
}

let restante = totalVenta - valorAbono

// 💰 GUARDAR ABONO EN CAJA

const { error: errorCajaMixto } = await supabase
.from("caja")
.insert([
{
tipo:"ingreso",
detalle:`Venta de ${producto}`,
monto: valorAbono,
fecha:hoy,
metodo:metodoMixto
}
])

if(errorCajaMixto){

console.log(errorCajaMixto)

alert("Error guardando abono en caja")

return

}

// 💳 GUARDAR DEUDA EN SUPABASE

const { error: errorDeuda } = await supabase
.from("deudas")
.insert([
{
cliente,
producto,
cantidad: cant,
monto: restante,
fecha: hoy,
estado: "pendiente"
}
])

if(errorDeuda){

console.log(errorDeuda)

alert("Error guardando deuda")

return

}

}

setMensaje("✅ Venta registrada correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

setBusqueda("")
setCliente("")
setOrigen("empresa")
setProducto("")
setCantidad(1)
setPrecio("")
setPago("efectivo")
setAbono("")
setMetodoMixto("efectivo")
setTipoEnvase("cambio")
setDevolucionManual(false)
setVaciosConLlave(0)
setVaciosSinLlave(0)
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

<h1 style={titulo}>💰 Registrar Venta</h1>

<div style={formulario}>

<input
style={input}
placeholder="Buscar cliente"
value={busqueda}
onChange={(e)=>setBusqueda(e.target.value)}
/>

<select
style={{
...input,
background:"#dbeafe",
color:"#000",
fontWeight:"bold"
}}
value={cliente}
onChange={(e)=>setCliente(e.target.value)}
>
<option value="">Seleccionar cliente</option>

{clientesFiltrados.map((c:any,i:number)=>(
<option key={i} value={c.nombre}>
{c.nombre}
</option>
))}

</select>

<div style={grupoIconos}>

<button
style={origen==="empresa" ? botonActivo : botonIcono}
onClick={()=>setOrigen("empresa")}
>
🏢 Empresa
</button>

<button
style={origen==="dorita" ? botonActivo : botonIcono}
onClick={()=>setOrigen("dorita")}
>
🏠 Dorita
</button>

<button
style={origen==="vehiculo1" ? botonActivo : botonIcono}
onClick={()=>setOrigen("vehiculo1")}
>
🚚 {vehiculo1?.marca || "Vehículo 1"}
</button>

<button
style={origen==="vehiculo2" ? botonActivo : botonIcono}
onClick={()=>setOrigen("vehiculo2")}
>
🚐 {vehiculo2?.marca || "Vehículo 2"}
</button>

</div>

<select
style={{
...input,
background:"#dbeafe",
color:"#000",
fontWeight:"bold"
}}
value={producto}
onChange={(e)=>setProducto(e.target.value)}
>

<option value="">Seleccionar producto</option>

{productos.map((p:any,i:number)=>(
<option key={i} value={p.nombre}>
{p.nombre}
</option>
))}

</select>

{producto.toLowerCase().includes("20l") && (

<div style={grupoIconos}>

<button
style={tipoEnvase==="cambio" ? botonActivo : botonIcono}
onClick={()=>setTipoEnvase("cambio")}
>
🔄 Cambio
</button>

<button
style={tipoEnvase==="prestado" ? botonActivo : botonIcono}
onClick={()=>setTipoEnvase("prestado")}
>
🫙 Prestado
</button>

<button
style={tipoEnvase==="vendido" ? botonActivo : botonIcono}
onClick={()=>setTipoEnvase("vendido")}
>
💰 Vendido
</button>

</div>

)}

{producto.toLowerCase().includes("20l") &&
tipoEnvase==="cambio" && (

<div
style={{
border:"1px solid #d1d5db",
padding:"12px",
borderRadius:"10px"
}}
>

<label
style={{
display:"flex",
gap:"10px",
alignItems:"center"
}}
>

<input
type="checkbox"
checked={devolucionManual}
onChange={(e)=>setDevolucionManual(e.target.checked)}
/>

Devolución personalizada

</label>

{devolucionManual && (

<>

<div>

<p
style={{
fontWeight:"bold",
marginBottom:"5px"
}}
>
🔵 Vacíos con llave recibidos
</p>

<input
style={input}
type="number"
value={vaciosConLlave}
onChange={(e)=>
setVaciosConLlave(Number(e.target.value))
}
/>

</div>

<div>

<p
style={{
fontWeight:"bold",
marginBottom:"5px"
}}
>
⚪ Vacíos sin llave recibidos
</p>

<input
style={input}
type="number"
value={vaciosSinLlave}
onChange={(e)=>
setVaciosSinLlave(Number(e.target.value))
}
/>

</div>

</>

)}

</div>

)}

<input
style={input}
type="number"
value={cantidad}
onChange={(e)=>setCantidad(Number(e.target.value))}
placeholder="Cantidad"
/>

<input
style={input}
type="number"
value={precio}
onChange={(e)=>setPrecio(e.target.value)}
placeholder="Precio"
/>

<div style={grupoIconos}>

<button
style={pago==="efectivo" ? botonActivo : botonIcono}
onClick={()=>setPago("efectivo")}
>
💵 Efectivo
</button>

<button
style={pago==="transferencia" ? botonActivo : botonIcono}
onClick={()=>setPago("transferencia")}
>
🏦 Transferencia
</button>

<button
style={pago==="fiado" ? botonActivo : botonIcono}
onClick={()=>setPago("fiado")}
>
📒 Fiado
</button>

<button
style={pago==="mixto" ? botonActivo : botonIcono}
onClick={()=>setPago("mixto")}
>
⚖️ Mixto
</button>

</div>

{/* 🔥 SOLO SI ES MIXTO */}
{pago === "mixto" && (

<>

<input
style={input}
type="number"
value={abono}
onChange={(e)=>setAbono(e.target.value)}
placeholder="Valor abonado"
/>

<select
style={input}
value={metodoMixto}
onChange={(e)=>setMetodoMixto(e.target.value)}
>

<option value="efectivo">Efectivo</option>
<option value="transferencia">Transferencia</option>

</select>

</>

)}

<div style={resumenVenta}>

<h3>📋 Resumen</h3>

<p><b>Cliente:</b> {cliente || "-"}</p>

<p><b>Producto:</b> {producto || "-"}</p>

<p><b>Cantidad:</b> {cantidad}</p>

<p><b>Precio:</b> ${precio || 0}</p>

<p>
<b>Total:</b>
${Number(cantidad || 0) * Number(precio || 0)}
</p>

</div>

<button
style={boton}
onClick={guardarVenta}
>
Guardar Venta
</button>

</div>

</div>

)

}

const contenedor={
background:"#ffffff",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"30px",
marginBottom:"30px",
textAlign:"center" as const
}

const formulario={
background:"#f9fafb",
padding:"25px",
borderRadius:"10px",
maxWidth:"420px",
display:"flex",
flexDirection:"column" as const,
gap:"12px",
border:"1px solid #ddd",
margin:"0 auto"
}

const input={
padding:"12px",
border:"2px solid #2563eb",
borderRadius:"8px",
background:"#eff6ff",
color:"#000",
fontWeight:"bold",
fontSize:"15px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
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
const grupoIconos={
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"10px"
}

const botonIcono={
padding:"15px",
border:"2px solid #d1d5db",
borderRadius:"12px",
background:"#fff",
cursor:"pointer",
fontSize:"16px",
fontWeight:"bold"
}

const botonActivo={
padding:"15px",
border:"2px solid #16a34a",
borderRadius:"12px",
background:"#dcfce7",
cursor:"pointer",
fontSize:"16px",
fontWeight:"bold"
}

const resumenVenta={
background:"#eff6ff",
padding:"15px",
borderRadius:"10px",
border:"1px solid #93c5fd"
}