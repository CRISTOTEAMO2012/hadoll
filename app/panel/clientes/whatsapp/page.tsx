"use client"
import {useEffect,useState} from "react"

export default function WhatsAppClientes(){

const [clientes,setClientes]=useState([])
const [dia,setDia]=useState("")

const [mensaje,setMensaje]=useState("Hola 👋 hoy estamos pasando por su sector con agua HADOLL 💧. Si necesita botellones por favor indíquenos. Gracias por su preferencia.")

useEffect(()=>{

let datos=JSON.parse(localStorage.getItem("clientes")||"[]")
setClientes(datos)

},[])

const filtrados = dia ? clientes.filter(c=>c.dia===dia) : []

function enviar(numero){

let url=`https://web.whatsapp.com/send?phone=593${numero}&text=${encodeURIComponent(mensaje)}`

window.open(url)

}

return(

<div style={{background:"#ffffff",minHeight:"100vh",padding:"40px"}}>

<h1 style={{color:"#000",marginBottom:"20px"}}>WhatsApp Clientes</h1>

<textarea
value={mensaje}
onChange={e=>setMensaje(e.target.value)}
style={{
width:"500px",
height:"100px",
padding:"10px",
fontSize:"16px",
color:"#000",
border:"1px solid #999",
borderRadius:"6px",
marginBottom:"30px"
}}
/>

<div style={{display:"flex",gap:"10px",marginBottom:"30px"}}>

<button style={{background:"#0070f3",color:"#fff",padding:"10px 20px",border:"none",borderRadius:"6px"}} onClick={()=>setDia("Lunes")}>Lunes</button>

<button style={{background:"#0070f3",color:"#fff",padding:"10px 20px",border:"none",borderRadius:"6px"}} onClick={()=>setDia("Martes")}>Martes</button>

<button style={{background:"#0070f3",color:"#fff",padding:"10px 20px",border:"none",borderRadius:"6px"}} onClick={()=>setDia("Miercoles")}>Miércoles</button>

<button style={{background:"#0070f3",color:"#fff",padding:"10px 20px",border:"none",borderRadius:"6px"}} onClick={()=>setDia("Jueves")}>Jueves</button>

<button style={{background:"#0070f3",color:"#fff",padding:"10px 20px",border:"none",borderRadius:"6px"}} onClick={()=>setDia("Viernes")}>Viernes</button>

</div>

{filtrados.map((c,i)=>(

<div key={i}
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
border:"1px solid #ccc",
padding:"12px",
marginBottom:"10px",
borderRadius:"8px",
background:"#f9f9f9"
}}
>

<span style={{color:"#000"}}>

{c.nombre} - {c.telefono}

</span>

<button
onClick={()=>enviar(c.telefono)}
style={{
background:"#25D366",
color:"#fff",
border:"none",
padding:"8px 15px",
borderRadius:"6px",
cursor:"pointer"
}}
>

Enviar WhatsApp

</button>

</div>

))}

</div>

)

}