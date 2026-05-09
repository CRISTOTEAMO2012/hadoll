import Link from "next/link"

export default function Vehiculos(){

return(

<div style={{
background:"#ffffff",
minHeight:"100vh",
padding:"40px"
}}>

<h1 style={{color:"#000",marginBottom:"40px"}}>
🚚 VEHÍCULOS DISTRIBUIDORES
</h1>

<div style={{
display:"flex",
gap:"20px",
flexWrap:"wrap"
}}>

<Link href="/panel/vehiculos/vehiculo1">
<button style={{...boton,background:"#3b82f6"}}>🚚 VEHÍCULO 1</button>
</Link>

<Link href="/panel/vehiculos/vehiculo2">
<button style={{...boton,background:"#22c55e"}}>🚚 VEHÍCULO 2</button>
</Link>

<Link href="/panel/vehiculos/vehiculo3">
<button style={{...boton,background:"#f97316"}}>🚚 VEHÍCULO 3</button>
</Link>

<Link href="/panel/vehiculos/vehiculo4">
<button style={{...boton,background:"#a855f7"}}>🚚 VEHÍCULO 4</button>
</Link>

</div>

</div>

)

}

const boton={

padding:"25px 40px",
color:"#fff",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer"

}