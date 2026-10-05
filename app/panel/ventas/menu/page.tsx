"use client"

import Link from "next/link"

export default function MenuVentas(){

return(

<div style={contenedor}>

<h1 style={titulo}>
💰 MÓDULO VENTAS
</h1>


<div style={grid}>


<Link
href="/panel/ventas"
style={{...boton,background:"#16a34a"}}
>
🛒
<br/>
VENTA NORMAL
</Link>


<Link
href="/panel/ventas/cortesia"
style={{...boton,background:"#f59e0b"}}
>
🎁
<br/>
VENTA CORTESÍA
</Link>


<Link
href="/panel/ventas/envasado"
style={{...boton,background:"#06b6d4"}}
>
💧
<br/>
VENTA SOLO ENVASADO
</Link>


</div>

</div>

)

}


const contenedor={

minHeight:"100vh",
padding:"40px",
background:
"linear-gradient(135deg,#60a5fa,#c084fc)"

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
maxWidth:"900px",
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