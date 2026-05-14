"use client"

import {useState,useEffect} from "react"

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

const [tipoEnvase,setTipoEnvase]=useState("cambio")

useEffect(()=>{

let c = JSON.parse(localStorage.getItem("clientes")||"[]")
let v = JSON.parse(localStorage.getItem("vehiculos")||"[]")
let p = JSON.parse(localStorage.getItem("productos")||"[]")

// 🔥 SI NO EXISTEN PRODUCTOS CARGAR LOS PRINCIPALES
if(!Array.isArray(p) || p.length === 0){

p = [

{nombre:"Botellón 20L con llave", precio:2.5},
{nombre:"Botellón 20L sin llave", precio:2},
{nombre:"Paca 15 botellas 600 ml", precio:3.5},
{nombre:"Paca 24 botellas 600 ml", precio:5},
{nombre:"Botella 6000 ml", precio:1.5},
{nombre:"Botella 1L", precio:1}

]

localStorage.setItem("productos", JSON.stringify(p))

}

setClientes(c)
setVehiculos(v)
setProductos(p)

},[])

let clientesFiltrados = clientes.filter((c:any)=>
(c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
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

const fecha = new Date()

const ecuador = new Date(
fecha.toLocaleString("en-US", {
timeZone: "America/Guayaquil"
})
)

return ecuador.toISOString().split("T")[0]

}

function guardarVenta(){

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

let hoy = obtenerFechaEcuador()

let ventas = JSON.parse(localStorage.getItem("ventas")||"[]")
let inventario = JSON.parse(localStorage.getItem("inventario")||"{}")

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
if(producto.toLowerCase().includes("20l") && tipoEnvase==="cambio"){

let claveVacio:any = obtenerClaveVacio(producto)

if(!inventario[origen][claveVacio]){
inventario[origen][claveVacio]=0
}

inventario[origen][claveVacio] += cant
}

// 🫙 ENVASE PRESTADO
if(producto.toLowerCase().includes("20l") && tipoEnvase==="prestado"){

let prestados = JSON.parse(localStorage.getItem("envasesprestados")||"[]")

prestados.push({
cliente: cliente.trim().toUpperCase(),
envase: obtenerClaveVacio(producto),
cantidad:cant,
fecha:hoy,
tipo:"prestado"
})

localStorage.setItem("envasesprestados",JSON.stringify(prestados))
}

// 🫙 ENVASE VENDIDO
if(producto.toLowerCase().includes("20l") && tipoEnvase==="vendido"){

let vendidos = JSON.parse(localStorage.getItem("envasesvendidos")||"[]")

vendidos.push({
cliente,
producto,
cantidad:cant,
fecha:hoy
})

localStorage.setItem("envasesvendidos",JSON.stringify(vendidos))
}

// 💾 INVENTARIO
localStorage.setItem("inventario",JSON.stringify(inventario))

// 🧾 VENTAS
ventas.push({
fecha:hoy,
cliente,
producto,
cantidad:cant,
precio:prec,
origen,
pago,
tipoEnvase
})

localStorage.setItem("ventas",JSON.stringify(ventas))

// 💳 FIADO
if(pago === "fiado"){

let deudas = JSON.parse(localStorage.getItem("deudas")||"[]")

deudas.push({
cliente,
producto,
cantidad:cant,
monto: prec * cant,
fecha: hoy,
estado: "pendiente"
})

localStorage.setItem("deudas",JSON.stringify(deudas))
}

// 💰 CAJA
if(pago !== "fiado"){

let caja = JSON.parse(localStorage.getItem("caja") || "[]")

caja.push({
tipo:"ingreso",
descripcion:`Venta de ${producto}`,
monto: prec * cant,
metodo:pago,
fecha:hoy
})

localStorage.setItem("caja", JSON.stringify(caja))
}

alert("Venta registrada correctamente")

setCantidad(1)
setPrecio("")

}

return(

<div style={contenedor}>

<h1 style={titulo}>💰 Registrar Venta</h1>

<div style={formulario}>

<input
style={input}
placeholder="Buscar cliente"
value={busqueda}
onChange={(e)=>setBusqueda(e.target.value)}
/>

<select
style={input}
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

<select
style={input}
value={origen}
onChange={(e)=>setOrigen(e.target.value)}
>

<option value="empresa">Empresa</option>
<option value="dorita">Local Dorita</option>

{vehiculos.map((v:any,i:number)=>(

<option key={i} value={"vehiculo"+(i+1)}>
{v.nombre || "Vehículo "+(i+1)}
</option>

))}

</select>

<select
style={input}
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

<select
style={input}
value={tipoEnvase}
onChange={(e)=>setTipoEnvase(e.target.value)}
>

<option value="cambio">Cambio</option>
<option value="prestado">Envase prestado</option>
<option value="vendido">Envase vendido</option>

</select>

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

<select
style={input}
value={pago}
onChange={(e)=>setPago(e.target.value)}
>

<option value="efectivo">Efectivo</option>
<option value="transferencia">Transferencia</option>
<option value="fiado">Fiado</option>

</select>

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
padding:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
}

const boton={
background:"#16a34a",
color:"#fff",
padding:"12px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}