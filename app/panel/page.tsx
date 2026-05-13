"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"

export default function Panel(){

const router = useRouter()

function cerrarSesion(){

localStorage.removeItem("login")

router.push("/")

}

return(

<div style={contenedor}>

{/* 🌊 MARCA DE AGUA */}
<div style={marcaAgua}>
<img src="/logo.png" alt="marca" style={logoMarca}/>
</div>

{/* 🔴 BOTON CERRAR SESION */}
<button onClick={cerrarSesion} style={botonCerrar}>
🚪 Cerrar Sesión
</button>

<div style={header}>

<img
src="/logo.png"
alt="Logo empresa"
style={logo}
/>

<h1 style={titulo}>
💧 AGUA HADOLL PANEL PRINCIPAL
</h1>

</div>

<div style={grid}>

<Link href="/panel/dashboard" style={{...boton,background:"#6366f1"}}>
📊 Dashboard
</Link>

<Link href="/panel/clientes" style={{...boton,background:"#22c55e"}}>
👥 Clientes
</Link>

<Link href="/panel/productos" style={{...boton,background:"#06b6d4"}}>
📦 Productos
</Link>

<Link href="/panel/bodega" style={{...boton,background:"#eab308"}}>
🏬 Bodega / Compras
</Link>

<Link href="/panel/produccion" style={{...boton,background:"#f97316"}}>
🏭 Producción
</Link>

<Link href="/panel/inventario" style={{...boton,background:"#0ea5e9"}}>
📦 Inventario
</Link>

<Link href="/panel/vehiculos" style={{...boton,background:"#8b5cf6"}}>
🚚 Vehículos Distribuidores
</Link>

<Link href="/panel/ventas" style={{...boton,background:"#16a34a"}}>
💰 Ventas
</Link>

<Link href="/panel/traslados" style={{...boton,background:"#f43f5e"}}>
🔄 Traslados
</Link>

<Link href="/panel/reportesproduccion" style={{...boton,background:"#f59e0b"}}>
📈 Reporte Producción
</Link>

<Link href="/panel/reportesventas" style={{...boton,background:"#ef4444"}}>
📊 Reporte Ventas
</Link>

<Link href="/panel/rutas" style={{...boton,background:"#0d9488"}}>
🗺 Rutas
</Link>

<Link href="/panel/caja" style={{...boton,background:"#dc2626"}}>
💵 Caja
</Link>

<Link href="/panel/gastos" style={{...boton,background:"#ef4444"}}>
💸 Gastos Corrientes
</Link>

<Link href="/panel/finanzas" style={{...boton,background:"#0ea5e9"}}>
📊 Finanzas
</Link>

<Link href="/panel/envases" style={{...boton,background:"#14b8a6"}}>
🫙 Envases
</Link>

<Link href="/panel/cuentas" style={{...boton,background:"#f97316"}}>
💳 Cuentas por cobrar
</Link>

<Link href="/panel/pedidos" style={{...boton,background:"#22c55e"}}>
📝 Pedidos
</Link>

<Link href="/panel/insumos" style={{...boton,background:"#64748b"}}>
🧪 Insumos
</Link>

</div>

</div>

)

}

/* 🌈 FONDO CLARO AZUL MORADO */
const contenedor={

background:
"linear-gradient(135deg, #60a5fa 0%, #818cf8 45%, #c084fc 100%)",

minHeight:"100vh",
padding:"20px",
position:"relative",
overflow:"hidden",

fontFamily:"Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
}

/* 🔴 BOTON CERRAR SESION */
const botonCerrar={

position:"absolute",
top:"15px",
right:"15px",

background:"#dc2626",
color:"#fff",

border:"none",
padding:"10px 16px",
borderRadius:"10px",

fontWeight:"bold",
cursor:"pointer",

boxShadow:"0 4px 10px rgba(0,0,0,0.2)",
zIndex:"5",

fontSize:"14px"
}

/* 🌊 MARCA DE AGUA */
const marcaAgua={
position:"absolute",
top:"50%",
left:"50%",
transform:"translate(-50%,-50%)",
opacity:"0.07",
pointerEvents:"none"
}

const logoMarca={
width:"90vw",
maxWidth:"650px",
height:"auto",
objectFit:"contain"
}

const header={
display:"flex",
flexDirection:"column" as const,
alignItems:"center",
marginTop:"50px",
marginBottom:"30px",
position:"relative",
zIndex:"2"
}

const logo={
width:"80px",
height:"80px",
borderRadius:"50%",
background:"#fff",
padding:"10px",
boxShadow:"0 6px 18px rgba(0,0,0,0.25)",
marginBottom:"10px"
}

const titulo={
fontSize:"clamp(24px,5vw,38px)",
color:"#ffffff",
textAlign:"center" as const,
fontWeight:"800",
letterSpacing:"1px",
textShadow:"0 3px 8px rgba(0,0,0,0.25)",
padding:"0 10px"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
gap:"16px",
justifyContent:"center",
maxWidth:"1100px",
margin:"0 auto",
position:"relative",
zIndex:"2"
}

const boton={
padding:"18px",
borderRadius:"18px",
color:"#fff",
textDecoration:"none",
fontWeight:"bold",
textAlign:"center" as const,
fontSize:"16px",
boxShadow:"0 8px 18px rgba(0,0,0,0.18)",
display:"flex",
alignItems:"center",
justifyContent:"center",
minHeight:"85px",
transition:"0.25s",
backdropFilter:"blur(4px)"
}