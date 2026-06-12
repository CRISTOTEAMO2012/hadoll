"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../supabase"
export default function Cuentas(){

const [deudas,setDeudas]=useState<any[]>([])
const [clienteActivo,setClienteActivo]=useState<any>(null)
const [verHistorial,setVerHistorial]=useState(false)

const [mostrarMetodo,setMostrarMetodo]=useState(false)
const [accionPendiente,setAccionPendiente]=useState<any>(null)
const [mensaje,setMensaje]=useState("")

useEffect(()=>{
cargar()
},[])

async function cargar(){

const { data, error } = await supabase
.from("deudas")
.select("*")
.order("id",{ascending:false})

if(error){

console.log(error)

alert("Error cargando deudas")

return

}

const deudasFormateadas = (data || []).map((d:any)=>({
...d,
producto: d.producto || "Producto",
cantidad: d.cantidad || 1
}))

setDeudas(deudasFormateadas)

}

// AGRUPAR
function agrupar(tipo:any){

let grupo:any={}

deudas.forEach((d:any,i:number)=>{

if(d.estado===tipo){

if(!grupo[d.cliente]){
grupo[d.cliente]={total:0,items:[]}
}

grupo[d.cliente].total += Number(d.monto)

grupo[d.cliente].items.push({
...d,
index:i
})

}

})

return grupo

}

// ABRIR MODAL MÉTODO
function abrirMetodo(callback:any){

setAccionPendiente(()=>callback)
setMostrarMetodo(true)

}

// REGISTRAR EN CAJA
async function registrarEnCaja(descripcion:any,monto:any,metodo:any){

let hoy = new Date().toLocaleDateString(
"en-CA",
{timeZone:"America/Guayaquil"}
)

const { data, error } = await supabase
.from("caja")
.insert([
{
tipo:"ingreso",
detalle: descripcion,
monto: Number(monto),
fecha: hoy,
metodo: metodo
}
])
.select()

if(error){

console.log(error)

alert("Error guardando en caja")

return

}
console.log("CAJA OK",data)
}

// COBRAR TODO
async function cobrarTodo(cliente:any,metodo:any){

let hoy = new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})

const pendientesCliente = deudas.filter(
(d:any)=>
d.cliente===cliente &&
d.estado==="pendiente"
)
let totalCobro = 0

pendientesCliente.forEach((d:any)=>{
totalCobro += Number(d.monto)
})
for(const deuda of pendientesCliente){

await supabase
.from("deudas")
.update({
estado:"pagado"
})
.eq("id",deuda.id)

}
await registrarEnCaja(
`Cobro total deuda ${cliente}`,
totalCobro,
metodo
)

await cargar()

setClienteActivo(null)

setMensaje("✅ Cobro registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

}

// COBRAR ITEM
async function cobrarItem(index:any,metodo:any){

let deuda:any = deudas[index]

let hoy = new Date().toLocaleDateString("en-CA",{timeZone:"America/Guayaquil"})

const { error } = await supabase
.from("deudas")
.update({
estado:"pagado"
})
.eq("id",deuda.id)

if(error){

alert("Error actualizando deuda")

console.log(error)

return

}
await registrarEnCaja(
`Cobro deuda ${deuda.cliente}`,
deuda.monto,
metodo
)

await cargar()

setMensaje("✅ Cobro registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

}

// ABONAR
async function abonarDeuda(index:any,metodo:any){

let monto:any = prompt("Ingrese valor a abonar")

if(!monto) return

let montoNumero = Number(monto)

if(isNaN(montoNumero) || montoNumero <= 0){

alert("Valor inválido")

return

}

let deuda:any = deudas[index]

if(montoNumero > Number(deuda.monto)){

alert("No puede abonar más de la deuda")

return

}

let nuevoSaldo =
Number(deuda.monto) - montoNumero

const datosActualizar:any = {
monto: nuevoSaldo
}

if(nuevoSaldo === 0){

datosActualizar.estado = "pagado"

}

const { error } = await supabase
.from("deudas")
.update(datosActualizar)
.eq("id",deuda.id)

if(error){

console.log(error)

alert(error.message)

return

}

await registrarEnCaja(
`Abono deuda ${deuda.cliente}`,
montoNumero,
metodo
)

await cargar()

setMensaje("✅ Cobro registrado correctamente")

setTimeout(()=>{
setMensaje("")
},2000)

}

// DATA
let pendientes:any = agrupar("pendiente")
let pagados:any = agrupar("pagado")

return(

<div style={contenedor}>

{mensaje && (

<div style={overlayMensaje}>

<div style={mensajeExito}>
{mensaje}
</div>

</div>

)}

{/* MODAL MÉTODO */}

{mostrarMetodo && (

<div style={overlayMensaje}>

<div style={modalMetodo}>

<h2 style={{marginBottom:"20px"}}>
Seleccione método de pago
</h2>

<button
style={botonMetodo}
onClick={()=>{
accionPendiente("efectivo")
setMostrarMetodo(false)
}}
>
💵 Efectivo
</button>

<button
style={{
...botonMetodo,
background:"#2563eb"
}}
onClick={()=>{
accionPendiente("transferencia")
setMostrarMetodo(false)
}}
>
🏦 Transferencia
</button>

<button
style={botonCancelar}
onClick={()=>setMostrarMetodo(false)}
>
Cancelar
</button>

</div>

</div>

)}

<h1 style={titulo}>💳 CUENTAS POR COBRAR</h1>

{!clienteActivo && !verHistorial && (

<>

<h2>Pendientes</h2>

{Object.entries(pendientes).map(([cliente,data]:any)=>(

<div key={cliente} style={card}>

<div
onClick={()=>setClienteActivo(cliente)}
style={{cursor:"pointer"}}
>

👤 <b>{cliente}</b><br/>

💲 {data.total}

</div>

<button
style={boton}
onClick={()=>
abrirMetodo(
(metodo:any)=>
cobrarTodo(cliente,metodo)
)
}
>
Cobrar todo
</button>

</div>

))}

<button
style={botonHistorial}
onClick={()=>setVerHistorial(true)}
>
Ver historial
</button>

</>

)}

{clienteActivo && !verHistorial && (

<div>

<button
style={botonVolver}
onClick={()=>setClienteActivo(null)}
>
⬅ Volver
</button>

<h2>{clienteActivo}</h2>

{pendientes[clienteActivo]?.items.map((d:any,i:number)=>(

<div key={i} style={card}>

<div>

📦 {d.cantidad} x {d.producto}<br/>

📅 {d.fecha}<br/>

💲 {d.monto}

</div>

<div style={{display:"flex",gap:"5px"}}>

<button
style={boton}
onClick={()=>
abrirMetodo(
(metodo:any)=>
cobrarItem(d.index,metodo)
)
}
>
Cobrar
</button>

<button
style={{...boton,background:"#f59e0b"}}
onClick={()=>
abrirMetodo(
(metodo:any)=>
abonarDeuda(d.index,metodo)
)
}
>
Abonar
</button>

</div>

</div>

))}

</div>

)}

{verHistorial && !clienteActivo && (

<div>

<button
style={botonVolver}
onClick={()=>setVerHistorial(false)}
>
⬅ Volver
</button>

<h2>Historial</h2>

{Object.entries(pagados).map(([cliente,data]:any)=>(

<div
key={cliente}
style={card}
onClick={()=>setClienteActivo(cliente)}
>

👤 {cliente} | 💲 {data.total}

</div>

))}

</div>

)}

{verHistorial && clienteActivo && (

<div>

<button
style={botonVolver}
onClick={()=>setClienteActivo(null)}
>
⬅ Volver
</button>

<h2>{clienteActivo}</h2>

{pagados[clienteActivo]?.items.map((d:any,i:number)=>(

<div key={i} style={cardPagado}>

📦 {d.cantidad} x {d.producto}

{" | "}📅 {d.fecha}

{" | "}💰 {d.fechaCobro}

{" | "}💲 {d.monto}

</div>

))}

</div>

)}

</div>

)

}

// ESTILOS

const contenedor={
background:"#ffffff",
minHeight:"100vh",
padding:"30px",
color:"#000"
}

const titulo={
fontSize:"28px",
marginBottom:"20px"
}

const card:any = {
background:"#f9fafb",
padding:"15px",
border:"1px solid #ccc",
borderRadius:"8px",
marginBottom:"10px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}

const cardPagado={
background:"#d1fae5",
padding:"10px",
borderRadius:"6px",
marginBottom:"5px"
}

const boton={
background:"#16a34a",
color:"#fff",
border:"none",
padding:"10px",
borderRadius:"6px",
cursor:"pointer"
}

const botonHistorial={
marginTop:"20px",
background:"#2563eb",
color:"#fff",
padding:"10px",
borderRadius:"6px",
border:"none",
cursor:"pointer"
}

const botonVolver={
marginBottom:"20px",
background:"#6b7280",
color:"#fff",
padding:"10px",
borderRadius:"6px",
border:"none",
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

const modalMetodo={
background:"#fff",
padding:"25px",
borderRadius:"12px",
display:"flex",
flexDirection:"column" as const,
gap:"12px",
minWidth:"300px"
}

const botonMetodo={
background:"#16a34a",
color:"#fff",
border:"none",
padding:"14px",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer"
}

const botonCancelar={
background:"#dc2626",
color:"#fff",
border:"none",
padding:"12px",
borderRadius:"10px",
cursor:"pointer"
}