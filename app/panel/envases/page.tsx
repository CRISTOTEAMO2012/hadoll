"use client"

import Link from "next/link"

export default function Envases(){

return(

<div style={contenedor}>

<h1 style={titulo}>🫙 Módulo Envases</h1>

<div style={grid}>

{/* BOTON YA EXISTENTE */}
<Link href="/panel/envases/prestados">
<button style={{...boton,background:"#3b82f6"}}>
🫙 Envases Prestados
</button>
</Link>

{/* BOTON YA EXISTENTE */}
<Link href="/panel/envases/vendidos">
<button style={{...boton,background:"#0ea5e9"}}>
🫙 Envases Vendidos
</button>
</Link>

{/* 🔥 REGISTRO INICIAL */}
<Link href="/panel/envases/inicial">
<button style={{...boton,background:"#16a34a"}}>
📥 Registro Inicial
</button>
</Link>

{/* 🔥 NUEVO MODULO DEVOLUCIONES */}
<Link href="/panel/envases/devoluciones">
<button style={{...boton,background:"#7c3aed"}}>
♻️ Devolución Envases
</button>
</Link>

</div>

</div>

)

}

// 🎨 ESTILO CLARO

const contenedor={
background:"#f1f5f9",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"30px",
marginBottom:"30px"
}

const grid={
display:"flex",
gap:"20px",
flexWrap:"wrap"
}

const boton={
padding:"20px",
border:"none",
borderRadius:"10px",
color:"#fff",
fontSize:"16px",
fontWeight:"bold",
cursor:"pointer",
minWidth:"220px"
}