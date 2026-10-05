"use client"

import {useState,useEffect} from "react"
import { supabase } from "../../../../supabase"

export default function VentaCortesia(){

const [clientes, setClientes] = useState<any[]>([])
const [vehiculos,setVehiculos]=useState<any[]>([])
const [productos,setProductos]=useState<any[]>([])

const [busqueda,setBusqueda]=useState("")
const [cliente,setCliente]=useState("")

const [origen,setOrigen]=useState("vehiculo1")
const [mostrarOtrosOrigenes,setMostrarOtrosOrigenes]=useState(false)

const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")

const [tipoEnvase,setTipoEnvase]=useState("cambio")

const [devolucionManual,setDevolucionManual]=useState(false)

const [vaciosConLlave,setVaciosConLlave]=useState(0)
const [vaciosSinLlave,setVaciosSinLlave]=useState(0)

const [mensaje,setMensaje]=useState("")
const [guardando,setGuardando]=useState(false)


useEffect(()=>{
cargarDatos()
},[])


async function cargarDatos(){

// CLIENTES
let clientesData:any[] = []
let desdeClientes = 0
const bloqueClientes = 1000

while(true){

const { data: loteClientes, error } = await supabase
.from("clientes")
.select("*")
.order("nombre",{ascending:true})
.range(desdeClientes, desdeClientes + bloqueClientes - 1)

if(error){
console.log(error)
break
}

if(!loteClientes || loteClientes.length === 0) break

clientesData = [...clientesData, ...loteClientes]

if(loteClientes.length < bloqueClientes) break

desdeClientes += bloqueClientes

}


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


// TRADUCTOR CLAVE
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


// VACÍOS
function obtenerClaveVacio(nombre:string){

nombre = nombre.toLowerCase()

if(nombre.includes("con llave")) return "botellon20llave_vacios"
if(nombre.includes("sin llave")) return "botellon20sin_llave_vacios"

return null

}


// FECHA ECUADOR
function obtenerFechaEcuador(){

return new Date().toLocaleDateString(
"en-CA",
{
timeZone:"America/Guayaquil"
}
)

}


async function guardarCortesia(){

if(guardando) return

setGuardando(true)


if(cliente==="" || producto===""){

alert("Complete los datos")

setGuardando(false)

return

}


let cant = Number(cantidad)


if(isNaN(cant) || cant <= 0){

alert("Cantidad inválida")

setGuardando(false)

return

}


let hoy = obtenerFechaEcuador()


// ==========================================
// INVENTARIO
// ==========================================

const { data: inventarioData, error: inventarioError } = await supabase
.from("inventario")
.select("*")
.eq("id",1)
.single()


if(inventarioError){

alert("Error cargando inventario")

console.log(inventarioError)

setGuardando(false)

return

}


let inventario = inventarioData

let clave:any = obtenerClave(producto)


// VALIDAR INVENTARIO
if(!inventario[origen] || inventario[origen][clave] === undefined){

alert("Producto no existe en inventario")

setGuardando(false)

return

}


if(inventario[origen][clave] < cant){

alert("Stock insuficiente")

setGuardando(false)

return

}


// RESTAR PRODUCTO LLENO
inventario[origen][clave] -= cant


// ==========================================
// CAMBIO DE BOTELLONES
// ==========================================

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
"La suma de vacíos debe ser igual a la cantidad entregada"
)

setGuardando(false)

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


// ==========================================
// GUARDAR INVENTARIO
// ==========================================

const { error: errorInventario } = await supabase
.from("inventario")
.update({

[origen]: inventario[origen]

})
.eq("id",1)


if(errorInventario){

alert("Error actualizando inventario")

console.log(errorInventario)

setGuardando(false)

return

}


// ==========================================
// GUARDAR EN TABLA VENTAS
// ==========================================

const { data: ventaCreada, error: errorVenta } = await supabase
.from("ventas")
.insert([
{

fecha: hoy,

cliente,

producto,

cantidad: cant,

precio: 0,

total: 0,

origen,

tipo_envase:
producto.toLowerCase().includes("20l")
? tipoEnvase
: null,

devolucion_manual: devolucionManual,

vacios_con_llave: vaciosConLlave,

vacios_sin_llave: vaciosSinLlave,

abono: 0,

restante: 0

}
])
.select()
.single()


if(errorVenta){

console.log(errorVenta)

alert("Error guardando cortesía")

setGuardando(false)

return

}


const ventaId = ventaCreada.id


// ==========================================
// ENVASE PRESTADO
// ==========================================

if(
producto.toLowerCase().includes("20l") &&
tipoEnvase==="prestado"
){

const { error } = await supabase
.from("envases_prestados")
.insert([
{

cliente,

envase: obtenerClaveVacio(producto),

cantidad: cant,

fecha: hoy,

tipo: "prestado",

venta_id: ventaId

}
])


if(error){

console.log(error)

alert("Error guardando envase prestado")

setGuardando(false)

return

}

}


// ==========================================
// TERMINADO
// ==========================================

setMensaje("✅ Cortesía registrada correctamente")


setTimeout(()=>{

setMensaje("")

},2000)


setBusqueda("")
setCliente("")
setOrigen("vehiculo1")
setMostrarOtrosOrigenes(false)
setProducto("")
setCantidad("")
setTipoEnvase("cambio")
setDevolucionManual(false)
setVaciosConLlave(0)
setVaciosSinLlave(0)

setGuardando(false)

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


<h1 style={titulo}>
🎁 Registrar Venta Cortesía
</h1>


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

<option value="">
Seleccionar cliente
</option>


{clientesFiltrados.map((c:any,i:number)=>(

<option key={i} value={c.nombre}>

{c.nombre}

</option>

))}

</select>


<div style={{
display:"flex",
flexDirection:"column",
gap:"10px"
}}>


<button
style={
origen==="vehiculo1"
? botonActivo
: botonIcono
}
onClick={()=>{

setOrigen("vehiculo1")

setMostrarOtrosOrigenes(false)

}}
>

🚚 {vehiculo1?.marca || "Vehículo 1"}

</button>


<button
style={{
...botonIcono,
background:"#f8fafc"
}}
onClick={()=>
setMostrarOtrosOrigenes(!mostrarOtrosOrigenes)
}
>

📍 Escoger otro lugar de origen

</button>


{mostrarOtrosOrigenes && (

<div style={grupoIconos}>


<button
style={
origen==="empresa"
? botonActivo
: botonIcono
}
onClick={()=>{

setOrigen("empresa")

setMostrarOtrosOrigenes(false)

}}
>

🏢 Empresa

</button>


<button
style={
origen==="dorita"
? botonActivo
: botonIcono
}
onClick={()=>{

setOrigen("dorita")

setMostrarOtrosOrigenes(false)

}}
>

🏠 Dorita

</button>


<button
style={
origen==="vehiculo2"
? botonActivo
: botonIcono
}
onClick={()=>{

setOrigen("vehiculo2")

setMostrarOtrosOrigenes(false)

}}
>

🚐 {vehiculo2?.marca || "Vehículo 2"}

</button>


</div>

)}


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

<option value="">
Seleccionar producto
</option>


{productos.map((p:any,i:number)=>(

<option
key={i}
value={p.nombre}
>

{p.nombre}

</option>

))}

</select>


{producto.toLowerCase().includes("20l") && (

<div style={grupoIconos}>


<button
style={
tipoEnvase==="cambio"
? botonActivo
: botonIcono
}
onClick={()=>setTipoEnvase("cambio")}
>

🔄 Cambio

</button>


<button
style={
tipoEnvase==="prestado"
? botonActivo
: botonIcono
}
onClick={()=>setTipoEnvase("prestado")}
>

🫙 Prestado

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
onChange={(e)=>setCantidad(e.target.value)}
placeholder="Cantidad"
/>


<div style={resumenVenta}>


<h3>
📋 Resumen
</h3>


<p>
<b>Cliente:</b> {cliente || "-"}
</p>


<p>
<b>Origen:</b> {origen}
</p>


<p>
<b>Producto:</b> {producto || "-"}
</p>


<p>
<b>Cantidad:</b> {cantidad || 0}
</p>


{producto.toLowerCase().includes("20l") && (

<p>
<b>Tipo de envase:</b>{" "}
{tipoEnvase==="cambio"
? "Cambio"
: "Prestado"}
</p>

)}


<p>
<b>Valor:</b> $0.00 - Cortesía
</p>


</div>


<button
style={{
...boton,
opacity: guardando ? 0.6 : 1,
cursor: guardando
? "not-allowed"
: "pointer"
}}
onClick={guardarCortesia}
disabled={guardando}
>

{guardando
? "⏳ Guardando cortesía..."
: "Guardar Cortesía"}

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

background:"#f59e0b",

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

background:"#fff7ed",

padding:"15px",

borderRadius:"10px",

border:"1px solid #fdba74"

}