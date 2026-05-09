"use client"

import { useEffect, useState } from "react"

export default function PedidoQR(){

const [productos,setProductos]=useState<any[]>([])
const [clientes,setClientes]=useState<any[]>([])

const [nombre,setNombre]=useState("")
const [telefono,setTelefono]=useState("")
const [ciudad,setCiudad]=useState("")
const [direccion,setDireccion]=useState("")
const [producto,setProducto]=useState("")
const [precio,setPrecio]=useState(0)
const [cantidad,setCantidad]=useState(1)
const [fechaSugerida,setFechaSugerida]=useState("")

const [tipoVenta,setTipoVenta]=useState("")

const numeroEmpresa = "593981143243"

useEffect(()=>{
let p = JSON.parse(localStorage.getItem("productos") || "[]")
let c = JSON.parse(localStorage.getItem("clientes") || "[]")

setProductos(p)
setClientes(c)
},[])

// 🔍 CLIENTE
function buscarCliente(tel:string){
setTelefono(tel)

let encontrado = clientes.find((c:any)=> c.telefono === tel)

if(encontrado){
setNombre(encontrado.nombre || "")
setDireccion(encontrado.direccion || "")
setCiudad(encontrado.ciudad || "")
}
}

// 🛒 PRODUCTO
function seleccionarProducto(nombreProd:string){
setProducto(nombreProd)
setTipoVenta("")
setPrecio(0)
setCantidad(1)
}

// 🔥 PRECIOS
function seleccionarTipo(e:any){

let tipo = e.target.value
setTipoVenta(tipo)

// 🔥 BLOQUEAR MINIMO
if(tipo === "mayor" && cantidad < 4){
setCantidad(4)
}

let prod = producto.toUpperCase()

if(prod.includes("BOTELLON") || prod.includes("20")){
if(tipo === "mayor") setPrecio(1)
if(tipo === "unidad") setPrecio(2)
}
else if(prod.includes("15")){
if(tipo === "mayor") setPrecio(3)
if(tipo === "unidad") setPrecio(4)
}
else if(prod.includes("24")){
if(tipo === "mayor") setPrecio(4)
if(tipo === "unidad") setPrecio(5)
}
else if(prod.includes("6000")){
if(tipo === "mayor") setPrecio(0.90)
if(tipo === "unidad") setPrecio(1.50)
}
else if(prod.includes("1L") || prod.includes("1000")){
if(tipo === "mayor") setPrecio(0.40)
if(tipo === "unidad") setPrecio(0.70)
}

}

// 📅 DIAS
function diasCiudad(){
if(ciudad==="GUARANDA") return [1,2,3]
if(["CHIMBO","SAN MIGUEL","CHILLANES"].includes(ciudad)) return [4]
if(ciudad==="RIOBAMBA") return [5]
return []
}

// 📅 FECHA
function calcularFecha(){
let dias = diasCiudad()
if(!dias.length) return

let hoy = new Date()

for(let i=0;i<10;i++){
let f = new Date()
f.setDate(hoy.getDate()+i)

if(dias.includes(f.getDay())){
let iso = f.toISOString().split("T")[0]
setFechaSugerida(iso)
return
}
}
}

useEffect(()=>{
if(ciudad) calcularFecha()
},[ciudad])

function formatearFechaBonita(fecha:string){
let f = new Date(fecha + "T00:00:00")

return f.toLocaleDateString("es-EC",{
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
})
}

// 💾 GUARDAR (CORREGIDO 🔥)
function enviar(){

if(!nombre || !telefono || !producto || !ciudad){
alert("Completa datos")
return
}

let pedidos = JSON.parse(localStorage.getItem("pedidos")||"[]")

// 🔍 BUSCAR SI YA EXISTE PEDIDO
let existente = pedidos.find(p => 
p.telefono === telefono &&
p.producto === producto &&
p.estado === "pendiente"
)

if(existente){
// 🔥 SUMAR
existente.cantidad = Number(existente.cantidad) + Number(cantidad)
existente.total = Number(existente.precio) * Number(existente.cantidad)
}else{
// 🆕 NUEVO
pedidos.push({
cliente:nombre,
telefono,
ciudad,
direccion,
producto,
precio,
cantidad,
total:precio*cantidad,
fecha:fechaSugerida,
estado:"pendiente",
origen:"qr"
})
}

localStorage.setItem("pedidos",JSON.stringify(pedidos))

alert("Pedido enviado")

setNombre("")
setTelefono("")
setCiudad("")
setDireccion("")
setProducto("")
setPrecio(0)
setCantidad(1)
setFechaSugerida("")
setTipoVenta("")
}

// 📲 WHATSAPP
function whatsapp(){
let url=`https://wa.me/${numeroEmpresa}?text=Hola quiero información`
window.open(url,"_blank")
}

return(

<div style={{
background:"linear-gradient(135deg,#6366f1,#9333ea)",
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative",
overflow:"hidden"
}}>

<div style={{
position:"absolute",
top:"50%",
left:"50%",
transform:"translate(-50%,-50%)",
fontSize:"160px",
fontWeight:"bold",
color:"rgba(255,255,255,0.05)",
pointerEvents:"none",
whiteSpace:"nowrap",
animation:"mover 20s linear infinite"
}}>
HADOLL WATER
</div>

<style>{`
@keyframes mover {
0% { transform: translate(-50%, -50%) translateX(-80px); }
50% { transform: translate(-50%, -50%) translateX(80px); }
100% { transform: translate(-50%, -50%) translateX(-80px); }
}
`}</style>

<div style={{
background:"#ffffff",
padding:"25px",
borderRadius:"15px",
width:"100%",
maxWidth:"400px",
color:"#000",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)",
zIndex:1
}}>

<h2 style={{textAlign:"center"}}>💧 PEDIDOS HADOLL WATER</h2>

<input placeholder="Teléfono" value={telefono} onChange={e=>buscarCliente(e.target.value)} style={input}/>
<input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={input}/>

<select value={ciudad} onChange={e=>setCiudad(e.target.value)} style={input}>
<option value="">CIUDAD</option>
<option>GUARANDA</option>
<option>CHIMBO</option>
<option>SAN MIGUEL</option>
<option>CHILLANES</option>
<option>RIOBAMBA</option>
</select>

{fechaSugerida && (
<div style={{
background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
padding:"18px",
borderRadius:"12px",
marginBottom:"12px",
textAlign:"center",
color:"#fff",
fontSize:"18px",
fontWeight:"bold"
}}>
🚚 ENTREGA PROGRAMADA:
<br/>
{formatearFechaBonita(fechaSugerida)}
</div>
)}

<input placeholder="Dirección" value={direccion} onChange={e=>setDireccion(e.target.value)} style={input}/>

<select value={producto} onChange={e=>seleccionarProducto(e.target.value)} style={input}>
<option value="">🚰 SELECCIONA TU PRODUCTO</option>
{productos.map((p,i)=>(
<option key={i} value={p.nombre}>
🔥 {p.nombre.toUpperCase()}
</option>
))}
</select>

{producto && (
<select value={tipoVenta} onChange={seleccionarTipo} style={input}>
<option value="">💰 TIPO DE COMPRA</option>
<option value="mayor">📦 AL POR MAYOR</option>
<option value="unidad">🧃 POR UNIDAD</option>
</select>
)}

{precio > 0 && (
<div style={precioBox}>
💰 PRECIO: ${precio} POR UNIDAD
</div>
)}

<input
type="number"
value={cantidad}
min={tipoVenta === "mayor" ? 4 : 1}
onChange={e=>{
let val = Number(e.target.value)
if(tipoVenta === "mayor" && val < 4){
setCantidad(4)
}else{
setCantidad(val)
}
}}
style={input}
/>

<button onClick={enviar} style={boton}>
CONFIRMAR PEDIDO
</button>

<button onClick={whatsapp} style={botonW}>
📲 HABLAR POR WHATSAPP
</button>

</div>
</div>
)
}

// 🎨 ESTILOS
const input={
display:"block",
width:"100%",
padding:"12px",
marginBottom:"10px",
border:"1px solid #ccc",
borderRadius:"8px",
background:"#fff",
color:"#000",
fontWeight:"bold"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"8px",
width:"100%",
fontWeight:"bold"
}

const botonW={
background:"#25d366",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"8px",
width:"100%",
marginTop:"10px",
fontWeight:"bold"
}

const precioBox={
background:"#dcfce7",
padding:"12px",
borderRadius:"8px",
textAlign:"center",
marginBottom:"10px",
fontWeight:"bold",
fontSize:"18px"
}