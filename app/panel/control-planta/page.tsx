"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabase"

export default function ControlPlanta() {

const [pestana,setPestana]=useState("equipos")
const [equipos,setEquipos]=useState<any[]>([])
const [equipoSeleccionado,setEquipoSeleccionado]=useState<any>(null)
const [mostrarFicha,setMostrarFicha]=useState(false)
useEffect(()=>{

cargarEquipos()

},[])

async function cargarEquipos(){

const { data, error } = await supabase
.from("equipos_planta")
.select("*")
.order("id")

if(error){

console.log(error)
return

}

setEquipos(data || [])
console.log("ERROR:", error)
console.log("DATOS:", data)
}
return(

<div style={contenedor}>

<h1 style={titulo}>
🏭 CENTRO DE CONTROL DE PLANTA
</h1>

<div style={tabs}>

<button
style={pestana==="equipos"?tabActivo:tab}
onClick={()=>setPestana("equipos")}
>
🔧 Equipos
</button>

<button
style={pestana==="mediciones"?tabActivo:tab}
onClick={()=>setPestana("mediciones")}
>
📊 Mediciones
</button>

<button
style={pestana==="mantenimiento"?tabActivo:tab}
onClick={()=>setPestana("mantenimiento")}
>
🛠 Mantenimiento
</button>

<button
style={pestana==="diagnostico"?tabActivo:tab}
onClick={()=>setPestana("diagnostico")}
>
🧪 Diagnóstico
</button>

<button
style={pestana==="biblioteca"?tabActivo:tab}
onClick={()=>setPestana("biblioteca")}
>
📚 Biblioteca
</button>

</div>

<div style={panel}>

{pestana==="equipos" && (

<div>

<h2 style={{marginBottom:"20px"}}>
🔧 EQUIPOS DE LA PLANTA
</h2>

{equipos.map((e:any)=>(

<div
key={e.id}
style={{
border:"1px solid #ddd",
borderRadius:"12px",
padding:"15px",
marginBottom:"12px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<h3 style={{margin:0}}>
{e.nombre}
</h3>

<p style={{margin:"5px 0"}}>
Tipo: {e.tipo}
</p>

<p style={{margin:0}}>
Estado:

<b
style={{
color:
e.estado==="OPERATIVO"
? "#16a34a"
: e.estado==="MANTENIMIENTO"
? "#ca8a04"
: "#dc2626"
}}
>
 {e.estado}
</b>

</p>

</div>

<button
onClick={()=>{
setEquipoSeleccionado(e)
setMostrarFicha(true)
}}
style={{
background:"#2563eb",
color:"#fff",
border:"none",
padding:"10px 15px",
borderRadius:"8px",
cursor:"pointer"
}}
>
🔧 Administrar Equipo
</button>

</div>

))}

</div>

)}

{pestana==="mediciones" && <h2>📊 MEDICIONES</h2>}

{pestana==="mantenimiento" && <h2>🛠 MANTENIMIENTO</h2>}

{pestana==="diagnostico" && <h2>🧪 DIAGNÓSTICO</h2>}

{pestana==="biblioteca" && <h2>📚 BIBLIOTECA TÉCNICA</h2>}

{mostrarFicha && equipoSeleccionado && (

<div
style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}}
>

<div
style={{
background:"#fff",
width:"700px",
padding:"30px",
borderRadius:"15px",
maxHeight:"90vh",
overflow:"auto"
}}
>

<h2>
🔧 {equipoSeleccionado.nombre}
</h2>

<hr/>

<p><b>Tipo:</b> {equipoSeleccionado.tipo}</p>

<p><b>Estado:</b> {equipoSeleccionado.estado}</p>

<p><b>Horas trabajadas:</b> {equipoSeleccionado.horas_trabajadas}</p>

<p><b>Último mantenimiento:</b> {equipoSeleccionado.ultimo_mantenimiento}</p>

<p><b>Próximo mantenimiento:</b> {equipoSeleccionado.proximo_mantenimiento}</p>

<p><b>Observaciones:</b></p>

<textarea
style={{
width:"100%",
height:"120px"
}}
defaultValue={equipoSeleccionado.observaciones}
/>

<br/><br/>

<button
onClick={()=>setMostrarFicha(false)}
style={{
background:"#dc2626",
color:"#fff",
padding:"10px 20px",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}
>
<button
style={{
background:"#2563eb",
color:"#fff",
padding:"12px 18px",
border:"none",
borderRadius:"10px",
cursor:"pointer",
marginRight:"15px"
}}
>
🛠 Registrar mantenimiento
</button>   
Cerrar
</button>

</div>

</div>

)}

</div>

</div>

)

}

const contenedor={
padding:"30px",
background:"#f1f5f9",
minHeight:"100vh",
color:"#000"
}

const titulo={
fontSize:"32px",
fontWeight:"bold",
marginBottom:"25px"
}

const tabs={
display:"flex",
gap:"10px",
flexWrap:"wrap" as const,
marginBottom:"25px"
}

const tab={
padding:"12px 20px",
border:"none",
borderRadius:"10px",
background:"#e5e7eb",
cursor:"pointer",
fontWeight:"bold"
}

const tabActivo={
...tab,
background:"#2563eb",
color:"#fff"
}

const panel={
background:"#fff",
padding:"25px",
borderRadius:"15px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}