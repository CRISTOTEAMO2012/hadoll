"use client"
import { useState,useEffect } from "react"

export default function Botellas6000(){

const [empresa,setEmpresa]=useState(0)
const [dorita,setDorita]=useState(0)
const [vehiculo,setVehiculo]=useState(0)

useEffect(()=>{

let datos = JSON.parse(localStorage.getItem("botellas6000")||"{}")

setEmpresa(datos.empresa||0)
setDorita(datos.dorita||0)
setVehiculo(datos.vehiculo||0)

},[])

function guardar(){

let datos={
empresa,
dorita,
vehiculo
}

localStorage.setItem("botellas6000",JSON.stringify(datos))

alert("Datos guardados correctamente")

}

let total = Number(empresa) + Number(dorita) + Number(vehiculo)

return(

<div style={{
background:"#ffffff",
minHeight:"100vh",
padding:"40px"
}}>

<h1 style={{
color:"#000000",
marginBottom:"40px"
}}>
BOTELLAS 6000 ML
</h1>

<div style={{
display:"grid",
gridTemplateColumns:"250px 250px",
gap:"30px"
}}>

<div>
<p style={{color:"#000"}}>EMPRESA</p>
<input
type="number"
value={empresa}
onChange={(e)=>setEmpresa(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ccc",
color:"#000"
}}
/>
</div>

<div>
<p style={{color:"#000"}}>LOCAL DORITA</p>
<input
type="number"
value={dorita}
onChange={(e)=>setDorita(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ccc",
color:"#000"
}}
/>
</div>

<div>
<p style={{color:"#000"}}>VEHÍCULO</p>
<input
type="number"
value={vehiculo}
onChange={(e)=>setVehiculo(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ccc",
color:"#000"
}}
/>
</div>

</div>

<button
onClick={guardar}
style={{
marginTop:"40px",
padding:"15px 40px",
background:"#ef4444",
color:"#ffffff",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
fontSize:"16px",
cursor:"pointer"
}}
>
GUARDAR
</button>

<h2 style={{
marginTop:"40px",
color:"#000"
}}>
TOTAL BOTELLAS: {total}
</h2>

</div>

)

}