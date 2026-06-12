"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabase"
export default function PedidoQR(){

const [productos,setProductos]=useState<any[]>([])
const [clientes,setClientes]=useState<any[]>([])

const [nombre,setNombre]=useState("")
const [telefono,setTelefono]=useState("")
const [ciudad,setCiudad]=useState("")
const [direccion,setDireccion]=useState("")
const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState<any>("")
const [fechaSugerida,setFechaSugerida]=useState("")

const [mensaje,setMensaje]=useState("")

const numeroEmpresa = "593981143243"

useEffect(()=>{

async function cargarDatos(){

const { data: clientesData } = await supabase
.from("clientes")
.select("*")

setClientes(clientesData || [])

const { data: productosData } = await supabase
.from("productos")
.select("*")

setProductos(productosData || [])

}

cargarDatos()

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
setCantidad("")

}

// 📅 DIAS
function diasCiudad(){

let c = ciudad.toUpperCase()

if(c === "GUARANDA")
return [1,2,5] // lunes martes viernes

if(c === "CHIMBO")
return [4] // jueves

if(c === "SAN MIGUEL")
return [4] // jueves

if(c === "RIOBAMBA")
return [0] // domingo

if(c === "CHILLANES")
return [4] // jueves (luego validamos quincenal)

return []

}

// 📅 FECHA
function calcularFecha(){
if(ciudad.toUpperCase() === "CHILLANES"){

const fechasChillanes = [
"2026-06-18",
"2026-07-02",
"2026-07-16",
"2026-07-30",
"2026-08-13",
"2026-08-27",
"2026-09-10",
"2026-09-24"
]

let hoy = new Date()

let hoyTexto =
`${hoy.getFullYear()}-${
String(hoy.getMonth()+1).padStart(2,"0")
}-${
String(hoy.getDate()).padStart(2,"0")
}`

let siguiente = fechasChillanes.find(f => f >= hoyTexto)

if(siguiente){

setFechaSugerida(siguiente)

return

}

}
let dias = diasCiudad()

if(!dias.length) return

let hoy = new Date()

for(let i=0;i<10;i++){

let f = new Date()

f.setDate(hoy.getDate()+i)

if(dias.includes(f.getDay())){

let anio = f.getFullYear()
let mes = String(f.getMonth()+1).padStart(2,"0")
let diaMes = String(f.getDate()).padStart(2,"0")

let iso = `${anio}-${mes}-${diaMes}`

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

// 💾 GUARDAR
async function enviar(){

if(!nombre || !telefono || !producto || !ciudad || !cantidad){

alert("Completa datos")

return

}

const { error } = await supabase
.from("pedidos")
.insert([
{
cliente:nombre,
telefono,
ciudad,
direccion,
producto,
cantidad:Number(cantidad),
fecha:fechaSugerida,
estado:"pendiente",
origen:"qr"
}
])

if(error){

alert("ERROR GUARDANDO PEDIDO")

console.log(error)

return

}

// ✅ MENSAJE BONITO
setMensaje("✅ PEDIDO REALIZADO CORRECTAMENTE")

setTimeout(()=>{

setMensaje("")

},2000)

setNombre("")
setTelefono("")
setCiudad("")
setDireccion("")
setProducto("")
setCantidad("")
setFechaSugerida("")

}

// 📲 WHATSAPP
function whatsapp(){

let url=`https://wa.me/${numeroEmpresa}?text=Hola quiero información`

window.open(url,"_blank")

}

return(

<>

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

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

<h2 style={{textAlign:"center"}}>   CENTRO DE PEDIDOS HADOLL WATER 🚚 </h2>

<input
placeholder="Teléfono"
value={telefono}
onChange={e=>buscarCliente(e.target.value)}
style={input}
/>

<input
placeholder="Nombre"
value={nombre}
onChange={e=>setNombre(e.target.value)}
style={input}
/>

<select
value={ciudad}
onChange={e=>setCiudad(e.target.value)}
style={input}
>

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

<input
placeholder="Dirección"
value={direccion}
onChange={e=>setDireccion(e.target.value)}
style={input}
/>

<select
value={producto}
onChange={e=>seleccionarProducto(e.target.value)}
style={input}
>

<option value="">🚰 ELIGE TU PRODUCTO</option>

{productos.map((p:any,i:number)=>(

<option key={i} value={p.nombre}>
🔥 {p.nombre.toUpperCase()}
</option>

))}

</select>

<input
type="number"
value={cantidad}
min={1}
onChange={e=>{

let valor = e.target.value

if(valor === ""){
setCantidad("")
return
}

setCantidad(Number(valor))

}}
onBlur={()=>{

if(cantidad === ""){
setCantidad(1)
}

}}
style={input}
/>

<button
onClick={enviar}
style={boton}
>
CONFIRMAR PEDIDO
</button>

<button
onClick={whatsapp}
style={botonW}
>
📲 HABLAR POR WHATSAPP
</button>

</div>
</div>

</>

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
color:"#4338ca",
fontWeight:"700",
fontSize:"16px"

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

const titulo={
fontSize:"30px",
fontWeight:"bold",
textAlign:"center",
color:"#4f46e5",
marginBottom:"20px",
textTransform:"uppercase",
letterSpacing:"1px"
}