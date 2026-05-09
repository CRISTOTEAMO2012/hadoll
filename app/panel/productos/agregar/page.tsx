"use client"
import {useState} from "react"

export default function AgregarProducto(){

const [tipo,setTipo]=useState("")
const [precio,setPrecio]=useState("")

function guardar(){

let productos = JSON.parse(localStorage.getItem("productos")||"[]")

productos.push({
tipo,
precio
})

localStorage.setItem("productos",JSON.stringify(productos))

alert("Producto guardado")

}

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
AGREGAR PRODUCTO
</h1>

<p style={{color:"#000"}}>TIPO DE PRODUCTO</p>

<select
value={tipo}
onChange={(e)=>setTipo(e.target.value)}
style={{
padding:"12px",
width:"300px",
marginBottom:"30px",
color:"#000"
}}
>

<option value="">SELECCIONAR</option>

<option>BOTELLON 20L CON LLAVE</option>

<option>BOTELLON 20L SIN LLAVE</option>

<option>PACA 15 BOTELLAS 600ML</option>

<option>PACA 24 BOTELLAS 600ML</option>

<option>BOTELLA 6000 ML</option>

</select>

<p style={{color:"#000"}}>PRECIO BASE</p>

<select
value={precio}
onChange={(e)=>setPrecio(e.target.value)}
style={{
padding:"12px",
width:"300px",
color:"#000"
}}
>

<option value="">SELECCIONAR</option>

<option>0.50</option>
<option>1.00</option>
<option>1.50</option>
<option>2.00</option>
<option>2.50</option>
<option>3.00</option>
<option>4.00</option>
<option>5.00</option>
<option>6.00</option>
<option>7.00</option>
<option>8.00</option>
<option>9.00</option>
<option>10.00</option>

</select>

<br/><br/>

<button
onClick={guardar}
style={{
padding:"15px 40px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer"
}}
>

GUARDAR PRODUCTO

</button>

</div>

)

}