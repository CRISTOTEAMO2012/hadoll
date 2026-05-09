import Link from "next/link"

export default function Botellones(){

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
CONTROL DE BOTELLONES
</h1>

<div style={{
display:"flex",
gap:"40px"
}}>

<Link href="/panel/productos/botellones/conllave">

<button style={{
padding:"25px 50px",
fontSize:"20px",
background:"#1d6fd8",
color:"#ffffff",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}>
BOTELLONES 20L CON LLAVE
</button>

</Link>


<Link href="/panel/productos/botellones/sinllave">

<button style={{
padding:"25px 50px",
fontSize:"20px",
background:"#16a34a",
color:"#ffffff",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}>
BOTELLONES 20L SIN LLAVE
</button>

</Link>

</div>

</div>

)

}