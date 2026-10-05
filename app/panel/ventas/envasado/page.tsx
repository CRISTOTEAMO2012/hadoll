"use client"

import {useState,useEffect} from "react"
import { supabase } from "../../../../supabase"

export default function VentaSoloEnvasado(){

const [clientes, setClientes] = useState<any[]>([])
const [productos,setProductos]=useState<any[]>([])

const [busqueda,setBusqueda]=useState("")
const [cliente,setCliente]=useState("")

const [producto,setProducto]=useState("")
const [cantidad,setCantidad]=useState("")
const [precio,setPrecio]=useState("")
const [pago,setPago]=useState("efectivo")

const [abono,setAbono]=useState("")
const [metodoMixto,setMetodoMixto]=useState("efectivo")

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


// PRODUCTOS
const { data: productosData } = await supabase
.from("productos")
.select("*")
.order("nombre")


// SOLO BOTELLÓN 20L CON LLAVE Y SIN LLAVE
const productosEnvasado = (productosData || []).filter((p:any)=>{

const nombre = (p.nombre || "").toLowerCase()

return (
nombre.includes("20l") &&
(
nombre.includes("con llave") ||
nombre.includes("sin llave")
)
)

})


setClientes(clientesData || [])
setProductos(productosEnvasado)

}


let clientesFiltrados = clientes.filter((c:any)=>
(c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
)


// FECHA ECUADOR
function obtenerFechaEcuador(){

return new Date().toLocaleDateString(
"en-CA",
{
timeZone:"America/Guayaquil"
}
)

}


async function guardarVenta(){

if(guardando) return

setGuardando(true)


if(cliente==""||producto==""){

alert("Complete los datos")

setGuardando(false)

return

}


let cant = Number(cantidad)

let prec = Number(precio)


if(isNaN(cant) || isNaN(prec)){

alert("Cantidad o precio inválido")

setGuardando(false)

return

}


let totalVenta = cant * prec

let hoy = obtenerFechaEcuador()


// =================================================
// 🧾 GUARDAR VENTA EN SUPABASE
// =================================================

const { data: ventaCreada, error: errorVenta } = await supabase
.from("ventas")
.insert([
{

fecha: hoy,

cliente,

producto,

cantidad: cant,

precio: prec,

total: totalVenta,

pago,

abono: pago==="mixto" ? Number(abono) : 0,

restante: pago==="mixto"
? totalVenta-Number(abono)
: pago==="fiado"
? totalVenta
: 0

}
])
.select()
.single()


if(errorVenta){

console.log(errorVenta)

alert("Error guardando venta")

setGuardando(false)

return

}


const ventaId = ventaCreada.id


// =================================================
// 💳 FIADO TOTAL
// =================================================

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

estado: "pendiente",

venta_id: ventaId

}
])


if(error){

console.log(error)

alert("Error guardando deuda")

setGuardando(false)

return

}

}


// =================================================
// 💰 EFECTIVO O TRANSFERENCIA TOTAL
// =================================================

if(pago === "efectivo" || pago === "transferencia"){

const { error: errorCaja } = await supabase
.from("caja")
.insert([
{

tipo:"ingreso",

detalle:`Envasado de ${producto}`,

monto: totalVenta,

fecha:hoy,

metodo:pago,

venta_id: ventaId

}
])


if(errorCaja){

console.log(errorCaja)

alert("Error guardando ingreso en caja")

setGuardando(false)

return

}

}


// =================================================
// 🔥 PAGO MIXTO
// =================================================

if(pago === "mixto"){

let valorAbono = Number(abono)


if(isNaN(valorAbono) || valorAbono <= 0){

alert("Ingrese abono válido")

setGuardando(false)

return

}


if(valorAbono >= totalVenta){

alert("El abono no puede ser mayor o igual al total")

setGuardando(false)

return

}


let restante = totalVenta - valorAbono


// 💰 GUARDAR ABONO EN CAJA

const { error: errorCajaMixto } = await supabase
.from("caja")
.insert([
{

tipo:"ingreso",

detalle:`Envasado de ${producto}`,

monto: valorAbono,

fecha:hoy,

metodo:metodoMixto,

venta_id: ventaId

}
])


if(errorCajaMixto){

console.log(errorCajaMixto)

alert("Error guardando abono en caja")

setGuardando(false)

return

}


// 💳 GUARDAR DEUDA

const { error: errorDeuda } = await supabase
.from("deudas")
.insert([
{

cliente,

producto,

cantidad: cant,

monto: restante,

fecha: hoy,

estado: "pendiente",

venta_id: ventaId

}
])


if(errorDeuda){

console.log(errorDeuda)

alert("Error guardando deuda")

setGuardando(false)

return

}

}


// =================================================
// ✅ TERMINADO
// =================================================

setMensaje("✅ Venta de envasado registrada correctamente")


setTimeout(()=>{

setMensaje("")

},2000)


setBusqueda("")

setCliente("")

setProducto("")

setCantidad("")

setPrecio("")

setPago("efectivo")

setAbono("")

setMetodoMixto("efectivo")

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
💧 Registrar Venta Solo Envasado
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

<option
key={i}
value={c.nombre}
>

{c.nombre}

</option>

))}


</select>


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


<input
style={input}
type="number"
value={cantidad}
onChange={(e)=>setCantidad(e.target.value)}
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

<option value="efectivo">
Efectivo
</option>

<option value="transferencia">
Transferencia
</option>

</select>


</>

)}


<div style={resumenVenta}>


<h3>
📋 Resumen
</h3>


<p>
<b>Cliente:</b> {cliente || "-"}
</p>


<p>
<b>Producto:</b> {producto || "-"}
</p>


<p>
<b>Cantidad:</b> {cantidad}
</p>


<p>
<b>Precio:</b> ${precio || 0}
</p>


<p>

<b>Total:</b>

${Number(cantidad || 0) * Number(precio || 0)}

</p>


</div>


<button
style={{
...boton,
opacity: guardando ? 0.6 : 1,
cursor: guardando ? "not-allowed" : "pointer"
}}
onClick={guardarVenta}
disabled={guardando}
>

{guardando
? "⏳ Guardando venta..."
: "Guardar Venta"}

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