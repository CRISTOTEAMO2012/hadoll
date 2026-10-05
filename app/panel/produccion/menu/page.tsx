"use client"

import Link from "next/link"

export default function MenuProduccion(){

return(

<div style={contenedor}>

<h1 style={titulo}>
🏭 MÓDULO PRODUCCIÓN
</h1>

<div style={grid}>

<Link
href="/panel/produccion"
style={{...boton,background:"#16a34a"}}
>
🏭
<br/>
PRODUCCIÓN NORMAL
</Link>

<Link
href="/panel/produccion/especial"
style={{...boton,background:"#f97316"}}
>
⚙️
<br/>
PRODUCCIÓN ESPECIAL
</Link>

</div>

</div>

)

}

const contenedor={
minHeight:"100vh",
padding:"40px",
background:"linear-gradient(135deg,#60a5fa,#c084fc)"
}

const titulo={
color:"#fff",
textAlign:"center" as const,
fontSize:"35px",
fontWeight:"bold",
marginBottom:"40px"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"25px",
maxWidth:"700px",
margin:"0 auto"
}

const boton={
padding:"35px",
borderRadius:"20px",
color:"#fff",
textDecoration:"none",
fontSize:"22px",
fontWeight:"bold",
textAlign:"center" as const,
boxShadow:"0 8px 20px rgba(0,0,0,0.25)"
}